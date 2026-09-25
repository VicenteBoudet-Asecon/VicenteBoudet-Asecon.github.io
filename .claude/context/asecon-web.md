# Contexto compartido — sitio Asecon (brief de los agentes)

Todos los agentes de `.claude/agents/` leen este archivo antes de tocar nada.
Si algo de aquí ya no es cierto, corrígelo aquí (no lo dupliques en cada agente).

Última puesta al día: **2026-09-24**, revisión completa previa al despliegue (QA, seguridad,
despliegue y backend en paralelo) — ver "Defectos abiertos" más abajo. Plan del proyecto:
`C:\Users\nt8as\.claude\plans\orquestador-necesito-que-hagamos-greedy-harbor.md` (Fase 8).

**Estado en una línea:** el sitio está construido y el preview funciona, pero **no se despliega a
producción hasta tener acceso a la zona DNS** (decisión del usuario, 2026-09-24). Mientras tanto se
cierran los defectos abiertos y, como mucho, se despliega a `*.netlify.app` para probar.

## Qué es

Sitio público de **Asecon S.A.** (estudio tributario/contable/auditoría, Chile),
en **Astro 4 + Tailwind 3**, **salida estática** (sin adapter, sin SSR).
Dominio de producción previsto: `https://aseconsa.com` (DNS todavía sin cortar).
Español en la raíz, inglés bajo `/en/`.

**Hosting: preview en GitHub Pages, producción en Netlify** (ver "Despliegue hoy"). La
Fase 7 había elegido Cloudflare Pages; se cambió en la Fase 8 al descubrir que el correo
del estudio vive en la misma zona DNS que el sitio y que Cloudflare exige tener la zona
para servir el dominio raíz. Netlify lo sirve con un registro A desde el DNS actual.

## Comandos

| Qué | Comando |
|---|---|
| Instalar | `npm ci` |
| Dev | `npm run dev` → http://localhost:4321 |
| Build | `npm run build` → `dist/` |
| Revisar el build | `npm run preview` |
| **Validar** | `npm run validate` (compila y revisa `dist/`) · `npm run validate -- --no-build` |
| **Smoke test post-deploy** | `npm run smoke -- <url>` (contra un sitio ya publicado, no contra `dist/`) |
| CMS en local | `BIND_HOST=127.0.0.1 ORIGIN=http://localhost:4321 npx decap-server@3.11.3` en otra terminal + `/cms/` (nunca sin esas variables: escucha en `0.0.0.0` con CORS `*`) |

No hay framework de test instalado. La validación real es: `npm run validate` +
recorrido en navegador (Chromium aislado, nunca el Playwright MCP — ver "Puerta de validación") + `npm run smoke` post-deploy.

## Archivos que gobiernan el sitio

- `src/data/content.js` — **todo** el texto editable, en `content.es` y `content.en` con las mismas claves.
- `src/data/channels.js` — estado de cada canal de captación (WhatsApp y lead magnet; el
  agendamiento **se retiró por decisión de negocio** el 2026-09-23 — no es un pendiente, no vuelve):
  `vivo` (el dato existe) / `maqueta` (falta el dato pero `PUBLIC_PREVIEW_CHANNELS=1`) / `ausente`.
  Ningún componente pregunta una variable de entorno directamente, todos pasan por acá.
- `src/i18n/config.js` — mapa de rutas ES/EN (`routes`, `navOrder`, `legalOrder`), `getLangFromUrl()`, `path()`, `alternatePath()`.
- `src/lib/schema.ts` — builders de JSON-LD (`organizationSchema`, `websiteSchema`, `webPageSchema` + `breadcrumbSchema`, `articleSchema`).
- `src/layouts/Layout.astro` — head, canonical, hreflang, OG/Twitter, monta los bloques de `schema.ts`, `<Analytics />` y `<ConsentBanner />`.
- `src/pages/sitemap.xml.ts` — sitemap generado desde `navOrder` + las notas de Novedades (con `lastmod` real).
  **No** incluye `legalOrder`: es correcto mientras las legales lleven `noindex`; el día que se hagan
  indexables hay que sumarlas aquí **y** sacarlas de `NOINDEX` en el validador.
