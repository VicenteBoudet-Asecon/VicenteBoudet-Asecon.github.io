#!/usr/bin/env node
// Smoke test de una URL ya desplegada. No mira el código ni dist/ local:
// pega contra el sitio de verdad, después del deploy — es lo único que
// scripts/validate.mjs no puede hacer, porque valida el artefacto antes de
// publicarlo.
//
// Uso:
//   node scripts/smoke.mjs https://aseconsa.com
//   node scripts/smoke.mjs https://vicenteboudet-asecon.github.io
//   SMOKE_CANONICAL_ORIGIN=https://aseconsa.com node scripts/smoke.mjs https://<sitio>.netlify.app
//
// Variables opcionales (por defecto asumen el estado "todavía sin activar"):
//   SMOKE_CANONICAL_ORIGIN=https://aseconsa.com
//                         el origen que el sitio declara en canonical,
//                         hreflang, sitemap y robots.txt, cuando NO es el
//                         mismo desde donde se sirve: un build de producción
//                         publicado en *.netlify.app antes del corte de DNS,
//                         o `astro preview` en local. Las páginas se piden a
//                         la URL dada; lo declarado se espera en este origen.
//                         Sin ella, se asume que son el mismo (el preview de
//                         GitHub Pages, o aseconsa.com ya cortado).
//   SMOKE_NETLIFY=1       el sitio lo sirve Netlify: exige las cabeceras de
//                         public/_headers y los 301 reales de
//                         public/_redirects. Sin ella esas comprobaciones
//                         quedan en [n/a], porque GitHub Pages y
//                         `astro preview` no pueden servir ninguna de las dos
//                         cosas — su ausencia ahí no es un defecto.
//   SMOKE_FORM_LIVE=1     espera que /contacto y /en/contact tengan
//                         access_key definido (el formulario ya activado).
//   SMOKE_ADMIN_ENABLED=1 espera que /admin responda 200 en vez de 404
//                         (PUBLIC_ENABLE_ADMIN=true en ese build).
//   SMOKE_LEGAL_INDEXABLE=1 espera que las 4 páginas legales YA no lleven
//                         noindex (el abogado firmó y salieron de la lista
//                         NOINDEX de validate.mjs — paso 5 de la Fase 8).
//
// Sale con código 1 si algo falla.

const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!base) {
  console.error('Uso: node scripts/smoke.mjs <https://dominio-desplegado>');
  process.exit(1);
}

// El origen canónico es un origen y nada más (esquema + host + puerto): si
// trajera una ruta, todas las comparaciones de abajo quedarían corridas.
const canonicoDeclarado = (process.env.SMOKE_CANONICAL_ORIGIN || '').replace(/\/+$/, '');
if (canonicoDeclarado) {
  let origen = null;
  try { origen = new URL(canonicoDeclarado).origin; } catch { /* se informa abajo */ }
  if (origen !== canonicoDeclarado) {
    console.error(`SMOKE_CANONICAL_ORIGIN debe ser un origen, sin ruta (p. ej. https://aseconsa.com); llegó "${process.env.SMOKE_CANONICAL_ORIGIN}"`);
    process.exit(1);
  }
}
const canonico = canonicoDeclarado || base;
const origenSeparado = canonico !== base;

const formularioVivo = process.env.SMOKE_FORM_LIVE === '1';
const adminHabilitado = process.env.SMOKE_ADMIN_ENABLED === '1';
const legalesIndexables = process.env.SMOKE_LEGAL_INDEXABLE === '1';
const esNetlify = process.env.SMOKE_NETLIFY === '1';

let fallas = 0;
const ok = (msg) => console.log(`  [ok]  ${msg}`);
const na = (msg) => console.log(`  [n/a] ${msg}`);
const mal = (msg) => {
  fallas++;
  console.log(`  [x]   ${msg}`);
};

async function get(path) {
  const res = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  const body = res.status < 400 ? await res.text() : '';
  return { res, body };
}

// URL absoluta declarada por el sitio → ruta a pedirle a `base`. Devuelve
// null si la URL no está en el origen canónico: eso es un defecto en sí
// (el sitemap anuncia otro dominio), no algo que se pueda "arreglar" acá
// concatenando. Antes, `url.replace(base, '')` no reemplazaba nada cuando
// los orígenes diferían, y el smoke terminaba pidiendo
// `https://x.netlify.app` + `https://aseconsa.com/servicios/`.
function rutaDe(url) {
  if (url === canonico) return '/';
  if (url.startsWith(`${canonico}/`)) return url.slice(canonico.length);
  return null;
}
const enCanonico = (url) => rutaDe(url) !== null;

