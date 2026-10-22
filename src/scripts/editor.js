// Editor visual del PREVIEW (no existe en producción: ver Layout.astro y la
// regla de scripts/validate.mjs). Deja que quien revisa el sitio escriba
// directo sobre los textos de cada página, deje notas sobre lo que no es texto
// (una foto, el orden de una sección) y descargue todo como un archivo que
// `npm run cambios` aplica al código.
//
// Qué NO toca: nada del sitio publicado. Los cambios viven en el localStorage
// del navegador de quien edita y en el archivo que descarga.
//
// Cómo se activa: abrir cualquier página del preview con `?editar` al final.
// Queda activo en ese navegador hasta cerrarlo desde la barra (o `?editar=salir`).
//
// Marca para el validador: asecon-editor:v1 (la clave de localStorage). Si esa
// cadena aparece en un dist/ de producción, el editor se coló.

import { routes, navOrder, legalOrder } from '../i18n/config.js';
import { getContent } from '../data/content.js';

const STORE_KEY = 'asecon-editor:v1';

// Elementos que pueden vivir DENTRO de un bloque de texto editable. Un bloque
// es el elemento más externo cuyo contenido es solo texto + estos (un <h2>
// con un <span class="italic"> adentro es un bloque; una tarjeta con <h3> y
// <p> no: se baja hasta el <h3> y el <p>).
const INLINE = new Set(['a', 'b', 'strong', 'em', 'i', 'span', 'br', 'small', 'sup', 'sub', 'mark', 'code', 'abbr', 'u', 's', 'time', 'cite', 'q']);
// Decorativos que pueden acompañar al texto (el ícono de un botón) sin impedir que sea un bloque.
const DECOR = new Set(['svg', 'img', 'picture']);
// Lo que nunca se edita ni se mira por dentro.
const SKIP = new Set(['script', 'style', 'noscript', 'template', 'svg', 'canvas', 'video', 'audio', 'iframe', 'input', 'textarea', 'select', 'option', 'img', 'picture']);

const SECTION_LABELS = { header: 'Encabezado', footer: 'Pie de página', nav: 'Menú', main: 'Página', article: 'Artículo', aside: 'Lateral', section: 'Sección' };

const nav = getContent('es').nav;
const PAGE = location.pathname.replace(/\/+$/, '') || '/';

// Las páginas que se pueden visitar desde el selector: las del menú, la de
// Tecnología (sigue en borrador y no está en el menú) y las cuatro legales.
const pageList = [...navOrder, 'technology', ...legalOrder].map((key) => ({
  path: routes[key].es,
  label: key === 'technology' ? `${nav.technology} (borrador)` : nav[key],
}));
const clean = (p) => p.replace(/\/+$/, '') || '/';
const pageLabel = (p) => (pageList.find((x) => clean(x.path) === p) || {}).label || p;

// ── Estado guardado ────────────────────────────────────────────────────────

let storageOk = true;
let state = load();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (d && d.v === 1 && Array.isArray(d.changes)) return d;
  } catch (e) {
    storageOk = false;
  }
  return { v: 1, active: false, mode: 'texto', changes: [] };
}

let saveTimer;
function save(now = false) {
  clearTimeout(saveTimer);
  const run = () => {
    try {
      // "Ver original" es una mirada pasajera: la próxima página (y la próxima sesión) vuelven a "Solo ver".
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, mode: state.mode === 'original' ? 'ver' : state.mode }));
      storageOk = true;
    } catch (e) {
      storageOk = false;
    }
    if (warnEl) warnEl.hidden = storageOk;
    if (Date.now() - lastBackupAt > BACKUP_EVERY_MS) backup('automática');
  };
  if (now) run();
  else saveTimer = setTimeout(run, 250);
}

// ── Copias de seguridad ───────────────────────────────────────────────────
// Además del estado vivo, el editor guarda copias de la lista de cambios (otra
// clave del localStorage) para poder volver atrás si algo se rompe: antes de
// descartar todo, antes de restaurar, al descargar y, mientras se edita, cada
// cinco minutos. Se conservan las últimas 12. Viven en el mismo navegador: el
// respaldo de verdad es el archivo descargado (npm run respaldar).
const BACKUP_KEY = `${STORE_KEY}:backups`;
const MAX_BACKUPS = 12;
const BACKUP_EVERY_MS = 5 * 60 * 1000;
let lastBackupAt = 0;

function loadBackups() {
  try {
    const list = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function backup(reason) {
  if (!state.changes.length) return;
  const list = loadBackups();
  const json = JSON.stringify(state.changes);
  lastBackupAt = Date.now();
  if (list.length && JSON.stringify(list[0].changes) === json) return; // igual a la última copia
  list.unshift({ at: new Date().toISOString(), reason, changes: JSON.parse(json) });
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list.slice(0, MAX_BACKUPS)));
  } catch (e) {
    /* sin espacio: el estado vivo sigue guardándose igual */
  }
  if (panelOpen && backupsEl) renderBackups();
}

