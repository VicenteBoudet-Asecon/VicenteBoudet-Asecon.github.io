# Contexto compartido — sitio Asecon (brief de los agentes)

Todos los agentes de `.claude/agents/` leen este archivo antes de tocar nada.
Si algo de aquí ya no es cierto, corrígelo aquí (no lo dupliques en cada agente).

Última puesta al día: cierre de la Fase 7 del plan (`C:\Users\nt8as\.claude\plans\
orquestador-necesito-que-hagamos-greedy-harbor.md`) — hosting de producción ya decidido.

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
- `src/data/channels.js` — estado de cada canal de captación (WhatsApp, agendamiento, lead magnet):
  `vivo` (el dato existe) / `maqueta` (falta el dato pero `PUBLIC_PREVIEW_CHANNELS=1`) / `ausente`.
  Ningún componente pregunta una variable de entorno directamente, todos pasan por acá.
- `src/i18n/config.js` — mapa de rutas ES/EN (`routes`, `navOrder`, `legalOrder`), `getLangFromUrl()`, `path()`, `alternatePath()`.
- `src/lib/schema.ts` — builders de JSON-LD (`organizationSchema`, `websiteSchema`, `webPageSchema` + `breadcrumbSchema`, `articleSchema`).
- `src/layouts/Layout.astro` — head, canonical, hreflang, OG/Twitter, monta los bloques de `schema.ts`, `<Analytics />` y `<ConsentBanner />`.
- `src/pages/sitemap.xml.ts` — sitemap generado desde `navOrder` + `legalOrder` + las notas de Novedades (con `lastmod` real).
- `astro.config.mjs` — `site` (usa `PREVIEW_SITE_URL` si existe), redirecciones `/soluciones` → `/servicios`.
- `public/_redirects` — las mismas 301, reales en Netlify (GitHub Pages las ignora; por eso también existen como páginas estáticas vía `redirects` de Astro).
- `public/_headers` — cabeceras de seguridad + CSP (`Content-Security-Policy-Report-Only`). Solo lo lee Netlify.
- `netlify.toml` — declara el directorio de funciones. **Sin `command` a propósito**: la integración git de Netlify no se usa.
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
  (`workflow_dispatch` únicamente, entorno `production` con revisores). Necesita como secrets de ese
  entorno `NETLIFY_AUTH_TOKEN` y `NETLIFY_SITE_ID` — no existen todavía.
- **La integración git de Netlify no se usa**, y `netlify.toml` no declara `command` justamente para
  eso: el despliegue tiene que pasar por el workflow, donde `npm run validate` corre contra el `dist/`
  ya armado. Dos vías de despliegue significan una que se salta la puerta.
- **El dominio no está vacío**: `aseconsa.com` sirve hoy un WordPress vivo, y el correo del estudio es
  Microsoft 365 **en la misma zona DNS**, con un SPF que incluye la IP del WordPress. Por eso la zona
  **no se mueve**: se cambia solo el registro A del apex (a `75.2.60.5`) y el CNAME de `www`. Ningún
  registro de correo se toca, nunca.
- **Lo que falta y depende de cuentas reales, no de código**: crear el sitio en Netlify, pedir a denial
  el cambio de los registros del sitio, y registrar la GitHub OAuth App del CMS
  (`Authorization callback URL` = `https://aseconsa.com/api/callback`) cargando sus credenciales como
  variables de entorno del sitio en Netlify.
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

`scripts/validate.mjs` (lo mantiene `asecon-qa`) tiene 15 secciones y revisa sobre `dist/`, que es lo
que se publica — el detalle completo está en el README (sección "Validar el sitio antes de publicar");
en resumen: páginas/rutas/legales presentes en los dos idiomas · borradores fuera del build ·
canonical/hreflang/sitemap/redirecciones correctos · enlaces e imágenes que existen de verdad ·
paridad `content.es`/`content.en` · sin credenciales ni URLs de desarrollo filtradas · Web3Forms nunca
con `access_key` vacío · todo formulario de leads pide consentimiento · sin `PUBLIC_GA4_ID` no se carga
`googletagmanager.com` · Netlify Identity ya no se carga en ninguna parte · fuentes autoalojadas ·
`dist/_headers` existe y la CSP sigue en Report-Only.

Distingue **fallas** (código de salida 1, bloquean) de **avisos** (no bloquean). Hoy corre **en 0
fallas y 0 avisos**. Con `PREVIEW_SITE_URL` definida valida contra la URL de preview.

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
propósito al cierre del proyecto), número de WhatsApp y quién contesta, cuenta de agendamiento,
contenido del lead magnet revisado por el estudio, apellido/foto de Fernanda, confirmar 50 vs. 28
profesionales, GitHub OAuth App + variables de entorno en Netlify para `/cms`, y el acceso a la
zona DNS de `aseconsa.com` en denial.cl (el Microsoft 365 lo administra el propio usuario).
