// Netlify Function — destino de los reportes de la CSP (report-uri y
// report-to de public/_headers). Recibe lo que el navegador avisa que la CSP
// *habría* bloqueado (hoy está en Report-Only) y guarda un agregado mínimo en
// Netlify Blobs, para la revisión de ~7 días antes de volverla bloqueante.
//
// Contrato (definido con asecon-security; README → "Cabeceras de seguridad y
// CSP"):
//   - Solo POST (405 con cualquier otro método). Acepta los dos formatos que
//     mandan los navegadores: application/csp-report (report-uri, un reporte
//     por petición) y application/reports+json (Reporting API, un arreglo).
//   - Cuerpo de 16 KB como máximo (413). Todo lo demás —JSON roto, tipo
//     desconocido, reportes que no son de CSP, Blobs caído— responde 204 sin
//     cuerpo: el navegador no lee la respuesta, y así nada de lo que llega se
//     refleja de vuelta.
//   - Minimiza antes de guardar. De cada reporte se conserva solo la directiva
//     (efectiva y violada), lo bloqueado reducido a su origen (o `inline`,
//     `eval`, `data`...), la ruta del documento SIN query ni fragmento y la
//     disposición (report/enforce). No se guarda IP, ni user-agent, ni
//     referrer, ni la muestra de código (`script-sample`/`sample`), ni el
//     archivo/línea de origen, ni la política completa. La IP no se lee nunca.
//   - Agregado por clave `directiva/bloqueado/ruta` (legible con
//     `netlify blobs:list csp-reports`); cada valor es un JSON con el conteo, la
//     primera y la última vez (al minuto) y los conteos por disposición.
//
// Límites contra abuso, en tres capas:
//   1. config.rateLimit (abajo): la plataforma corta en 429 a una IP que pase
//      de 30 peticiones por minuto, ANTES de invocar la función — esas
//      peticiones no consumen cómputo ni créditos. Netlify usa la IP para
//      contar; esta función no la ve ni la guarda.
//   2. Por instancia: como mucho MAX_CLAVES_POR_MINUTO claves escritas por
//      minuto (una ráfaga distribuida desde muchas IP no multiplica las
//      escrituras sin techo).
//   3. Cupo diario de claves nuevas (MAX_CLAVES_NUEVAS_POR_DIA, contado en
//      `_cupo/AAAA-MM-DD` del mismo store): acota lo que puede crecer el store.
//      Las claves que ya existen siguen sumando aunque el cupo se agote.
// Lo que se descarta por límite o porque Blobs falla queda, ya minimizado, en
// los logs de la función (retención corta: es un respaldo, no el registro).
//
// El conteo es aproximado a propósito: Blobs es "última escritura gana", así
// que dos reportes idénticos que llegan en el mismo instante pueden contarse
// como uno. Para decidir qué falta en la CSP alcanza de sobra.
//
// @netlify/blobs va fijado en 8.2.0 (sin dependencias propias). Las versiones
// 9+ hablan el mismo protocolo con el runtime pero suman ~45 paquetes
// (OpenTelemetry, chokidar...). Ver README antes de subirlo.
//
// Solo existe en Netlify: ni el preview de GitHub Pages ni `astro preview`
// sirven public/_headers, así que ahí no hay CSP que genere reportes.

import { getStore } from '@netlify/blobs';

const STORE = 'csp-reports';
const MAX_BYTES = 16 * 1024;
const MAX_REPORTES_POR_PETICION = 20;
const MAX_CLAVES_POR_MINUTO = 120;
const MAX_CLAVES_NUEVAS_POR_DIA = 100;
// Tiempo máximo para hablar con Blobs. Pasado eso se responde 204 igual y el
// agregado de esta petición va al log.
const PLAZO_MS = 1500;

const TIPO_LEGACY = 'application/csp-report';
const TIPO_REPORTING = 'application/reports+json';

// Netlify no aplica public/_headers a las funciones: van en la Response.
const CABECERAS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

const responder = (status, extra) => new Response(null, { status, headers: { ...CABECERAS, ...extra } });

