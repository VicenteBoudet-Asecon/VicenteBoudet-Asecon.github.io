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
};

// Orden del menú. "thanks" queda fuera a propósito: no se navega, se llega al enviar.
export const navOrder = ['home', 'services', 'clients', 'seal', 'technology', 'team', 'news', 'contact'];

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