// ── Utilidades de texto y DOM ──────────────────────────────────────────────

const norm = (s) => s.replace(/[\s ]+/g, ' ').trim();

// Al teclear un espacio al final, el navegador mete un espacio de no separación
// (U+00A0). Si el texto original no los usaba, no deben viajar al archivo.
const fixNbsp = (after, before) => (before.includes(' ') ? after : after.replace(/ /g, ' '));

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

function textNodesOf(el) {
  const out = [];
  const walk = (n) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) out.push(c);
      else if (c.nodeType === 1 && !['svg', 'script', 'style'].includes(c.localName)) walk(c);
    }
  };
  walk(el);
  return out;
}

function textOf(el) {
  let s = '';
  const walk = (n) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) s += c.nodeValue;
      else if (c.nodeType === 1) {
        if (c.localName === 'br') s += ' ';
        else if (!['svg', 'script', 'style'].includes(c.localName)) walk(c);
      }
    }
  };
  walk(el);
  return norm(s);
}

function inlineOnly(el) {
  for (const ch of el.children) {
    if (DECOR.has(ch.localName)) continue;
    if (!INLINE.has(ch.localName) || !inlineOnly(ch)) return false;
  }
  return true;
}

function collectBlocks() {
  const out = [];
  const walk = (el) => {
    if (SKIP.has(el.localName) || el.hasAttribute('data-editor-ignore')) return;
    if (textOf(el) !== '' && inlineOnly(el)) {
      out.push(el);
      return;
    }
    for (const child of el.children) walk(child);
  };
  walk(document.body);
  return out;
}

function sectionOf(el) {
  const sec = el.closest('section, header, footer, nav, article, aside, main');
  if (!sec) return '';
  const label = SECTION_LABELS[sec.localName] || '';
  const heading = sec.querySelector('h1, h2, h3');
  // El título ORIGINAL de la sección (el de la foto previa a las ediciones): si
  // no, la etiqueta de un cambio cambiaría a medida que se reescribe el título.
  const title = heading && !sec.localName.match(/^(header|footer|nav)$/) ? (snaps.has(heading) ? snaps.get(heading).text : textOf(heading)).slice(0, 60) : '';
  return title ? `${label}: ${title}` : label;
}

function cssPath(el) {
  const parts = [];
  while (el && el.nodeType === 1 && el !== document.body) {
    if (el.id) {
      parts.unshift('#' + CSS.escape(el.id));
      break;
    }
    let part = el.localName;
    const same = el.parentElement ? [...el.parentElement.children].filter((c) => c.localName === el.localName) : [];
    if (same.length > 1) part += `:nth-of-type(${same.indexOf(el) + 1})`;
    parts.unshift(part);
    el = el.parentElement;
  }
  // Con un id, el camino arranca en él (no es hijo directo de <body>).
  return (parts[0]?.startsWith('#') ? '' : 'body > ') + parts.join(' > ');
}

