/// <reference path="../.astro/types.d.ts" />

// Tipado explícito de las variables de entorno del sitio. Sin esto,
// import.meta.env.PUBLIC_ALGO con un typo no da error de compilación: se
// evalúa a `undefined` en silencio y el bug aparece recién en producción.
interface ImportMetaEnv {
  /** Clave de destinatario de Web3Forms para el formulario de contacto. Ver .env.example. */
  readonly PUBLIC_WEB3FORMS_KEY?: string;
  /** 'true' para generar /admin (panel de demostración) en este build. Ver .env.example. */
  readonly PUBLIC_ENABLE_ADMIN?: string;
  /** '1' para ver los canales sin activar en su estado "maqueta". Nunca en producción. Ver .env.example. */
  readonly PUBLIC_PREVIEW_CHANNELS?: string;
  /** Site key de Cloudflare Turnstile para el formulario. Ver .env.example. */
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
