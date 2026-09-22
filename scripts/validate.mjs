#!/usr/bin/env node
// Puerta de validación del sitio. Un solo comando: `npm run validate`.
//
// Compila y después revisa el artefacto `dist/` — que es lo que de verdad se
// publica — contra las reglas que el sitio no puede romper: páginas presentes,
// canonical y hreflang correctos, sitemap completo, borradores fuera, /admin y
// /cms bloqueados, enlaces e imágenes que existen, paridad de textos ES/EN,
// nada de credenciales ni URLs de desarrollo dentro del build, que el
// formulario nunca apunte a Web3Forms con la clave vacía, que cada persona
// del equipo tenga una foto real o `img: null` explícito, y que el widget de
// Netlify Identity no se cargue fuera de /cms.
//
// Uso:
//   npm run validate                  compila y valida
//   npm run validate -- --no-build    valida el dist/ que ya existe
//   PREVIEW_SITE_URL=... npm run validate   valida un build de preview
//
// Sale con código 1 si hay alguna falla (los avisos no rompen el build).
// Es la herramienta del agente `asecon-qa`; si agregas una regla al sitio,
// agrégala también acá.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const SITE = (process.env.PREVIEW_SITE_URL || 'https://aseconsa.com').replace(/\/+$/, '');
const esPreview = Boolean(process.env.PREVIEW_SITE_URL);
const sinBuild = process.argv.includes('--no-build');
// El build de admin/[...slug].astro lee esta misma variable de entorno (vía
// import.meta.env, que Vite llena desde process.env al momento del build);
// como este script invoca `npm run build` como subproceso heredando
// process.env, las dos lecturas siempre están de acuerdo.
const adminHabilitado = process.env.PUBLIC_ENABLE_ADMIN === 'true';

let fallas = 0;
let avisos = 0;

function reportar(nombre, problemas, nivel = 'error') {
  if (problemas.length === 0) {
    console.log(`  [ok]  ${nombre}`);
    return;
  }
  if (nivel === 'error') fallas++;
  else avisos++;
  console.log(`  [${nivel === 'error' ? 'x' : '!'}]   ${nombre}`);
  for (const p of problemas.slice(0, 12)) console.log(`         - ${p}`);
  if (problemas.length > 12) console.log(`         - (+${problemas.length - 12} más)`);
}

// Páginas que no son contenido indexable: se validan con otras reglas.
// /admin/ solo entra a la lista cuando el build la genera a propósito
// (PUBLIC_ENABLE_ADMIN=true); si no, su ausencia total de dist/ se exige en
// la sección 1, no aquí. /tecnologia y /en/technology llevan noindex porque
// el contenido sigue marcado BORRADOR en content.js. /404.html es la página
// de error propia del sitio.
const NOINDEX = [
  '/gracias/',
  '/en/thank-you/',
  '/tecnologia/',
  '/en/technology/',
  '/404.html',
  // Fase 3: las 4 páginas legales llevan noindex mientras el contenido sea
  // BORRADOR (ver content.js → legal.draftBody). Sacar de esta lista el día
  // que Asecon y su abogado confirmen el texto — ver la Fase 8 del plan
  // ("legal viva") y el comentario de routes.privacy en i18n/config.js.
  '/privacidad/',
  '/en/privacy/',
  '/cookies/',
  '/en/cookies/',
  '/aviso-legal/',
  '/en/legal-notice/',
  '/terminos/',
  '/en/terms/',
  ...(adminHabilitado ? ['/admin/'] : []),
];
const REDIRECCIONES = { '/soluciones/': '/servicios', '/en/solutions/': '/en/services' };

function archivosDe(dir, filtro, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) archivosDe(ruta, filtro, acc);
    else if (filtro(entrada)) acc.push(ruta);
  }
  return acc;
}

// '/servicios' -> dist/servicios/index.html ; '/' -> dist/index.html
function archivoDe(ruta) {
  const limpio = ruta.replace(/^\/+|\/+$/g, '');
  return limpio ? join(dist, limpio, 'index.html') : join(dist, 'index.html');
}

// '/en/services' -> '/en/services/' ; '/' -> '/'  (la forma que usan canonical y sitemap)
function conBarra(ruta) {
  return ruta.endsWith('/') ? ruta : `${ruta}/`;
}

// dist/en/services/index.html -> '/en/services/'
function urlDe(archivo) {
  const rel = relative(dist, archivo).split('\\').join('/');
  return '/' + rel.replace(/index\.html$/, '');
}

console.log(`\nValidación del sitio Asecon`);
console.log(`  site esperado: ${SITE}${esPreview ? '  (build de preview)' : ''}`);