const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// El HTML de un bloque cuya estructura cambió (se reescribió un titular entero y
// el trozo en cursiva desapareció) se vuelve a pintar copiándolo con lista
// blanca: solo las etiquetas de INLINE y solo estos atributos. Nunca se asigna
// como innerHTML lo que viene del localStorage.
const ATTRS_OK = new Set(['class', 'href', 'target', 'rel', 'lang', 'title']);
function copyInline(from, into) {
  for (const n of from.childNodes) {
    if (n.nodeType === 3) {
      into.append(document.createTextNode(n.nodeValue));
    } else if (n.nodeType === 1 && INLINE.has(n.localName)) {
      const e = document.createElement(n.localName);
      for (const a of n.attributes) {
        if (!ATTRS_OK.has(a.name) && !a.name.startsWith('data-astro-cid-')) continue;
        if (a.name === 'href' && !/^(\/(?!\/)|#|https?:|mailto:|tel:)/i.test(a.value)) continue;
        e.setAttribute(a.name, a.value);
      }
      copyInline(n, e);
      into.append(e);
    }
  }
}
function setInlineHtml(el, html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  el.replaceChildren();
  copyInline(doc.body, el);
}

// ── Bloques de texto ──────────────────────────────────────────────────────

const snaps = new Map(); // elemento -> { texts, text, html, nth }
const byKey = new Map(); // "texto\0n" -> elemento
const keyOf = (text, nth) => `${text}\u0000${nth}`;
const shown = new Set(); // ids de cambios que se pudieron pintar en esta página

function snapshotBlocks() {
  const seen = new Map();
  for (const el of collectBlocks()) {
    const text = textOf(el);
    const nth = seen.get(text) || 0;
    seen.set(text, nth + 1);
    snaps.set(el, { texts: textNodesOf(el).map((n) => n.nodeValue), text, html: el.innerHTML, nth });
    byKey.set(keyOf(text, nth), el);
    el.setAttribute('data-editor-block', '');
  }
}

function applyStoredText() {
  for (const ch of state.changes) {
    if (ch.kind !== 'text' || ch.page !== PAGE) continue;
    const el = byKey.get(keyOf(ch.blockBefore, ch.nth));
    if (!el) continue;
    if (ch.nodes) {
      const nodes = textNodesOf(el);
      for (const p of ch.nodes) if (nodes[p.i]) nodes[p.i].nodeValue = p.after;
      shown.add(ch.id);
    } else if (ch.afterHtml != null) {
      setInlineHtml(el, ch.afterHtml);
      shown.add(ch.id);
    } else if (!el.children.length) {
      el.textContent = ch.blockAfter;
      shown.add(ch.id);
    }
    el.setAttribute('data-editor-changed', '');
  }
}

function onEdit(el) {
  const snap = snaps.get(el);
  if (!snap) return;
  const nodes = textNodesOf(el);
  let parts = null;
  if (nodes.length === snap.texts.length) {
    parts = [];
    nodes.forEach((n, i) => {
      const after = fixNbsp(n.nodeValue, snap.texts[i]);
      if (norm(after) !== norm(snap.texts[i])) parts.push({ i, before: snap.texts[i], after });
    });
  }
  const after = textOf(el);
  const changed = parts ? parts.length > 0 : after !== snap.text;
  const idx = state.changes.findIndex((c) => c.kind === 'text' && c.page === PAGE && c.blockBefore === snap.text && c.nth === snap.nth);

  if (!changed) {
    if (idx >= 0) state.changes.splice(idx, 1);
    el.removeAttribute('data-editor-changed');
  } else {
    const record = {
      id: idx >= 0 ? state.changes[idx].id : newId(),
      kind: 'text',
      page: PAGE,
      pageTitle: document.title,
      section: sectionOf(el),
      tag: el.localName,
      nth: snap.nth,
      blockBefore: snap.text,
      blockAfter: after,
      nodes: parts && parts.length ? parts : null,
      // Estructura distinta a la original: el HTML resultante, para volver a pintarlo
      // (y para que quien aplique el cambio vea qué quedó). Sin él si el bloque trae
      // un ícono o una imagen, que no se copian.
      afterHtml: parts || el.querySelector('svg, img, picture') ? null : el.innerHTML,
      at: new Date().toISOString(),
    };
    if (idx >= 0) state.changes[idx] = record;
    else state.changes.push(record);
    shown.add(record.id);
    el.setAttribute('data-editor-changed', '');
  }
  save();
  renderList();
}

// ── SEO: título y descripción de la página ─────────────────────────────────

const descEl = document.querySelector('meta[name="description"]');
const metaOrig = { title: document.title, description: descEl ? descEl.getAttribute('content') || '' : '' };

function setMeta(field, value) {
  if (field === 'title') document.title = value;
  else if (descEl) descEl.setAttribute('content', value);
}

function applyStoredMeta() {
  for (const ch of state.changes) if (ch.kind === 'meta' && ch.page === PAGE) setMeta(ch.field, ch.after);
}

function onMeta(field, value) {
  const idx = state.changes.findIndex((c) => c.kind === 'meta' && c.page === PAGE && c.field === field);
  setMeta(field, value);
  if (norm(value) === norm(metaOrig[field])) {
    if (idx >= 0) state.changes.splice(idx, 1);
  } else {
    const record = { id: idx >= 0 ? state.changes[idx].id : newId(), kind: 'meta', page: PAGE, pageTitle: metaOrig.title, field, before: metaOrig[field], after: value, at: new Date().toISOString() };
    if (idx >= 0) state.changes[idx] = record;
    else state.changes.push(record);
  }
  save();
  renderList();
}

// ── Notas ─────────────────────────────────────────────────────────────────

function noteTarget(el) {
  if (!el || el.closest('[data-editor-ignore]')) return null;
  if (el.closest('svg')) el = el.closest('svg');
  // Una foto o un ícono dentro de un bloque de texto (la foto de una tarjeta con
  // su leyenda) es el objetivo por sí mismo: la nota habla de la foto, no del bloque.
  if (DECOR.has(el.localName) || el.localName === 'video') return el;
  const block = el.closest('[data-editor-block]');
  if (block) return block;
  while (INLINE.has(el.localName) && el.parentElement && el.parentElement !== document.body) el = el.parentElement;
  return el === document.body || el === document.documentElement ? null : el;
}

function describe(el) {
  const src = el.localName === 'video' ? el.getAttribute('poster') || el.currentSrc : el.getAttribute('src');
  return {
    tag: el.localName,
    text: textOf(el).slice(0, 140),
    src: src || null,
    selector: cssPath(el),
    section: sectionOf(el),
  };
}

// ── Eventos sobre la página ────────────────────────────────────────────────

// "Solo ver" y "Ver original": la página responde normal (clics, enlaces, formularios).
const passive = () => state.mode === 'ver' || state.mode === 'original';
const blockOf = (t) => (t && t.closest ? t.closest('[data-editor-block]') : null);
const inEditor = (e) => e.composedPath().includes(host);
let hoverEl = null;

function setHover(el) {
  if (hoverEl === el) return;
  if (hoverEl) hoverEl.removeAttribute('data-editor-hover');
  hoverEl = el;
  if (el) el.setAttribute('data-editor-hover', '');
}

function wirePage() {
  // Todo clic, salvo en el propio editor, se queda en el editor: ni enlaces, ni
  // menús, ni envíos del formulario (en "Solo ver" el sitio funciona normal).
  document.addEventListener(
    'click',
    (e) => {
      if (inEditor(e) || passive()) return;
      e.preventDefault();
      e.stopPropagation();
      if (state.mode === 'nota') {
        const target = noteTarget(e.target);
        if (target) openNote({ info: describe(target) });
      }
    },
    true,
  );
  document.addEventListener(
    'submit',
    (e) => {
      if (!passive()) e.preventDefault();
    },
    true,
  );
  document.addEventListener('mouseover', (e) => setHover(state.mode === 'nota' && !inEditor(e) ? noteTarget(e.target) : null), true);
  document.documentElement.addEventListener('mouseleave', () => setHover(null));

  // Un título no es un documento: sin saltos de línea, sin negritas, sin pegar formato.
  document.addEventListener(
    'beforeinput',
    (e) => {
      if (!blockOf(e.target)) return;
      const t = e.inputType || '';
      if (t === 'insertParagraph' || t === 'insertLineBreak' || t.startsWith('format') || t === 'insertFromDrop') e.preventDefault();
    },
    true,
  );
  document.addEventListener(
    'paste',
    (e) => {
      if (!blockOf(e.target)) return;
      e.preventDefault();
      const text = (e.clipboardData.getData('text/plain') || '').replace(/\s*\n+\s*/g, ' ');
      document.execCommand('insertText', false, text);
    },
    true,
  );
  // En un <button> o un <summary> la barra espaciadora es "activar", no escribir:
  // Chrome se la traga y el texto queda pegado. Se inserta el espacio a mano.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== ' ' || e.ctrlKey || e.metaKey || e.altKey || state.mode !== 'texto') return;
      const el = blockOf(e.target);
      if (!el || !el.closest('button, summary')) return;
      e.preventDefault();
      document.execCommand('insertText', false, ' ');
    },
    true,
  );
  document.addEventListener('dragover', (e) => blockOf(e.target) && e.preventDefault(), true);
  document.addEventListener('drop', (e) => blockOf(e.target) && e.preventDefault(), true);
  document.addEventListener('input', (e) => {
    const el = blockOf(e.target);
    if (el) onEdit(el);
  });
}