- `astro.config.mjs` — `site` (usa `PREVIEW_SITE_URL` si existe), redirecciones `/soluciones` → `/servicios`.
- `public/_redirects` — las mismas 301, reales en Netlify (GitHub Pages las ignora; por eso también existen como páginas estáticas vía `redirects` de Astro).
- `public/_headers` — cabeceras de seguridad + CSP (`Content-Security-Policy-Report-Only`). Solo lo lee Netlify.
- `netlify.toml` — declara el directorio de funciones. **Sin `command` a propósito**: la integración git de Netlify no se usa.
  Ojo: no declarar `command` **no impide** que el CLI compile — autodetecta Astro. Lo que protege de
  verdad es `netlify deploy --no-build` en el workflow (ya está) y "Stop builds" en el panel.
- `public/robots.txt` — bloquea `/gracias`, `/en/thank-you`, `/admin`, `/cms`, `/downloads`.
- `netlify/functions/cms-auth.mjs` + `cms-callback.mjs` — Netlify Functions (v2, `export default async (req)` + `export const config = { path }`): el proxy de OAuth con GitHub para el login de `/cms` (backend `github` de Decap), publicado en `/api/auth` y `/api/callback`.
- `src/content/posts/*.md` + `src/content/config.ts` — Novedades (6 notas hoy; `draft: true` no entra al build; campo `pair` empareja traducciones para el hreflang).

## Fronteras de confianza

1. **Formulario de contacto** → Web3Forms. `LeadForm.astro` + `src/scripts/leadForm.js` hacen `fetch`
   como mejora progresiva (así el navegador nunca sale del sitio a `api.web3forms.com`, ni rompe la
   atribución de GA4); el `<form action>` nativo se conserva como piso sin JS.
   `PUBLIC_WEB3FORMS_KEY` es **visible en el HTML por diseño**: es una clave de destinatario, no un
   secreto. Ninguna credencial privada puede vivir en un `PUBLIC_*`.
2. **`/cms`** → Decap CMS con **backend `github`** (no `git-gateway`/Netlify Identity — eso no existe
   fuera de Netlify). Cada persona entra con su propia cuenta de GitHub; el intercambio de OAuth lo
   hace este mismo sitio vía `netlify/functions/`. `publish_mode: editorial_workflow`
   se mantiene: toda nota nueva queda pendiente de revisión. Escribe directo en el repo
   (`src/content/posts/`, `public/news-media/`).
3. **`/admin`** → panel de analítica de demostración **con datos falsos** (`src/data/adminAnalytics.js`).
   **No se genera en el build salvo `PUBLIC_ENABLE_ADMIN=true`** (`src/pages/admin/[...slug].astro`,
   `getStaticPaths()` devuelve `[]` sin esa variable) — en salida estática esa es la única protección
   real posible, porque no hay forma de proteger una página ya publicada. La versión anterior (cortina
   de cliente con hash SHA-256 en un `AdminGate.astro`) se retiró por dar una sensación de seguridad que
   no existía; **no queda ningún resto de ese componente**. Si algún día se activa de verdad, la
   protección de acceso se configura en el proveedor recién en ese momento, no antes.

## Despliegue hoy

- `.github/workflows/deploy-preview.yml` publica en **GitHub Pages** en cada push a `main`,
  con `PREVIEW_SITE_URL=https://vicenteboudet-asecon.github.io` y sobrescribiendo `dist/robots.txt`
  con `Disallow: /` para que el preview **no** se indexe. No cambia con la decisión de producción.
- **Producción: Netlify.** `.github/workflows/deploy-production.yml` despliega ahí con el CLI de
  Netlify (versión exacta, no una acción de terceros), pero sigue **sin habilitarse solo**
  (`workflow_dispatch` únicamente). **El entorno `production` ya existe** en GitHub (revisores
  obligatorios, solo ramas protegidas) y **ya tiene cargados `NETLIFY_AUTH_TOKEN` y `NETLIFY_SITE_ID`**
  (comprobado el 2026-09-24): el workflow está a una aprobación de desplegar. Ninguna `PUBLIC_*` está
  definida todavía, que es lo correcto para un primer despliegue con el formulario apagado.
  El workflow tiene tres jobs: `build` (sin secretos: build + validate + artefacto), `deploy` (único
  con `environment: production`; CLI con `--no-build`) y `smoke` (contra el `deploy_url`). **Se aprueba
  el job `deploy`**, no el disparo. Las `PUBLIC_*` se leen como variables del repositorio (`vars.*`,
  ver P1). Node 22.