console.log(`\nSmoke test — ${base}`);
if (origenSeparado) console.log(`  origen canónico esperado: ${canonico}  (SMOKE_CANONICAL_ORIGIN)`);
console.log(`  hosting: ${esNetlify ? 'Netlify (SMOKE_NETLIFY=1): se exigen cabeceras y 301 reales' : 'sin SMOKE_NETLIFY: cabeceras y 301 reales no se exigen'}\n`);

// 1. El sitemap existe, trae al menos las páginas de menú, y todas sus URL
//    están en el origen canónico. robots.txt apunta a ese mismo sitemap.
console.log('1. Sitemap y robots.txt');
let urls = [];
try {
  const { res, body } = await get('/sitemap.xml');
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length < 14) mal(`el sitemap trae ${urls.length} URLs, se esperaban al menos 14`);
  else ok(`${urls.length} URLs en el sitemap`);
  const fuera = urls.filter((u) => !enCanonico(u));
  if (fuera.length) {
    const pista = origenSeparado ? '' : ' — si el sitio se sirve desde un origen distinto del canónico, define SMOKE_CANONICAL_ORIGIN';
    mal(`${fuera.length} URL del sitemap fuera de ${canonico} (p. ej. ${fuera[0]})${pista}`);
  } else if (urls.length) {
    ok(`todas las URL del sitemap están en ${canonico}`);
  }
} catch (e) {
  mal(`no se pudo leer /sitemap.xml: ${e.message}`);
}

try {
  const { res, body } = await get('/robots.txt');
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const lineas = body.split(/\r?\n/).map((l) => l.trim());
  const sitemaps = lineas.filter((l) => /^sitemap:/i.test(l)).map((l) => l.replace(/^sitemap:\s*/i, ''));
  // El preview de GitHub Pages sobrescribe robots.txt con `Disallow: /` y
  // nada más: un sitio que se bloquea entero no tiene por qué anunciar un
  // sitemap. Cualquier otro robots.txt es el de producción.
  const bloqueaTodo = lineas.some((l) => /^disallow:\s*\/$/i.test(l));
  if (sitemaps.length) {
    const malos = sitemaps.filter((s) => s !== `${canonico}/sitemap.xml`);
    if (malos.length) mal(`robots.txt: Sitemap: ${malos[0]} (esperado ${canonico}/sitemap.xml)`);
    else ok(`robots.txt: Sitemap: ${canonico}/sitemap.xml`);
  } else if (bloqueaTodo) {
    ok('robots.txt bloquea todo el sitio y no declara Sitemap (deploy de preview)');
  } else {
    mal(`robots.txt no declara Sitemap: (esperado ${canonico}/sitemap.xml)`);
  }
  if (!bloqueaTodo) {
    const faltan = ['/gracias', '/en/thank-you', '/admin', '/cms']
      .filter((r) => !lineas.some((l) => new RegExp(`^disallow:\\s*${r.replace(/\//g, '\\/')}/?$`, 'i').test(l)));
    if (faltan.length) mal(`robots.txt no bloquea ${faltan.join(', ')}`);
    else ok('robots.txt bloquea /gracias, /en/thank-you, /admin y /cms');
  }
} catch (e) {
  mal(`no se pudo leer /robots.txt: ${e.message}`);
}

// 2. Cada URL del sitemap: 200, <title> no vacío, un solo canonical que es
//    exactamente su propia URL en el origen canónico, y hreflang (con
//    x-default) todos en ese mismo origen.
console.log('\n2. Páginas del sitemap');
for (const url of urls) {
  // Si la URL está fuera del origen canónico ya se contó como falla en la
  // sección 1; igual se pide su ruta, para no esconder los demás problemas.
  let path = rutaDe(url);
  if (path === null) {
    try { path = new URL(url).pathname; } catch { mal(`${url}: no es una URL válida`); continue; }
  }
  try {
    const { res, body } = await get(path);
    if (res.status !== 200) { mal(`${path}: status ${res.status}`); continue; }

    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title || !title.trim()) { mal(`${path}: sin <title> o vacío`); continue; }

    const canonicals = [...body.matchAll(/rel="canonical"\s+href="([^"]+)"/g)].map((m) => m[1]);
    if (canonicals.length !== 1) { mal(`${path}: ${canonicals.length} canonical (debía ser 1)`); continue; }
    if (canonicals[0] !== `${canonico}${path}`) {
      mal(`${path}: canonical ${canonicals[0]} (esperado ${canonico}${path})`);
      continue;
    }

    const hreflang = [...body.matchAll(/<link\b[^>]*\bhreflang="([^"]+)"[^>]*>/g)].map((m) => ({
      lang: m[1],
      href: (m[0].match(/\bhref="([^"]+)"/) || [])[1] || '',
    }));
    if (!hreflang.some((h) => h.lang === 'x-default')) { mal(`${path}: sin hreflang x-default`); continue; }
    const ajeno = hreflang.find((h) => !enCanonico(h.href));
    if (ajeno) { mal(`${path}: hreflang="${ajeno.lang}" apunta a ${ajeno.href}, fuera de ${canonico}`); continue; }

    ok(path);
  } catch (e) {
    mal(`${path}: ${e.message}`);
  }
}