// ── 0. Build ────────────────────────────────────────────────────────────────
if (sinBuild) {
  console.log(`\n0. Build — omitido (--no-build)`);
} else {
  console.log(`\n0. Build`);
  const r = spawnSync('npm', ['run', 'build'], { cwd: raiz, shell: true, stdio: 'inherit' });
  if (r.status !== 0) {
    console.log('\n  [x]   `npm run build` falló. No se valida un artefacto roto.\n');
    process.exit(1);
  }
  reportar('`npm run build` termina sin error', []);
}

if (!existsSync(dist)) {
  console.log(`\n  [x]   No existe dist/. Corre \`npm run validate\` sin --no-build.\n`);
  process.exit(1);
}

const { routes, navOrder, path: rutaDe, languages } = await import(
  pathToFileURL(join(raiz, 'src/i18n/config.js')).href
);
const { content, team } = await import(pathToFileURL(join(raiz, 'src/data/content.js')).href);

const paginas = archivosDe(dist, (f) => f.endsWith('.html'));
const htmlDe = new Map(paginas.map((f) => [urlDe(f), readFileSync(f, 'utf8')]));
const idiomas = Object.keys(languages);

// ── 1. Páginas esperadas ────────────────────────────────────────────────────
console.log(`\n1. Páginas`);
{
  const faltan = [];
  for (const clave of Object.keys(routes)) {
    for (const lang of idiomas) {
      const ruta = rutaDe(clave, lang);
      if (!existsSync(archivoDe(ruta))) faltan.push(`${clave} (${lang}) → ${ruta}`);
    }
  }
  if (!existsSync(join(dist, 'cms', 'index.html'))) faltan.push('/cms');
  if (adminHabilitado && !existsSync(join(dist, 'admin', 'index.html'))) {
    faltan.push('/admin (PUBLIC_ENABLE_ADMIN=true pero no se generó)');
  }
  for (const archivo of ['sitemap.xml', 'robots.txt', '_redirects']) {
    if (!existsSync(join(dist, archivo))) faltan.push(archivo);
  }
  reportar(`las ${Object.keys(routes).length} rutas en los dos idiomas, /cms, sitemap y robots`, faltan);

  // La otra mitad de la regla: en salida estática no hay forma de proteger
  // una página publicada, así que /admin solo puede estar a salvo si no
  // existe en absoluto. Si esto falla, algo generó el panel sin que se haya
  // pedido a propósito con PUBLIC_ENABLE_ADMIN=true.
  const sobra = !adminHabilitado && existsSync(join(dist, 'admin', 'index.html'))
    ? ['/admin/ existe en dist/ sin PUBLIC_ENABLE_ADMIN=true: no debería publicarse']
    : [];
  reportar('/admin no existe en dist/ salvo que se pida a propósito', sobra);
}

// ── 2. Borradores ───────────────────────────────────────────────────────────
console.log(`\n2. Borradores`);
{
  const publicados = [];
  const dirPosts = join(raiz, 'src/content/posts');
  for (const archivo of readdirSync(dirPosts).filter((f) => f.endsWith('.md'))) {
    const md = readFileSync(join(dirPosts, archivo), 'utf8');
    if (!/^draft:\s*true\s*$/m.test(md)) continue;
    const slug = archivo.replace(/\.md$/, '');
    const lang = (md.match(/^lang:\s*"?(\w+)"?/m) || [])[1] === 'en' ? 'en' : 'es';
    const base = lang === 'en' ? '/en/insights/' : '/novedades/';
    if (existsSync(archivoDe(base + slug))) publicados.push(`${archivo} tiene draft: true y quedó en ${base}${slug}`);
  }
  reportar('ninguna nota con draft: true está publicada', publicados);
}

// ── 3. Canonical ────────────────────────────────────────────────────────────
console.log(`\n3. Canonical`);
{
  const malas = [];
  for (const [url, html] of htmlDe) {
    // /cms es la página estática de Decap, no la genera el Layout del sitio.
    // /404.html: Astro construye su Astro.url.pathname como '/404', pero el
    // archivo se emite como 404.html (sin carpeta propia) — el canonical que
    // arma el Layout ('.../404') nunca va a coincidir con la URL del artefacto
    // ('.../404.html'). Es un desajuste conocido de esta ruta especial, no un
    // bug del contenido: se exime en vez de forzar una URL falsa.
    if (url in REDIRECCIONES || url.startsWith('/cms') || url === '/404.html') continue;
    const encontrados = [...html.matchAll(/rel="canonical"\s+href="([^"]+)"/g)].map((m) => m[1]);
    if (encontrados.length !== 1) {
      malas.push(`${url} tiene ${encontrados.length} canonical (debe tener exactamente 1)`);
      continue;
    }
    const esperado = `${SITE}${url}`;
    if (encontrados[0] !== esperado) malas.push(`${url} → ${encontrados[0]} (esperado ${esperado})`);
  }
  reportar(`un solo canonical por página y apuntando a ${SITE}`, malas);
}