- **La integración git de Netlify no se usa**, y `netlify.toml` no declara `command` justamente para
  eso: el despliegue tiene que pasar por el workflow, donde `npm run validate` corre contra el `dist/`
  ya armado. Dos vías de despliegue significan una que se salta la puerta.
- **El dominio no está vacío**: `aseconsa.com` sirve hoy un WordPress vivo, y el correo del estudio es
  Microsoft 365 **en la misma zona DNS**, con un SPF que incluye la IP del WordPress. Por eso la zona
  **no se mueve**: se cambian solo los registros del sitio. Ningún registro de correo se toca, nunca.
- **Zona DNS real (comprobada en vivo el 2026-09-24, SOA `2026092001`)**:
  - Apex: A `138.186.10.80` **y AAAA `2803:8240:310:16::2`** (este último no estaba en el plan). En el
    corte hay que cambiar el A a `75.2.60.5` **y borrar el AAAA en el mismo cambio**; si no, IPv6 sigue
    llegando al WordPress y Let's Encrypt no emite el certificado. El rollback recrea el AAAA.
  - `www`: CNAME al apex (el WordPress lo redirige con 301). Pasa a CNAME a `<sitio>.netlify.app`.
  - **No se tocan**: MX, TXT `MS=`, SPF, `_dmarc`, `selector1/selector2._domainkey`, `autodiscover`,
    `mail`, y los subdominios de cPanel (`webmail`, `cpanel`, `whm`, `ftp`, `webdisk`, `cpcalendars`,
    `cpcontacts`).
  - `ns1`/`ns2.urano.denial.cl` viven **en el mismo servidor que el WordPress**: dar de baja ese
    hosting podría llevarse la zona y el correo. Preguntarlo a denial antes de apagar nada.
- **Lo que falta y depende de cuentas reales, no de código**: el **acceso a la zona DNS** (bloquea el
  corte), y registrar la GitHub OAuth App del CMS (`Authorization callback URL` =
  `https://aseconsa.com/api/callback`) — S1–S3 ya corregidos; faltan S8 y S9 antes de activar.
- Netlify sí puede servir cabeceras HTTP propias (`public/_headers`), 301 reales (`public/_redirects`)
  y funciones de servidor (`netlify/functions/`) — GitHub Pages no puede ninguna de las tres. Por eso
  el preview se queda en GitHub Pages (no necesita ninguna) y la producción no.

## Reglas duras (valen para los cinco agentes)

- **Nunca** imprimir, inventar, pedir o comitear secretos. Referirse a ellos por nombre.
- **Nada irreversible sin confirmación explícita del usuario**: publicar en el dominio real,
  tocar DNS, rotar credenciales, abrir registro público del CMS, borrar ramas o despliegues,
  pasar la CSP de Report-Only a bloqueante.
- **Paridad ES/EN** en rutas, textos, metadatos, JSON-LD y estados de UI. Si cambias una rama, cambia la otra.
- **Nunca escribir un enlace a mano**: usar `path('clave', lang)`.
- Mantener correctos canonical, hreflang, sitemap, redirecciones y filtrado de borradores.
- Reusar componentes, tokens y patrones existentes antes de crear abstracciones nuevas.
- No agregar dependencias ni hidratación de cliente sin justificar por qué no alcanza HTML estático.
- No afirmar que algo está validado si no se ejecutó la comprobación. Decir qué quedó sin probar.

## Puerta de validación (antes de decir "listo")

```bash
npm run validate                 # compila y valida el artefacto; sale con 1 si hay fallas
npm run validate -- --no-build   # valida el dist/ que ya existe
```

