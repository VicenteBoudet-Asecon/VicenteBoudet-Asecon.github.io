#!/usr/bin/env node
// Lleva al código los cambios que alguien hizo en el editor visual del preview
// (src/scripts/editor.js): lee el archivo `cambios-asecon-AAAA-MM-DD.json` que
// descarga el editor y reemplaza cada texto editado en el fuente de src/.
//
// Uso:
//   npm run cambios -- cambios-asecon-2026-10-22.json            muestra qué haría, no toca nada
//   npm run cambios -- cambios-asecon-2026-10-22.json --write    aplica los reemplazos a src/
//   ... --todos    si un texto aparece en varios lugares, reemplaza todos (por defecto se
//                  salta y avisa: puede que solo se quisiera cambiar uno)
//   ... --pisar    si OTRA persona ya cambió ese mismo texto, gana la última (por defecto no
//                  se pisa: se informa el conflicto y no se toca)
//   ... --raiz <carpeta>   trabaja sobre otro proyecto (el de gerencia, ver respaldar-cambios.mjs)
//                          en vez de este
//   ... --forzar-main      permite --write sobre una carpeta en la rama main (el original), que
//                          por defecto se rechaza
//
// Cada descarga del editor es ACUMULATIVA (trae todo lo que la persona lleva
// hecho, no solo lo nuevo), siempre habla del texto ORIGINAL, y cada cambio
// lleva el nombre de quien lo hizo (`by`). Por eso este proyecto lleva un
// registro, cambios/estado.json: para cada texto original, qué hay hoy puesto
// en el código y quién lo pidió. Con él:
//   - lo que ya está puesto se reconoce y se salta;
//   - si la MISMA persona vuelve a editar un texto, se parte de lo último que puso;
//   - si OTRA persona toca un texto que ya cambió alguien, hay un CONFLICTO: se
//     informa con las dos versiones y no se pisa nada (salvo --pisar).
//
// Qué hace: busca el texto ORIGINAL como string completo (entre comillas en
// .js/.ts, entre `>` y `<` o solo en su línea en .astro/.md) y pone el nuevo,
// escapado para donde cae. Qué no hace, y deja en el informe para resolver a
// mano: textos armados por partes o con marcadores ({rut}), notas (fotos,
// orden, eliminar secciones), textos borrados por completo, conflictos entre
// personas y todo lo que aparezca en más de un lugar sin --todos. Las
// versiones en inglés no se tocan.
//
// Después de aplicar: `git diff` para revisar y `npm run validate` antes de publicar.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const iRaiz = args.indexOf('--raiz');
const raiz = iRaiz >= 0 ? resolve(args[iRaiz + 1] ?? '') : fileURLToPath(new URL('..', import.meta.url));
const archivo = args.find((a, i) => !a.startsWith('--') && (iRaiz < 0 || i !== iRaiz + 1));
const escribir = args.includes('--write');
const todos = args.includes('--todos');
const pisar = args.includes('--pisar');
// Para respaldar-cambios.mjs: al final imprime una línea con los conteos.
const maquina = args.includes('--maquina');

if (!archivo) {
  console.error('Falta el archivo de cambios.\n  npm run cambios -- cambios-asecon-AAAA-MM-DD.json [--write] [--todos] [--pisar] [--raiz <carpeta>]');
  process.exit(2);
}
if (!existsSync(join(raiz, 'src'))) {
  console.error(`${raiz} no parece un proyecto del sitio (no tiene src/).`);
  process.exit(2);
}
// El original (rama main) no se modifica con cambios de la gerencia: para eso está el proyecto
// de gerencia (npm run respaldar). Simular sí se puede en cualquier carpeta.
if (escribir && !args.includes('--forzar-main')) {
  const rama = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).stdout?.trim();
  if (rama === 'main') {
    console.error(
      `Esta carpeta es el ORIGINAL (rama main): no se le aplican cambios de la gerencia.\n` +
        `  Usa:  npm run respaldar -- ${archivo}     (los aplica en el proyecto de gerencia y los respalda)\n` +
        `  Si de verdad quieres cambiar el original con este archivo: agrega --forzar-main.`,
    );
    process.exit(2);
  }
}
if (!existsSync(archivo)) {
  console.error(`No existe ${archivo}`);
  process.exit(2);
}

