#!/usr/bin/env node
// Mantiene DOS proyectos: el original y el de gerencia.
//
//   original  → esta carpeta, rama `main`. Nunca se toca desde acá.
//   gerencia  → carpeta hermana `<este proyecto>-gerencia`, rama `gerencia`: el sitio con los
//               cambios que hizo la gerencia en el editor visual del preview.
//
// Cada archivo `cambios-asecon-*.json` que descarga el editor se respalda ahí: se archiva
// tal cual en cambios/, se aplica al código, y todo queda en UN commit de la rama `gerencia`
// (el archivo, el informe de lo que se pudo y no se pudo aplicar, y los cambios en src/).
// Así hay una historia completa, cada entrega se puede revertir sola, y el original sigue
// intacto para comparar o para volver atrás si la gerencia deja algo que no está bien.
//
// Uso:
//   npm run respaldar -- cambios-asecon-2026-10-22.json            arma/actualiza gerencia
//   npm run respaldar -- cambios-asecon-2026-10-22.json --push     y además sube la rama a GitHub
//   ... --todos    textos repetidos: reemplaza todos (ver aplicar-cambios.mjs)
//   ... --pisar    si OTRA persona ya cambió ese texto, gana la última (por defecto se avisa y no se pisa)
//
// Qué hace, en orden: (1) crea la carpeta y la rama `gerencia` desde `main` si no existen,
// (2) exige que esa carpeta no tenga cambios sueltos, (3) le trae lo nuevo de `main` (si hay
// conflicto, aborta sin dejar nada a medias), (4) aplica el archivo, (5) lo archiva con su
// informe, (6) hace el commit. Sube a GitHub solo con --push.
//
// Para ver qué difiere del original:  git diff main..gerencia
// Para publicar lo de gerencia: revisar ese diff y mezclar (o llevar commits sueltos) a `main`.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const original = resolve(fileURLToPath(new URL('..', import.meta.url)));
const gerencia = join(dirname(original), `${basename(original)}-gerencia`);
const RAMA = 'gerencia';

const args = process.argv.slice(2);
const archivo = args.find((a) => !a.startsWith('--'));
const subir = args.includes('--push');
const todos = args.includes('--todos');
const pisar = args.includes('--pisar');

const falla = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};
const git = (cwd, ...a) => {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
};
const mismaRuta = (a, b) => resolve(a).toLowerCase() === resolve(b).toLowerCase();

if (!archivo) falla('Falta el archivo de cambios.\n    npm run respaldar -- cambios-asecon-AAAA-MM-DD.json [--push] [--todos] [--pisar]');
if (!existsSync(archivo)) falla(`No existe ${archivo}`);
const bytes = readFileSync(archivo);
let paquete;
try {
  paquete = JSON.parse(bytes.toString('utf8'));
} catch (e) {
  falla(`${archivo} no es un JSON válido: ${e.message}`);
}
if (paquete.app !== 'asecon-editor' || !Array.isArray(paquete.changes)) falla(`${archivo} no es un archivo de cambios del editor.`);

if (!git(original, 'rev-parse', '--is-inside-work-tree').ok) falla('Esta carpeta no es un repositorio git.');
if (!git(original, 'rev-parse', '--verify', 'refs/heads/main').ok) falla('No existe la rama `main` (el original).');

// ── 1. El proyecto de gerencia ──────────────────────────────────────────────

const arboles = git(original, 'worktree', 'list', '--porcelain').out.split(/\r?\n\r?\n/).map((bloque) => ({
  ruta: /^worktree (.+)$/m.exec(bloque)?.[1],
  rama: /^branch refs\/heads\/(.+)$/m.exec(bloque)?.[1],
}));
let creado = false;
if (!arboles.some((w) => w.ruta && mismaRuta(w.ruta, gerencia) && w.rama === RAMA)) {
  if (existsSync(gerencia)) falla(`Ya existe ${gerencia} y no es el proyecto de gerencia (rama ${RAMA}). Muévela o bórrala y vuelve a correr.`);
  const local = git(original, 'rev-parse', '--verify', `refs/heads/${RAMA}`).ok;
  const remota = git(original, 'rev-parse', '--verify', `refs/remotes/origin/${RAMA}`).ok;
  const alta = local
    ? ['worktree', 'add', gerencia, RAMA]
    : remota
      ? ['worktree', 'add', '-b', RAMA, gerencia, `origin/${RAMA}`]
      : ['worktree', 'add', '-b', RAMA, gerencia, 'main'];
  const r = git(original, ...alta);
  if (!r.ok) falla(`No pude crear el proyecto de gerencia:\n${r.err}`);
  creado = true;
  console.log(`\n  + Proyecto de gerencia creado en ${gerencia} (rama ${RAMA})`);
}

if (git(gerencia, 'status', '--porcelain').out) falla(`${gerencia} tiene cambios sin guardar. Revísalos (git status) antes de respaldar algo nuevo.`);

// ── 2. Traer lo nuevo del original ─────────────────────────────────────────

const mezcla = git(gerencia, 'merge', 'main', '--no-edit', '-m', 'Gerencia al día con el original (main)');
if (!mezcla.ok) {
  git(gerencia, 'merge', '--abort');
  falla(
    `Lo nuevo del original (main) choca con los cambios de gerencia; no se tocó nada.\n` +
      `    Resuélvelo a mano en ${gerencia}: git merge main  (y después vuelve a correr este comando).\n${mezcla.err || mezcla.out}`,
  );
}
if (!/Already up to date|Ya está actualizado/i.test(mezcla.out)) console.log('  ↻ Gerencia al día con el original (main)');

