// Constructores de JSON-LD. Antes vivían inline en Layout.astro como un solo
// objeto AccountingService que se repetía idéntico en las 26 páginas, con
// una `description` que cambiaba según la página — la entidad de la
// organización no debería describirse distinto según qué URL la sirve.
//
// Ahora: la organización (+ WebSite) se emite una sola vez, en la home;
// el resto de las páginas emiten WebPage + BreadcrumbList referenciando esa
// misma entidad por @id. Las notas de Novedades suman su propio bloque
// Article (ver NewsPost.astro).

interface CompanyLike {
  name: string;
  phone1: string;
  phone2: string;
  email: string;
  founded: number;
  cmfRegistry: string;
  linkedin: string;
  mapUrl: string;
  addressStreet: string;
  addressLocality: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
}

const ORG_ID = '#organization';
const WEBSITE_ID = '#website';

function addressSchema(company: CompanyLike) {
  return {
    '@type': 'PostalAddress',
    streetAddress: company.addressStreet,
    addressLocality: company.addressLocality,
    addressRegion: company.addressRegion,
    ...(company.addressPostalCode && { postalCode: company.addressPostalCode }),
    addressCountry: company.addressCountry,
  };
}

/**
 * La entidad de la organización, con dirección, credencial CMF y el
 * catálogo de servicios. Solo se emite en la home (es/en): es una sola
 * entidad, no algo que tenga sentido repetir por página.
 */
export function organizationSchema(opts: {
  site: URL;
  company: CompanyLike;
  lang: string;
  description: string;
  ogImage: string;
  serviceList: Array<{ name: string; summary: string }>;
  geo?: { latitude: number; longitude: number };
}) {
  const { site, company, lang, description, ogImage, serviceList, geo } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': ['AccountingService', 'ProfessionalService', 'LocalBusiness'],
    '@id': `${site.origin}/${ORG_ID}`,
    name: company.name,
    alternateName: 'Asecon',
    description,
    url: site.origin,
    logo: new URL('/brand/logo-asecon.svg', site).href,
    image: ogImage,
    telephone: [company.phone1, company.phone2],
    email: company.email,
    foundingDate: String(company.founded),
    priceRange: '$$',
    knowsLanguage: ['es-CL', 'en'],
    address: addressSchema(company),
    ...(geo && { geo: { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude } }),
    areaServed: { '@type': 'Country', name: 'Chile' },
    sameAs: [company.linkedin],
    hasMap: company.mapUrl,
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'CMF Registro de Inspectores de Cuentas y Auditores Externos',
      identifier: company.cmfRegistry,
      validIn: { '@type': 'Country', name: 'Chile' },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'en' ? 'Asecon services' : 'Servicios Asecon',
      itemListElement: serviceList.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.summary },
      })),
    },
  };
}

/** WebSite de la organización. Sin potentialAction/SearchAction: el sitio no tiene buscador — declararlo sería marcado falso. */
export function websiteSchema(opts: { site: URL; company: CompanyLike; lang: string }) {
  const { site, company, lang } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.origin}/${WEBSITE_ID}`,
    url: site.origin,
    name: company.name,
    inLanguage: lang,
    about: { '@id': `${site.origin}/${ORG_ID}` },
  };
}

/** Para toda página que no sea la home: referencia a la organización en vez de repetirla. */
export function webPageSchema(opts: { site: URL; canonical: string; title: string; description: string }) {
  const { site, canonical, title, description } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${site.origin}/${WEBSITE_ID}` },
    about: { '@id': `${site.origin}/${ORG_ID}` },
  };
}

const conBarra = (ruta: string) => (ruta === '/' ? '/' : `${ruta.replace(/\/+$/, '')}/`);

/** trail no incluye Home: se antepone acá siempre. Normaliza la barra final
 * acá adentro (la misma que ya lleva canonical) para que quien arma el
 * trail no tenga que acordarse de hacerlo cada vez. */
export function breadcrumbSchema(opts: {
  site: URL;
  homeName: string;
  homePath: string;
  trail: Array<{ name: string; path: string }>;
}) {
  const { site, homeName, homePath, trail } = opts;
  const items = [{ name: homeName, path: homePath }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(conBarra(item.path), site).href,
    })),
  };
}

/** Article/BlogPosting de una nota de Novedades. Se emite además del WebPage de Layout.astro, no en su lugar: son entidades distintas. */
export function articleSchema(opts: {
  site: URL;
  company: CompanyLike;
  canonical: string;
  title: string;
  summary: string;
  datePublished: string;
  image?: string;
}) {
  const { site, company, canonical, title, summary, datePublished, image } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: title,
    description: summary,
    datePublished,
    dateModified: datePublished,
    mainEntityOfPage: canonical,
    ...(image && { image: new URL(image, site).href }),
    author: { '@id': `${site.origin}/${ORG_ID}` },
    publisher: { '@id': `${site.origin}/${ORG_ID}` },
  };
}
