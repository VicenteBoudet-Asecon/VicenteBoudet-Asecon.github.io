#!/usr/bin/env node
// Smoke test de una URL ya desplegada. No mira el código ni dist/ local:
// pega contra el sitio de verdad, después del deploy — es lo único que
// scripts/validate.mjs no puede hacer, porque valida el artefacto antes de
// publicarlo.
//
// Uso:
//   node scripts/smoke.mjs https://aseconsa.com
//   node scripts/smoke.mjs https://vicenteboudet-asecon.github.io
//
// Variables opcionales (por defecto asumen el estado "todavía sin activar"):
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

const formularioVivo = process.env.SMOKE_FORM_LIVE === '1';
const adminHabilitado = process.env.SMOKE_ADMIN_ENABLED === '1';
const legalesIndexables = process.env.SMOKE_LEGAL_INDEXABLE === '1';

let fallas = 0;
const ok = (msg) => console.log(`  [ok]  ${msg}`);
const mal = (msg) => {
  fallas++;
  console.log(`  [x]   ${msg}`);
};

async function get(path) {
  const res = await fetch(base + path, { redirect: 'manual' });
  const body = res.status < 400 ? await res.text() : '';
  return { res, body };
}

console.log(`\nSmoke test — ${base}\n`);

// 1. El sitemap existe y trae al menos las páginas de menú.
console.log('1. Sitemap');
let urls = [];
try {
  const { res, body } = await get('/sitemap.xml');
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length < 14) mal(`el sitemap trae ${urls.length} URLs, se esperaban al menos 14`);
  else ok(`${urls.length} URLs en el sitemap`);
} catch (e) {
  mal(`no se pudo leer /sitemap.xml: ${e.message}`);
}

// 2. Cada URL del sitemap: 200, <title> no vacío, un solo canonical al
//    mismo origen, y su hreflang presente.
console.log('\n2. Páginas del sitemap');
for (const url of urls) {
  const path = url.replace(base, '') || '/';
  try {
    const { res, body } = await get(path);
    if (res.status !== 200) { mal(`${path}: status ${res.status}`); continue; }

    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title || !title.trim()) { mal(`${path}: sin <title> o vacío`); continue; }

    const canonicals = [...body.matchAll(/rel="canonical"\s+href="([^"]+)"/g)];
    if (canonicals.length !== 1) { mal(`${path}: ${canonicals.length} canonical (debía ser 1)`); continue; }
    if (!canonicals[0][1].startsWith(base)) { mal(`${path}: canonical no apunta a ${base}`); continue; }

    if (!/hreflang="x-default"/.test(body)) { mal(`${path}: sin hreflang x-default`); continue; }

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

console.log('');
if (fallas > 0) {
  console.log(`${fallas} falla(s).\n`);
  process.exit(1);
}
console.log('Todo en orden.\n');
