# Contexto compartido — sitio Asecon (brief de los agentes)

Todos los agentes de `.claude/agents/` leen este archivo antes de tocar nada.
Si algo de aquí ya no es cierto, corrígelo aquí (no lo dupliques en cada agente).

## Qué es

Sitio público de **Asecon S.A.** (estudio tributario/contable/auditoría, Chile),
en **Astro 4 + Tailwind 3**, **salida estática** (sin adapter, sin SSR).
Dominio de producción previsto: `https://aseconsa.com`.
Español en la raíz, inglés bajo `/en/`.

## Comandos

| Qué | Comando |
|---|---|
| Instalar | `npm ci` |
| Dev | `npm run dev` → http://localhost:4321 |
| Build | `npm run build` → `dist/` |
| Revisar el build | `npm run preview` |
| **Validar** | `npm run validate` (compila y revisa `dist/`) · `npm run validate -- --no-build` |
| CMS en local | `npx decap-server` en otra terminal + `/cms/` |

No hay framework de test instalado. La validación real es: `npm run validate` +
recorrido en navegador (Playwright MCP).

## Archivos que gobiernan el sitio

- `src/data/content.js` — **todo** el texto editable, en `content.es` y `content.en` con las mismas claves.
- `src/i18n/config.js` — mapa de rutas ES/EN, `navOrder`, `getLangFromUrl()`, `path()`, `alternatePath()`.
- `src/layouts/Layout.astro` — head, canonical, hreflang, OG/Twitter, JSON-LD `AccountingService`.
- `src/pages/sitemap.xml.ts` — sitemap generado desde `navOrder`.
- `astro.config.mjs` — `site` (usa `PREVIEW_SITE_URL` si existe), redirecciones `/soluciones` → `/servicios`.
- `public/_redirects` — las mismas 301 para Netlify/Cloudflare.
- `public/robots.txt` — bloquea `/gracias`, `/en/thank-you`, `/admin`, `/cms`.
- `src/content/posts/*.md` + `src/content/config.ts` — Novedades (`draft: true` no entra al build).

## Fronteras de confianza

1. **Formulario de contacto** → Web3Forms, envío HTML nativo desde el navegador.
   `PUBLIC_WEB3FORMS_KEY` es **visible en el HTML por diseño**: es una clave de
   destinatario, no un secreto. Ninguna credencial privada puede vivir en un `PUBLIC_*`.
2. **`/cms`** → Decap CMS con `git-gateway` + Netlify Identity, `publish_mode: editorial_workflow`.
   Registro **solo por invitación**. Escribe directo en el repo (`src/content/posts/`, `public/news-media/`).
3. **`/admin`** → panel de analytics **con datos falsos** (`src/data/adminAnalytics.js`), detrás de
   una cortina cliente con hash SHA-256 en `AdminGate.astro`. **No es seguridad real**: si el enlace
   sale del equipo, hay que protegerlo en el hosting (Cloudflare Access, password de Netlify, Basic Auth).

## Despliegue hoy

- `.github/workflows/deploy-preview.yml` publica en **GitHub Pages** en cada push a `main`,
  con `PREVIEW_SITE_URL=https://vicenteboudet-asecon.github.io` y sobrescribiendo `dist/robots.txt`
  con `Disallow: /` para que el preview **no** se indexe.
- **El hosting de producción todavía no está decidido** (GitHub Pages / Netlify / Vercel / Cloudflare Pages).
  Cualquier recomendación debe decir de qué proveedor habla; no inventar capacidades.
- GitHub Pages **no** puede servir endpoints de servidor de Astro ni cabeceras HTTP personalizadas.

## Reglas duras (valen para los cinco agentes)

- **Nunca** imprimir, inventar, pedir o comitear secretos. Referirse a ellos por nombre.
- **Nada irreversible sin confirmación explícita del usuario**: publicar en el dominio real,
  tocar DNS, rotar credenciales, abrir registro público del CMS, borrar ramas o despliegues.
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

`scripts/validate.mjs` (lo mantiene `asecon-qa`) revisa sobre `dist/`, que es lo que se publica:
páginas presentes en los dos idiomas · notas con `draft: true` fuera del build · un solo canonical
por página apuntando al `site` correcto · `hreflang` con su par y `x-default` · `noindex` y
`robots.txt` según entorno · sitemap completo · las 301 de `/soluciones` · **enlaces e imágenes
referenciados que existen de verdad** · paridad de claves entre `content.es` y `content.en` ·
credenciales y URLs de desarrollo filtradas al artefacto.

Distingue **fallas** (código de salida 1, bloquean) de **avisos** (no bloquean).
Con `PREVIEW_SITE_URL` definida valida contra la URL de preview.

Además, según lo que se tocó (esto el script no lo ve):
- **UI**: recorrido a 360 / 768 / 1280 px, teclado y foco visible, `alt` con sentido, contraste, `prefers-reduced-motion`, consola sin errores.
- **Formulario**: envío real de prueba, redirección a `/gracias` (o `/en/thank-you`), mensajes de error y éxito.
- **SEO/i18n**: cada página con canonical propio, par `hreflang` correcto y `noindex` donde corresponde.
- **Post-deploy**: smoke test de las 8 páginas en los dos idiomas sobre la URL desplegada.

## Deuda conocida (no la "arregles" en silencio)

- `/tecnologia` y `/en/technology` son **BORRADOR**: los seis puntos no están verificados con el estudio.
  No puede salir al dominio real sin que alguien de Asecon revise cada afirmación.
- Las 8 imágenes de `public/services/` son ilustraciones generadas, no fotos.
- Las 3 notas de Novedades y sus portadas son provisorias.
- `/admin` no tiene analítica real conectada.

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

## Defectos abiertos que la puerta ya detecta

- **`/team/fernanda.jpg` no existe** y `/equipo` y `/en/team` la referencian: falta el apellido y
  la foto de Fernanda (marcado `PENDIENTE` en `src/data/content.js`). Es una falla de la puerta
  hasta que el estudio entregue el dato. Dueño: `asecon-ux` + decisión de contenido de Asecon.
- **Avisos**: las notas de Novedades no entran al sitemap (solo las páginas del menú), y los
  `hreflang` se emiten sin barra final mientras el canonical la lleva. Dueño: `asecon-backend`.
