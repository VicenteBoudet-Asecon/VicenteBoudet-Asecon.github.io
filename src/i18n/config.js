// Configuración de idiomas del sitio.
// El español es el idioma por defecto y vive en la raíz (/contacto).
// El inglés vive bajo /en/ con slugs propios (/en/contact), que posicionan mejor
// que traducir la URL española.

export const defaultLang = 'es';

export const languages = {
  es: { label: 'Español', short: 'ES', htmlLang: 'es-CL', ogLocale: 'es_CL' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
};

// Cada página del sitio, con su ruta en los dos idiomas. La clave es la que usan
// los componentes; así un enlace nunca queda escrito a mano.
export const routes = {
  home: { es: '/', en: '/en' },
  services: { es: '/servicios', en: '/en/services' },
  clients: { es: '/clientes', en: '/en/clients' },
  seal: { es: '/sello-asecon', en: '/en/asecon-seal' },
  technology: { es: '/tecnologia', en: '/en/technology' },
  team: { es: '/equipo', en: '/en/team' },
  news: { es: '/novedades', en: '/en/insights' },
  contact: { es: '/contacto', en: '/en/contact' },
  thanks: { es: '/gracias', en: '/en/thank-you' },
  // Fuera de navOrder, igual que "thanks": no es una página de menú, se llega
  // desde el CTA de agendar del hero y de otros canales. Ver
  // src/data/channels.js — mientras company.bookingUrl esté vacío, la página
  // muestra el estado de respaldo (booking.fallbackTitle en content.js) en
  // vez de un embed roto.
  booking: { es: '/agendar', en: '/en/book' },
};

// Orden del menú. "thanks" y "booking" quedan fuera a propósito: no se
// navega a ellas, se llega al enviar o desde un CTA. "technology" también
// queda fuera: el contenido sigue marcado BORRADOR en content.js (ver
// ESTRUCTURA_CONFIRMADA y el comentario de `technology`) y no se puede
// publicar sin que el estudio lo revise. La página sigue existiendo en
// `routes` y accesible por URL directa para esa revisión, pero no aparece en
// el menú, el footer ni el sitemap (los tres derivan de este arreglo), y
// lleva `noindex` (ver tecnologia.astro).
export const navOrder = ['home', 'services', 'clients', 'seal', 'team', 'news', 'contact'];

export function getLangFromUrl(url) {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : defaultLang;
}

/** Ruta de una página en el idioma pedido: path('contact', 'en') -> '/en/contact' */
export function path(key, lang = defaultLang) {
  return routes[key][lang];
}

/** La clave de página que corresponde a una URL, para saber dónde estamos parados. */
export function keyFromPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  for (const [key, byLang] of Object.entries(routes)) {
    if (Object.values(byLang).some((r) => (r.replace(/\/+$/, '') || '/') === clean)) return key;
  }
  return null;
}

/** La misma página en el otro idioma, para el botón ES/EN. */
export function alternatePath(pathname, targetLang) {
  const key = keyFromPath(pathname);
  return key ? routes[key][targetLang] : routes.home[targetLang];
}