// ── Interfaz del editor (shadow DOM: el CSS del sitio no entra ni sale) ─────

const host = document.createElement('div');
host.setAttribute('data-editor-ignore', '');
host.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:0;overflow:visible;z-index:2147483000;pointer-events:none;';
const root = host.attachShadow({ mode: 'open' });

const EDITOR_CSS = `
:host { all: initial; }
* { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
button, select, input, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
[hidden] { display: none !important; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); width: max-content; max-width: calc(100vw - 24px); pointer-events: auto;
  padding: 8px 10px 8px 14px; border-radius: 16px;
  background: #1F1726; color: #fff; box-shadow: 0 10px 34px rgba(31,23,38,.45); font-size: 13px; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.brand { font-weight: 700; letter-spacing: .02em; color: #E6C988; }
.seg { display: flex; border-radius: 10px; background: rgba(255,255,255,.1); padding: 2px; }
.seg button { border: 0; background: transparent; color: #fff; padding: 6px 11px; border-radius: 8px; font-size: 13px; }
.seg button[aria-pressed="true"] { background: #fff; color: #42134E; font-weight: 600; }
.bar select { background: rgba(255,255,255,.12); color: #fff; border: 0; border-radius: 8px; padding: 6px 8px; font-size: 13px; max-width: 170px; }
.bar select option { color: #1F1726; }
.btn { border: 0; border-radius: 10px; padding: 7px 13px; font-size: 13px; font-weight: 600; background: #C79A4B; color: #1F1726; }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn.ghost { background: transparent; color: #fff; padding: 6px 9px; font-weight: 400; }
.btn.light { background: #fff; color: #42134E; border: 1px solid #D9D0DE; }
.btn.danger { background: #fff; color: #9b1c1c; border: 1px solid #e3b4b4; }
.count { display: inline-block; min-width: 18px; padding: 0 5px; margin-left: 4px; border-radius: 9px; background: #1F1726; color: #fff; font-size: 11px; line-height: 18px; text-align: center; }
.ribbon { position: fixed; top: 92px; left: 50%; transform: translateX(-50%); max-width: calc(100vw - 24px); pointer-events: auto; padding: 8px 16px; border-radius: 999px;
  background: #C79A4B; color: #1F1726; font-size: 13px; font-weight: 700; box-shadow: 0 6px 22px rgba(31,23,38,.35); text-align: center; }
.hint { margin: 6px 0 0; font-size: 12px; color: rgba(255,255,255,.72); }
button:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid #E6C988; outline-offset: 2px; }
.warn { margin: 6px 0 0; padding: 6px 10px; border-radius: 8px; background: #fde8c8; color: #5a3b00; font-size: 12px; }

.panel { position: fixed; top: 12px; right: 12px; bottom: 84px; width: min(400px, calc(100vw - 24px)); pointer-events: auto; display: flex; flex-direction: column;
  background: #fff; color: #1F1726; border-radius: 16px; border: 1px solid #D9D0DE; box-shadow: 0 10px 40px rgba(31,23,38,.3); font-size: 14px; }
.panel header { padding: 14px 16px 10px; border-bottom: 1px solid #EAE4ED; }
.panel h2 { margin: 0 0 4px; font-size: 16px; color: #42134E; }
.panel p { margin: 0; color: #3A2C44; font-size: 13px; line-height: 1.45; }
.panel .body { padding: 12px 16px; overflow: auto; flex: 1; }
.panel .foot { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #EAE4ED; }
.panel .foot .btn { flex: 1; }
.seo { margin: 0 0 14px; padding: 10px 12px; border-radius: 12px; background: #F4F1F6; }
.seo summary { cursor: pointer; font-weight: 600; font-size: 13px; color: #42134E; }
.seo label { display: block; margin-top: 8px; font-size: 12px; color: #3A2C44; }
.seo input, .seo textarea { display: block; width: 100%; margin-top: 3px; padding: 6px 8px; border: 1px solid #D9D0DE; border-radius: 8px; background: #fff; font-size: 13px; }
.group { margin: 14px 0 6px; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #6B1F7E; }
.item { margin: 0 0 8px; padding: 9px 11px; border: 1px solid #EAE4ED; border-radius: 12px; }
.item .tag { display: inline-block; margin-right: 6px; padding: 1px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #EAE4ED; color: #42134E; }
.item .tag.nota { background: #F3E3BE; color: #5a3b00; }
.item .where { font-size: 12px; color: #3A2C44; }
.item .row { margin-top: 5px; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.item .row b { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #6b6173; margin-right: 4px; }
.item .before { text-decoration: line-through; color: #8a7f93; }
.item .acts { margin-top: 7px; display: flex; gap: 6px; }
.item .acts button { border: 0; background: transparent; padding: 2px 4px; font-size: 12px; color: #6B1F7E; text-decoration: underline; }
.empty { padding: 18px 4px; text-align: center; color: #6b6173; font-size: 13px; }

.pin { position: absolute; width: 22px; height: 22px; padding: 0; border: 2px solid #fff; border-radius: 50%; background: #C79A4B; color: #1F1726;
  font-size: 11px; font-weight: 700; line-height: 18px; text-align: center; pointer-events: auto; box-shadow: 0 2px 8px rgba(0,0,0,.35); }

.dialog { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); width: min(460px, calc(100vw - 24px)); pointer-events: auto;
  padding: 14px 16px; border-radius: 16px; background: #fff; color: #1F1726; border: 1px solid #D9D0DE; box-shadow: 0 10px 40px rgba(31,23,38,.35); }
.dialog h3 { margin: 0 0 4px; font-size: 15px; color: #42134E; }
.dialog .on { margin: 0 0 8px; font-size: 12px; color: #3A2C44; overflow-wrap: anywhere; }
.dialog textarea { width: 100%; padding: 8px 10px; border: 1px solid #D9D0DE; border-radius: 10px; font-size: 14px; resize: vertical; }
.dialog .acts { margin-top: 10px; display: flex; gap: 8px; justify-content: flex-end; }
`;

