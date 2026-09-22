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
  /** ID de la propiedad GA4 (G-XXXXXXXXXX). Nunca en preview. Ver .env.example. */
  readonly PUBLIC_GA4_ID?: string;
  /** Valor del meta tag de verificación de Search Console. Ver .env.example. */
  readonly PUBLIC_GSC_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
