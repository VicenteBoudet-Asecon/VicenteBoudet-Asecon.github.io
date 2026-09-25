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

1. Entra a https://web3forms.com/ e ingresa el correo donde quieres recibir los mensajes: para
   este sitio es **`info@aseconsa.com`**, confirmado por el estudio. La clave queda atada a ese
   destinatario, así que cambiar de buzón implica generar una clave nueva.
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

### Dejarlo andando para el equipo de verdad (Netlify)

El editor usa el backend `github` de Decap (`public/cms/config.yml`): cada persona inicia
sesión con su propia cuenta de GitHub y escribe con sus propios permisos del repositorio —
nada de contraseñas nuevas ni de un servicio aparte para esto. Lo único que hace falta es un
proveedor de OAuth frente a GitHub, y ese proveedor es el propio sitio
(`netlify/functions/cms-auth.mjs` + `cms-callback.mjs`, ya en el repo, publicadas en
`/api/auth` y `/api/callback`, inertes hasta que se configuren estas dos cosas):

1. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App.**
   - Homepage URL: `https://aseconsa.com`
   - Authorization callback URL: `https://aseconsa.com/api/callback`
     (un OAuth App clásico solo admite una URL de callback — por eso esto solo puede
     probarse de verdad desde el dominio final, no desde una URL `*.netlify.app`).