let barEl, panelEl, listEl, countEl, warnEl, hintEl, pinLayer, dialogEl, modeBtns, selectEl, downloadBtn, resetBtn, ribbonEl, backupsEl;
let panelOpen = false;

const HINTS = {
  texto: 'Haz clic en cualquier texto de la página y escribe. Los enlaces y botones no se activan en este modo.',
  nota: 'Haz clic en lo que quieras comentar (una foto, una sección, un botón) y escribe qué cambiar.',
  ver: 'Navega la página con normalidad; tus cambios se ven aplicados.',
  original: 'Así se ve la página SIN tus cambios, para comparar. Tus cambios siguen guardados: elige otro modo para volver a verlos.',
};

function buildUi() {
  const style = h('style', {}, EDITOR_CSS);
  warnEl = h('p', { class: 'warn', hidden: storageOk }, 'Este navegador no deja guardar entre páginas (¿ventana privada?). Descarga los cambios antes de cambiar de página.');
  hintEl = h('p', { class: 'hint' });
  countEl = h('span', { class: 'count' }, '0');
  modeBtns = {};
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Modo del editor' });
  for (const [mode, label] of [['texto', 'Editar texto'], ['nota', 'Agregar nota'], ['ver', 'Solo ver'], ['original', 'Ver original']]) {
    modeBtns[mode] = h('button', { type: 'button', onclick: () => setMode(mode), title: mode === 'original' ? 'Mira la página sin tus cambios, para comparar' : null }, label);
    seg.append(modeBtns[mode]);
  }
  selectEl = h(
    'select',
    { 'aria-label': 'Ir a otra página', onchange: () => selectEl.value && (location.href = selectEl.value) },
    h('option', { value: '' }, 'Ir a otra página…'),
    pageList.map((p) => h('option', { value: p.path }, p.label)),
  );
  barEl = h(
    'div',
    { class: 'bar', role: 'toolbar', 'aria-label': 'Editor del borrador' },
    h(
      'div',
      { class: 'row' },
      h('span', { class: 'brand' }, 'Editor'),
      seg,
      selectEl,
      h('button', { class: 'btn', type: 'button', onclick: () => togglePanel() }, 'Cambios', countEl),
      h('button', { class: 'btn ghost', type: 'button', 'aria-label': 'Cerrar el editor', title: 'Cerrar el editor', onclick: closeEditor }, '✕'),
    ),
    hintEl,
    warnEl,
  );

  listEl = h('div');
  backupsEl = h('details', { class: 'seo' });
  ribbonEl = h('div', { class: 'ribbon', role: 'status', hidden: true }, 'Estás viendo el ORIGINAL, sin tus cambios');
  downloadBtn = h('button', { class: 'btn', type: 'button', onclick: download }, 'Descargar cambios');
  resetBtn = h('button', { class: 'btn danger', type: 'button', onclick: resetAll }, 'Descartar todo');
  panelEl = h(
    'aside',
    { class: 'panel', hidden: true, 'aria-label': 'Cambios del borrador' },
    h(
      'header',
      {},
      h('h2', {}, 'Cambios de este borrador'),
      h('p', {}, 'Todo queda guardado en este navegador. Cuando termines, descarga el archivo y envíalo al equipo web: ellos lo pasan a la página real.'),
    ),
    h('div', { class: 'body' }, buildSeo(), listEl, backupsEl),
    h('div', { class: 'foot' }, resetBtn, downloadBtn),
  );
  pinLayer = h('div');
  root.append(style, pinLayer, ribbonEl, barEl, panelEl);
  document.body.append(host);
}