// ── 3. ¿Ya estaba respaldado? ──────────────────────────────────────────────

const hash = createHash('sha1').update(bytes).digest('hex').slice(0, 8);
const dirCambios = join(gerencia, 'cambios');
const existente = existsSync(dirCambios) ? readdirSync(dirCambios).find((f) => f.endsWith(`-${hash}.json`)) : undefined;
if (existente && !pisar) {
  console.log(`\n  = Este archivo ya está respaldado en gerencia (${existente}). No hay nada nuevo que hacer.`);
  console.log(`    Si quedaron conflictos entre personas y debe ganar la última versión: repite con --pisar.\n`);
  process.exit(0);
}
// Con --pisar sobre un archivo ya respaldado se vuelve a aplicar, sin archivarlo de nuevo.
const reaplicar = Boolean(existente);

// ── 4. Aplicar ─────────────────────────────────────────────────────────────

const aplicar = spawnSync(
  process.execPath,
  [join(original, 'scripts', 'aplicar-cambios.mjs'), resolve(archivo), '--write', '--maquina', '--raiz', gerencia, ...(todos ? ['--todos'] : []), ...(pisar ? ['--pisar'] : [])],
  { encoding: 'utf8' },
);
if (aplicar.status !== 0) falla(`No se pudo aplicar el archivo:\n${aplicar.stderr || aplicar.stdout}`);
const lineas = aplicar.stdout.split(/\r?\n/);
const marca = lineas.find((l) => l.startsWith('@@RESUMEN@@ '));
const resumen = marca ? JSON.parse(marca.slice('@@RESUMEN@@ '.length)) : {};
const informe = lineas.filter((l) => !l.startsWith('@@RESUMEN@@ ')).join('\n').trim();

// ── 5. Archivar el archivo y su informe ────────────────────────────────────

const fecha = (paquete.exportedAt ? new Date(paquete.exportedAt) : new Date()).toISOString().slice(0, 16).replace('T', '-').replace(':', '');
// Quién hizo los cambios (cada uno lleva su nombre; ver el editor): va en el nombre del archivo
// archivado, en el commit y en el informe, para saber de quién es cada entrega.
const autores = resumen.autores ?? [];
const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
const quienArchivo = autores.length === 1 ? slug(autores[0]) || 'sin-nombre' : autores.length > 1 ? 'varios' : 'sin-nombre';
const nombre = reaplicar ? existente.replace(/\.json$/, '') : `${fecha}-${quienArchivo}-${hash}`;
mkdirSync(dirCambios, { recursive: true });
if (!reaplicar) writeFileSync(join(dirCambios, `${nombre}.json`), bytes);
writeFileSync(join(dirCambios, `${nombre}${reaplicar ? '.pisar' : ''}.informe.txt`), informe + '\n');

// ── 6. Commit ──────────────────────────────────────────────────────────────

const conflictos = resumen.conflictos ?? 0;
const pendientes = (resumen.ambiguos ?? 0) + (resumen.noEncontrados ?? 0) + (resumen.manuales ?? 0) + conflictos;
const deQuien = autores.length ? ` de ${autores.join(', ')}` : '';
const asunto = `${reaplicar ? 'Se pisó con --pisar: ' : ''}Cambios de gerencia${deQuien} (${fecha}): ${resumen.aplicados ?? 0} aplicado(s), ${pendientes} por resolver${conflictos ? ` (${conflictos} en conflicto entre personas)` : ''}, ${resumen.notas ?? 0} nota(s)`;
const cuerpo =
  `Archivo respaldado: cambios/${nombre}.json (${paquete.changes.length} cambio(s), descargado ${paquete.exportedAt ?? 'sin fecha'}).\n` +
  `Cambios de: ${autores.join(', ') || 'sin nombre'}.\n` +
  `Ya aplicados antes: ${resumen.yaAplicados ?? 0}.\n\n${informe}\n`;
git(gerencia, 'add', 'cambios', 'src');
const commit = spawnSync('git', ['commit', '-F', '-'], { cwd: gerencia, encoding: 'utf8', input: `${asunto}\n\n${cuerpo}` });
if (commit.status !== 0) falla(`No se pudo hacer el commit en ${gerencia}:\n${commit.stderr || commit.stdout}`);
const sha = git(gerencia, 'rev-parse', '--short', 'HEAD').out;

console.log(`\n${informe}\n`);
console.log(`  ✓ Respaldado en gerencia: commit ${sha} — ${asunto}`);
if (conflictos) console.log(`  ⚠ ${conflictos} conflicto(s) entre personas: dos personas tocaron el mismo texto y NO se pisó nada. Revisa el informe (cambios/${nombre}.informe.txt); si debe ganar la última: npm run respaldar -- <archivo> --pisar`);

if (subir) {
  const push = git(gerencia, 'push', '-u', 'origin', RAMA);
  console.log(push.ok ? `  ✓ Rama ${RAMA} subida a GitHub` : `  ✗ No se pudo subir la rama ${RAMA}:\n${push.err}`);
} else {
  console.log(`  · La rama ${RAMA} todavía NO está en GitHub (respaldo solo en este equipo). Súbela con: npm run respaldar -- <archivo> --push  o  git -C "${gerencia}" push -u origin ${RAMA}`);
}

console.log(`\n  Original  (intacto):  ${original}   rama main`);
console.log(`  Gerencia  (con cambios): ${gerencia}   rama ${RAMA}${creado ? '   ← recién creada: corre `npm ci` ahí antes de `npm run dev`' : ''}`);
console.log(`  Diferencias con el original:  git diff main..${RAMA}\n`);
