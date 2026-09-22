# Asecon S.A. — Sitio en Astro

Rediseño del sitio de Asecon S.A. — Estudio Tributario Contable Auditorías — construido en **Astro + Tailwind CSS**, manteniendo
todo el contenido original (servicios, equipo, testimonios, contacto) con una identidad visual
propia inspirada en el "Sello Asecon" — su garantía siempre vigente — y la estética de un libro
contable.

## Requisitos

- Node.js 18 o superior

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321).

## Compilar para producción

```bash
npm run build
npm run preview   # para revisar el resultado compilado
```

El sitio estático queda en `dist/`, listo para subir a cualquier hosting estático (Netlify,
Vercel, Cloudflare Pages, GitHub Pages, etc.).

## Formulario de contacto (Web3Forms)

El formulario en `src/components/Contact.astro` usa [Web3Forms](https://web3forms.com/), un
servicio gratuito que envía los mensajes del formulario directo a tu correo sin necesidad de
backend propio. Es un formulario HTML nativo (sin JavaScript): el navegador envía los datos
directo a Web3Forms y luego redirige al visitante a la página `/gracias` del sitio.

La clave **ya no va escrita en el código**: se lee desde una variable de entorno, así no queda
expuesta en el repositorio.

Pasos para activarlo:

1. Entra a https://web3forms.com/ e ingresa el correo donde quieres recibir los mensajes
   (por ejemplo `info@aseconsa.com`).
2. Te llegará un **Access Key**.
3. Copia el archivo `.env.example` como `.env` y pega la clave:

   ```
   PUBLIC_WEB3FORMS_KEY=tu-clave-aqui
   ```

4. Reinicia `npm run dev`.

Mientras la variable esté vacía, en modo desarrollo aparece un aviso dentro del formulario
recordándote que falta configurarla (ese aviso **no** se muestra en producción).

> El archivo `.env` está en `.gitignore`. Si publicas en Netlify, Vercel o Cloudflare Pages,
> define ahí la misma variable `PUBLIC_WEB3FORMS_KEY` en el panel de variables de entorno.

## SEO y metadatos

`src/layouts/Layout.astro` genera automáticamente para cada página:

- `<title>` y `<meta name="description">`
- `<link rel="canonical">` con la URL definitiva
- Open Graph y Twitter Card completos, con la imagen para compartir `public/og-image.png`
  (1200×630, generada con la identidad de la marca)
- Datos estructurados JSON-LD de tipo `AccountingService` con dirección, teléfonos, correo,
  año de fundación, registro y las 8 áreas de práctica — esto es lo que Google usa para las
  fichas de negocio local
- `<meta name="theme-color">` y enlaces `preconnect` a Google Fonts (las fuentes ya no se
  cargan con un `@import` bloqueante dentro del CSS)

El mapa del sitio se genera solo en el build desde `src/pages/sitemap.xml.ts`, leyendo el menú
de `src/data/content.js`: al agregar una página nueva al menú, entra sola al sitemap. El
archivo `public/robots.txt` apunta a él.

La página `/gracias` (destino del formulario) va marcada como `noindex`.

## Fotos del equipo

✅ **Listas.** Las 28 fotos están en `public/team/`, recortadas a 600×600 y optimizadas
(1,3 MB en total). Se descargaron desde aseconsa.com el 3 de septiembre de 2026.

Se muestran a color (antes iban en blanco y negro con color al pasar el mouse; se sacó ese
efecto tanto acá como en la franja de oficina de la portada, a pedido del estudio).

**Para agregar una persona:** súmala al array `team` en `src/data/content.js` con su cargo
como clave (y la traducción del cargo en `roles`, en los dos idiomas), y deja su foto en
`public/team/` con el nombre que indique el campo `img`. Mientras la foto no exista, se
muestra el monograma con sus iniciales — no queda una imagen rota.

> El equipo pasó de 33 a 28 personas: Estrella Ocaranza, Karen Muñoz, Geraldine Madriaza,
> Eufemia del Valle y Nathan Diaz ya no aparecen en aseconsa.com y se quitaron del sitio
> nuevo. La dotación se actualizó en la franja de respaldo, la página de equipo, la nota de
> los 30 años y los datos estructurados.

## Imágenes del sitio

Ya no falta ninguna: el sitio no tiene rutas de imagen rotas.

| Zona | Archivo | Origen |
|---|---|---|
| Portada | `public/hero/hero-video.mp4` + `hero-main.jpg` | Máster 4K del cliente, recortado a 15 s y 1080p |
| Sello Asecon | `public/sello/inmueble-asecon.jpg` | Foto propia, tomada de aseconsa.com |
| Equipo | `public/team/*.jpg` (28) | Retratos propios, tomados de aseconsa.com |
| Conoce Asecon | `public/office/conoce-asecon.jpg` + `-movil.jpg` | Foto del slider de aseconsa.com, ya licenciada por el estudio |
| Servicios | `public/services/*.jpg` (8) | **Generadas**, con la paleta y el vocabulario de Asecon |
| Marca | `public/brand/*.svg`, `favicon.svg`, `og-image.png` | Logotipo oficial del cliente |

### Las dos que conviene reemplazar algún día

**Las 8 de servicios son ilustraciones, no fotos.** No se encontró banco de imágenes
utilizable: Pexels y Unsplash bloquean la descarga automática, y en los repositorios de
licencia abierta no hay material contable decente. Se generaron con la identidad de Asecon
(libro mayor, Formulario 29, timbre del SII, flujo de caja, diagrama societario, timbre
consular). Funcionan, pero una foto real del estudio siempre va a rendir más.

**La franja "Conoce Asecon" usa la única foto de personas que existe.** Es la del slider del
sitio actual. Por eso la franja se rediseñó a una sola imagen a lo ancho en vez de cuatro
celdas: repetir la misma foto cuatro veces se habría notado.

Cuando hagan una sesión de fotos, conviene cubrir: el equipo trabajando (reuniones, revisión
de documentos, la sala), y detalles del oficio (carpetas, pantallas con planillas) para
reemplazar las ocho ilustraciones. Basta con dejar los archivos con el mismo nombre; no hay
que tocar código. La dirección fotográfica está en el documento de dirección visual.

## Páginas del sitio

El sitio existe completo en español e inglés. El español vive en la raíz; el inglés bajo
`/en/` con slugs propios, que posicionan mejor que traducir la URL española.

| Página | Español | Inglés |
|---|---|---|
| Inicio | `/` | `/en` |
| Servicios | `/servicios` | `/en/services` |
| Clientes | `/clientes` | `/en/clients` |
| Sello Asecon | `/sello-asecon` | `/en/asecon-seal` |
| Tecnología | `/tecnologia` | `/en/technology` |
| Nuestro Equipo | `/equipo` | `/en/team` |
| Novedades | `/novedades` | `/en/insights` |
| Gracias (no indexada) | `/gracias` | `/en/thank-you` |
| Contacto | `/contacto` | `/en/contact` |

> La página de Servicios se llamó "Soluciones" (`/soluciones` / `/en/solutions`) hasta
> septiembre de 2026. Esas URLs redirigen a las nuevas (ver `redirects` en
> `astro.config.mjs` y `public/_redirects`) para no perder el posicionamiento ya
> indexado en Google.

## Tecnología (`/tecnologia`): contenido por confirmar

La página de Tecnología (`src/components/Technology.astro`, contenido en
`content.js` bajo la clave `technology`) es un **borrador**. Los seis puntos que
describe (portal de clientes, automatización de procesos, integración con el
SII y bancos, reportería en tiempo real, firma electrónica, seguridad de la
información) son prácticas habituales en estudios que incorporan tecnología a
su operación — no son afirmaciones verificadas sobre lo que Asecon usa hoy.

Antes de que esta página salga en el dominio real, alguien del estudio tiene
que revisar cada punto y ajustarlo a lo que efectivamente hacen (o sacar los
que no aplican). El código lo marca con un comentario `BORRADOR` justo arriba
del objeto `technology` en `src/data/content.js`.

## Novedades: editor para el equipo

Para que alguien del equipo pueda agregar una novedad **sin tocar código ni Markdown**, el
sitio incluye un editor de contenido en `/cms` ([Decap CMS](https://decapcms.org/)). Es un
formulario con los mismos campos que un post (título, resumen, fecha, idioma, categoría,
foto de portada, cuerpo) que guarda directo en el repositorio — y permite adjuntar fotos
arrastrándolas o subiéndolas desde el computador, tanto como portada de la nota como dentro
del cuerpo.

**Cada nota nueva queda pendiente de revisión.** Nadie la publica sin querer: dentro del
editor, la nota pasa por los estados *borrador → en revisión → lista*, y alguien con acceso
tiene que apretar "Publicar" para que salga en el sitio. Cualquier persona con acceso de
escritura al repositorio de GitHub puede tanto escribir como aprobar — si más adelante
quieren que solo ciertas personas puedan aprobar, se resuelve con permisos de GitHub
(colaborador vs. mantenedor), no con algo propio del editor.

### Probarlo en el computador (sin configurar nada más)

1. En una terminal aparte, corre `npx decap-server` (queda escuchando, no cierres esa
   terminal).
2. Con `npm run dev` corriendo en la otra terminal, entra a `http://localhost:4321/cms/`
   (con la barra `/` al final; en el navegador de desarrollo puede dar 404 sin ella — en
   producción no pasa) y aprieta "Login". Vas a ver las notas que ya existen y vas a poder
   crear, editar y adjuntar fotos: todo se guarda de verdad en `src/content/posts/` y
   `public/news-media/`.

### Dejarlo andando para el equipo de verdad (Cloudflare Pages)

El editor usa el backend `github` de Decap (`public/cms/config.yml`): cada persona inicia
sesión con su propia cuenta de GitHub y escribe con sus propios permisos del repositorio —
nada de contraseñas nuevas ni de un servicio aparte para esto. Lo único que hace falta es un
proveedor de OAuth frente a GitHub, y ese proveedor es el propio proyecto de Cloudflare Pages
(`functions/api/auth.js` + `callback.js`, ya en el repo, inertes hasta que se configuren estas
dos cosas):

1. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App.**
   - Homepage URL: `https://aseconsa.com`
   - Authorization callback URL: `https://aseconsa.com/api/callback`
     (un OAuth App clásico solo admite una URL de callback — por eso esto solo puede
     probarse de verdad desde el dominio final, no desde una URL `*.pages.dev`).
2. Copia el **Client ID** y genera un **Client secret**.
3. En el proyecto de Cloudflare Pages: **Settings → Environment variables**, agrega
   `GITHUB_OAUTH_CLIENT_ID` y `GITHUB_OAUTH_CLIENT_SECRET` con esos valores (como
   variables **encriptadas** — no son variables `PUBLIC_` de Astro, no van en `.env`, y no
   deben repetirse en ningún otro lado).
4. Dale acceso de escritura al repositorio (como colaborador, o Organización → equipo) a
   cada persona que vaya a publicar desde `/cms`.
5. Esa persona entra a `/cms/`, aprieta "Login with GitHub", autoriza la OAuth App la
   primera vez, y queda dentro del editor.

Mientras tanto, para publicar a mano sigue funcionando igual: crear el archivo directo en
`src/content/posts/` con el frontmatter de más abajo.

### El frontmatter de una nota

```markdown
---
title: "Título de la nota"
summary: "Un párrafo corto. Es lo que se ve en el listado y en Google."
date: 2026-09-15
lang: "es"          # "es" o "en"
category: "Tributaria"
image: "/news-media/foto.jpg"   # opcional — portada de la nota
imageAlt: "Descripción de la foto"  # opcional — para lectores de pantalla
draft: false        # true = escrita pero sin publicar
---

El cuerpo va en Markdown normal. Párrafos, **negritas**, listas, enlaces,
subtítulos con ## y más imágenes si hace falta. El formato lo pone el sitio.
```

Notas prácticas:

- El nombre del archivo es la URL: `reforma-tributaria.md` queda en `/novedades/reforma-tributaria`.
  Publicando desde `/cms` esto sale solo, a partir del título.
- Una nota en inglés lleva `lang: "en"` y aparece solo en `/en/insights`.
- Las notas no se traducen solas: si quieres una nota en los dos idiomas, son dos archivos.
- Con `draft: true` la nota queda guardada sin publicarse, y tampoco entra al build.
- La foto es opcional: sin ella la nota se ve igual que antes, solo con texto.
- Las fotos que se suben desde `/cms` quedan en `public/news-media/`.
- El estilo del cuerpo está definido una sola vez en `src/components/NewsPost.astro`, así que
  todas las notas se ven iguales sin que el autor piense en formato.

> **Las tres notas que vienen incluidas son un punto de partida escrito a partir del contenido
> del propio sitio (los 30 años, el registro CMF N° 418 y el alcance del Sello Asecon).
> Conviene que alguien del estudio las lea y las ajuste al tono de la casa antes de publicar.
> Sus fotos de portada también son provisorias — son las mismas tres fotos que ya se usan en
> el resto del sitio (la oficina, el edificio con el Sello, la fachada), reutilizadas nada más
> para mostrar cómo se ve el listado con imagen. Conviene reemplazarlas por fotos propias de
> cada nota cuando existan.**

## Cómo funcionan los dos idiomas

Todo el sistema de idiomas vive en dos archivos:

- **`src/i18n/config.js`** — el mapa de rutas. Cada página tiene su dirección en los dos
  idiomas y los componentes nunca escriben un enlace a mano: piden `path('contact', lang)`.
  Aquí también están `getLangFromUrl()` (deduce el idioma del path) y `alternatePath()`
  (la misma página en el otro idioma, que es lo que usa el botón ES/EN).
- **`src/data/content.js`** — todos los textos, en `content.es` y `content.en`, con la misma
  forma. Los componentes leen `getContent(lang)` y no tienen ni una frase escrita dentro.

Los componentes deducen el idioma solos desde la URL, así que no hay que pasarles nada:

```astro
const lang = getLangFromUrl(Astro.url);
const c = getContent(lang);
```

### Agregar una página nueva

1. Agrega la clave y sus dos rutas a `routes` en `src/i18n/config.js`.
2. Si va en el menú, súmala a `navOrder` y agrega su etiqueta en `nav` de los dos idiomas.
3. Crea `src/pages/loquesea.astro` y `src/pages/en/whatever.astro`.

El sitemap y las etiquetas `hreflang` se generan solos desde ese mapa: no hay que tocarlos.

### Cambiar un texto

Todo está en `src/data/content.js`. Si cambias algo en español, cambia también su par en
inglés: las dos ramas tienen exactamente las mismas claves.

### El equipo

Los nombres y las fotos no se traducen, pero los cargos sí. Por eso `team` guarda el cargo
como clave (`gerenteContabilidad`) y la traducción vive en `roles` de cada idioma. Para
agregar una persona con un cargo nuevo, súmalo a `roles` en los dos idiomas.

## Estructura

```
src/
  components/
    Header, Footer          → usados en todas las páginas
    Hero, TeamStrip,
    ServicesTeaser,
    SelloTeaser, CtaBanner   → solo en Inicio (/)
    Services                 → página Servicios (/servicios)
    Clients, Testimonials    → página Clientes (/clientes)
    Sello                    → página Sello Asecon (/sello-asecon)
    Technology               → página Tecnología (/tecnologia)
    Team                     → página Nuestro Equipo (/equipo)
    Contact                  → página Contacto (/contacto)
  data/         → content.js (todo el contenido editable en un solo lugar)
  layouts/      → Layout.astro (head, meta tags)
  content/      → posts/*.md (las notas de Novedades) + config.ts
  i18n/         → config.js (idiomas, mapa de rutas, helpers)
  pages/        → español en la raíz, inglés en pages/en/, sitemap.xml.ts
  styles/       → global.css (fuentes, tokens de diseño)
public/
  cms/          → editor de Novedades (Decap CMS): index.html + config.yml
  news-media/   → fotos que se suben desde /cms
  _headers      → cabeceras HTTP + CSP para Cloudflare Pages (y Netlify)
  _redirects    → 301 reales para Cloudflare Pages (y Netlify)
functions/
  api/          → Cloudflare Pages Functions: proxy de OAuth con GitHub para
                  el login de /cms (auth.js + callback.js)
scripts/
  validate.mjs  → puerta de validación del build (`npm run validate`)
  smoke.mjs     → smoke test de una URL ya desplegada (`npm run smoke`)
```

Para editar textos, servicios o el equipo, modifica únicamente `src/data/content.js`: todos los
componentes leen de ahí.

Los componentes de sección completos (`Services`, `Clients`, `Sello`, `Team`) aceptan una prop
opcional `bordered` (por defecto `true`). Se usa `bordered={false}` cuando el componente es el
primer bloque de su página, para no dejar un borde justo debajo del header.

## Panel de Analytics (`/admin`)

Panel interno de demostración, pensado como maqueta visual: **todos los números y
envíos de formulario son datos de ejemplo generados en el navegador**, no hay ninguna
analítica real conectada. Sirve para ver cómo se vería un dashboard de métricas del
sitio (sesiones, fuentes de tráfico, dispositivo, páginas más vistas, embudo de
conversión, formularios) antes de decidir qué fuente de datos real conectar.

- **No se publica salvo que se pida a propósito.** En salida estática no existe forma
  de proteger una página ya publicada — lo que está en `dist/` es público para
  cualquiera con el enlace. Por eso `/admin` (`src/pages/admin/[...slug].astro`) usa
  `getStaticPaths()` para no generar ningún archivo a menos que el build defina
  `PUBLIC_ENABLE_ADMIN=true` (ver `.env.example`). Sin esa variable, `/admin` no
  existe en absoluto en el artefacto: no hay contraseña que filtrar ni enlace que
  compartir por error. (La versión anterior pedía una clave en el navegador — un
  filtro que no protegía nada de verdad y se retiró por eso.)
- **Datos**: se generan con una semilla fija por rango de fechas en
  `src/data/adminAnalytics.js`, así que son estables entre recargas pero cambian al
  elegir 7/30/90 días. Para conectar una fuente real (GA4, Plausible, Umami, etc.),
  ese archivo es el único lugar que hay que reemplazar — el resto del panel
  (`src/scripts/adminDashboard.js`, `src/pages/admin/[...slug].astro`) ya está armado
  para recibir la misma forma de datos.
- **SEO**: cuando se genera, la página lleva `noindex` y está bloqueada en
  `public/robots.txt`.

## Sistema de diseño

- **Color**: tinta `#1F1726`, morado Asecon `#5B2369` / `#3D1742`, latón `#C79A4B`, papel `#F4F1F6`
- **Tipografía**: Fraunces (titulares) e IBM Plex Mono (cifras y datos), **autoalojadas** en
  `public/fonts/`. El cuerpo usa una pila del sistema (`Tahoma, Verdana, Geneva, sans-serif`): no
  descarga ninguna fuente. El sitio **no pide nada a Google Fonts** y hay una regla del validador
  que lo impide.
- **Elemento de marca**: el sello circular giratorio (`src/components/Seal.astro`), que representa
  la garantía "Sello Asecon"

## Validar el sitio antes de publicar

```bash
npm run validate                 # compila y revisa el artefacto dist/
npm run validate -- --no-build   # revisa el dist/ que ya existe (más rápido)
```

`scripts/validate.mjs` revisa lo que de verdad se publica, no el código fuente: que existan las
páginas en los dos idiomas, que ninguna nota con `draft: true` haya salido, que cada página tenga
un solo `canonical` apuntando al dominio correcto, que los `hreflang` apunten a su par, que
`/gracias`, `/en/thank-you` y `/admin` lleven `noindex`, que `robots.txt` corresponda al entorno,
que el sitemap esté completo, que las 301 de `/soluciones` funcionen, que **todo enlace interno e
imagen referenciada exista**, que `content.es` y `content.en` tengan las mismas claves, y que no se
haya filtrado ninguna credencial ni URL de desarrollo al build.

También revisa que ningún formulario apunte a Web3Forms con la clave de acceso vacía, que
cada persona del equipo tenga una foto que existe o `img: null` explícito, y que el widget de
Netlify Identity no se cargue en ninguna parte (el editor usa backend `github`, ver
"Novedades: editor para el equipo").

También revisa que todo `<form>` de leads pida consentimiento, que las fuentes estén
autoalojadas (sin `fonts.googleapis.com`), que sin `PUBLIC_GA4_ID` no se cargue
`googletagmanager.com`, que las notas de Novedades con traducción emitan su `hreflang` real, y
que `dist/_headers` exista con la CSP todavía en modo Report-Only.

Distingue **fallas** (sale con código 1: no se publica) de **avisos** (no bloquean). Con
`PREVIEW_SITE_URL` definida valida contra la URL de preview en vez del dominio real.

## Smoke test de una URL ya desplegada

```bash
npm run smoke -- https://vicenteboudet-asecon.github.io
```

A diferencia de `validate` (que revisa el artefacto `dist/` antes de publicarlo),
`scripts/smoke.mjs` pega contra el sitio real después del deploy: lee su sitemap, comprueba
que cada página responda 200 con `<title>`, un canonical propio y su `hreflang`, que `/gracias`
lleve `noindex`, que `/admin` responda 404 (salvo `SMOKE_ADMIN_ENABLED=1`), y que el formulario
esté sin activar (salvo `SMOKE_FORM_LIVE=1`).

## Cabeceras de seguridad y CSP

`public/_headers` viaja a `dist/_headers` como cualquier otro archivo de `public/`. Lo lee
Cloudflare Pages (y Netlify); GitHub Pages lo ignora sin que rompa nada — por eso el preview
puede seguir ahí mientras esto ya está listo para producción.

Incluye cabeceras base (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Strict-Transport-Security`) y una `Content-Security-Policy-Report-Only`: **no bloquea nada
todavía**, solo hace que el navegador muestre en la consola qué habría bloqueado. La idea es
revisarla ~7 días con tráfico real y recién ahí pasarla a bloqueante (quitar el
`-Report-Only`) — un cambio deliberado, no algo que un build cualquiera pueda hacer solo: hay
una regla en `scripts/validate.mjs` (sección 15) que lo impide por accidente.

La lista de dominios permitidos se armó revisando el código, no copiando una plantilla:
Web3Forms, Google Analytics 4/gtag y Cloudflare Turnstile en el sitio público; unpkg.com y la
API de GitHub solo dentro de `/cms` (ver más abajo). `'unsafe-inline'` en `script-src` es
necesario porque Astro emite scripts en línea (JSON-LD, el bootstrap de Analytics.astro,
`tracking.js`) sin firmar un nonce por request — eso requiere SSR o post-proceso del build.

## CI/CD

- **`.github/workflows/ci.yml`** — corre `npm run validate` en cada Pull Request y en cada push
  a `main`. Es la puerta que antes no existía: un build que compila pero no valida ya no se
  puede mergear sin que el check falle.
- **`.github/workflows/deploy-preview.yml`** — publica en GitHub Pages en cada push a `main`,
  validando el artefacto ya con `robots.txt` de preview sobrescrito (el orden importa: se valida
  lo que de verdad se publica).
- **`.github/workflows/deploy-production.yml`** — creado pero **no habilitado**: solo corre si
  alguien lo dispara a mano desde la pestaña Actions. Publica en **Cloudflare Pages** (hosting de
  producción elegido en la Fase 7) vía `cloudflare/wrangler-action`, y al final corre
  `npm run smoke` contra la URL real ya desplegada. Necesita, como secrets del entorno
  `production` (Settings → Environments → production → Secrets): `CLOUDFLARE_API_TOKEN` y
  `CLOUDFLARE_ACCOUNT_ID` (de la cuenta de Cloudflare), más `PUBLIC_WEB3FORMS_KEY`,
  `PUBLIC_GA4_ID`, `PUBLIC_TURNSTILE_SITEKEY` y `PUBLIC_GSC_VERIFICATION` de siempre. El nombre
  del proyecto de Cloudflare Pages se define como variable `CLOUDFLARE_PAGES_PROJECT`
  (Settings → Environments → production → Variables) una vez creado — sin ella cae a `asecon`.
- **`deploy-preview.yml` se queda en GitHub Pages tal cual** — no depende de la decisión de
  hosting de producción, y ya funciona.
- Las Actions de terceros (`actions/checkout`, `actions/setup-node`,
  `cloudflare/wrangler-action`, etc.) van fijadas por SHA exacto, no por tag mayor — Dependabot
  (`.github/dependabot.yml`) abre un PR cuando corresponde actualizarlas.

## Agentes de trabajo (Claude Code)

El repositorio trae seis agentes especializados en `.claude/agents/`, cada uno dueño de una zona
del sitio, más un brief compartido en `.claude/context/asecon-web.md` con el stack, las fronteras
de confianza, las reglas duras y la puerta de validación. Los agentes leen ese brief: si algo del
proyecto cambia, se corrige **ahí** y no en cada agente.

| Agente | De qué es dueño |
|---|---|
| `asecon-ux` | Páginas y componentes, Tailwind, jerarquía visual, responsive, accesibilidad, textos de `content.js` |
| `asecon-backend` | Web3Forms, Decap CMS, colecciones de contenido, rutas i18n, sitemap, JSON-LD, datos del panel |
| `asecon-deploy` | GitHub Actions, hosting, dominio y HTTPS, variables del proveedor, preview vs producción, rollback |
| `asecon-security` | Secretos, superficies expuestas (`/admin`, `/cms`), permisos, cabeceras y CSP, indexación, dependencias |
| `asecon-qa` | `npm run validate`, pruebas en navegador, accesibilidad, informes de defectos, smoke test post-deploy |
| `asecon-orquestador` | Descompone el trabajo en fases con dueño y criterio de aceptación, integra y cierra la validación |

Se invocan por nombre en una sesión de Claude Code (por ejemplo "usa `asecon-qa` para revisar esto
antes de publicar") o dejando que el orquestador reparta el trabajo. `asecon-qa` no arregla el
producto: informa y enruta al dueño, y por eso su veredicto sirve. Ninguno publica en el dominio
real, toca DNS, rota credenciales ni habilita registro público del CMS sin confirmación explícita.