2. Copia el **Client ID** y genera un **Client secret**.
3. En el sitio de Netlify: **Site configuration → Environment variables**, agrega
   `GITHUB_OAUTH_CLIENT_ID` y `GITHUB_OAUTH_CLIENT_SECRET` con esos valores (marcados
   como **secretos** — no son variables `PUBLIC_` de Astro, no van en `.env`, y no
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
pair: "reforma-tributaria"      # obligatorio — el mismo valor en la nota y en su traducción
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
- `pair` es **obligatorio** (sin él el build falla) y es lo que empareja una nota con su
  traducción: las dos llevan exactamente el mismo valor —por convención, el nombre del archivo
  de la versión en español, sin `.md`—, y de ahí sale el `hreflang` de la nota (lo que le dice
  a Google que son la misma pieza en dos idiomas). Una nota que todavía no tiene traducción lo
  lleva igual, con el mismo criterio. En `/cms` es el campo "Par en el otro idioma".
- Con `draft: true` la nota queda guardada sin publicarse, y tampoco entra al build.
- La foto es opcional: sin ella la nota se ve igual que antes, solo con texto.
- Las fotos que se suben desde `/cms` quedan en `public/news-media/`.
- El estilo del cuerpo está definido una sola vez en `src/components/NewsPost.astro`, así que
  todas las notas se ven iguales sin que el autor piense en formato.

> **Las seis notas que vienen incluidas (tres temas, cada uno en español y en inglés) son un
> punto de partida escrito a partir del contenido del propio sitio (los 30 años, el registro
> CMF N° 418 y el alcance del Sello Asecon).
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
  _headers      → cabeceras HTTP + CSP (formato Netlify)
  _redirects    → 301 reales (formato Netlify)
netlify/
  functions/    → Netlify Functions: el proxy de OAuth con GitHub para el
                  login de /cms (cms-auth.mjs + cms-callback.mjs, servidas
                  en /api/auth y /api/callback)
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

`scripts/validate.mjs` revisa lo que de verdad se publica (`dist/`), no el código fuente.
Distingue **fallas** (sale con código 1: no se publica) de **avisos** (no bloquean). Con
`PREVIEW_SITE_URL` definida valida contra la URL de preview en vez del dominio real. Tiene 21
secciones:

| # | Sección | Qué revisa |
|---|---|---|
| 0 | Build | `npm run build` termina sin error (se omite con `--no-build`) |
| 1 | Páginas | Las rutas de `routes` en los dos idiomas, `/cms`, `sitemap.xml`, `robots.txt` y `_redirects`; `/admin` **no** existe salvo `PUBLIC_ENABLE_ADMIN=true` |
| 2 | Borradores | Ninguna nota con `draft: true` quedó publicada |
| 3 | Canonical | Exactamente un `canonical` por página, apuntando a su propia URL en el dominio |
| 4 | hreflang | Cada página apunta a su par en el otro idioma y declara `x-default` (aviso si la forma de la URL no calza con el canonical) |
| 5 | Indexación | `noindex` exactamente en `/gracias`, `/en/thank-you`, `/tecnologia`, las legales, la 404 (y `/admin` si se generó); `robots.txt` coherente con el entorno |
| 6 | Sitemap | Las páginas del menú en los dos idiomas y todas las notas, en el dominio correcto, sin `/gracias`, `/admin` ni `/cms` |
| 7 | Redirecciones | `/soluciones` y `/en/solutions` tienen su página de respaldo `noindex` y su línea en `_redirects` con el `!` de forzado |
| 8 | Enlaces e imágenes | Todo `href`, `src` y `poster` interno existe en `dist/` |
| 9 | Paridad ES/EN | `content.es` y `content.en` tienen las mismas claves (aviso si una lista tiene distinto largo) |
| 10 | Fugas | Sin credenciales privadas, sin `.env` y sin URLs de desarrollo dentro de `dist/` |
| 11 | Equipo — fotos | Cada persona tiene una foto que existe o `img: null` explícito |
| 12 | Formulario | Nunca Web3Forms con `access_key` vacío; todo `<form data-form="lead">` pide consentimiento (`name="consent" required`) |
| 13 | Terceros | Sin el widget de Netlify Identity, sin Google Fonts, y sin `googletagmanager.com` si no hay `PUBLIC_GA4_ID` |
| 14 | Notas — hreflang | Cada nota con pareja (`pair`) en el otro idioma emite su `hreflang` real |
| 15 | Cabeceras | `dist/_headers` existe y la CSP sigue en `Content-Security-Policy-Report-Only` |
| 16 | Dotación | Mientras `company.headcount` esté vacío, ninguna página afirma "N profesionales/empleados" |
| 17 | Scripts en línea | Ningún `<script>` clásico contiene un `import`: es la huella de un script que Astro no procesó por estar dentro de una expresión `{…}`, y que en el navegador es un error de sintaxis. Los `import` de un `<script type="module">` en línea tienen que resolver a un archivo de `dist/` |
| 18 | Formularios inactivos | Un formulario de leads **sin** `action` no tiene ningún botón que lo envíe (`button type="submit"`, `button` sin `type`, `input type="submit"`): si lo tiene, Enter lo envía igual y, sin JS, los datos terminan en la URL. Uno **con** `action` envía por `POST` |
| 19 | Agendamiento retirado | Ningún archivo de `dist/` menciona `/agendar`, `/en/book`, "agendamiento", "scheduling provider" ni los eventos `booking_*`: el canal se retiró y no vuelve |
| 20 | Enlaces sin barra final | **Aviso**: `href` internos sin barra final (cada uno le cuesta al visitante un 301 extra). Excluye anclas, `mailto:`/`tel:`, archivos con extensión y `/api/` |
| 21 | `hidden` y display | **Aviso**: un elemento con el atributo `hidden` y una clase `flex`, `grid`, `block`, `inline-flex`… se ve igual, porque la clase le gana al `hidden`. Se eximen los que ya tienen una regla `X[hidden]{display:none}` más específica en el CSS |

**El artefacto cambia con las variables de activación**, así que una sola corrida no alcanza: un
defecto puede existir solo en una combinación (el de la sección 17 solo aparecía con los canales
en maqueta; la 18 revisa cosas distintas con y sin clave de Web3Forms). Antes de dar algo por
validado, correr al menos estas cuatro:

```bash
npm run validate                                   # producción, todo sin activar
PUBLIC_PREVIEW_CHANNELS=1 npm run validate         # canales en maqueta (lo que publica el preview)
PUBLIC_WEB3FORMS_KEY=<clave> npm run validate      # formulario activo
PUBLIC_ENABLE_ADMIN=true npm run validate          # /admin generado a propósito
```

En PowerShell, la variable va antes y aparte: `$env:PUBLIC_PREVIEW_CHANNELS='1'; npm run validate`
(y `Remove-Item Env:PUBLIC_PREVIEW_CHANNELS` al terminar, porque queda puesta en la sesión). Con
`PREVIEW_SITE_URL` definida, el aviso de `robots.txt` en local es esperable: el workflow del
preview lo sobrescribe recién después del build.

## Smoke test de una URL ya desplegada

```bash
# preview en GitHub Pages: se sirve y se declara en el mismo origen
npm run smoke -- https://vicenteboudet-asecon.github.io

# build de producción servido desde otro origen (Netlify antes del corte de DNS)
SMOKE_CANONICAL_ORIGIN=https://aseconsa.com SMOKE_NETLIFY=1 npm run smoke -- https://<sitio>.netlify.app

# producción con el dominio ya cortado
SMOKE_NETLIFY=1 npm run smoke -- https://aseconsa.com
```

A diferencia de `validate` (que revisa el artefacto `dist/` antes de publicarlo),
`scripts/smoke.mjs` pega contra el sitio real después del deploy:

1. **Sitemap y `robots.txt`**: el sitemap responde con al menos 14 URL, todas en el origen
   canónico; `robots.txt` declara `Sitemap:` en ese mismo origen (o bloquea el sitio entero, que
   es lo que hace el preview) y bloquea `/gracias`, `/en/thank-you`, `/admin` y `/cms`.
2. **Cada página del sitemap**: 200, `<title>` no vacío, un solo canonical que es exactamente su
   propia URL en el origen canónico, y `hreflang` (con `x-default`) todos en ese origen.
3. **Rutas fuera del sitemap**: las 4 legales en los dos idiomas y `/en/thank-you`, con su `noindex`.
4. **Casos especiales**: `/gracias` con `noindex`, `/admin` en 404 (salvo
   `SMOKE_ADMIN_ENABLED=1`), y `/soluciones` → `/servicios` (301 real o, fuera de Netlify, la
   página de respaldo con meta-refresh).
5. **Formulario**: sin activar, salvo `SMOKE_FORM_LIVE=1`.
6. **Cabeceras** (solo con `SMOKE_NETLIFY=1`): las de `public/_headers` en `/`, la CSP todavía en
   Report-Only, y la CSP propia de `/cms/`.

| Variable | Para qué |
|---|---|
| `SMOKE_CANONICAL_ORIGIN` | El origen que el sitio **declara** (canonical, hreflang, sitemap, `Sitemap:`) cuando no es el mismo desde donde se **sirve**. Las páginas se piden a la URL dada; lo declarado se espera en este origen. Sin ella, se asume que son el mismo. Debe ser un origen sin ruta (`https://aseconsa.com`) |
| `SMOKE_NETLIFY=1` | El sitio lo sirve Netlify: exige las cabeceras de `public/_headers` y 301 reales. Sin ella esas comprobaciones quedan en `[n/a]`, porque GitHub Pages y `astro preview` no pueden servir ninguna de las dos cosas y su ausencia ahí no es un defecto |
| `SMOKE_FORM_LIVE=1` | Espera `access_key` definido en `/contacto` y `/en/contact` |
| `SMOKE_ADMIN_ENABLED=1` | Espera `/admin` en 200 en vez de 404 |
| `SMOKE_LEGAL_INDEXABLE=1` | Espera las legales ya **sin** `noindex` (tras la firma del abogado) |

Para probar un build de producción en local, sin desplegar nada:

```bash
npm run build
npx astro preview --port 4351      # en otra terminal
SMOKE_CANONICAL_ORIGIN=https://aseconsa.com npm run smoke -- http://localhost:4351
```

Ahí **no** va `SMOKE_NETLIFY=1`: `astro preview` no lee `_headers` ni `_redirects`, así que las
cabeceras y los 301 fallarían por el servidor, no por el sitio.

## Cabeceras de seguridad y CSP

`public/_headers` viaja a `dist/_headers` como cualquier otro archivo de `public/`. Lo lee
Netlify, que es el hosting de producción; GitHub Pages lo ignora sin que rompa nada — por eso el preview
puede seguir ahí mientras esto ya está listo para producción.

Incluye cabeceras base (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Strict-Transport-Security`) y una `Content-Security-Policy-Report-Only`: **no bloquea nada
todavía**, solo hace que el navegador muestre en la consola qué habría bloqueado. La idea es
revisarla ~7 días con tráfico real y recién ahí pasarla a bloqueante (quitar el
`-Report-Only`) — un cambio deliberado, no algo que un build cualquiera pueda hacer solo: hay
una regla en `scripts/validate.mjs` (sección 15) que lo impide por accidente. **Esa revisión
todavía no puede empezar**: la CSP no tiene `report-uri`/`report-to`, así que las violaciones solo
se ven en la consola de quien navega. Falta decidir a dónde se mandan los reportes.

La lista de dominios permitidos se armó revisando el código, no copiando una plantilla:
Web3Forms, Google Analytics 4/gtag y Cloudflare Turnstile en el sitio público; unpkg.com y la
API de GitHub solo dentro de `/cms`. `'unsafe-inline'` en `script-src` es
necesario porque Astro emite scripts en línea (JSON-LD, el bootstrap de Analytics.astro,
`tracking.js`) sin firmar un nonce por request — eso requiere SSR o post-proceso del build.
Los orígenes de GA4 son la lista oficial de Google para GA4 sin funciones de Ads (si algún día
se vincula Google Ads, esa lista crece).

**`/cms` tiene su propia CSP**, medida en Chromium con Decap 3.16.3: scripts solo desde la
carpeta de **esa versión** en unpkg (no desde todo unpkg, que sirve cualquier paquete de npm),
`'unsafe-eval'` porque Decap lo necesita para validar su configuración, y **sin** `'unsafe-inline'`
en scripts: así, una vez bloqueante, un HTML hostil en una nota no puede ejecutar código donde
vive el token de GitHub del editor. Subir Decap son **tres cambios en un mismo commit**: `src` y
`integrity` en `public/cms/index.html`, y la ruta con la versión en el bloque `/cms/*` de
`public/_headers` (el comando para calcular el hash está en el HTML). El SRI cubre solo el archivo
principal: los trozos que Decap carga a pedido desde la misma carpeta no llevan hash.

**HSTS arranca corto**: `max-age=86400`, sin `includeSubDomains` ni `preload`, para no alcanzar a
los subdominios del cPanel (`webmail`, `cpanel`, `whm`, …) y para que un rollback de DNS al WordPress
siga siendo posible. Cuándo y cómo subirlo está escrito junto a la cabecera, en `public/_headers`.

Antes de volver bloqueante la CSP, y en el primer despliegue a `*.netlify.app`, comprobar con
`curl -sI https://<sitio>/cms/` que `/cms` recibe **una sola** `Content-Security-Policy` (la
documentación de Netlify no dice qué hace cuando dos reglas calzan con la misma ruta; si las
juntara, Decap dejaría de cargar) y una sola `Strict-Transport-Security`.

## Runbook de activación

El sitio está **construido pero sin activar**: cada canal existe en el código y queda inerte hasta
que su dato real aparece. Esta tabla es el índice de todos los interruptores — qué enciende cada
uno, dónde se configura y cómo se comprueba que quedó bien. El orden de encendido y sus
dependencias están en la Fase 8 del plan del proyecto.

| Interruptor | Dónde se configura | Qué enciende | Cómo se verifica |
|---|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | Variable del repositorio (Settings → Secrets and variables → Actions → **Variables**) | El formulario de contacto, que entrega a **`info@aseconsa.com`**. Sin ella el `<form>` no lleva `action` y su botón es `type="button"`: no puede enviarse ni por accidente | `curl -s <url>/contacto/` trae `access_key` no vacío y un `redirect` al dominio correcto. Y es el primer build en el que la sección 12 del validador deja de decir `[n/a]` |
| `PUBLIC_TURNSTILE_SITEKEY` | Variable del repositorio | El captcha en el formulario | El HTML trae `class="cf-turnstile"` y un envío **todavía se acepta**. Solo *después* se exige el captcha en el panel de Web3Forms — al revés, todo envío se rechaza en silencio |
| `PUBLIC_GA4_ID` | Variable del repositorio | GA4. Sin ella no se carga nada de Google ni aparece el banner de consentimiento | Con "Rechazar" en el banner, DevTools filtrado por `google` muestra **cero** peticiones; al aceptar aparece `gtag/js` |
| `PUBLIC_GSC_VERIFICATION` | Variable del repositorio | El meta tag de Search Console | Es el **respaldo**: la vía preferida es un TXT en el DNS, que sobrevive a cambios de hosting. Si se verificó por TXT, esta variable se deja vacía |
| `company.whatsapp` | `src/data/content.js` | El canal de WhatsApp en la barra fija y junto al formulario | Un clic real abre la conversación. Con el campo vacío el botón **no existe**, no aparece muerto |
| `company.leadMagnetFile` | `src/data/content.js` | La franja de guía descargable y su entrega en `/gracias` | El PDF responde 200 con `content-type: application/pdf` |
| `company.rut`, `dataController`, `retentionMonths`, `privacyVersion` | `src/data/content.js` | Completan el texto legal | **Van los cuatro en un mismo commit**: son un solo hecho jurídico. Subir los datos sin subir `privacyVersion` deja los consentimientos futuros atribuidos a un texto que ya cambió. Verificación: `curl -s <url>/privacidad/` sin ningún `PENDIENTE` |
| `company.headcount` | `src/data/content.js` | Permite volver a publicar una cifra de dotación | Hoy vacío a propósito (había tres cifras contradictorias). Al ponerlo hay que rehacer `credentials`, `teamPage` y las dos notas; la sección 16 del validador lo bloquea mientras siga vacío |
| `ESTRUCTURA_CONFIRMADA` | `src/data/content.js` | Quita el aviso "Estructura preliminar" de `/equipo` | Cambiarlo a `true` cuando Asecon confirme el organigrama. No requiere ningún otro cambio |
| **Legales indexables** | `scripts/validate.mjs` + `src/pages/sitemap.xml.ts` | Que las 4 páginas legales entren a Google | **No es solo aprobación del abogado, es código en dos lugares**: sacarlas de la lista `NOINDEX` del validador **y** sumarlas a la fuente del sitemap (hoy solo recorre `navOrder` y las notas). Sin lo segundo quedan indexables y huérfanas. Verificación: `SMOKE_LEGAL_INDEXABLE=1 npm run smoke -- <url>` |
| `PUBLIC_ENABLE_ADMIN` | Solo en local | Genera `/admin` en el build | **Nunca en producción.** Sin ella la página no existe en `dist/`, que es la única protección real en un sitio estático |
| `PUBLIC_PREVIEW_CHANNELS` | `deploy-preview.yml` | Muestra los canales sin dato en estado maqueta | Ya activa en el preview. **Producción no la define y no debe hacerlo** |
| `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` | Secrets del entorno `production` (ya cargados). `NETLIFY_SITE_ID` es el **API ID** del sitio, no su nombre | El despliegue a Netlify. Solo los ve el paso que publica, en el job `deploy` | El workflow `deploy-production.yml` completa y `npm run smoke` corre contra el `deploy_url` de ese despliegue. Si faltan, el paso falla antes de publicar nada |
| **Registros del sitio en el DNS** | En **denial.cl**, el proveedor de DNS actual | Que `aseconsa.com` sirva este sitio en vez del WordPress | En un mismo cambio: el A del apex de `138.186.10.80` a `75.2.60.5`, **borrar el AAAA del apex** (`2803:8240:310:16::2`; si queda, IPv6 sigue en el WordPress y Let's Encrypt no emite), y `www` a un CNAME al subdominio `.netlify.app`. **No se toca ningún registro de correo** (MX, SPF, DKIM, DMARC, `autodiscover`, `mail`) ni los subdominios de cPanel. El rollback recrea el AAAA — ver la Fase 8 del plan |
| `GITHUB_OAUTH_CLIENT_ID`, `..._SECRET` | Variables de entorno del sitio en **Netlify**, con alcance Functions (`..._SECRET` marcada como secreta) | El login de `/cms` | Sin ellas, `/api/auth` responde "Editor no configurado todavía" — esa respuesta es la señal de que el despliegue está bien. Netlify las fija al desplegar: **después de cargarlas hay que volver a disparar el workflow**. El callback de la OAuth App exige el dominio final, así que **no se puede probar antes del corte de DNS** |
| `SMOKE_FORM_LIVE`, `SMOKE_ADMIN_ENABLED`, `SMOKE_LEGAL_INDEXABLE` | En la línea de comando del smoke test; en `deploy-production.yml`, variables del repositorio | Qué estado espera encontrar el smoke test | `SMOKE_FORM_LIVE=1 npm run smoke -- <url>`. Por defecto asumen "todavía sin activar" y fallan si encuentran lo contrario |
| `SMOKE_CANONICAL_ORIGIN` | Fija en `deploy-production.yml` (`https://aseconsa.com`) | Que el smoke pida las páginas a la URL del despliegue (`*.netlify.app`) pero espere canonical, hreflang y sitemap en el dominio real | La define el workflow; no se toca. A mano, contra el dominio ya cortado, no hace falta: `npm run smoke -- https://aseconsa.com` |

La única variable del proyecto que **no** está en esta tabla es `PREVIEW_SITE_URL`, porque no
enciende nada: la define `deploy-preview.yml` para que canonical, hreflang, JSON-LD y sitemap
apunten a la URL del preview en vez de al dominio real. En producción se deja sin definir y
`astro.config.mjs` cae a `https://aseconsa.com`.

## CI/CD

Los tres workflows corren en **Node 22** (Node 20 está fuera de soporte y `netlify-cli@27.8.1`
pide ≥22.13), con permisos de solo lectura salvo donde se publica.

- **`.github/workflows/ci.yml`** — corre `npm run validate` en cada Pull Request y en cada push
  a `main`. Es la puerta que antes no existía: un build que compila pero no valida ya no se
  puede mergear sin que el check falle. El `npm audit` es informativo: queda en el log del job.
- **`.github/workflows/deploy-preview.yml`** — publica en GitHub Pages en cada push a `main`,
  validando el artefacto ya con `robots.txt` de preview sobrescrito (el orden importa: se valida
  lo que de verdad se publica). Solo el job `deploy` tiene `pages: write` e `id-token: write`.
- **`.github/workflows/deploy-production.yml`** — **no se habilita solo**: corre únicamente si
  alguien lo dispara a mano desde la pestaña Actions. Tres jobs:
  1. `build` — `npm ci`, build, `npm run validate -- --no-build` y sube `dist/` como artefacto.
     Sin entorno y sin ningún secreto de Netlify. Lee `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_GA4_ID`,
     `PUBLIC_TURNSTILE_SITEKEY` y `PUBLIC_GSC_VERIFICATION` como **variables del repositorio**
     (Settings → Secrets and variables → Actions → Variables), a nivel de job para que build y
     validate vean lo mismo. Son públicas por diseño (terminan en el HTML); cargadas como
     variables del entorno `production` llegarían vacías, porque este job no usa ese entorno.
  2. `deploy` — el único con el entorno `production` (revisores obligatorios: acá se aprueba).
     Baja el artefacto y lo publica con `netlify deploy --prod --no-build --dir=dist`. Los
     secrets `NETLIFY_AUTH_TOKEN` y `NETLIFY_SITE_ID` los ve solo ese paso, y el job no instala
     dependencias del proyecto ni restaura caché. `--no-build` es obligatorio: sin él, el CLI
     autodetecta Astro y recompila, y lo publicado deja de ser lo validado.
  3. `smoke` — `npm run smoke` contra el `deploy_url` de ese despliegue (la URL fija
     `<id>--<sitio>.netlify.app`), con `SMOKE_CANONICAL_ORIGIN=https://aseconsa.com`. Nunca
     contra `url`, el dominio principal del sitio: en cuanto se agrega `aseconsa.com` en
     Netlify pasa a ser ese, que antes del corte de DNS es el WordPress.
- **La integración git de Netlify no se usa, a propósito** (ver `netlify.toml`): el despliegue
  sale del workflow, donde `npm run validate` corre contra el `dist/` ya armado antes de
  publicar. Conectar además el repo a Netlify daría dos vías de despliegue y una de ellas se
  saltaría la puerta. Lo que lo impide de verdad es `--no-build` más "Stop builds" en el panel
  de Netlify, no que `netlify.toml` omita `command`.
- **Rollback en Netlify**: panel del sitio → Deploys → el despliegue anterior → "Publish
  deploy". Es inmediato y no pasa por Actions. Ojo: cada despliegue conserva las variables de
  entorno de Netlify que había al publicarse (las del CMS, por ejemplo). Si además se fija con
  "Lock to stop auto publishing", el workflow falla con "Deployments are locked" hasta que se
  desbloquee — es lo esperado, no un error del pipeline.
- **`deploy-preview.yml` se queda en GitHub Pages tal cual** — no depende de la decisión de
  hosting de producción, y ya funciona.
- Las Actions de terceros (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`,
  `actions/download-artifact`, `actions/upload-pages-artifact`, `actions/deploy-pages`) van
  fijadas por SHA exacto, no por tag mayor — Dependabot (`.github/dependabot.yml`) abre un PR
  cuando corresponde actualizarlas. El despliegue usa el CLI de Netlify con versión exacta en
  vez de una acción de terceros, por la misma razón: menos código ajeno corriendo en un runner
  que tiene credenciales de publicación.

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
