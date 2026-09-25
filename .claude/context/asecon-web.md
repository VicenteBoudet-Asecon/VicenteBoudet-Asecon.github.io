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
| CMS en local | `npx decap-server` en otra terminal + `/cms/` |

No hay framework de test instalado. La validación real es: `npm run validate` +
recorrido en navegador (Playwright MCP) + `npm run smoke` post-deploy.

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
  verdad es `netlify deploy --no-build` en el workflow (hoy falta, ver D1) y "Stop builds" en el panel.
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
  **No dispararlo antes de corregir D1** (sin `--no-build` publica un build distinto del validado).
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
  `https://aseconsa.com/api/callback`) — **solo después de corregir S1**.
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

`scripts/validate.mjs` (lo mantiene `asecon-qa`) tiene 16 secciones y revisa sobre `dist/`, que es lo
que se publica — el detalle completo está en el README (sección "Validar el sitio antes de publicar");
en resumen: páginas/rutas/legales presentes en los dos idiomas · borradores fuera del build ·
canonical/hreflang/sitemap/redirecciones correctos · enlaces e imágenes que existen de verdad ·
paridad `content.es`/`content.en` · sin credenciales ni URLs de desarrollo filtradas · Web3Forms nunca
con `access_key` vacío · todo formulario de leads pide consentimiento · sin `PUBLIC_GA4_ID` no se carga
`googletagmanager.com` · Netlify Identity ya no se carga en ninguna parte · fuentes autoalojadas ·
`dist/_headers` existe y la CSP sigue en Report-Only · ninguna página afirma una dotación mientras
`company.headcount` esté vacío.

Distingue **fallas** (código de salida 1, bloquean) de **avisos** (no bloquean). Hoy corre **en 0
fallas y 0 avisos** en las cuatro combinaciones — **pero ese verde esconde defectos reales** (Q1, Q2):
el validador no ve scripts sin procesar ni botones `submit` en formularios inactivos. Con
`PREVIEW_SITE_URL` definida valida contra la URL de preview.

**Playwright MCP es un navegador compartido**: si dos agentes lo usan a la vez se contaminan (en la
revisión del 2026-09-24 aparecieron globals y listeners ajenos). En trabajo en paralelo, un solo agente
usa el MCP; los demás usan un Chromium aislado (`npx playwright`) o se serializan.

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

## Defectos abiertos (revisión del 2026-09-24)

Verificados contra el código o en vivo. Se cierran en el orden de la columna "Antes de"; al cerrar
uno, se borra de aquí en el mismo commit.