function buildSeo() {
  const stored = (field) => (state.changes.find((c) => c.kind === 'meta' && c.page === PAGE && c.field === field) || {}).after;
  const title = h('input', { type: 'text', value: stored('title') ?? metaOrig.title, oninput: () => onMeta('title', title.value) });
  const desc = h('textarea', { rows: 3, oninput: () => onMeta('description', desc.value) }, stored('description') ?? metaOrig.description);
  return h(
    'details',
    { class: 'seo' },
    h('summary', {}, 'Texto de esta página en Google'),
    h('label', {}, 'Título (lo que se ve en la pestaña y en el resultado de búsqueda)', title),
    h('label', {}, 'Descripción (la frase bajo el título en Google)', desc),
  );
}

// Ver el original: cada bloque editado vuelve a la foto previa a las ediciones (y el
// título/descripción de Google también); al salir se reaplican los cambios guardados.
let showingOriginal = false;
function showOriginal(on) {
  if (on === showingOriginal) return;
  showingOriginal = on;
  if (on) {
    for (const [el, snap] of snaps) if (el.hasAttribute('data-editor-changed')) el.innerHTML = snap.html;
    for (const field of ['title', 'description']) setMeta(field, metaOrig[field]);
  } else {
    applyStoredText();
    applyStoredMeta();
  }
  ribbonEl.hidden = !on;
}

function setMode(mode) {
  state.mode = mode;
  showOriginal(mode === 'original');
  save(true);
  document.body.setAttribute('data-editor-mode', mode);
  for (const [m, btn] of Object.entries(modeBtns)) btn.setAttribute('aria-pressed', String(m === mode));
  hintEl.textContent = HINTS[mode];
  for (const el of snaps.keys()) {
    if (mode === 'texto') {
      // "true" y no "plaintext-only": este último hace que Chrome pinte los
      // espacios y saltos del fuente (pre-wrap) y la página se vea distinta a
      // la real. El formato lo cierran los beforeinput/paste/drop de wirePage().
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'true');
    } else {
      el.removeAttribute('contenteditable');
    }
  }
  setHover(null);
  closeDialog();
}

function togglePanel(open = !panelOpen) {
  panelOpen = open;
  panelEl.hidden = !open;
  renderList();
  if (open) renderBackups();
}

// ── Versiones guardadas ────────────────────────────────────────────────────

function renderBackups() {
  const list = loadBackups();
  backupsEl.replaceChildren(h('summary', {}, `Versiones guardadas (${list.length})`));
  if (!list.length) {
    backupsEl.append(h('p', { class: 'empty' }, 'Todavía no hay copias. El editor guarda una automáticamente mientras trabajas, y otra antes de descartar o restaurar.'));
    return;
  }
  backupsEl.append(h('p', { class: 'where' }, 'Copias de tus cambios en este navegador. Restaurar reemplaza la lista actual (la actual también se guarda antes).'));
  for (const b of list) {
    const when = new Date(b.at).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
    backupsEl.append(
      h(
        'div',
        { class: 'item' },
        h('div', { class: 'where' }, `${when} · ${b.reason}`),
        h('div', { class: 'row' }, `${b.changes.length} cambio(s) y nota(s)`),
        h('div', { class: 'acts' }, h('button', { type: 'button', onclick: () => restoreBackup(b) }, 'Restaurar esta versión')),
      ),
    );
  }
}