// ── 4. hreflang ─────────────────────────────────────────────────────────────
console.log(`\n4. hreflang`);
{
  const malas = [];
  const sinBarra = [];
  for (const clave of Object.keys(routes)) {
    for (const lang of idiomas) {
      const url = conBarra(rutaDe(clave, lang));
      const html = htmlDe.get(url);
      if (!html) continue;
      for (const otro of idiomas) {
        const etiqueta = languages[otro].htmlLang;
        const ruta = rutaDe(clave, otro);
        const emitido = (html.match(new RegExp(`hreflang="${etiqueta}" href="([^"]+)"`)) || [])[1];
        if (!emitido) { malas.push(`${url} le falta hreflang="${etiqueta}"`); continue; }
        // Se acepta con o sin barra final: la barra se compara aparte, como aviso.
        if (emitido.replace(/\/$/, '') !== `${SITE}${ruta}`.replace(/\/$/, '')) {
          malas.push(`${url} apunta hreflang="${etiqueta}" a ${emitido} (esperado ${SITE}${ruta})`);
        } else if (emitido !== `${SITE}${conBarra(ruta)}` && conBarra(ruta) !== '/') {
          sinBarra.push(`${url} → ${emitido} (el canonical de esa página sí lleva barra final)`);
        }
      }
      if (!html.includes('hreflang="x-default"')) malas.push(`${url} le falta x-default`);
    }
  }
  reportar('cada página apunta a su par en el otro idioma y declara x-default', malas);
  reportar(
    'los hreflang usan la misma forma de URL que el canonical',
    sinBarra.length ? [`${sinBarra.length} enlaces hreflang van sin barra final mientras el canonical la lleva`, ...sinBarra.slice(0, 3)] : [],
    'aviso'
  );
}