let paquete;
try {
  paquete = JSON.parse(readFileSync(archivo, 'utf8'));
} catch (e) {
  console.error(`${archivo} no es un JSON válido: ${e.message}`);
  process.exit(2);
}
if (paquete.app !== 'asecon-editor' || !Array.isArray(paquete.changes)) {
  console.error(`${archivo} no es un archivo de cambios del editor (falta app: "asecon-editor").`);
  process.exit(2);
}

const norm = (s) => s.replace(/[\s ]+/g, ' ').trim();
const comillas = (t) => `“${t.length > 90 ? t.slice(0, 87) + '…' : t}”`;

// Quién hizo cada cambio: el `by` del propio cambio y, si falta (archivos de antes de
// que el editor pidiera el nombre), el autor del archivo.
const SIN_NOMBRE = '(sin nombre)';
const autorDe = (ch, paq) => norm(String(ch.by ?? paq.author ?? '')) || SIN_NOMBRE;

// ── Fuentes donde se busca ─────────────────────────────────────────────────

const EXT = new Set(['.js', '.ts', '.astro', '.md']);
const EXCLUIR = new Set(['src/scripts/editor.js', 'src/components/EditorLoader.astro']);
function fuentes(dir, acc = []) {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) fuentes(ruta, acc);
    else if (EXT.has(extname(ruta)) && !EXCLUIR.has(relative(raiz, ruta).replace(/\\/g, '/'))) acc.push(ruta);
  }
  return acc;
}
const archivos = fuentes(join(raiz, 'src')).map((ruta) => ({ ruta, rel: relative(raiz, ruta).replace(/\\/g, '/'), ext: extname(ruta), src: readFileSync(ruta, 'utf8') }));

// ── Unidades de cambio: lo que hay que buscar y reemplazar ──────────────────

const origenDe = (ch) => `${ch.page}${ch.section ? ` · ${ch.section}` : ''}`;

// De la lista de cambios del editor a pares "texto original → texto nuevo", cada uno con su autor.
function extraer(changes, paq) {
  const unidades = []; // { before, after, origen, autor }
  const manuales = []; // { motivo, origen, texto?, autor }
  const notas = [];
  for (const ch of changes) {
    const autor = autorDe(ch, paq);
    if (ch.kind === 'note') {
      notas.push({ ...ch, autor });
      continue;
    }
    const pares =
      ch.kind === 'meta'
        ? [{ before: norm(ch.before), after: norm(ch.after) }]
        : ch.nodes
          ? ch.nodes.map((n) => ({ before: norm(n.before), after: norm(n.after) }))
          : [{ before: norm(ch.blockBefore), after: norm(ch.blockAfter) }];
    const etiqueta = ch.kind === 'meta' ? `${origenDe(ch)} · SEO ${ch.field === 'title' ? 'título' : 'descripción'}` : origenDe(ch);
    for (const p of pares) {
      if (p.before === p.after) continue;
      if (!p.before) manuales.push({ motivo: 'el texto original es solo espacios: no hay qué buscar', origen: etiqueta, texto: `→ ${comillas(p.after)}`, autor });
      else if (!p.after) manuales.push({ motivo: 'el texto quedó vacío: ¿se quiere borrar el elemento entero?', origen: etiqueta, texto: comillas(p.before), autor });
      else unidades.push({ ...p, origen: etiqueta, autor });
    }
  }
  return { unidades, manuales, notas };
}

const { unidades, manuales, notas } = extraer(paquete.changes, paquete);
const autores = [...new Set([...unidades, ...manuales, ...notas].map((x) => x.autor))];

