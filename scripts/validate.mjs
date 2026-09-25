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
// Netlify Identity no se cargue fuera de /cms. Desde la revisión del
// 2026-09-24 también mira el HTML como lo ejecuta un navegador: scripts que
// Astro dejó sin procesar (17), formularios inactivos que igual se envían
// con Enter (18), restos del agendamiento retirado (19), y como avisos,
// enlaces internos sin barra final (20) y `hidden` pisado por una clase de
// display (21).
//
// El artefacto cambia con las variables de activación, así que la puerta se
// corre en varias combinaciones y no en una: con y sin
// PUBLIC_PREVIEW_CHANNELS=1, con y sin PUBLIC_WEB3FORMS_KEY, y con
// PUBLIC_ENABLE_ADMIN=true (ver el README, "Validar el sitio antes de
// publicar").
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

// `evaluados` es cuántos casos miró de verdad la regla. Cuando es 0, la regla
// no probó nada: decir [ok] ahí es engañoso, porque suena a garantía cuando en
// realidad es una guarda antirregresión esperando a tener algo que vigilar.
// Se marca [n/a] y se dice por qué. Las reglas que no lo pasan no cambian:
// siguen mostrando [ok], que en su caso sí significa "lo miré y está bien".
function reportar(nombre, problemas, nivel = 'error', evaluados = null) {
  if (problemas.length === 0 && evaluados === 0) {
    console.log(`  [n/a] ${nombre} — nada que evaluar todavía`);
    return;
  }
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

// Lectura mínima de etiquetas y atributos para las secciones 17 a 21. No es
// un parser de HTML: alcanza para lo que emite Astro (atributos con comillas
// dobles casi siempre, sin `>` dentro de los valores), que es lo único que
// este script lee. `atributos()` devuelve los nombres en minúscula; un
// atributo sin valor (`hidden`, `required`) queda con valor ''.
const ETIQUETA = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>"'/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*\/?>/g;
const ATRIBUTO = /([^\s=>"'/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g;
function atributos(texto) {
  const acc = {};
  for (const a of texto.matchAll(ATRIBUTO)) {
    const nombre = a[1].toLowerCase();
    if (!(nombre in acc)) acc[nombre] = a[2] ?? a[3] ?? a[4] ?? '';
  }
  return acc;
}

// El marcado de una página sin comentarios ni el contenido de <script> y
// <style>: así un `<div hidden class="flex">` escrito dentro de un string de
// JS, o un href dentro de un comentario, no cuenta como elemento real.
function soloMarcado(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?(<\/script\s*>)/gi, '$1$2')
    .replace(/(<style\b[^>]*>)[\s\S]*?(<\/style\s*>)/gi, '$1$2');
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
const { content, team, company } = await import(pathToFileURL(join(raiz, 'src/data/content.js')).href);

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
  // Hoy no hay ninguna nota con draft: true, así que la regla no mira nada y
  // lo dice ([n/a]). Empieza a probar algo en cuanto alguien guarde un
  // borrador desde /cms, que es justo cuando hace falta.
  const publicados = [];
  let borradores = 0;
  const dirPosts = join(raiz, 'src/content/posts');
  for (const archivo of readdirSync(dirPosts).filter((f) => f.endsWith('.md'))) {
    const md = readFileSync(join(dirPosts, archivo), 'utf8');
    if (!/^draft:\s*true\s*$/m.test(md)) continue;
    borradores++;
    const slug = archivo.replace(/\.md$/, '');
    const lang = (md.match(/^lang:\s*"?(\w+)"?/m) || [])[1] === 'en' ? 'en' : 'es';
    const base = lang === 'en' ? '/en/insights/' : '/novedades/';
    if (existsSync(archivoDe(base + slug))) publicados.push(`${archivo} tiene draft: true y quedó en ${base}${slug}`);
  }
  reportar('ninguna nota con draft: true está publicada', publicados, 'error', borradores);
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

  // Ya no es un aviso: desde que sitemap.xml.ts suma las notas con su fecha
  // real, una nota publicada que falte acá es un error real, no un "todavía
  // no lo hicimos".
  const notas = [...htmlDe.keys()].filter((u) => /^\/(novedades|en\/insights)\/.+/.test(u));
  const notasFuera = notas.filter((u) => !locs.includes(`${SITE}${u}`));
  reportar('las notas de Novedades están en el sitemap', notasFuera.map((u) => `${u} no aparece`));
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
  // El `!` de forzado es lo que hace que la regla sirva de algo: Netlify da
  // prioridad a un archivo estático que existe por sobre una redirección, y
  // acá SIEMPRE existe uno (Astro genera la página meta-refresh de respaldo
  // para GitHub Pages). Sin el `!`, `_redirects` queda de adorno y el 301
  // real nunca ocurre — un fallo silencioso que solo se ve desplegando.
  const redirects = readFileSync(join(dist, '_redirects'), 'utf8');
  for (const origen of Object.keys(REDIRECCIONES)) {
    const limpio = origen.replace(/\/$/, '');
    const linea = redirects
      .split('\n')
      .find((l) => !l.trim().startsWith('#') && l.split(/\s+/)[0] === limpio);
    if (!linea) { malas.push(`_redirects no cubre ${limpio}`); continue; }
    if (!/\b30[12]!/.test(linea)) {
      malas.push(`_redirects cubre ${limpio} pero sin el \`!\` de forzado: el archivo estático de respaldo lo anularía y nunca habría un 301 real`);
    }
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
  // Mientras el formulario esté sin activar, LeadForm.astro ni siquiera emite
  // el `action` a Web3Forms, así que esta regla no tiene nada que mirar y lo
  // dice ([n/a], no [ok]). Importa tenerlo claro: **el primer build con
  // PUBLIC_WEB3FORMS_KEY puesta es la primera vez que esta regla prueba algo
  // de verdad** — es decir, en el paso 11 de la Fase 8, no antes.
  const malas = [];
  let conWeb3Forms = 0;
  for (const [url, html] of htmlDe) {
    if (!html.includes('api.web3forms.com/submit')) continue;
    conWeb3Forms++;
    const m = html.match(/name="access_key"\s+value="([^"]*)"/);
    if (!m) { malas.push(`${url} usa Web3Forms pero no encuentro el input access_key`); continue; }
    if (m[1].trim() === '') malas.push(`${url}: apunta a Web3Forms con access_key vacío (quedaría roto en producción)`);
  }
  reportar('todo formulario que apunta a Web3Forms lleva access_key definido', malas, 'error', conWeb3Forms);

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
  // Desde que /cms pasó a backend `github` (proxy de OAuth propio en
  // functions/api/), ya no depende de Netlify Identity en ninguna parte —
  // a diferencia de la regla anterior, que solo lo permitía dentro de /cms.
  const malas = [];
  for (const [url, html] of htmlDe) {
    if (html.includes('identity.netlify.com')) {
      malas.push(`${url} carga el widget de Netlify Identity (ya no hace falta: el backend es github)`);
    }
  }
  reportar('el widget de Netlify Identity no se carga en ninguna parte', malas);

  // Fraunces e IBM Plex Mono se autoalojan (public/fonts/) precisamente para
  // no depender de Google en cada carga; esta regla evita que alguien vuelva
  // a pegar el <link> de fonts.googleapis.com sin querer.
  const conGoogleFonts = [];
  for (const [url, html] of htmlDe) {
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) conGoogleFonts.push(url);
  }
  reportar('las fuentes están autoalojadas (sin fonts.googleapis.com ni fonts.gstatic.com)', conGoogleFonts);

  // Fase 4: si este build no definió PUBLIC_GA4_ID, googletagmanager.com no
  // puede aparecer en el artefacto — es lo que impide que un preview o un
  // envío de prueba contaminen la propiedad real con tráfico que no es de
  // producción.
  const ga4Definido = Boolean(process.env.PUBLIC_GA4_ID);
  if (!ga4Definido) {
    const conGA4 = [];
    for (const [url, html] of htmlDe) {
      if (html.includes('googletagmanager.com')) conGA4.push(url);
    }
    reportar('sin PUBLIC_GA4_ID no se carga googletagmanager.com en ningún lado', conGA4);
  }
}

// ── 14. Notas — hreflang por pareja ──────────────────────────────────────────
console.log(`\n14. Notas — hreflang por pareja`);
{
  // Antes de la Fase 5, keyFromPath() no reconocía /novedades/[slug] (no
  // vive en el mapa de `routes`) y las notas se publicaban sin hreflang.
  // Ahora cada [slug].astro lo arma a mano a partir del campo `pair` del
  // frontmatter — esta regla comprueba que el HTML de verdad lo lleve, no
  // solo que el código lo intente.
  const dirPosts = join(raiz, 'src/content/posts');
  const notas = [];
  for (const archivo of readdirSync(dirPosts).filter((f) => f.endsWith('.md'))) {
    const md = readFileSync(join(dirPosts, archivo), 'utf8');
    if (/^draft:\s*true\s*$/m.test(md)) continue;
    const slug = archivo.replace(/\.md$/, '');
    const lang = (md.match(/^lang:\s*"?(\w+)"?/m) || [])[1] === 'en' ? 'en' : 'es';
    const pair = (md.match(/^pair:\s*"?([\w-]+)"?/m) || [])[1];
    notas.push({ archivo, slug, lang, pair });
  }

  const malas = [];
  for (const nota of notas) {
    if (!nota.pair) { malas.push(`${nota.archivo} no tiene el campo pair`); continue; }
    const contraparte = notas.find((n) => n.lang !== nota.lang && n.pair === nota.pair);
    if (!contraparte) continue; // nota genuinamente sin traducción todavía: no es un error.

    const base = nota.lang === 'en' ? '/en/insights/' : '/novedades/';
    const url = conBarra(base + nota.slug);
    const html = htmlDe.get(url);
    if (!html) { malas.push(`${url} no existe en dist/`); continue; }

    const otraBase = contraparte.lang === 'en' ? '/en/insights/' : '/novedades/';
    const otraUrl = `${SITE}${conBarra(otraBase + contraparte.slug)}`;
    const etiqueta = languages[contraparte.lang].htmlLang;
    if (!html.includes(`hreflang="${etiqueta}" href="${otraUrl}"`)) {
      malas.push(`${url} no tiene hreflang="${etiqueta}" hacia ${otraUrl}`);
    }
  }
  reportar('cada nota con pareja en el otro idioma emite su hreflang', malas);
}

// ── 15. Cabeceras (Netlify) ─────────────────────────────────────────────────
console.log(`\n15. Cabeceras`);
{
  // public/_headers viaja tal cual a dist/_headers (Astro copia public/ sin
  // tocarlo). Netlify lo lee; GitHub Pages lo ignora sin romper nada.
  const malas = [];
  const ruta = join(dist, '_headers');
  if (!existsSync(ruta)) {
    malas.push('falta dist/_headers');
  } else {
    const headers = readFileSync(ruta, 'utf8');
    if (!headers.includes('Content-Security-Policy-Report-Only')) {
      malas.push('_headers no define Content-Security-Policy-Report-Only');
    }
    // Pasar la CSP a modo bloqueante (sin "-Report-Only") es una decisión de
    // activación explícita (Fase 8, tras ~7 días revisando avisos con
    // tráfico real), no algo que un build cualquiera deba poder hacer solo.
    if (/\n\s*Content-Security-Policy:/.test(headers)) {
      malas.push('_headers ya tiene una Content-Security-Policy bloqueante — activarla es un paso aparte, no de este build');
    }
  }
  reportar('dist/_headers existe y la CSP sigue en modo Report-Only', malas);
}

// ── 16. Dotación no afirmada ────────────────────────────────────────────────
console.log(`\n16. Dotación`);
{
  // Había tres cifras de dotación publicadas contradiciéndose entre sí
  // (company.headcount decía 50, las notas de los 30 años decían 28, y el
  // array `team` lista 30 personas). Ninguna estaba confirmada por el
  // estudio, así que se retiró la afirmación en vez de elegir una.
  //
  // Mientras company.headcount siga vacío, el sitio no puede volver a
  // publicar una cifra de dotación por descuido — ni en la copy, ni en una
  // nota nueva escrita desde /cms. El día que Asecon confirme el número,
  // esta sección deja de aplicar sola (la condición de abajo se vuelve falsa).
  if (company.headcount) {
    console.log(`  [n/a] company.headcount = ${company.headcount}: la cifra está confirmada y puede publicarse`);
  } else {
    // Deliberadamente NO incluye "personas"/"people": /equipo/ los usa para
    // el tamaño de cada grupo del organigrama, que es una cifra derivada de
    // la gente efectivamente listada y que el visitante puede contar. Lo que
    // no puede afirmarse es la dotación del estudio, y esas son las palabras
    // con las que se afirma.
    const patron = /\b\d{1,3}\s+(profesionales|professionals|empleados|employees)\b/gi;
    const conCifra = [];
    for (const [url, html] of htmlDe) {
      const texto = html.replace(/<[^>]+>/g, ' ');
      for (const hallazgo of texto.matchAll(patron)) {
        conCifra.push(`${url}: "${hallazgo[0].trim()}"`);
      }
    }
    reportar(
      'sin dotación confirmada, ninguna página afirma un número de profesionales',
      [...new Set(conCifra)]
    );
  }
}

// ── 17. Scripts en línea sin procesar ───────────────────────────────────────
console.log(`\n17. Scripts en línea`);
{
  // Q1 (revisión del 2026-09-24): Astro solo procesa —empaqueta, resuelve
  // los `import`— un <script> que está en el nivel superior de la plantilla.
  // Si queda dentro de una expresión (`{show && (<script>…)}`), sale al HTML
  // tal cual lo escribió alguien: un script clásico con `import '../x.js'`
  // adentro, que el navegador rechaza con un SyntaxError. El componente
  // queda muerto y la consola con un error en cada página, y el build no se
  // entera. Solo se miran scripts clásicos (sin `type` o con un tipo de
  // JavaScript): JSON-LD, importmap y plantillas no son código que se
  // ejecute, y los módulos sí pueden importar (se miran aparte, abajo).
  const TIPOS_CLASICOS = new Set(['', 'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']);
  // `import x from`, `import {…} from`, `import * as`, `import 'x'`, o
  // `import.meta`, al comienzo de una sentencia. No atrapa `import(...)`,
  // que es legal en un script clásico.
  const IMPORT_ESTATICO = /(?:^|[;{}\n\r])\s*(import\s*(?:["'`]|[\w$*{])[^\n;]*|import\.meta\b[^\n;]*)/;
  // Especificadores de un módulo en línea: `from "x"`, `import "x"`, `import("x")`.
  const ESPECIFICADOR = /\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/g;

  const sinProcesar = new Map(); // fragmento → páginas: el mismo componente se repite en todas
  const importsRotos = [];
  let clasicos = 0;
  let modulos = 0;
  for (const [url, html] of htmlDe) {
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const attrs = atributos(m[1]);
      if ('src' in attrs) continue; // externo: que el archivo exista lo cuida la sección 8
      const tipo = (attrs.type ?? '').trim().toLowerCase();
      const codigo = m[2].replace(/\/\*[\s\S]*?\*\//g, '');

      if (tipo === 'module') {
        // Un <script type="module"> con atributos distintos de `src` Astro
        // tampoco lo procesa (lo trata como is:inline): "arreglar" Q1
        // agregando type="module" deja un import relativo a la URL de la
        // página, que da 404. Por eso cada especificador tiene que resolver
        // a un archivo que exista en dist/.
        modulos++;
        for (const e of codigo.matchAll(ESPECIFICADOR)) {
          const espec = e[1] ?? e[2];
          if (/^https?:\/\//.test(espec)) continue; // externo: asunto de la CSP, no de este chequeo
          if (!/^\.{0,2}\//.test(espec)) {
            importsRotos.push(`${url}: módulo en línea importa "${espec}" (especificador desnudo: el navegador no lo resuelve)`);
            continue;
          }
          const destino = new URL(espec, `https://x${url}`).pathname;
          if (!existsSync(join(dist, decodeURIComponent(destino).slice(1)))) {
            importsRotos.push(`${url}: módulo en línea importa "${espec}" → ${destino}, que no existe en dist/`);
          }
        }
        continue;
      }
      if (!TIPOS_CLASICOS.has(tipo)) continue; // application/ld+json, importmap, plantillas
      clasicos++;
      const hallazgo = codigo.match(IMPORT_ESTATICO);
      if (hallazgo) {
        const fragmento = hallazgo[1].trim().slice(0, 70);
        if (!sinProcesar.has(fragmento)) sinProcesar.set(fragmento, []);
        sinProcesar.get(fragmento).push(url);
      }
    }
  }
  reportar(
    'ningún <script> clásico en línea contiene un import (Astro no lo procesó)',
    [...sinProcesar].map(([fragmento, urls]) =>
      `\`${fragmento}\` en un <script> clásico, en ${urls.length} página${urls.length === 1 ? '' : 's'} (${urls.slice(0, 3).join(', ')}${urls.length > 3 ? ', …' : ''}) — salió sin procesar: ¿está dentro de una expresión {…} de Astro?`
    ),
    'error',
    clasicos
  );
  reportar('los import de cada módulo en línea resuelven a un archivo de dist/', importsRotos, 'error', modulos);
}

// ── 18. Formularios inactivos ───────────────────────────────────────────────
console.log(`\n18. Formularios inactivos`);
{
  // Q2 (revisión del 2026-09-24): mientras falte PUBLIC_WEB3FORMS_KEY,
  // LeadForm.astro emite el <form data-form="lead"> sin `action` y su botón
  // principal como type="button", para que nada lo envíe. Pero bastaba un
  // solo botón que enviara —el "Reintentar" oculto del panel de error era
  // type="submit"— para que Enter en cualquier campo disparara el envío: sin
  // JS, un GET a la misma página con los datos del visitante en la URL (una
  // navegación que parece un éxito); con JS, un POST a la propia página.
  // Un <button> sin `type` (o con uno inválido) también envía: es el valor
  // por defecto del HTML.
  const conEnvio = [];
  const sinPost = [];
  let inactivos = 0;
  let activos = 0;
  for (const [url, html] of htmlDe) {
    for (const m of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form\s*>/gi)) {
      const attrs = atributos(m[1]);
      if (attrs['data-form'] !== 'lead') continue;
      const variante = attrs['data-form-variant'] || 'sin variante';
      const action = (attrs.action ?? '').trim();

      if (action) {
        // Activo: la otra mitad del mismo defecto. Sin method="post", el
        // envío nativo (sin JS) viaja por GET y deja nombre, correo y
        // mensaje en la URL, en el historial y en los logs del servidor.
        activos++;
        if ((attrs.method ?? '').trim().toLowerCase() !== 'post') {
          sinPost.push(`${url} (${variante}): action="${action}" sin method="post" — sin JS, los datos irían en la URL`);
        }
        continue;
      }

      inactivos++;
      const cuerpo = soloMarcado(m[2]);
      for (const b of cuerpo.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button\s*>/gi)) {
        const tipo = (atributos(b[1]).type ?? '').trim().toLowerCase();
        if (tipo === 'button' || tipo === 'reset') continue;
        const texto = b[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
        conEnvio.push(`${url} (${variante}): formulario sin action con <button${tipo ? ` type="${tipo}"` : ' sin type'}> "${texto}" — Enter lo enviaría`);
      }
      for (const t of cuerpo.matchAll(ETIQUETA)) {
        if (t[1].toLowerCase() !== 'input') continue;
        const tipo = (atributos(t[2]).type ?? '').trim().toLowerCase();
        if (tipo === 'submit' || tipo === 'image') {
          conEnvio.push(`${url} (${variante}): formulario sin action con <input type="${tipo}"> — Enter lo enviaría`);
        }
      }
    }
  }
  reportar('ningún formulario de leads sin action tiene un botón que lo envíe', conEnvio, 'error', inactivos);
  reportar('todo formulario de leads con action envía por POST', sinPost, 'error', activos);
}

// ── 19. Canal de agendamiento retirado ──────────────────────────────────────
console.log(`\n19. Agendamiento retirado`);
{
  // El agendamiento en línea se retiró por decisión de negocio el 2026-09-23
  // (no es un pendiente: no vuelve). Q3 mostró que el texto legal lo siguió
  // nombrando después. Cualquier mención en el artefacto —una ruta, un
  // enlace, un evento de medición o la copy— es un resto que hay que sacar,
  // no algo a lo que acostumbrarse. Se miran todos los archivos de texto que
  // salen a producción, incluidos _redirects, _headers y la config del CMS.
  const PATRONES = [
    [/\/agendar(?![\w-])/i, 'la ruta /agendar'],
    [/\/en\/book(?![\w-])/i, 'la ruta /en/book'],
    [/agendamiento/i, '"agendamiento"'],
    [/scheduling\s+provider/i, '"scheduling provider"'],
    [/\bbooking_(?:click|completed)\b/, 'un evento booking_* de medición'],
  ];
  const textos = archivosDe(
    dist,
    (f) => /\.(html|js|mjs|css|xml|txt|json|ya?ml|svg|webmanifest)$/i.test(f) || f === '_redirects' || f === '_headers'
  );
  const restos = [];
  for (const ruta of ['agendar', join('en', 'book')]) {
    if (existsSync(join(dist, ruta))) restos.push(`dist/${ruta.split('\\').join('/')}/ existe: la página del canal retirado volvió a generarse`);
  }
  for (const archivo of textos) {
    const texto = readFileSync(archivo, 'utf8');
    const rel = relative(dist, archivo).split('\\').join('/');
    for (const [patron, nombre] of PATRONES) {
      const m = patron.exec(texto);
      if (!m) continue;
      const contexto = texto
        .slice(Math.max(0, m.index - 60), m.index + m[0].length + 40)
        .replace(/^[^<]*?>/, '') // el recorte puede partir a la mitad de una etiqueta
        .replace(/<[^>]*>?/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      restos.push(`${rel}: ${nombre} — "…${contexto}…"`);
    }
  }
  reportar('ninguna ruta, enlace ni texto del agendamiento retirado', restos);
}

// ── 20. Enlaces internos sin barra final ────────────────────────────────────
console.log(`\n20. Enlaces sin barra final`);
{
  // Cada página vive en /ruta/index.html y su canonical lleva barra final.
  // Un enlace a /ruta (sin barra) funciona, pero le cuesta al visitante un
  // 301 extra en cada clic (GitHub Pages y Netlify redirigen a /ruta/) y le
  // da a los buscadores dos URL para la misma página. Aviso, no falla: no
  // rompe nada visible. Se excluyen anclas, mailto:/tel:, archivos con
  // extensión y /api/ (las Netlify Functions no llevan barra por diseño).
  const origen = new URL(SITE).origin;
  const porRuta = new Map();
  let apariciones = 0;
  for (const [url, html] of htmlDe) {
    for (const t of soloMarcado(html).matchAll(ETIQUETA)) {
      const href = atributos(t[2]).href;
      if (href === undefined) continue;
      let ruta;
      if (/^\/(?!\/)/.test(href)) ruta = href;
      else if (href.startsWith(`${origen}/`)) ruta = href.slice(origen.length);
      else continue; // externo, ancla, mailto:, tel:, javascript:
      const camino = ruta.split(/[?#]/)[0];
      if (camino.endsWith('/') || /\.[a-z0-9]{2,12}$/i.test(camino) || camino.startsWith('/api/')) continue;
      apariciones++;
      if (!porRuta.has(camino)) porRuta.set(camino, new Set());
      porRuta.get(camino).add(url);
    }
  }
  const lista = [...porRuta]
    .sort((a, b) => b[1].size - a[1].size)
    .map(([camino, paginas]) => `${camino} → debería ser ${camino}/  (en ${paginas.size} página${paginas.size === 1 ? '' : 's'})`);
  reportar(
    'los enlaces internos llevan barra final (sin 301 de más)',
    lista.length ? [`${porRuta.size} rutas distintas, ${apariciones} enlaces en total`, ...lista] : [],
    'aviso'
  );
}

// ── 21. `hidden` pisado por una clase de display ────────────────────────────
console.log(`\n21. hidden y clases de display`);
{
  // Q4 (revisión del 2026-09-24): el atributo `hidden` solo oculta porque la
  // hoja del navegador (y el preflight de Tailwind) le da display:none con
  // la especificidad de un atributo — la misma que una clase. Una utilidad
  // de Tailwind como `flex` viene después en la cascada y gana: el elemento
  // se ve aunque diga `hidden`. Pasó con el botón de pausa del video del
  // hero, visible en móvil sin video. Aviso, porque puede ser intencional si
  // el script siempre lo quita; pero entonces conviene cambiar la clase.
  //
  // No es falso positivo cuando una regla más específica ya lo resuelve
  // (`.news-item[hidden]{display:none}` en NewsList.astro): esas reglas se
  // leen del CSS de dist/ y los elementos que calzan con ellas se eximen.
  const DISPLAY = /^!?(?:(?:sm|md|lg|xl|2xl|max-(?:sm|md|lg|xl|2xl)):)*(?:flex|inline-flex|grid|inline-grid|block|inline-block|inline|table|flow-root|contents)$/;

  // Reglas `…X[hidden]{display:none}` con algo más que [hidden] en el
  // compuesto: cada una se reduce a la lista de selectores simples (clase,
  // id, atributo) que el elemento tiene que cumplir para quedar eximido.
  const css = [
    ...archivosDe(dist, (f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')),
    ...[...htmlDe.values()].flatMap((h) => [...h.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1])),
  ].join('\n');
  const exenciones = [];
  for (const regla of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/display\s*:\s*none/.test(regla[2])) continue;
    for (const selector of regla[1].split(',')) {
      // `:not([hidden])` dice lo contrario (los espaciadores de Tailwind lo usan): no cuenta.
      const compuesto = selector.trim().replace(/:not\([^)]*\)/g, '').split(/\s*[\s>+~]\s*/).pop() ?? '';
      if (!compuesto.includes('[hidden]')) continue;
      const simples = compuesto
        .replace(/:where\([^)]*\)|:is\([^)]*\)/g, '')
        .replace(/\[hidden\]|\[data-astro-cid-[\w-]+\]/g, '')
        .match(/[.#][\w-]+|\[[\w-]+(?:[~|^$*]?=[^\]]*)?\]/g);
      if (simples?.length) exenciones.push(simples);
    }
  }
  const cumple = (attrs, simple) => {
    const clases = (attrs.class ?? '').split(/\s+/);
    if (simple.startsWith('.')) return clases.includes(simple.slice(1));
    if (simple.startsWith('#')) return attrs.id === simple.slice(1);
    return simple.slice(1).split(/[~|^$*]?=/)[0].toLowerCase() in attrs;
  };

  const porElemento = new Map();
  let conHidden = 0;
  for (const [url, html] of htmlDe) {
    for (const t of soloMarcado(html).matchAll(ETIQUETA)) {
      const attrs = atributos(t[2]);
      if (!('hidden' in attrs) || attrs.hidden === 'until-found') continue;
      conHidden++;
      const pisan = (attrs.class ?? '').split(/\s+/).filter((c) => DISPLAY.test(c));
      if (!pisan.length) continue;
      if (exenciones.some((simples) => simples.every((s) => cumple(attrs, s)))) continue;
      const quien = `<${t[1].toLowerCase()}${attrs.id ? ` id="${attrs.id}"` : ''}> lleva hidden y la clase ${pisan.join(' ')}`;
      if (!porElemento.has(quien)) porElemento.set(quien, []);
      porElemento.get(quien).push(url);
    }
  }
  reportar(
    'ningún elemento con hidden tiene una clase de display que lo vuelva visible',
    [...porElemento].map(([quien, urls]) => `${quien} — se ve igual (${urls.slice(0, 3).join(', ')}${urls.length > 3 ? `, +${urls.length - 3}` : ''})`),
    'aviso',
    conHidden
  );
}

// ── Resumen ─────────────────────────────────────────────────────────────────
console.log('');
if (fallas === 0 && avisos === 0) console.log('Todo en orden.\n');
else console.log(`${fallas} falla(s), ${avisos} aviso(s).\n`);

if (fallas > 0) {
  console.log('Los avisos no rompen el build; las fallas sí. Revisa cada [x] antes de publicar.\n');
}
process.exit(fallas > 0 ? 1 : 0);