// 3. Rutas que existen pero NO están en el sitemap, así que la sección 2
//    nunca las mira. Hasta la Fase 8 este era el hueco del smoke test: podía
//    dar verde con las 4 legales caídas, que son precisamente las que no
//    pueden faltar en producción. Se listan a mano a propósito — si alguna
//    entra al sitemap algún día, la sección 2 la cubrirá y sobra de acá.
console.log('\n3. Rutas fuera del sitemap');
const FUERA_DEL_SITEMAP = [
  // Las 4 legales × 2 idiomas. `noindex` depende de SMOKE_LEGAL_INDEXABLE.
  { path: '/privacidad/', legal: true },
  { path: '/cookies/', legal: true },
  { path: '/aviso-legal/', legal: true },
  { path: '/terminos/', legal: true },
  { path: '/en/privacy/', legal: true },
  { path: '/en/cookies/', legal: true },
  { path: '/en/legal-notice/', legal: true },
  { path: '/en/terms/', legal: true },
  // El par en inglés de /gracias/, que la sección 4 ya cubre en español.
  { path: '/en/thank-you/', noindex: true },
];

for (const { path, legal, noindex } of FUERA_DEL_SITEMAP) {
  try {
    const { res, body } = await get(path);
    if (res.status !== 200) { mal(`${path}: status ${res.status}`); continue; }

    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title || !title.trim()) { mal(`${path}: sin <title> o vacío`); continue; }

    const llevaNoindex = /name="robots"\s+content="noindex/.test(body);
    const debeLlevarlo = noindex || (legal && !legalesIndexables);

    if (debeLlevarlo && !llevaNoindex) {
      mal(`${path}: debería llevar noindex y no lo lleva`);
    } else if (legal && legalesIndexables && llevaNoindex) {
      mal(`${path}: sigue con noindex pese a SMOKE_LEGAL_INDEXABLE=1`);
    } else {
      ok(`${path}${debeLlevarlo ? ' (noindex, como se esperaba)' : ''}`);
    }
  } catch (e) {
    mal(`${path}: ${e.message}`);
  }
}