// Mismo texto original en varios cambios (p. ej. un ítem del menú editado en
// cada página): si piden lo mismo se junta; si piden cosas distintas, conflicto.
const porAntes = new Map();
for (const u of unidades) {
  if (!porAntes.has(u.before)) porAntes.set(u.before, []);
  porAntes.get(u.before).push(u);
}
const trabajo = [];
for (const [before, lista] of porAntes) {
  const distintos = [...new Set(lista.map((u) => u.after))];
  if (distintos.length > 1) {
    const quien = (a) => [...new Set(lista.filter((u) => u.after === a).map((u) => u.autor))].join(', ');
    manuales.push({
      motivo: 'dos cambios distintos para el mismo texto en este archivo',
      origen: [...new Set(lista.map((u) => u.origen))].join(' | '),
      texto: `${comillas(before)} → ${distintos.map((a) => `${comillas(a)} (${quien(a)})`).join(' / ')}`,
      autor: [...new Set(lista.map((u) => u.autor))].join(', '),
    });
  } else {
    trabajo.push({ before, after: distintos[0], origenes: [...new Set(lista.map((u) => u.origen))], autores: [...new Set(lista.map((u) => u.autor))] });
  }
}

// ── Registro de lo ya aplicado (cambios/estado.json) ────────────────────────
// texto original -> { actual: lo que hay hoy en el código, autores: quién lo pidió }.

const dirCambios = join(raiz, 'cambios');
const rutaEstado = join(dirCambios, 'estado.json');
const registro = { version: 1, textos: {} };
if (existsSync(rutaEstado)) {
  try {
    Object.assign(registro, JSON.parse(readFileSync(rutaEstado, 'utf8')));
  } catch (e) {
    console.error(`${rutaEstado} no es un JSON válido: ${e.message}`);
    process.exit(2);
  }
} else if (existsSync(dirCambios)) {
  // Un proyecto con descargas ya archivadas pero sin registro (de antes de que existiera):
  // se reconstruye a partir de ellas, en orden, suponiendo que se aplicaron.
  for (const f of readdirSync(dirCambios).filter((x) => x.endsWith('.json')).sort()) {
    try {
      const previo = JSON.parse(readFileSync(join(dirCambios, f), 'utf8'));
      if (previo.app !== 'asecon-editor') continue;
      for (const u of extraer(previo.changes, previo).unidades) registro.textos[u.before] = { actual: u.after, autores: [u.autor] };
    } catch (e) {
      /* un archivo ajeno en cambios/: no es parte del historial */
    }
  }
}

// ── Búsqueda ───────────────────────────────────────────────────────────────