function restoreBackup(b) {
  if (!confirm(`¿Restaurar la versión del ${new Date(b.at).toLocaleString('es-CL')}? Reemplaza tus cambios actuales (quedan guardados como otra versión).`)) return;
  backup('antes de restaurar');
  state.changes = JSON.parse(JSON.stringify(b.changes));
  save(true);
  location.reload();
}

function closeEditor() {
  if (!confirm('Se cierra el editor. Tus cambios quedan guardados en este navegador.\n\nPara volver, abre la página con ?editar al final de la dirección.')) return;
  state.active = false;
  save(true);
  location.reload();
}

function resetAll() {
  if (!state.changes.length || !confirm('¿Descartar TODOS los cambios y notas de este borrador?\n\nQuedan guardados en «Versiones guardadas» por si necesitas recuperarlos.')) return;
  backup('antes de descartar todo');
  state.changes = [];
  save(true);
  location.reload();
}

// ── Lista de cambios ──────────────────────────────────────────────────────

function renderList() {
  const total = state.changes.length;
  countEl.textContent = String(total);
  if (downloadBtn) downloadBtn.disabled = total === 0;
  if (resetBtn) resetBtn.disabled = total === 0;
  if (!panelOpen) return;
  listEl.replaceChildren();
  if (!total) {
    listEl.append(h('p', { class: 'empty' }, 'Todavía no hay cambios. Escribe sobre cualquier texto de la página o agrega una nota.'));
    return;
  }
  const order = pageList.map((p) => clean(p.path));
  const pages = [...new Set(state.changes.map((c) => c.page))].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  for (const page of pages) {
    listEl.append(h('div', { class: 'group' }, pageLabel(page)));
    let noteN = 0;
    for (const ch of state.changes.filter((c) => c.page === page)) {
      if (ch.kind === 'note') noteN++;
      listEl.append(renderItem(ch, noteN));
    }
  }
}

function renderItem(ch, noteN) {
  const here = ch.page === PAGE;
  const acts = h('div', { class: 'acts' });
  if (!here && /^\/(?!\/)/.test(ch.page)) acts.append(h('button', { type: 'button', onclick: () => (location.href = ch.page) }, 'Ir a la página'));
  if (ch.kind === 'note' && here) acts.append(h('button', { type: 'button', onclick: () => openNote({ existing: ch }) }, 'Editar'));
  acts.append(h('button', { type: 'button', onclick: () => undo(ch.id) }, ch.kind === 'note' ? 'Eliminar' : 'Deshacer'));

  let body;
  if (ch.kind === 'text') {
    body = [
      h('div', { class: 'where' }, h('span', { class: 'tag' }, 'Texto'), ch.section),
      h('div', { class: 'row before' }, ch.blockBefore),
      h('div', { class: 'row' }, ch.blockAfter || '(vacío)'),
      here && !shown.has(ch.id) ? h('div', { class: 'row' }, 'No se puede mostrar acá, pero viaja en el archivo.') : null,
    ];
  } else if (ch.kind === 'meta') {
    body = [
      h('div', { class: 'where' }, h('span', { class: 'tag' }, 'Google'), ch.field === 'title' ? 'Título' : 'Descripción'),
      h('div', { class: 'row before' }, ch.before),
      h('div', { class: 'row' }, ch.after),
    ];
  } else {
    body = [
      h('div', { class: 'where' }, h('span', { class: 'tag nota' }, `Nota ${noteN}`), `${ch.section || ''} · ${ch.tag}${ch.text ? ` “${ch.text.slice(0, 50)}”` : ''}`),
      h('div', { class: 'row' }, ch.note),
    ];
  }
  return h('div', { class: 'item' }, body, acts);
}

function undo(id) {
  const ch = state.changes.find((c) => c.id === id);
  if (!ch) return;
  if (ch.page === PAGE) {
    if (ch.kind === 'text') {
      const el = byKey.get(keyOf(ch.blockBefore, ch.nth));
      if (el) {
        el.innerHTML = snaps.get(el).html;
        el.removeAttribute('data-editor-changed');
      }
    } else if (ch.kind === 'meta') {
      setMeta(ch.field, metaOrig[ch.field]);
      buildSeoInto();
    }
  }
  state.changes = state.changes.filter((c) => c.id !== id);
  save(true);
  renderList();
  renderPins();
}

function buildSeoInto() {
  const old = panelEl.querySelector('.seo');
  if (old) old.replaceWith(buildSeo());
}

// ── Notas: diálogo y marcadores ────────────────────────────────────────────

function closeDialog() {
  if (dialogEl) dialogEl.remove();
  dialogEl = null;
}

