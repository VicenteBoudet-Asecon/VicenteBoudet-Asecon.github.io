import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// El workflow de GitHub Pages pasa PREVIEW_SITE_URL con la URL real del
// preview para que canonical/hreflang/JSON-LD y las redirecciones de
// /soluciones y /en/solutions apunten al preview, no al dominio real.
// En local y en cualquier build futuro "de verdad", sin esa variable, sigue
// usando aseconsa.com como siempre.
const site = process.env.PREVIEW_SITE_URL || 'https://aseconsa.com';

export default defineConfig({
  site,
  integrations: [tailwind({ applyBaseStyles: false })],
  // La página de Soluciones pasó a llamarse Servicios (ver README). Estas
  // redirecciones evitan perder el posicionamiento de las URLs ya indexadas.
  redirects: {
    '/soluciones': '/servicios',
    '/en/solutions': '/en/services',
  },
});