// 4. Casos especiales.
console.log('\n4. Casos especiales');
try {
  const { res, body } = await get('/gracias/');
  if (res.status !== 200) mal(`/gracias/: status ${res.status}`);
  else if (!/name="robots"\s+content="noindex/.test(body)) mal('/gracias/ no lleva noindex');
  else ok('/gracias/ responde y lleva noindex');
} catch (e) {
  mal(`/gracias/: ${e.message}`);
}

try {
  const { res } = await get('/admin/');
  if (adminHabilitado) {
    if (res.status !== 200) mal(`/admin/: se esperaba 200 (SMOKE_ADMIN_ENABLED=1), llegó ${res.status}`);
    else ok('/admin/ responde 200 (habilitado a propósito)');
  } else {
    if (res.status !== 404) mal(`/admin/: se esperaba 404, llegó ${res.status} — no debería estar publicado`);
    else ok('/admin/ responde 404');
  }
} catch (e) {
  mal(`/admin/: ${e.message}`);
}

// Soluciones → Servicios. Netlify hace el 301 real (public/_redirects, con
// el `!` de forzado); GitHub Pages y `astro preview` sirven en cambio la
// página meta-refresh que genera Astro. Sin SMOKE_NETLIFY se acepta
// cualquiera de las dos; con SMOKE_NETLIFY=1 solo el 301 — si llega el
// meta-refresh, el `!` de _redirects no actuó.
for (const [origen, destino] of [['/soluciones/', '/servicios'], ['/en/solutions/', '/en/services']]) {
  try {
    const { res, body } = await get(origen);
    if ([301, 302, 307, 308].includes(res.status)) {
      const location = res.headers.get('location') || '';
      let llega = null;
      try { llega = new URL(location, base + origen); } catch { /* se informa abajo */ }
      const origenesValidos = [new URL(base).origin, new URL(canonico).origin];
      if (!llega || !origenesValidos.includes(llega.origin) || llega.pathname.replace(/\/$/, '') !== destino) {
        mal(`${origen}: ${res.status} hacia "${location}" (esperado ${destino})`);
      } else if (esNetlify && res.status !== 301) {
        mal(`${origen}: ${res.status} hacia ${destino}, pero _redirects pide un 301 permanente`);
      } else {
        ok(`${origen}: ${res.status} → ${destino}`);
      }
    } else if (res.status === 200) {
      const refresh = (body.match(/http-equiv="refresh"\s+content="[^"]*url=([^"]+)"/) || [])[1];
      if (esNetlify) {
        mal(`${origen}: 200 con meta-refresh en vez de un 301 real — en Netlify, el \`!\` de _redirects no actuó`);
      } else if (!refresh || refresh.replace(/\/$/, '') !== `${canonico}${destino}`) {
        mal(`${origen}: 200 sin meta-refresh hacia ${canonico}${destino} (llegó ${refresh || 'ninguno'})`);
      } else {
        ok(`${origen}: meta-refresh → ${refresh} (respaldo estático; el 301 real solo lo hace Netlify)`);
      }
    } else {
      mal(`${origen}: status ${res.status}`);
    }
  } catch (e) {
    mal(`${origen}: ${e.message}`);
  }
}

// 5. El formulario, solo si se espera que ya esté vivo.
console.log('\n5. Formulario');
for (const [path] of [['/contacto/'], ['/en/contact/']]) {
  try {
    const { body } = await get(path);
    const m = body.match(/name="access_key"\s+value="([^"]*)"/);
    const vacio = !m || m[1].trim() === '';
    if (formularioVivo) {
      if (vacio) mal(`${path}: se esperaba access_key definido (SMOKE_FORM_LIVE=1) y está vacío`);
      else ok(`${path}: access_key definido`);
    } else {
      if (!vacio) mal(`${path}: access_key definido pero SMOKE_FORM_LIVE no estaba puesta — ¿se activó sin querer?`);
      else ok(`${path}: sin activar, como se esperaba`);
    }
  } catch (e) {
    mal(`${path}: ${e.message}`);
  }
}

// 6. Cabeceras de public/_headers. Solo Netlify las sirve: en GitHub Pages
//    y en `astro preview` el archivo existe en dist/ pero nadie lo lee, así
//    que exigirlas ahí sería un falso positivo del script, no un defecto.
console.log('\n6. Cabeceras (Netlify)');
try {
  const { res } = await get('/');
  const h = res.headers;
  if (!esNetlify) {
    const pareceNetlify = /netlify/i.test(h.get('server') || '') || h.has('x-nf-request-id');
    na(`sin SMOKE_NETLIFY=1 no se exigen cabeceras ni 301 reales${pareceNetlify ? ' — ojo: este sitio responde como Netlify; define SMOKE_NETLIFY=1' : ''}`);
  } else {
    const esperadas = {
      'x-content-type-options': /^nosniff$/i,
      'x-frame-options': /^sameorigin$/i,
      'referrer-policy': /\S/,
      'permissions-policy': /\S/,
      'strict-transport-security': /max-age=\d+/i,
      'content-security-policy-report-only': /default-src/,
    };
    const faltan = Object.entries(esperadas).filter(([k, re]) => !re.test(h.get(k) || '')).map(([k]) => k);
    if (faltan.length) mal(`/: faltan o no calzan: ${faltan.join(', ')}`);
    else ok('/: cabeceras de seguridad de public/_headers presentes');
    // Pasar la CSP a bloqueante es un paso de activación aparte (Fase 8);
    // la misma regla que la sección 15 de validate.mjs, ahora en vivo.
    if (h.has('content-security-policy')) mal('/: ya se sirve una Content-Security-Policy bloqueante — activarla es un paso aparte');
    else ok('/: la CSP sigue en Report-Only');

    const cms = await get('/cms/');
    if (cms.res.status !== 200) mal(`/cms/: status ${cms.res.status}`);
    else if (!/https:\/\/unpkg\.com/.test(cms.res.headers.get('content-security-policy-report-only') || '')) {
      mal('/cms/: la CSP no incluye https://unpkg.com (la regla /cms/* de _headers no se aplicó)');
    } else {
      ok('/cms/: responde con su propia CSP (unpkg.com permitido)');
    }
  }
} catch (e) {
  mal(`cabeceras: ${e.message}`);
}

console.log('');
if (fallas > 0) {
  console.log(`${fallas} falla(s).\n`);
  process.exit(1);
}
console.log('Todo en orden.\n');
