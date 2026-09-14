import type { APIRoute } from 'astro';
import { navOrder, routes, languages } from '../i18n/config';

// Se genera en el build desde el mapa de rutas (src/i18n/config.js): al agregar
// una página al menú entra sola al sitemap, en los dos idiomas, y con las
// etiquetas hreflang que le dicen a Google que son la misma página traducida.
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://aseconsa.com')).origin;
  const lastmod = new Date().toISOString().slice(0, 10);
  const langs = Object.keys(languages);

  const urls = navOrder
    .flatMap((key) =>
      langs.map((lang) => {
        const href = routes[key][lang];
        const loc = origin + (href === '/' ? '/' : href + '/');
        const alts = langs
          .map((other) => {
            const otherHref = routes[key][other];
            const otherLoc = origin + (otherHref === '/' ? '/' : otherHref + '/');
            return `    <xhtml:link rel="alternate" hreflang="${languages[other].htmlLang}" href="${otherLoc}"/>`;
          })
          .join('\n');

        return `  <url>
    <loc>${loc}</loc>
${alts}
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${key === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
      })
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