`scripts/validate.mjs` (lo mantiene `asecon-qa`) tiene 21 secciones y revisa sobre `dist/`, que es lo
que se publica — el detalle completo está en el README (sección "Validar el sitio antes de publicar");
en resumen: páginas/rutas/legales presentes en los dos idiomas · borradores fuera del build ·
canonical/hreflang/sitemap/redirecciones correctos · enlaces e imágenes que existen de verdad ·
paridad `content.es`/`content.en` · sin credenciales ni URLs de desarrollo filtradas · Web3Forms nunca
con `access_key` vacío · todo formulario de leads pide consentimiento · sin `PUBLIC_GA4_ID` no se carga
`googletagmanager.com` · Netlify Identity ya no se carga en ninguna parte · fuentes autoalojadas ·
`dist/_headers` existe y la CSP sigue en Report-Only · ninguna página afirma una dotación mientras
`company.headcount` esté vacío · ningún `<script>` clásico con `import` sin procesar · ningún formulario
inactivo con un botón que lo envíe · nada del agendamiento retirado · (avisos) enlaces sin barra final y
`hidden` pisado por una clase de display.

Distingue **fallas** (código de salida 1, bloquean) de **avisos** (no bloquean). Hoy corre **en 0
fallas y 1 aviso** (enlaces sin barra final, B5) en las cuatro combinaciones. Las secciones 17–21 se
agregaron el 2026-09-25 porque el 0/0 anterior escondía defectos reales: se probó que fallan con el
defecto presente y pasan con él arreglado. Con `PREVIEW_SITE_URL` definida valida contra la URL de preview.

El smoke (`scripts/smoke.mjs`) admite `SMOKE_CANONICAL_ORIGIN` (pide las páginas a la URL dada y espera
canonical/hreflang/sitemap en ese origen: así se prueba `*.netlify.app` antes del corte) y
`SMOKE_NETLIFY=1` (exige cabeceras de `_headers`, CSP Report-Only, CSP de `/cms/` y 301 reales; sin
ella esas comprobaciones quedan en `[n/a]`). El workflow de producción define las dos.

**No usar el Playwright MCP.** En este equipo está conectado al **Chrome personal del usuario**, con
sus pestañas abiertas (comprobado el 2026-09-25), y además es compartido entre agentes (el 2026-09-24
aparecieron globals y listeners ajenos). Todo recorrido en navegador se hace en un **Chromium aislado**
(`playwright-core` + chromium de la caché de `npx playwright`, perfil nuevo, headless), cada agente con
su propio puerto de `astro preview`. Si algún día el MCP se reconfigura a un navegador propio, se
corrige esta línea.

Además, según lo que se tocó (esto el script no lo ve):
- **UI**: recorrido a 360 / 768 / 1280 px, teclado y foco visible, `alt` con sentido, contraste, `prefers-reduced-motion`, consola sin errores.
- **Formulario**: envío real de prueba (con y sin JS), redirección a `/gracias` (o `/en/thank-you`), mensajes de error y éxito.
- **SEO/i18n**: cada página con canonical propio, par `hreflang` correcto y `noindex` donde corresponde.
- **Post-deploy**: `npm run smoke -- <url>` sobre la URL ya publicada.

## Deuda conocida (no la "arregles" en silencio)

- `/tecnologia` y `/en/technology` son **BORRADOR**: los seis puntos no están verificados con el
  estudio. Fuera de `navOrder`/sitemap y con `noindex` a propósito; no puede salir del todo sin que
  alguien de Asecon revise cada afirmación.
- Las 8 imágenes de `public/services/` son ilustraciones generadas, no fotos.
- Las 6 notas de Novedades y sus portadas de partida son provisorias (ver la nota al final de
  "Novedades: editor para el equipo" en el README) — conviene que el estudio las revise antes de
  darlas por definitivas.
- `/admin` no tiene analítica real conectada (datos de ejemplo, `src/data/adminAnalytics.js`) y **no
  se genera en el build** salvo que se pida a propósito (ver "Fronteras de confianza" arriba).
- La capa legal (`/aviso-legal`, `/privacidad`, etc.) tiene el RUT y la identidad del responsable del
  tratamiento marcados como "se confirma al cierre del proyecto" — decisión explícita del usuario, no
  un olvido.

## Defectos abiertos (revisión del 2026-09-24, puesta al día el 2026-09-25)