// Lee el cuerpo con tope real de bytes: Content-Length puede faltar (chunked)
// o mentir. Devuelve null si se pasa del tope.
const leerCuerpo = async (req) => {
  if (!req.body) return '';
  const lector = req.body.getReader();
  const trozos = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      lector.cancel().catch(() => {});
      return null;
    }
    trozos.push(value);
  }
  const bytes = new Uint8Array(total);
  let desde = 0;
  for (const trozo of trozos) {
    bytes.set(trozo, desde);
    desde += trozo.byteLength;
  }
  return new TextDecoder().decode(bytes);
};

// ── Normalización ────────────────────────────────────────────────────────────

// Primer token, en minúsculas: navegadores viejos mandan en violated-directive
// la directiva con todo su valor ("script-src 'self' ...").
const directiva = (valor) => {
  if (typeof valor !== 'string') return null;
  const token = valor.trim().split(/\s+/)[0].toLowerCase();
  return /^[a-z][a-z-]{0,39}$/.test(token) ? token : null;
};

const PALABRAS_BLOQUEADO = new Set([
  'inline',
  'eval',
  'wasm-eval',
  'trusted-types-policy',
  'trusted-types-sink',
  'self',
  'data',
  'blob',
  'filesystem',
]);
const ESQUEMAS_EXTENSION = new Set([
  'chrome-extension:',
  'moz-extension:',
  'safari-extension:',
  'safari-web-extension:',
  'ms-browser-extension:',
]);