| # | Antes de | Defecto | Dónde | Dueño |
|---|---|---|---|---|
| D1 | 1er despliegue | `netlify deploy` sin `--no-build`: el CLI recompila tras el validate y sin las `PUBLIC_*` | `deploy-production.yml:92` | deploy |
| D2 | 1er despliegue | Node 20 (EOL) en los tres workflows; `netlify-cli@27.8.1` pide ≥22.13 | `ci.yml`, `deploy-*.yml` | deploy |
| D3 | 1er despliegue | El smoke contra `*.netlify.app` falla por construcción (URL absoluta del sitemap concatenada); falta un origen canónico separado (`SMOKE_CANONICAL_ORIGIN`) | `smoke.mjs:64,74`, `deploy-production.yml:132-137` | qa + deploy |
| D4 | 1er despliegue | Se toma `.url` (dominio principal) y no `.deploy_url`; tras agregar el dominio, el smoke apuntaría al WordPress. Quitar el fallback a `https://aseconsa.com` | `deploy-production.yml:98,137` | deploy |
| D5 | activar GA4 | El paso validate no recibe las `PUBLIC_*`: las variables van a nivel de job | `deploy-production.yml:57-69` | deploy |
| D6 | — | Permisos `pages`/`id-token` globales en el preview; `needs.*` interpolado en `run:`; build y deploy con secretos en el mismo job | `deploy-preview.yml:8-11`, `deploy-production.yml` | deploy |
| S1 | cargar OAuth App | **El callback entrega el token de GitHub a cualquier origen** (`message.origin` sin validar, primer aviso con `'*'`) | `cms-callback.mjs:59-68` | backend + security |
| S2 | activar CMS | Scope `repo` (todos los repos privados del editor); el repo es público → `public_repo` + `auth_scope` en `config.yml` | `cms-auth.mjs:36`, `cms/config.yml` | security |
| S3 | activar CMS | Decap 3.1.6 afectado por GHSA-xp8g-32qh-mv28 (XSS en la vista previa); subir a la última 3.x y recalcular SRI | `public/cms/index.html:20-24` | security |
| S4 | activar CMS | JSON-LD con `set:html={JSON.stringify(...)}` sin escapar `<`: un título con `</script>` es XSS guardado | `NewsPost.astro:36`, `Layout.astro:166`, `FAQ.astro:50` | backend |
| S5 | ventana de CSP | La CSP Report-Only no tiene `report-uri`/`report-to`: no hay de dónde leer violaciones. Faltan orígenes de GA4 en `img-src`/`connect-src` y `avatars.githubusercontent.com` en `/cms` | `public/_headers` | security |
| S6 | corte DNS | HSTS con `includeSubDomains` alcanza a los subdominios de cPanel; empezar con `max-age` corto y confirmar contra la zona | `public/_headers:21` | security |
| S7 | activar GA4 | "Rechazar" tras aceptar no manda `consent update: denied` ni borra `_ga` | `consent.js:60-63` | backend |
| Q1 | activar GA4 | **El `<script>` de `ConsentBanner` está dentro de `{show && …}` y sale sin procesar**: error de consola en cada página del preview, banner muerto, GA4 nunca se cargaría | `ConsentBanner.astro:46` | backend |
| Q2 | activar form | Enter envía el formulario inactivo: el botón oculto "Reintentar" es `type="submit"` y la guarda `if (!form.action)` nunca actúa (usar `getAttribute`). Sin JS manda los datos en la URL (GET) | `LeadForm.astro:250`, `leadForm.js:40` | backend |
| Q3 | firma del abogado | Cookies y Términos siguen nombrando un "proveedor de agendamiento" | `content.js:664,736,1382,1454` | ux |
| Q4 | — | El botón de pausa del video queda tapado por `.wrap` a 1280 px (WCAG 2.2.2); en móvil se ve un botón de pausa sin video (`flex` pisa `hidden`) | `Hero.astro:36-53` | ux |
| B1 | probar form en netlify.app | Tras un envío con JS se navega al `redirect` absoluto (`aseconsa.com/gracias` = WordPress hoy). Navegar a `pathname` del mismo origen | `leadForm.js:87` | backend |
| B2 | cierre legal | `company.rut`, `dataController`, `retentionMonths` no los lee nadie: el texto legal tiene `[PENDIENTE]` a mano. Interpolar o corregir el comentario | `content.js:52-59` | backend |
| B3 | activar GA4 | `generate_lead` de respaldo se dispara en cualquier visita a `/gracias` sin marca de sesión | `gracias.astro:89-102`, `en/thank-you.astro` | backend |
| B4 | activar Turnstile | Falta `turnstile.reset()` tras un error; Cloudflare no figura en la política; el script se carga en todas las páginas | `leadForm.js:88-106`, `Layout.astro:168` | backend |
| M | — | Menores: selector de idioma en notas va a la portada y no al par; footer se solapa a 768 px; contraste de `text-brass-dark` 3,7:1 en texto chico; teléfonos del footer sin `tel:`; `<nav>` del footer sin `aria-label`; espacio en "privacidad ."; enlaces sin barra final (301 extra); borrador del form en `localStorage` sin vencimiento; claves huérfanas en `content.js`; README sin `pair` en el frontmatter y sin la sección 16; `.env.example` con restos de Cloudflare | varios | ux / backend / qa |

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
dotación real, GitHub OAuth App + variables en Netlify para `/cms` (tras S1), y **el acceso a la zona
DNS de `aseconsa.com` en denial.cl** — que hoy es lo que frena el despliegue a producción.