Verificados contra el código o en vivo. Se cierran en el orden de la columna "Antes de"; al cerrar
uno, se borra de aquí en el mismo commit. **Cerrados el 2026-09-25** (y por eso ya no figuran): D1–D6
(workflows), Q1–Q4 (banner de consentimiento, Enter en el formulario inactivo, legales sin
agendamiento, botón de pausa), B1 (navegación al mismo origen), S1, S2, S4, S7 (login del CMS,
scope `public_repo`, escape del JSON-LD, revocación del consentimiento — revisado y aprobado por
security con prueba de punta a punta y un opener ajeno), S3 (Decap 3.16.3, que sanea la vista previa
con DOMPurify desde 3.13; SRI recalculado), S6 (HSTS `max-age=86400` sin `includeSubDomains`), y del grupo M: footer a
768 px, `tel:`, `aria-label` de los `<nav>`, espacio en "privacidad .", `pair` en el README,
`.env.example` sin Cloudflare.

| # | Antes de | Defecto | Dónde | Dueño |
|---|---|---|---|---|
| S5 | ventana de CSP | **Decisión pendiente del usuario**: la CSP Report-Only no tiene `report-uri`, así que la revisión de 7 días no puede empezar. Propuesta de security: función propia `/api/csp-report` (POST, ≤16 KB, sin IP, agregado en Netlify Blobs, rate limit; $0 en el plan). Alternativas: solo logs de función; servicio externo (nuevo encargado de datos → política/abogado). Los orígenes de GA4 y de `/cms` ya están completos | `public/_headers` | security + backend |
| S9 | activar CMS | Decap 3.16.3 carga 94 trozos desde unpkg **sin SRI** (solo el archivo principal lo tiene). Mitigado con `script-src https://unpkg.com/decap-cms@3.16.3/dist/`, que solo protege cuando la CSP sea bloqueante. Arreglo de fondo: autoalojar Decap en `/cms/` (decisión: suma ~6 MB al repo) | `public/cms/index.html`, `public/_headers` | security |
| S10 | 1er despliegue | Comprobar en Netlify que `/` y `/cms/` reciben **una sola** CSP y **un solo** `Strict-Transport-Security` (Netlify inyecta su propio HSTS de 1 año en dominios propios; hay que ver que el nuestro lo reemplace) — `curl -sI` en `*.netlify.app` y otra vez en el dominio | Netlify | deploy + security |
| S8 | activar CMS | El login solo se completa si `/cms` se abre desde `https://aseconsa.com` (el `base_url`) y `www` redirige al apex; el chequeo `message.source === window.opener` solo se probó en simulación → confirmarlo en el primer login real | `cms-callback.mjs`, `cms/config.yml` | security + deploy |
| B2 | cierre legal | `company.rut`, `dataController`, `retentionMonths` no los lee nadie: el texto legal tiene `[PENDIENTE]` a mano. Interpolar o corregir el comentario | `content.js:52-59` | backend |
| B3 | activar GA4 | `generate_lead` de respaldo se dispara en cualquier visita a `/gracias` sin marca de sesión | `gracias.astro:89-102`, `en/thank-you.astro` | backend |
| B4 | activar Turnstile | Falta `turnstile.reset()` tras un error; Cloudflare no figura en la política; el script se carga en todas las páginas | `leadForm.js`, `Layout.astro` | backend |
| B5 | — | Enlaces internos sin barra final → un 301 extra por clic (aviso de la sección 20 del validador, el único aviso que queda). La raíz es `path()`/`routes` en `src/i18n/config.js`, el `redirect` del formulario y las páginas de `redirects` de `astro.config.mjs` | `src/i18n/config.js`, `LeadForm.astro`, `astro.config.mjs` | backend |
| U1 | — | **Decisión pendiente del usuario**: a 360 px en ES el eyebrow del hero queda recortado (el `.wrap` mide ~741 px en una sección fija de 560 con `overflow-hidden`). Arreglarlo (`min-h` en vez de altura fija) cambia también la altura del hero en escritorio | `Hero.astro` | ux |
| U2 | — | **Decisión de marca pendiente**: contraste AA. Propuesta de ux: token `brass.dark` #9C7635 → **#80602C** (5,17:1 sobre papel) y botón ES/EN `text-ink/60` → `text-ink/70` | `tailwind.config.mjs`, `Header.astro:58` | ux |
| P1 | — | **Decisión pendiente del usuario**: las `PUBLIC_*` pasaron a leerse como **variables del repositorio** (`vars.*`), porque el job `build` va sin entorno y no ve los secrets de `production`. Si alguien las carga como secret del entorno, llegan vacías (el resumen del run lo muestra) | `deploy-production.yml` | deploy + security |
| U3 | — | Footer en inglés dice "REGISTRO CMF Nº 418" (texto fijo en español); el resto de `/en/` dice "CMF Registry No. 418" | `Footer.astro:31` | ux |
| U4 | — | Botón de pausa: combina `aria-pressed` con un `aria-label` que cambia ("Pausar video" + pressed=true se anuncia como pausado). WAI-ARIA: etiqueta fija en un toggle | `Hero.astro:46,132,138` | ux |
| B6 | — | El `mailto:` de emergencia tras un envío fallido codifica espacios como `+` (`URLSearchParams`); los clientes de correo muestran el `+` literal. Usar `encodeURIComponent` | `leadForm.js:27` | backend |
| M | — | Menores: 404 única en español también para `/en/*` (Netlify permite `/en/*  /en/404.html  404`); selector de idioma en notas va a la portada y no al par; borrador del form en `localStorage` sin vencimiento; claves huérfanas en `content.js`; `LeadForm.astro` usa `accessKey.length > 0` en vez de `channels.form.ready`; README no lista el campo "Par en el otro idioma" entre los del editor; comentario de `validate.mjs:32-35` inexacto cuando el valor viene de `.env` | varios | ux / backend / qa |