// Lo bloqueado, reducido a algo que no identifica a nadie: el origen de una
// URL (nunca su ruta ni su query), o una palabra fija.
const bloqueado = (valor) => {
  if (typeof valor !== 'string' || !valor.trim()) return 'desconocido';
  const texto = valor.trim();
  if (PALABRAS_BLOQUEADO.has(texto.toLowerCase())) return texto.toLowerCase();
  let url;
  try {
    url = new URL(texto);
  } catch {
    return 'otro';
  }
  if (['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return url.origin.slice(0, 200);
  if (ESQUEMAS_EXTENSION.has(url.protocol)) return 'extension';
  const esquema = url.protocol.slice(0, -1);
  return /^[a-z][a-z0-9+.-]{0,19}$/.test(esquema) ? esquema : 'otro';
};

// Ruta del documento: solo el pathname (sin query ni fragmento, que es donde
// podría viajar algo personal) y solo si el documento es de este mismo sitio.
// Un reporte de otra página no dice nada de esta CSP.
const ruta = (valor, hostPropio) => {
  if (typeof valor !== 'string') return null;
  let url;
  try {
    url = new URL(valor);
  } catch {
    return null;
  }
  if (url.host.toLowerCase() !== hostPropio) return null;
  return url.pathname.slice(0, 150);
};

const disposicion = (valor) => (valor === 'report' || valor === 'enforce' ? valor : 'otra');

// Un segmento de clave de Blobs seguro: el cliente arma la URL con la clave
// sin codificarla, así que fuera de este juego de caracteres todo pasa a "_"
// (nada de ?, #, %, :, espacios) y "." / ".." no pueden subir de nivel.
const segmento = (texto) => {
  const limpio = texto.replace(/[^A-Za-z0-9._~()-]/g, '_');
  return limpio === '.' || limpio === '..' || limpio === '' ? '_' : limpio;
};

const claveDe = (dir, bloq, camino) => {
  const bloqClave = segmento(bloq.replace(/^https:\/\//, '').replace('://', '_'));
  const partes = camino.split('/').filter(Boolean).map(segmento);
  const rutaClave = partes.length ? partes.join('/') : '(raiz)';
  return `${dir}/${bloqClave}/${rutaClave}`.slice(0, 500);
};

// ── Extracción ───────────────────────────────────────────────────────────────

const extraer = (tipo, datos) => {
  if (tipo === TIPO_LEGACY) {
    const r = datos && typeof datos === 'object' ? datos['csp-report'] : null;
    if (!r || typeof r !== 'object') return [];
    return [
      {
        documento: r['document-uri'],
        bloqueado: r['blocked-uri'],
        efectiva: r['effective-directive'],
        violada: r['violated-directive'],
        disposicion: r.disposition,
      },
    ];
  }
  if (!Array.isArray(datos)) return [];
  return datos
    .slice(0, MAX_REPORTES_POR_PETICION)
    .filter((r) => r && typeof r === 'object' && r.type === 'csp-violation' && r.body && typeof r.body === 'object')
    .map((r) => ({
      documento: r.body.documentURL ?? r.url,
      bloqueado: r.body.blockedURL,
      efectiva: r.body.effectiveDirective,
      violada: r.body.violatedDirective ?? r.body.effectiveDirective,
      disposicion: r.body.disposition,
    }));
};

// Reportes minimizados, agrupados por clave dentro de esta misma petición
// (la Reporting API manda lotes): una sola escritura por clave.
const agrupar = (reportes, hostPropio) => {
  const grupos = new Map();
  for (const r of reportes) {
    const efectiva = directiva(r.efectiva) ?? directiva(r.violada);
    const camino = ruta(r.documento, hostPropio);
    if (!efectiva || camino === null) continue;
    const bloq = bloqueado(r.bloqueado);
    const clave = claveDe(efectiva, bloq, camino);
    const disp = disposicion(r.disposicion);
    const g = grupos.get(clave) ?? {
      directiva: efectiva,
      violada: directiva(r.violada) ?? efectiva,
      bloqueado: bloq,
      ruta: camino,
      conteo: 0,
      disposicion: {},
    };
    g.conteo += 1;
    g.disposicion[disp] = (g.disposicion[disp] ?? 0) + 1;
    grupos.set(clave, g);
  }
  return grupos;
};

// ── Límite por instancia ─────────────────────────────────────────────────────

let ventanaDesde = 0;
let ventanaUsadas = 0;
let ventanaAvisada = false;
const concederClaves = (pedidas) => {
  const ahora = Date.now();
  if (ahora - ventanaDesde >= 60_000) {
    ventanaDesde = ahora;
    ventanaUsadas = 0;
    ventanaAvisada = false;
  }
  const concedidas = Math.min(pedidas, Math.max(0, MAX_CLAVES_POR_MINUTO - ventanaUsadas));
  ventanaUsadas += concedidas;
  return concedidas;
};

// ── Registro (respaldo en los logs de la función) ────────────────────────────

const registrar = (motivo, grupos) => {
  const reportes = [...grupos.values()]
    .slice(0, MAX_REPORTES_POR_PETICION)
    .map(({ directiva: d, bloqueado: b, ruta: p, conteo }) => ({ directiva: d, bloqueado: b, ruta: p, conteo }));
  console.log(JSON.stringify({ csp: 'sin-guardar', motivo, reportes }));
};

// ── Blobs ────────────────────────────────────────────────────────────────────

const alMinuto = (fecha) => `${fecha.toISOString().slice(0, 16)}Z`;

const combinar = (previo, g, ahora) => {
  const base = previo && typeof previo === 'object' && Number.isFinite(previo.conteo) ? previo : null;
  const disp = {};
  for (const k of ['report', 'enforce', 'otra']) {
    const n = (Number(base?.disposicion?.[k]) || 0) + (g.disposicion[k] ?? 0);
    if (n) disp[k] = n;
  }
  return {
    directiva: g.directiva,
    violada: g.violada,
    bloqueado: g.bloqueado,
    ruta: g.ruta,
    conteo: (base ? base.conteo : 0) + g.conteo,
    disposicion: disp,
    primera: typeof base?.primera === 'string' ? base.primera : ahora,
    ultima: ahora,
  };
};

// Devuelve cuántas claves quedaron fuera y por qué (para el log).
const guardar = async (grupos, signal) => {
  // Pasado el plazo, ninguna petición más sale a la red: el fetch devuelve un
  // 400 local, que el cliente de Blobs no reintenta. Sin esto, un reintento
  // del cliente podría escribir un conteo viejo encima de uno nuevo.
  const fetchConPlazo = (url, opciones = {}) =>
    signal.aborted ? Promise.resolve(new Response(null, { status: 400 })) : fetch(url, { ...opciones, signal });
  const store = getStore({ name: STORE, consistency: 'strong', fetch: fetchConPlazo });
  const ahora = alMinuto(new Date());
  const hoy = ahora.slice(0, 10);

  const claves = [...grupos.keys()];
  const previos = await Promise.all(claves.map((clave) => store.get(clave, { type: 'json' })));

  const nuevas = claves.filter((_, i) => previos[i] === null);
  let permitidas = new Set();
  if (nuevas.length) {
    const claveCupo = `_cupo/${hoy}`;
    const cupo = (await store.get(claveCupo, { type: 'json' })) ?? {};
    const usadas = Number(cupo.claves) || 0;
    const libres = Math.max(0, MAX_CLAVES_NUEVAS_POR_DIA - usadas);
    permitidas = new Set(nuevas.slice(0, libres));
    if (permitidas.size && !signal.aborted) await store.setJSON(claveCupo, { claves: usadas + permitidas.size });
  }

  if (signal.aborted) throw new Error('plazo');
  const fuera = [];
  const escrituras = [];
  claves.forEach((clave, i) => {
    if (previos[i] === null && !permitidas.has(clave)) {
      fuera.push(clave);
      return;
    }
    escrituras.push(store.setJSON(clave, combinar(previos[i], grupos.get(clave), ahora)));
  });
  await Promise.all(escrituras);
  return fuera;
};

const conPlazo = async (tarea, ms) => {
  const control = new AbortController();
  let temporizador;
  const plazo = new Promise((_, rechazar) => {
    temporizador = setTimeout(() => {
      control.abort();
      rechazar(new Error('plazo'));
    }, ms);
  });
  const trabajo = tarea(control.signal);
  // Si pierde la carrera y falla después, que no quede como rechazo sin
  // manejar (en el runtime de funciones eso puede tumbar la instancia).
  trabajo.catch(() => {});
  try {
    return await Promise.race([trabajo, plazo]);
  } finally {
    clearTimeout(temporizador);
  }
};

// ── Handler ──────────────────────────────────────────────────────────────────

export default async (req) => {
  if (req.method !== 'POST') return responder(405, { Allow: 'POST' });

  const declarado = Number(req.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > MAX_BYTES) return responder(413);

  let cuerpo;
  try {
    cuerpo = await leerCuerpo(req);
  } catch {
    return responder(204);
  }
  if (cuerpo === null) return responder(413);

  const tipo = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (tipo !== TIPO_LEGACY && tipo !== TIPO_REPORTING) return responder(204);

  let datos;
  try {
    datos = JSON.parse(cuerpo);
  } catch {
    return responder(204);
  }

  const hostPropio = new URL(req.url).host.toLowerCase();
  const todos = agrupar(extraer(tipo, datos), hostPropio);
  if (!todos.size) return responder(204);

  // Límite por instancia: lo que no entra en la ventana va al log (una vez
  // por ventana, para que una ráfaga no inunde también los logs).
  const concedidas = concederClaves(todos.size);
  const grupos = new Map([...todos].slice(0, concedidas));
  if (concedidas < todos.size && !ventanaAvisada) {
    ventanaAvisada = true;
    registrar('tasa-por-instancia', new Map([...todos].slice(concedidas)));
  }
  if (!grupos.size) return responder(204);

  try {
    const fuera = await conPlazo((signal) => guardar(grupos, signal), PLAZO_MS);
    if (fuera.length) registrar('cupo-diario', new Map(fuera.map((clave) => [clave, grupos.get(clave)])));
  } catch (error) {
    // Blobs caído, sin contexto de Netlify (netlify dev sin Blobs, por
    // ejemplo) o fuera de plazo: el agregado de esta petición va al log. El
    // mensaje del error no, que puede traer URLs internas de Blobs.
    registrar(error?.message === 'plazo' ? 'plazo' : 'blobs', grupos);
  }
  return responder(204);
};

export const config = {
  path: '/api/csp-report',
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