// ── 5. Indexación ───────────────────────────────────────────────────────────
console.log(`\n5. Indexación`);
{
  const malas = [];
  for (const url of NOINDEX) {
    const html = htmlDe.get(url);
    if (!html) { malas.push(`${url} no existe en dist/`); continue; }
    if (!/name="robots"\s+content="noindex/.test(html)) malas.push(`${url} debería llevar noindex y no lo lleva`);
  }
  for (const [url, html] of htmlDe) {
    if (NOINDEX.includes(url) || url in REDIRECCIONES || url.startsWith('/cms')) continue;
    if (/name="robots"\s+content="noindex/.test(html)) malas.push(`${url} lleva noindex y no debería`);
  }
  reportar('noindex exactamente en las páginas que no son contenido público', malas);

  const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
  const robotsMal = [];
  if (esPreview) {
    if (!/^Disallow:\s*\/\s*$/m.test(robots)) {
      robotsMal.push('build de preview sin `Disallow: /` (el workflow lo sobrescribe después del build; si estás validando en local es normal)');
    }
  } else {
    for (const ruta of ['/gracias', '/en/thank-you', '/admin', '/cms']) {
      if (!robots.includes(`Disallow: ${ruta}`)) robotsMal.push(`falta \`Disallow: ${ruta}\``);
    }
    if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) robotsMal.push(`la línea Sitemap no apunta a ${SITE}/sitemap.xml`);
  }
  reportar('robots.txt coherente con el entorno', robotsMal, esPreview ? 'aviso' : 'error');
}

// ── 6. Sitemap ──────────────────────────────────────────────────────────────
console.log(`\n6. Sitemap`);
{
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const malas = [];
  for (const clave of navOrder) {
    for (const lang of idiomas) {
      const url = `${SITE}${conBarra(rutaDe(clave, lang))}`;
      if (!locs.includes(url)) malas.push(`falta ${url}`);
    }
  }
  for (const loc of locs) {
    if (!loc.startsWith(SITE)) malas.push(`${loc} no usa ${SITE}`);
    if (/\/(gracias|thank-you|admin|cms)\/?$/.test(loc)) malas.push(`${loc} no debería estar en el sitemap`);
  }
  reportar(`las ${navOrder.length} páginas del menú en los dos idiomas, todas con ${SITE}`, malas);

  const notas = [...htmlDe.keys()].filter((u) => /^\/(novedades|en\/insights)\/.+/.test(u));
  const notasFuera = notas.filter((u) => !locs.includes(`${SITE}${u}`));
  reportar('las notas de Novedades están en el sitemap', notasFuera.map((u) => `${u} no aparece`), 'aviso');
}

// ── 7. Redirecciones ────────────────────────────────────────────────────────
console.log(`\n7. Redirecciones`);
{
  const malas = [];
  for (const [url, destino] of Object.entries(REDIRECCIONES)) {
    const html = htmlDe.get(url);
    if (!html) { malas.push(`${url} no genera página de redirección`); continue; }
    if (!html.includes(`url=${SITE}${destino}`)) malas.push(`${url} no redirige a ${SITE}${destino}`);
    if (!/name="robots"\s+content="noindex/.test(html)) malas.push(`${url} debería ser noindex`);
  }
  const redirects = readFileSync(join(dist, '_redirects'), 'utf8');
  for (const origen of Object.keys(REDIRECCIONES)) {
    const limpio = origen.replace(/\/$/, '');
    if (!redirects.includes(limpio)) malas.push(`_redirects no cubre ${limpio}`);
  }
  reportar('/soluciones y /en/solutions redirigen y no se indexan', malas);
}

// ── 8. Enlaces y archivos referenciados ─────────────────────────────────────
console.log(`\n8. Enlaces e imágenes`);
{
  const rotos = new Set();
  for (const [url, html] of htmlDe) {
    const refs = [...html.matchAll(/(?:href|src|poster)="(\/[^"#?]*)/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (ref.startsWith('//')) continue;
      const tieneExtension = /\.[a-z0-9]{2,5}$/i.test(ref);
      const destino = tieneExtension
        ? join(dist, ref.slice(1))
        : archivoDe(ref);
      if (!existsSync(destino)) rotos.add(`${ref}  (referenciado en ${url})`);
    }
  }
  reportar('toda ruta interna y todo archivo referenciado existe en dist/', [...rotos]);
}

// ── 9. Paridad de textos ES/EN ──────────────────────────────────────────────
console.log(`\n9. Paridad ES/EN`);
{
  const claves = (obj, prefijo = '', acc = []) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      const ruta = prefijo ? `${prefijo}.${k}` : k;
      acc.push(ruta);
      if (v && typeof v === 'object' && !Array.isArray(v)) claves(v, ruta, acc);
    }
    return acc;
  };
  const es = new Set(claves(content.es));
  const en = new Set(claves(content.en));
  const malas = [
    ...[...es].filter((k) => !en.has(k)).map((k) => `content.en le falta \`${k}\``),
    ...[...en].filter((k) => !es.has(k)).map((k) => `content.es le falta \`${k}\``),
  ];
  reportar(`${es.size} claves de contenido, las mismas en los dos idiomas`, malas);

  const largos = (obj, prefijo = '', acc = new Map()) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      const ruta = prefijo ? `${prefijo}.${k}` : k;
      if (Array.isArray(v)) acc.set(ruta, v.length);
      else if (v && typeof v === 'object') largos(v, ruta, acc);
    }
    return acc;
  };
  const largosEs = largos(content.es);
  const largosEn = largos(content.en);
  const distintos = [...largosEs].filter(([k, n]) => largosEn.has(k) && largosEn.get(k) !== n)
    .map(([k, n]) => `\`${k}\`: ${n} en español, ${largosEn.get(k)} en inglés`);
  reportar('las listas tienen la misma cantidad de elementos en los dos idiomas', distintos, 'aviso');
}

// ── 10. Fugas en el artefacto ───────────────────────────────────────────────
console.log(`\n10. Fugas en el build`);
{
  const textos = archivosDe(dist, (f) => /\.(html|js|css|xml|txt|json|map)$/i.test(f));
  const secretos = [
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clave privada'],
    [/\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{20,}/, 'token de GitHub'],
    [/\bgithub_pat_[A-Za-z0-9_]{20,}/, 'token de GitHub (fine-grained)'],
    [/\bsk_(?:live|test)_[A-Za-z0-9]{10,}/, 'clave secreta de Stripe'],
    [/\bAKIA[0-9A-Z]{16}\b/, 'clave de AWS'],
    [/\bAIza[0-9A-Za-z_-]{30,}/, 'clave de Google'],
  ];
  const hallazgos = [];
  const dev = [];
  for (const archivo of textos) {
    const texto = readFileSync(archivo, 'utf8');
    const rel = relative(dist, archivo).split('\\').join('/');
    for (const [patron, nombre] of secretos) {
      if (patron.test(texto)) hallazgos.push(`posible ${nombre} en ${rel}`);
    }
    if (/localhost:4321|127\.0\.0\.1:4321|PREVIEW_SITE_URL/.test(texto)) dev.push(rel);
  }
  if (existsSync(join(dist, '.env'))) hallazgos.push('dist/.env existe y no debería salir en el artefacto');
  reportar('sin credenciales privadas dentro de dist/', hallazgos);
  reportar('sin URLs de desarrollo dentro de dist/', [...new Set(dev)]);
  console.log('         nota: PUBLIC_WEB3FORMS_KEY sí aparece en el HTML, por diseño (es la clave');
  console.log('         de destinatario de Web3Forms, no un secreto).');
}