**Dependencias:** Astro 4.16.19 tiene 18 avisos (1 crítico) que **no aplican** a esta salida estática
sin `astro:assets` (auditado el 2026-09-24); no hay parche en 4.x y el arreglo es migrar a Astro 7 →
**después del lanzamiento**. Regla mientras tanto: no usar `astro:assets` sobre imágenes del CMS. Vite
afecta solo a `npm run dev` en Windows (no usar `--host`). Dependabot: mergear #1–#4 (Actions) antes
del primer despliegue; **no** mergear #6–#8 (Astro 7, Tailwind 4) antes del lanzamiento — fallan en CI.

## Quién manda en qué

| Zona | Dueño |
|---|---|
| Páginas, componentes, Tailwind, accesibilidad, responsive, contenido de `content.js` | `asecon-ux` |
| Web3Forms, Decap CMS, colecciones de contenido, i18n/rutas, sitemap, datos del panel, cualquier integración | `asecon-backend` |
| Workflow de Actions, hosting, dominio, variables de entorno, preview vs producción, rollback | `asecon-deploy` |
| Secretos, cabeceras, superficies expuestas (`/admin`, `/cms`), dependencias, indexación, privacidad | `asecon-security` |
| Verificación independiente, `scripts/validate.mjs`, pruebas en navegador, informes de defectos, smoke test | `asecon-qa` |
| Descomponer el trabajo, orden de fases, integrar y cerrar la puerta de validación | `asecon-orquestador` |

Solapes: el dueño de la zona decide; los demás reportan el hallazgo y no lo parchean solos.
`asecon-qa` nunca arregla el producto: informa y enruta, y por eso su informe vale.

## Pendientes de negocio (no son defectos de código)

Lista completa en el plan (`orquestador-necesito-que-hagamos-greedy-harbor.md`, sección
"Pendientes de negocio"). Los más bloqueantes hoy: RUT y responsable del tratamiento (diferidos a
propósito al cierre del proyecto) y el visto bueno del abogado sobre la política (hoy dice de sí misma
que es borrador; falta Netlify, Microsoft 365, la retención de Web3Forms y la Ley 21.719, que rige desde
el 2026-12-01), revisión de `/tecnologia`, número de WhatsApp y quién contesta, contenido del lead
magnet revisado por el estudio, apellido/foto de Fernanda y el cargo de Jeanette ("Director"), la
dotación real, GitHub OAuth App + variables en Netlify para `/cms`, y **el acceso a la zona
DNS de `aseconsa.com` en denial.cl** — que hoy es lo que frena el despliegue a producción.