// El texto renderizado puede venir de un fuente con la comilla escapada (\'),
// con entidades (&amp;, &nbsp;) o con espacios de no separación: se aceptan.
function patron(texto) {
  const esc = (w) =>
    w
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/&/g, '(?:&|&amp;)')
      .replace(/'/g, "(?:'|\\\\'|&#39;|&apos;)")
      .replace(/"/g, '(?:"|\\\\"|&quot;)');
  return new RegExp(texto.split(' ').map(esc).join('(?:\\s|&nbsp;|\\\\u00a0)+'), 'g');
}

// ¿El tramo es un texto completo? Devuelve cómo escaparlo, o null si es solo
// un pedazo de algo más largo (en ese caso no se toca).
function modoDe({ src, ext }, ini, fin) {
  const ant = src[ini - 1];
  const sig = src[fin];
  const lineaIni = src.lastIndexOf('\n', ini - 1) + 1;
  const lineaFin = src.indexOf('\n', fin) < 0 ? src.length : src.indexOf('\n', fin);
  const antes = src.slice(lineaIni, ini);
  const despues = src.slice(fin, lineaFin);
  if (ext === '.js' || ext === '.ts') {
    if (/^\s*(\/\/|\*|\/\*)/.test(antes)) return null; // un comentario que cita el texto
    return '\'"`'.includes(ant) && ant === sig ? ant : null;
  }
  if (ext === '.md') {
    if ('\'"'.includes(ant) && ant === sig) return ant;
    if (/^\s*$/.test(antes) && /^\s*$/.test(despues)) return 'md';
    if (/^[\w-]+:\s*$/.test(antes) && /^\s*$/.test(despues)) return 'md';
    return null;
  }
  if (ant === '>' && sig === '<') return 'html';
  if (/^\s*$/.test(antes) && /^\s*$/.test(despues)) return 'html';
  return null;
}

function escapar(texto, modo) {
  if (modo === "'" || modo === '"') return texto.replace(/\\/g, '\\\\').replace(new RegExp(modo, 'g'), `\\${modo}`);
  if (modo === '`') return texto.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  if (modo === 'html') return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
  return texto; // md: tal cual
}

const lineaDe = (src, pos) => src.slice(0, pos).split('\n').length;

function buscar(texto) {
  const hallazgos = [];
  for (const a of archivos) {
    for (const m of a.src.matchAll(patron(texto))) {
      const modo = modoDe(a, m.index, m.index + m[0].length);
      if (modo) hallazgos.push({ a, ini: m.index, fin: m.index + m[0].length, modo, linea: lineaDe(a.src, m.index), original: m[0] });
    }
  }
  return hallazgos;
}

const aplicables = []; // { archivo, ini, fin, nuevo, ... }
const ambiguos = [];
const noEncontrados = [];
const yaAplicados = [];
const conflictos = []; // { ...t, previo }
for (const t of trabajo) {
  const previo = registro.textos[t.before];
  let hallazgos;
  let desde = t.before; // lo que de verdad hay hoy en el código
  if (!previo) {
    hallazgos = buscar(t.before);
  } else if (previo.actual === t.after) {
    // Ya está puesto lo que se pide (quizá lo pidió otra persona: da igual, queda lo mismo).
    if (buscar(t.after).length) yaAplicados.push({ ...t, previo });
    else noEncontrados.push({ ...t, nota: 'se aplicó antes, pero ya no está en el código' });
    continue;
  } else {
    const mismaPersona = t.autores.some((a) => previo.autores.includes(a));
    if (!mismaPersona && !pisar) {
      conflictos.push({ ...t, previo });
      continue;
    }
    // La misma persona se corrigió (o --pisar): se parte de lo último que se puso.
    hallazgos = buscar(previo.actual);
    desde = previo.actual;
    if (hallazgos.length === 0) {
      // Alguien devolvió el original a mano: se parte de él.
      hallazgos = buscar(t.before);
      desde = t.before;
    }
  }
  if (hallazgos.length === 0) noEncontrados.push(t);
  else if (hallazgos.length > 1 && !todos) ambiguos.push({ ...t, before: desde, hallazgos });
  else for (const x of hallazgos) aplicables.push({ ...t, antes: t.before, before: desde, ...x, nuevo: escapar(t.after, x.modo) });
}

// Dos reemplazos sobre el mismo tramo no se pueden hacer a la vez.
const porArchivo = new Map();
for (const ap of aplicables) {
  if (!porArchivo.has(ap.a.ruta)) porArchivo.set(ap.a.ruta, []);
  porArchivo.get(ap.a.ruta).push(ap);
}

// ── Informe ────────────────────────────────────────────────────────────────

const quien = (lista) => (lista.length ? `  [${lista.join(', ')}]` : '');

console.log(`\n${escribir ? 'Aplicando' : 'Simulando (no se toca nada; agrega --write para aplicar)'}: ${archivo}`);
console.log(`  ${paquete.changes.length} cambio(s) en el archivo, descargado ${paquete.exportedAt ?? '(sin fecha)'} · de: ${autores.join(', ') || SIN_NOMBRE}\n`);

if (aplicables.length) {
  console.log(`Aplicables (${aplicables.length}):`);
  for (const ap of aplicables) {
    const aviso = / |&nbsp;|\\u00a0/.test(ap.original ?? '') ? '   ← el original tenía espacios sin separación; revisa el resultado' : '';
    console.log(`  ✓ ${ap.a.rel}:${ap.linea}  ${comillas(ap.before)} → ${comillas(ap.after)}${quien(ap.autores)}${aviso}`);
  }
  console.log('');
}
if (conflictos.length) {
  console.log(`CONFLICTOS ENTRE PERSONAS (${conflictos.length}) — no se aplicaron; con --pisar gana la última:`);
  for (const x of conflictos) {
    console.log(`  ⚠ ${comillas(x.before)}   (${x.origenes.join(' | ')})`);
    console.log(`      ya aplicado, de ${x.previo.autores.join(', ')}: ${comillas(x.previo.actual)}`);
    console.log(`      ahora pide ${x.autores.join(', ')}:  ${comillas(x.after)}`);
  }
  console.log('');
}
if (ambiguos.length) {
  console.log(`Ambiguos (${ambiguos.length}) — el texto aparece en más de un lugar; con --todos se cambian todos:`);
  for (const x of ambiguos) {
    console.log(`  ? ${comillas(x.before)} → ${comillas(x.after)}   (${x.origenes.join(' | ')})${quien(x.autores)}`);
    for (const f of x.hallazgos) console.log(`      ${f.a.rel}:${f.linea}`);
  }
  console.log('');
}
if (noEncontrados.length) {
  console.log(`No encontrados (${noEncontrados.length}) — el texto está armado por partes, lleva marcadores o viene de otro lado; hay que editarlo a mano:`);
  for (const x of noEncontrados) console.log(`  ✗ ${comillas(x.before)} → ${comillas(x.after)}   (${x.origenes.join(' | ')})${quien(x.autores)}${x.nota ? ` — ${x.nota}` : ''}`);
  console.log('');
}
if (yaAplicados.length) {
  console.log(`Ya aplicados en descargas anteriores (${yaAplicados.length}): no se tocan.\n`);
}
if (manuales.length) {
  console.log(`Para resolver a mano (${manuales.length}):`);
  for (const x of manuales) console.log(`  ! ${x.texto ?? ''}  — ${x.motivo}   (${x.origen})  [${x.autor}]`);
  console.log('');
}
if (notas.length) {
  console.log(`Notas (${notas.length}) — no se aplican solas:`);
  for (const n of notas) {
    const que = [n.tag, n.src, n.text ? comillas(n.text) : ''].filter(Boolean).join(' ');
    console.log(`  • ${n.page}${n.section ? ` · ${n.section}` : ''} · ${que}  [${n.autor}]\n      “${n.note}”`);
  }
  console.log('');
}

// ── Escritura ──────────────────────────────────────────────────────────────

let hechos = 0;
if (escribir) {
  for (const [ruta, lista] of porArchivo) {
    const a = archivos.find((x) => x.ruta === ruta);
    let src = a.src;
    let limite = Infinity; // de atrás hacia adelante, sin pisar un tramo ya reemplazado
    for (const ap of lista.sort((x, y) => y.ini - x.ini)) {
      if (ap.fin > limite) {
        console.log(`  ! ${a.rel}:${ap.linea} se solapa con otro reemplazo; se salta`);
        continue;
      }
      src = src.slice(0, ap.ini) + ap.nuevo + src.slice(ap.fin);
      limite = ap.ini;
      ap.hecho = true;
      hechos++;
    }
    writeFileSync(ruta, src);
  }

  // El registro: lo que de verdad quedó puesto, y quién lo pidió.
  let tocado = false;
  const ahora = new Date().toISOString();
  for (const ap of aplicables) {
    if (!ap.hecho) continue;
    registro.textos[ap.antes] = { actual: ap.after, autores: ap.autores, en: ahora };
    tocado = true;
  }
  for (const y of yaAplicados) {
    const faltan = y.autores.filter((a) => !y.previo.autores.includes(a));
    if (!faltan.length) continue;
    registro.textos[y.before].autores = [...y.previo.autores, ...faltan];
    tocado = true;
  }
  if (tocado) {
    mkdirSync(dirCambios, { recursive: true });
    writeFileSync(rutaEstado, JSON.stringify(registro, null, 2) + '\n');
  }
  console.log(`Listo: ${hechos} reemplazo(s) en ${porArchivo.size} archivo(s). Revisa con \`git diff\` y corre \`npm run validate\`.\n`);
} else if (aplicables.length) {
  console.log('Nada se modificó. Si el informe se ve bien: agrega --write.\n');
}

if (maquina) {
  console.log(
    '@@RESUMEN@@ ' +
      JSON.stringify({
        aplicados: escribir ? hechos : aplicables.length,
        yaAplicados: yaAplicados.length,
        conflictos: conflictos.length,
        ambiguos: ambiguos.length,
        noEncontrados: noEncontrados.length,
        manuales: manuales.length,
        notas: notas.length,
        autores,
      }),
  );
}
