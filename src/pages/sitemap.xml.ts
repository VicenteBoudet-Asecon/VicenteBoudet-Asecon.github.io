import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { navOrder, routes, languages } from '../i18n/config';

// Se genera en el build desde el mapa de rutas (src/i18n/config.js): al agregar
// una página al menú entra sola al sitemap, en los dos idiomas, y con las
// etiquetas hreflang que le dicen a Google que son la misma página traducida.
//
// Las notas de Novedades se suman aparte, con su fecha real como lastmod
// (antes usaban la fecha del build para las 22 URLs por igual — una señal
// que Google aprende a ignorar) y con hreflang solo cuando el campo `pair`
// (ver src/content/config.ts) encuentra su contraparte en el otro idioma.
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://aseconsa.com')).origin;
  const today = new Date().toISOString().slice(0, 10);
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
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${key === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
      })
    )
    .join('\n');

  const posts = await getCollection('posts', (p) => !p.data.draft);
  const postUrls = posts
    .map((post) => {
      const base = post.data.lang === 'en' ? '/en/insights' : '/novedades';
      const loc = `${origin}${base}/${post.slug}/`;
      const lastmod = post.data.date.toISOString().slice(0, 10);

      const pair = posts.find((p) => p.data.lang !== post.data.lang && p.data.pair === post.data.pair);
      const alts = pair
        ? [post, pair]
            .map((p) => {
              const pBase = p.data.lang === 'en' ? '/en/insights' : '/novedades';
              const hreflang = languages[p.data.lang].htmlLang;
              return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${origin}${pBase}/${p.slug}/"/>`;
            })
            .join('\n')
        : '';

      return `  <url>
    <loc>${loc}</loc>
${alts}
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
${postUrls}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