function openNote({ info, existing }) {
  closeDialog();
  const data = existing || info;
  const area = h('textarea', { rows: 4, 'aria-label': 'Nota', placeholder: 'Ej.: cambiar esta foto por otra · mover esta sección más arriba · eliminar este bloque' }, existing ? existing.note : '');
  const saveNote = () => {
    const note = area.value.trim();
    if (!note) return closeDialog();
    if (existing) {
      existing.note = note;
    } else {
      state.changes.push({ id: newId(), kind: 'note', page: PAGE, pageTitle: metaOrig.title, ...info, note, at: new Date().toISOString() });
    }
    save(true);
    closeDialog();
    renderList();
    renderPins();
  };
  dialogEl = h(
    'div',
    { class: 'dialog', role: 'dialog', 'aria-label': 'Nota', onkeydown: (e) => e.key === 'Escape' && closeDialog() },
    h('h3', {}, 'Nota para el equipo web'),
    h('p', { class: 'on' }, `${data.section ? data.section + ' · ' : ''}${data.tag}${data.src ? ` · ${data.src}` : ''}${data.text ? ` · “${data.text.slice(0, 80)}”` : ''}`),
    area,
    h(
      'div',
      { class: 'acts' },
      h('button', { class: 'btn light', type: 'button', onclick: closeDialog }, 'Cancelar'),
      h('button', { class: 'btn', type: 'button', onclick: saveNote }, 'Guardar nota'),
    ),
  );
  root.append(dialogEl);
  area.focus();
}

let pinFrame = 0;
function renderPins() {
  cancelAnimationFrame(pinFrame);
  pinFrame = requestAnimationFrame(() => {
    pinLayer.replaceChildren();
    document.querySelectorAll('[data-editor-note]').forEach((e) => e.removeAttribute('data-editor-note'));
    let n = 0;
    for (const ch of state.changes) {
      if (ch.kind !== 'note' || ch.page !== PAGE) continue;
      n++;
      let el = null;
      try {
        el = document.querySelector(ch.selector);
      } catch (e) {
        /* selector que ya no existe: la nota sigue en el archivo, sin marcador */
      }
      if (!el) continue;
      el.setAttribute('data-editor-note', '');
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      pinLayer.append(
        h('button', { class: 'pin', type: 'button', style: `top:${Math.max(0, r.top + scrollY - 11)}px;left:${Math.max(0, r.left + scrollX - 11)}px`, title: ch.note, 'aria-label': `Nota ${n}: ${ch.note}`, onclick: () => openNote({ existing: ch }) }, String(n)),
      );
    }
  });
}

// ── Descargar ─────────────────────────────────────────────────────────────

function download() {
  save(true);
  backup('al descargar');
  const payload = { app: 'asecon-editor', version: 1, exportedAt: new Date().toISOString(), site: location.origin, changes: state.changes };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `cambios-asecon-${new Date().toISOString().slice(0, 10)}.json` });
  root.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ── Arranque ──────────────────────────────────────────────────────────────

const PAGE_CSS = `
[data-editor-block] { cursor: default; }
body[data-editor-mode="texto"] [data-editor-block] { cursor: text; }
body[data-editor-mode="texto"] [data-editor-block]:hover { outline: 2px dashed rgba(107,31,126,.6); outline-offset: 3px; }
body[data-editor-mode="texto"] [data-editor-block]:focus { outline: 2px solid #6B1F7E; outline-offset: 3px; }
[data-editor-changed] { box-shadow: 0 0 0 3px rgba(250,204,21,.55); border-radius: 2px; }
body[data-editor-mode="original"] [data-editor-changed] { box-shadow: none; }
[data-editor-hover] { outline: 2px solid #C79A4B !important; outline-offset: 2px; cursor: crosshair !important; }
[data-editor-note] { outline: 2px dashed #C79A4B; outline-offset: 2px; }
/* Lo flotante del sitio (banner de cookies, barra de contacto) sube para no quedar bajo la barra del editor. */
body[data-editor-mode] #consent-banner { bottom: 84px !important; }
body[data-editor-mode] [data-sticky-cta] { bottom: 96px !important; }
`;

function main() {
  const url = new URL(location.href);
  const flag = url.searchParams.get('editar');
  if (flag !== null) {
    state.active = flag !== 'salir';
    save(true);
    url.searchParams.delete('editar');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  if (!state.active) return;

  // Orden importa: primero la foto del texto original, después los cambios guardados.
  snapshotBlocks();
  applyStoredText();
  applyStoredMeta();

  document.head.append(h('style', { 'data-editor-ignore': '' }, PAGE_CSS));
  buildUi();
  wirePage();
  setMode(['texto', 'nota', 'ver'].includes(state.mode) ? state.mode : 'texto');
  renderList();
  renderPins();

  addEventListener('resize', renderPins);
  addEventListener('load', renderPins);
  addEventListener('pagehide', () => save(true));
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && save(true));
  if ('ResizeObserver' in window) new ResizeObserver(renderPins).observe(document.documentElement);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main, { once: true });
else main();