// ── 11. Equipo — fotos ──────────────────────────────────────────────────────
console.log(`\n11. Equipo — fotos`);
{
  const malas = [];
  for (const persona of team) {
    if (persona.img === null) continue;
    if (typeof persona.img !== 'string' || !persona.img.startsWith('/')) {
      malas.push(`${persona.id}: img inválido (${JSON.stringify(persona.img)}) — usa una ruta o \`null\` explícito`);
      continue;
    }
    if (!existsSync(join(dist, persona.img.slice(1)))) {
      malas.push(`${persona.id}: ${persona.img} no existe en dist/`);
    }
  }
  reportar('cada persona de team tiene una foto que existe, o img: null explícito', malas);
}

// ── 12. Formulario ──────────────────────────────────────────────────────────
console.log(`\n12. Formulario`);
{
  // El fallo real de este sitio no fue la clave vacía en sí, sino que el
  // <form> apuntaba a Web3Forms de todos modos: sin JS, el visitante salía
  // del sitio a la respuesta de error de un tercero. Esta regla asegura que
  // eso no pueda volver a pasar en silencio.
  const malas = [];
  for (const [url, html] of htmlDe) {
    if (!html.includes('api.web3forms.com/submit')) continue;
    const m = html.match(/name="access_key"\s+value="([^"]*)"/);
    if (!m) { malas.push(`${url} usa Web3Forms pero no encuentro el input access_key`); continue; }
    if (m[1].trim() === '') malas.push(`${url}: apunta a Web3Forms con access_key vacío (quedaría roto en producción)`);
  }
  reportar('todo formulario que apunta a Web3Forms lleva access_key definido', malas);

  // Fase 3 — capa legal: todo formulario de leads tiene que pedir consentimiento.
  const sinConsentimiento = [];
  for (const [url, html] of htmlDe) {
    const formularios = [...html.matchAll(/<form\b[^>]*data-form="lead"[\s\S]*?<\/form>/g)];
    for (const f of formularios) {
      if (!/name="consent"[^>]*\brequired\b|required[^>]*name="consent"/.test(f[0])) {
        sinConsentimiento.push(`${url}: un <form data-form="lead"> no tiene un input name="consent" required`);
      }
    }
  }
  reportar('todo formulario de leads pide consentimiento (name="consent" required)', sinConsentimiento);
}

// ── 13. Terceros fuera de lugar ─────────────────────────────────────────────
console.log(`\n13. Terceros fuera de lugar`);
{
  const malas = [];
  for (const [url, html] of htmlDe) {
    if (url.startsWith('/cms')) continue;
    if (html.includes('identity.netlify.com')) {
      malas.push(`${url} carga el widget de Netlify Identity (solo debería estar dentro de /cms)`);
    }
  }
  reportar('el widget de Netlify Identity solo se carga dentro de /cms', malas);

  // Fraunces e IBM Plex Mono se autoalojan (public/fonts/) precisamente para
  // no depender de Google en cada carga; esta regla evita que alguien vuelva
  // a pegar el <link> de fonts.googleapis.com sin querer.
  const conGoogleFonts = [];
  for (const [url, html] of htmlDe) {
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) conGoogleFonts.push(url);
  }
  reportar('las fuentes están autoalojadas (sin fonts.googleapis.com ni fonts.gstatic.com)', conGoogleFonts);
}

// ── Resumen ─────────────────────────────────────────────────────────────────
console.log('');
if (fallas === 0 && avisos === 0) console.log('Todo en orden.\n');
else console.log(`${fallas} falla(s), ${avisos} aviso(s).\n`);

if (fallas > 0) {
  console.log('Los avisos no rompen el build; las fallas sí. Revisa cada [x] antes de publicar.\n');
}
process.exit(fallas > 0 ? 1 : 0);
