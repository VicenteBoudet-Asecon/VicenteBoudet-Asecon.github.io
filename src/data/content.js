// Contenido del sitio, en español e inglés.
//
// - `company`  : datos que no se traducen (teléfonos, dirección, cifras).
// - `team`     : las personas. El nombre y la foto no cambian; el cargo y el área
//                se guardan como clave y se traducen en `roles` / `groups`.
// - `content`  : todo lo traducible, con la misma forma en los dos idiomas.
//
// Para editar textos, este es el único archivo que hay que tocar.

export const company = {
  name: 'Asecon S.A.',
  founded: 1996,
  years: 30,
  // PENDIENTE — dotación sin confirmar, y por eso el sitio no la afirma.
  // Había tres cifras publicadas contradiciéndose: este campo decía 50, las
  // notas de los 30 años decían 28, y el array `team` de más abajo lista 30
  // personas. Ninguna estaba confirmada por el estudio, así que se retiró la
  // cifra de la copy en vez de elegir una. Al confirmarla: poner el número
  // acá, volver a redactar `credentials`/`teamPage` y las dos notas, y
  // retirar la regla 16 de scripts/validate.mjs que impide reintroducirla.
  headcount: null,
  practiceAreas: 8,
  cmfRegistry: '418',
  cmfSince: 2016,
  // Página institucional real de la CMF sobre el Registro de Inspectores de
  // Cuentas y Auditores Externos (verificada, no un buscador filtrado por
  // RUT que podamos armar mal): sirve de prueba verificable en /clientes.
  cmfRegistryUrl: 'https://www.cmfchile.cl/portal/principal/623/w4-propertyvalue-18538.html',
  phone1: '+562 2951 9191',
  phone2: '+562 2951 9192',
  email: 'info@aseconsa.com',
  address: 'Los Militares 5953 of. 302, Las Condes, Santiago, Chile.',
  // Los mismos datos de la dirección, estructurados: los usa el JSON-LD de
  // Layout.astro (antes los sacaba partiendo `address` por comas, frágil) y
  // los va a usar el aviso legal.
  addressStreet: 'Los Militares 5953 of. 302',
  addressLocality: 'Las Condes',
  addressRegion: 'Región Metropolitana',
  // Código postal y coordenadas: resueltos desde el propio enlace corto de
  // Google Maps que ya usa el sitio (mapUrl, abajo) — Google redirige
  // "Weid4zP3PUe5pLTdA" a la ficha "Los Militares 5953, oficina 302,
  // 7561282 Las Condes" con @-33.4058113,-70.5698828. No verificado por una
  // segunda fuente independiente; conviene confirmarlo si el estudio tiene
  // el dato de otra parte.
  addressPostalCode: '7561282',
  addressCountry: 'CL',
  geoLat: -33.4058113,
  geoLng: -70.5698828,
  mapUrl: 'https://maps.app.goo.gl/Weid4zP3PUe5pLTdA',
  linkedin: 'https://www.linkedin.com/company/aseconsa',

  // Fase 3 — capa legal. Los tres quedan vacíos a propósito: son datos que
  // solo el estudio puede entregar (el RUT, quién responde por el
  // tratamiento de datos, y por cuánto tiempo se conservan). Confirmados por
  // el usuario el 2026-09-29. LegalPage.astro los inserta en los textos
  // legales vía marcadores ({rut}, {razonSocial}, {retencion}...), así que
  // cambiarlos acá cambia las cuatro páginas legales en los dos idiomas.
  rut: '77.190.943-4',
  // Razón social del responsable del tratamiento (el marcador {razonSocial}).
  dataController: 'Asecon S.A.',
  // Datos de consultas que no se convierten en cliente. 24 meses desde el
  // último contacto: plazo estándar de proporcionalidad para un contacto
  // comercial; no hay una norma chilena que fije otro para este caso. Los
  // datos de clientes se rigen por la relación profesional y los plazos
  // tributarios (6 años), que la política explica aparte.
  retentionMonths: 24,
  // Identifica qué versión de la política de privacidad estaba vigente
  // cuando alguien marcó el consentimiento (viaja en el hidden
  // consent_version de LeadForm.astro). Subir este valor cada vez que el
  // texto de /privacidad cambie de forma material.
  privacyVersion: '2026-09-29',

  // Datos de activación de los canales nuevos. Vacíos a propósito: cada uno
  // se construye y se ve en preview (ver src/data/channels.js y
  // PUBLIC_PREVIEW_CHANNELS), pero no queda vivo hasta que Asecon entrega el
  // dato real y se completa acá. Nunca escribir un enlace a mano contra
  // estos campos: siempre a través de src/data/channels.js.
  whatsapp: '', // Dígitos E.164 sin '+', ej. '56912345678'.
  leadMagnetFile: '', // Ruta bajo /downloads/, ej. '/downloads/guia.pdf'.
};

// Cada persona declara de quién depende. `reportsTo: null` es la raíz del árbol.
//
// ESTRUCTURA PRELIMINAR. Confirmadas por la dirección: Jeanette sobre Rafael, y
// bajo Rafael se abren Thomas (Operaciones) y Fernanda (Impuestos). El resto de
// las dependencias las dedujo el sitio por disciplina y hay que revisarlas.
// Mientras `ESTRUCTURA_CONFIRMADA` sea false, el organigrama muestra un aviso.
// Para cambiar a alguien de jefatura basta editar su `reportsTo`.
export const ESTRUCTURA_CONFIRMADA = false;

export const team = [
  { id: 'jeanette-lewitt', name: 'Jeanette Lewitt', role: 'director', reportsTo: null, img: '/team/jeanette-lewitt.jpg' },
  { id: 'rafael-cohn', name: 'Rafael Cohn', role: 'ceo', reportsTo: 'jeanette-lewitt', img: '/team/rafael-cohn.jpg' },

  { id: 'thomas-taub', name: 'Thomas Taub', role: 'coo', reportsTo: 'rafael-cohn', img: '/team/thomas-taub.jpg' },
  // PENDIENTE: falta el apellido y la foto de Fernanda. Con `img: null` la
  // ficha se muestra con el monograma de iniciales en vez de una foto rota
  // (ver Team.astro) — no publicar una ruta que no existe en public/team/.
  { id: 'fernanda', name: 'Fernanda', role: 'directoraTributaria', reportsTo: 'rafael-cohn', img: null },

  { id: 'marco-del-rio', name: 'Marco A. Del Río', role: 'gerenteContabilidad', reportsTo: 'thomas-taub', img: '/team/marco-del-rio.jpg' },
  { id: 'antonio-agelvis', name: 'Antonio Agelvis', role: 'gerenteContabilidad', reportsTo: 'thomas-taub', img: '/team/antonio-agelvis.jpg' },
  { id: 'cristian-avila', name: 'Cristián Ávila', role: 'gerenteAuditoria', reportsTo: 'thomas-taub', img: '/team/cristian-avila.jpg' },
  { id: 'carolina-vera', name: 'Carolina Vera', role: 'gerenteRRHH', reportsTo: 'thomas-taub', img: '/team/carolina-vera.jpg' },
  { id: 'humprey-bublitz', name: 'Humprey Bublitz', role: 'gerenteTributario', reportsTo: 'fernanda', img: '/team/humprey-bublitz.jpg' },
  // Legal. Sin gerente de área identificado todavía; cuelga de Operaciones por
  // deducción, igual que Administración — PENDIENTE de confirmar.
  { id: 'valentina-oporto', name: 'Valentina Oporto', role: 'gerenteLegal', reportsTo: 'thomas-taub', img: '/team/valentina-oporto.jpg' },

  // Contabilidad. El reparto entre los dos gerentes está PENDIENTE de confirmar.
  { id: 'rolando-cachutt', name: 'Rolando Cachutt', role: 'supervisorContable', reportsTo: 'marco-del-rio', img: '/team/rolando-cachutt.jpg' },
  { id: 'margarita-valdivia', name: 'Margarita Valdivia', role: 'supervisorContable', reportsTo: 'marco-del-rio', img: '/team/margarita-valdivia.jpg' },
  { id: 'jessica-calderon', name: 'Jessica Calderón', role: 'seniorContabilidad', reportsTo: 'marco-del-rio', img: '/team/jessica-calderon.jpg' },
  { id: 'camila-conoman', name: 'Camila Coñoman', role: 'analistaContable', reportsTo: 'marco-del-rio', img: '/team/camila-conoman.jpg' },
  { id: 'daniela-sepulveda', name: 'Daniela Sepúlveda', role: 'analistaContable', reportsTo: 'marco-del-rio', img: '/team/daniela-sepulveda.jpg' },
  { id: 'julian-de-la-cerda', name: 'Julian De La Cerda', role: 'supervisorContable', reportsTo: 'antonio-agelvis', img: '/team/julian-de-la-cerda.jpg' },
  { id: 'nicole-fredes', name: 'Nicole Fredes', role: 'seniorContabilidad', reportsTo: 'antonio-agelvis', img: '/team/nicole-fredes.jpg' },
  { id: 'valentina-carcamo', name: 'Valentina Cárcamo', role: 'analistaContable', reportsTo: 'antonio-agelvis', img: '/team/valentina-carcamo.jpg' },
  { id: 'marian-barrios', name: 'Marian Barrios', role: 'analistaContable', reportsTo: 'antonio-agelvis', img: '/team/marian-barrios.jpg' },

  // Impuestos
  { id: 'osduald-suarez', name: 'Osduald Suarez', role: 'supervisorTributario', reportsTo: 'humprey-bublitz', img: '/team/osduald-suarez.jpg' },
  { id: 'wladimir-sanchez', name: 'Wladimir Sanchez', role: 'seniorTributario', reportsTo: 'humprey-bublitz', img: '/team/wladimir-sanchez.jpg' },
  { id: 'lucas-peretta', name: 'Lucas Peretta', role: 'asistenteTributario', reportsTo: 'humprey-bublitz', img: '/team/lucas-peretta.jpg' },
  { id: 'esteban-zurita', name: 'Esteban Zurita', role: 'asistenteTributario', reportsTo: 'humprey-bublitz', img: '/team/esteban-zurita.jpg' },

  // Auditoría
  { id: 'yeremy-rivera', name: 'Yeremy Rivera', role: 'asistenteAuditoria', reportsTo: 'cristian-avila', img: '/team/yeremy-rivera.jpg' },

  // Remuneraciones y RRHH
  { id: 'gisselle-correa', name: 'Gisselle Correa', role: 'supervisorRRHH', reportsTo: 'carolina-vera', img: '/team/gisselle-correa.jpg' },
  { id: 'evelyn-escobar', name: 'Evelyn Escobar', role: 'analistaRRHH', reportsTo: 'carolina-vera', img: '/team/evelyn-escobar.jpg' },
  { id: 'mitzi-caro', name: 'Mitzi Caro', role: 'analistaRRHH', reportsTo: 'carolina-vera', img: '/team/mitzi-caro.jpg' },

  // Administración. Cuelga de Operaciones por deducción, PENDIENTE de confirmar.
  { id: 'rodrigo-torres', name: 'Rodrigo Torres', role: 'asistenteAdmin', reportsTo: 'thomas-taub', img: '/team/rodrigo-torres.jpg' },
  { id: 'elisa-carvajal', name: 'Elisa Carvajal', role: 'secretaria', reportsTo: 'thomas-taub', img: '/team/elisa-carvajal.jpg' },
  { id: 'ulises-murua', name: 'Ulises Murua', role: 'tramitador', reportsTo: 'thomas-taub', img: '/team/ulises-murua.jpg' },
];

/** Quienes dependen directamente de `id` (o la raiz si se pasa null). */
export function childrenOf(id) {
  return team.filter((t) => t.reportsTo === id);
}

/** Todas las personas colgando de `id`, en cualquier nivel. */
export function descendantsOf(id) {
  return childrenOf(id).flatMap((h) => [h, ...descendantsOf(h.id)]);
}

/** El arbol completo, listo para recorrer. */
export function orgTree() {
  const armar = (persona) => ({ ...persona, hijos: childrenOf(persona.id).map(armar) });
  return childrenOf(null).map(armar);
}

/** Un gerente es donde se detiene la apertura inicial del organigrama. */
export function isGerente(persona) {
  return persona.role.startsWith('gerente');
}

const es = {
  tagline: 'Estudio Tributario Contable Auditorías',

  nav: {
    home: 'Inicio',
    services: 'Servicios',
    clients: 'Clientes',
    seal: 'Sello Asecon',
    technology: 'Tecnología',
    team: 'Nuestro Equipo',
    news: 'Novedades',
    contact: 'Contacto',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    legal: 'Aviso legal',
    terms: 'Términos',
  },

  ui: {
    skipToContent: 'Saltar al contenido',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    menuLabel: 'Navegación principal',
    switchTo: 'View this page in English',
    people: 'personas',
    viewAllServices: 'Ver todos los servicios',
    requestInfo: 'Solicitar más información',
    viewServices: 'Ver servicios',
    meetTheTeam: 'Conocer al equipo',
    learnAboutSeal: 'Conoce el Sello Asecon',
    goToContact: 'Ir a Contacto',
    backHome: 'Volver al inicio',
    allRightsReserved: 'Todos los derechos reservados.',
    // Nombres de las dos <nav> del footer: cada landmark de navegación
    // necesita uno distinto, y distinto del menú del header (menuLabel).
    footerNavLabel: 'Secciones del sitio',
    legalNavLabel: 'Información legal',
    // CTA del hero: lleva a /contacto, el mismo destino que el resto del
    // sitio, y la etiqueta dice exactamente eso.
    writeToUs: 'Escríbenos',
    // Estado "maqueta" de un canal sin activar, solo visible con
    // PUBLIC_PREVIEW_CHANNELS=1 (nunca en producción).
    channelPending: 'Este canal está en construcción — visible solo en esta vista previa.',
    orPrefer: 'o si prefieres',
    pauseVideo: 'Pausar video',
    playVideo: 'Reproducir video',
    // Footer: mismo dato que company.cmfRegistry, con el rótulo traducido.
    footerCmf: 'Registro CMF N° {n}',
  },

  // Copy de los canales de contacto reutilizables (ChannelLinks, StickyCta).
  // El destino de cada uno sale de src/data/channels.js, nunca de acá.
  channels: {
    call: 'Llamar',
    whatsapp: 'WhatsApp',
    email: 'Escribir',
    whatsappPrefill: 'Hola, te escribo desde aseconsa.com. Quisiera conversar sobre mi empresa.',
  },

  // Banner de consentimiento (Fase 4). Postura estricta: gtag/js no se pide
  // a la red hasta que la persona aprieta "Aceptar" — ver
  // src/scripts/analytics.js. Solo aparece si PUBLIC_GA4_ID tiene valor (o
  // en preview de canales): sin una propiedad de GA4 no hay nada que medir
  // ni de qué pedir consentimiento.
  consent: {
    body: 'Usamos Google Analytics para entender cómo se usa este sitio. Solo se activa si lo aceptas.',
    accept: 'Aceptar',
    reject: 'Rechazar',
    link: 'Ver política de cookies',
    manage: 'Preferencias de cookies',
  },

  credentials: {
    label: 'Respaldo',
    items: [
      { value: 'N° 418', label: 'Registro CMF de Auditores Externos, desde 2016' },
      { value: '1996', label: 'Año de fundación en Santiago de Chile' },
      { value: '8', label: 'Áreas de práctica, de contabilidad a representación de extranjeras' },
      { value: 'Siempre', label: 'Garantía Sello Asecon sobre nuestra gestión' },
    ],
  },

  hero: {
    eyebrow: 'Estudio Tributario Contable Auditorías · Desde 1996',
    title: ['Nos hacemos cargo,', 'para que tú solo', 'te preocupes de crecer.'],
    body:
      'Contabilidad, impuestos y auditoría para empresas extranjeras que operan en Chile, family offices y compañías en crecimiento. Con garantía siempre vigente sobre nuestra gestión.',
  },

  teamStrip: {
    eyebrow: 'Conoce Asecon',
    title: ['Un equipo con', 'visión y cercanía'],
    alt: 'Equipo de Asecon en una reunión de trabajo en la oficina',
    body:
      '30 años trabajando con las mismas empresas no se sostienen con procesos: se sostienen con gente que conoce cada caso por dentro.',
  },

  servicesTeaser: {
    eyebrow: 'Índice de servicios',
    title: 'Nuestros servicios.',
    body: '8 áreas de práctica, cada una con altos estándares de calidad y garantía siempre vigente.',
    ui: {
      prev: 'Servicios anteriores',
      next: 'Servicios siguientes',
    },
  },

  // Cierre de la home: formulario corto + canales alternativos, en vez de la
  // franja CtaBanner que usan el resto de las páginas (acá conviene bajar un
  // paso el esfuerzo de contactar, no solo repetir el teléfono).
  homeForm: {
    eyebrow: 'Hablemos',
    title: ['¿Conversamos', 'sobre tu empresa?'],
    body: 'Cuéntanos en pocas palabras qué necesitas y te contactamos, o elige el canal que prefieras.',
  },

  services: {
    eyebrow: 'Servicios',
    title: ['8 áreas', 'de práctica'],
    body:
      'Un solo estudio para la contabilidad, los impuestos, la auditoría y las remuneraciones de tu empresa.',
    ui: {
      indexLabel: 'Áreas de práctica',
      includesLabel: 'Qué incluye',
      askAboutArea: 'Consultar por esta área',
    },
  },

  clients: {
    eyebrow: 'Cartera de clientes',
    title: ['Confianza y', 'confidencialidad'],
    body:
      'Pilares de nuestra relación con cada cliente. Protegemos tu información con el máximo cuidado y profesionalismo.',
    // Cada tipo lleva una línea concreta de qué resolvemos ahí — no una
    // cifra ni un caso inventado, solo el alcance real del servicio.
    types: [
      { name: 'Empresas productivas', resolves: 'Contabilidad, costos y cumplimiento tributario para la operación diaria.' },
      { name: 'Empresas de servicios', resolves: 'Facturación, remuneraciones y reportería para equipos que crecen rápido.' },
      { name: 'Empresas de inversión', resolves: 'Estados financieros y estructura societaria del vehículo de inversión.' },
      { name: 'PYME', resolves: 'Contabilidad y obligaciones tributarias sin necesidad de un equipo interno.' },
      { name: 'Empresas extranjeras', resolves: 'Constitución, representación legal y cumplimiento para operar en Chile.' },
      { name: 'Agencias', resolves: 'Contabilidad y cumplimiento para sucursales y agencias de matrices extranjeras.' },
      { name: 'OSFL', resolves: 'Contabilidad y rendición de cuentas conforme a la normativa de organizaciones sin fines de lucro.' },
      { name: 'Family office', resolves: 'Consolidación patrimonial y reportería entre las distintas entidades de la familia.' },
      { name: 'Gerentes y rentistas', resolves: 'Declaración de renta y planificación tributaria personal.' },
      { name: 'Inversionistas de alto patrimonio', resolves: 'Estructuración patrimonial y asesoría tributaria sobre inversiones.' },
    ],
    // Logos con nombre real de cliente: vacío a propósito hasta que el
    // estudio autorice cuáles pueden mostrarse. Clients.astro no renderiza
    // nada mientras esté vacío — nunca un <img> a un logo que no existe.
    logos: [],
    // Prueba verificable en vez de testimonios anónimos: lo que cualquiera
    // puede comprobar por su cuenta, con enlace a la fuente pública.
    proof: {
      label: 'Lo que se puede verificar',
      cmf: 'Registro CMF de Auditores Externos N° {n}, desde {year}',
      cmfCta: 'Ver el registro',
      founded: 'Fundada en {year}, {years} años de operación continua',
      seal: 'Garantía Sello Asecon sobre toda nuestra gestión',
    },
  },

  // Los dos testimonios que había acá eran de "Cliente anónimo": para un
  // estudio contable eso resta credibilidad en vez de sumarla. Se retiran;
  // la prueba social de /clientes pasa a ser clients.proof (verificable) en
  // vez de una cita sin nombre. Testimonials.astro no renderiza nada
  // mientras este arreglo esté vacío.
  testimonials: {
    eyebrow: 'Testimonios',
    title: ['Lo que dicen', 'de nosotros'],
    items: [],
  },

  seal: {
    eyebrow: 'Sello Asecon',
    title: ['Nos hacemos cargo,', 'siempre'],
    body1:
      'Nuestra gestión se basa en entender en profundidad a nuestros clientes y entregar una atención personalizada, cuidando cada detalle para ofrecer soluciones eficaces en cada caso.',
    body2:
      'Nuestro mayor activo es la confianza que construimos con cada cliente. Nuestros servicios cumplen altos estándares de calidad y garantizamos siempre nuestro trabajo, haciéndonos cargo de cualquier giro o multa generado como resultado de nuestra gestión.',
    teaserBody:
      'Nuestro mayor activo es la confianza que construimos con cada cliente. Garantizamos siempre nuestro trabajo, haciéndonos cargo de cualquier giro o multa generado como resultado de nuestra gestión.',
    yearsLabel: 'años',
    officeAlt: 'Oficinas de Asecon en {address}',
    ringText: 'SELLO ASECON - GARANTIZADO - ',
  },

  // BORRADOR: cada punto describe una práctica habitual en estudios que
  // incorporan tecnología a su operación. Falta confirmar con el equipo cuáles
  // aplican tal cual a Asecon (y ajustar el detalle) antes de publicar esta
  // página en el dominio real.
  technology: {
    eyebrow: 'Tecnología',
    title: ['Tecnología que', 'sostiene el trabajo'],
    body:
      'Incorporamos herramientas y automatización donde de verdad ahorran tiempo y reducen el margen de error, para que el criterio profesional del equipo se concentre en lo que un software no puede resolver.',
    items: [
      {
        icon: 'portal',
        title: 'Portal de clientes',
        body: 'Acceso en línea a reportes, comprobantes y el estado de cada trámite, sin depender de ir y venir por correo.',
      },
      {
        icon: 'automation',
        title: 'Automatización de procesos contables y tributarios',
        body: 'Conciliaciones, cálculos y declaraciones recurrentes corren con apoyo de software, liberando horas del equipo para el análisis y el criterio, no para la digitación.',
      },
      {
        icon: 'integration',
        title: 'Integración con el SII y bancos',
        body: 'Conexión con las plataformas que usamos todos los días, para reducir la carga manual y el margen de error humano.',
      },
      {
        icon: 'reporting',
        title: 'Reportería en tiempo real',
        body: 'Tableros que se actualizan solos, en vez de un reporte fijo que llega una vez al mes.',
      },
      {
        icon: 'signature',
        title: 'Firma electrónica y gestión documental',
        body: 'Flujos de aprobación y archivo sin papel, trazables y fáciles de auditar.',
      },
      {
        icon: 'security',
        title: 'Seguridad de la información',
        body: 'Control de acceso y respaldo sobre la información financiera de cada cliente, tratada con el mismo cuidado que un banco.',
      },
    ],
  },

  teamPage: {
    eyebrow: 'Personal',
    title: ['Nuestro', 'Equipo'],
    body:
      'Dirección, gerencia, supervisión, equipo técnico y soporte.',
  },

  roles: {
    ceo: 'CEO',
    director: 'Director',
    coo: 'Director de Operaciones',
    directoraTributaria: 'Directora de Impuestos',
    gerenteContabilidad: 'Gerente Contabilidad',
    gerenteAuditoria: 'Gerente Auditoría',
    gerenteTributario: 'Gerente Impuestos',
    gerenteRRHH: 'Gerente RRHH',
    gerenteLegal: 'Abogada Senior Laboral',
    supervisorContable: 'Supervisor Contable',
    supervisorRRHH: 'Supervisor RRHH',
    supervisorTributario: 'Supervisor Impuestos',
    seniorContabilidad: 'Senior Contabilidad',
    seniorTributario: 'Senior Impuestos',
    analistaContable: 'Analista Contable',
    analistaRRHH: 'Analista RRHH',
    asistenteTributario: 'Asistente Impuestos',
    asistenteAuditoria: 'Asistente Auditoría',
    asistenteAdmin: 'Asistente Administrativo',
    secretaria: 'Secretaria Administrativa',
    tramitador: 'Tramitador',
  },

  // Franja de cierre. Una línea distinta por página: repetir la misma frase en
  // las cinco la volvía relleno. El "tomemos un café" queda solo en Contacto,
  // que es donde de verdad es una invitación.
  news: {
    eyebrow: 'Novedades',
    title: ['Lo que estamos', 'mirando'],
    body:
      'Notas breves sobre el estudio, la normativa que seguimos de cerca y las preguntas que más nos llegan. Escritas por el equipo, sin relleno.',
    readMore: 'Leer la nota',
    readingTime: '{n} min de lectura',
    filterLabel: 'Filtrar',
    allCategories: 'Todas',
    noMatches: 'No hay notas en esta categoría.',
    backToList: 'Volver a Novedades',
    empty: 'Todavía no hay notas publicadas.',
    publishedOn: 'Publicado el',
    alsoRead: 'Otras notas',
    resultsLabel: '{n} notas encontradas',
  },

  // Franja de descarga (Novedades y al pie de Servicios). Mientras
  // company.leadMagnetFile esté vacío, LeadMagnet.astro no renderiza nada:
  // en un sitio estático no hay forma de ofrecer una descarga que no existe.
  leadMagnet: {
    eyebrow: 'Guía descargable',
    title: ['Un checklist', 'para tu cierre anual'],
    body: 'Los puntos que revisamos con cada cliente antes de cerrar el año. Déjanos tu correo y te la enviamos.',
    bullets: [
      'Plazos y formularios clave del período.',
      'Documentación que conviene tener ordenada antes del cierre.',
      'Errores frecuentes que generan observaciones del SII.',
    ],
    formCta: 'Enviar y recibir la guía',
    fileLabel: 'Descargar la guía (PDF)',
  },

  org: {
    direccion: 'Dirección',
    gerencia: 'Gerencia',
    equipo: 'Equipo',
    peopleCount: '{n} personas',
    onePerson: '1 persona',
    showAll: 'Ver al resto del equipo',
    showLess: 'Ver menos',
    draftTitle: 'Estructura preliminar',
    draftBody:
      'La estructura está en revisión. Las dependencias de dirección están confirmadas; las de los equipos se dedujeron por disciplina y pueden cambiar.',
  },

  cta: {
    action: 'Escríbenos',
    home: '¿Conversamos sobre tu empresa?',
    services: '¿Cuál de estas áreas necesitas resolver?',
    clients: '¿Tu empresa calza con alguno de estos perfiles?',
    seal: '¿Quieres el Sello Asecon sobre tu contabilidad?',
    technology: '¿Quieres saber cómo aplicamos esto a tu empresa?',
    team: '¿Quieres hablar con alguien del equipo?',
  },

  contact: {
    eyebrow: 'Contacto',
    title: ['Tomemos un café', 'y conversemos'],
    body:
      'Completa el formulario y un miembro de nuestro equipo se pondrá en contacto contigo a la brevedad.',
    // Rescatado de la página /agendar cuando se retiró el agendamiento en
    // línea: el texto no hablaba de la herramienta sino de la reunión, y acá
    // sí lo lee alguien (esa página estaba fuera del menú y del sitemap).
    whatHappensTitle: '¿Qué pasa en esta primera conversación?',
    whatHappensItems: [
      'Entendemos tu operación y qué necesitas resolver primero.',
      'Te explicamos cómo trabajaríamos y qué información vamos a pedirte.',
      'Sales con los próximos pasos claros, sin compromiso.',
    ],
    labels: {
      phone: 'Teléfono',
      email: 'Email',
      office: 'Oficina',
      linkedin: 'LinkedIn',
      linkedinCta: 'Novedades en LinkedIn',
      name: 'Nombre y apellido',
      type: 'Tipo',
      typePlaceholder: 'Seleccionar una opción',
      typeCompany: 'Empresa',
      typeIndividual: 'Particular',
      emailField: 'Email',
      emailPlaceholder: 'tu@correo.com',
      phoneField: 'Teléfono (opcional)',
      phonePlaceholder: '+56 9 1234 5678',
      area: 'Área de interés (opcional)',
      areaPlaceholder: 'Prefiero no especificar',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos en qué podemos ayudarte',
      // Tres partes para poder enlazar solo el nombre de la política dentro
      // de la frase, igual que el patrón [before, accent] de otros títulos.
      consent: ['He leído y acepto la ', 'política de privacidad', '.'],
      submit: 'Enviar solicitud',
    },
    subject: 'Nuevo contacto desde aseconsa.com',
    // Asuntos distintos según de dónde vino el lead: así el equipo distingue
    // el canal con solo mirar la bandeja, sin abrir el correo.
    subjectHome: 'Nuevo contacto rápido desde la home de aseconsa.com',
    subjectMagnet: 'Solicitud de guía descargable — aseconsa.com',
    sendingLabel: 'Enviando tu solicitud…',
    devNotice:
      'Aviso solo visible en desarrollo: falta definir PUBLIC_WEB3FORMS_KEY en el archivo .env, por lo que el formulario todavía no entrega los mensajes. Ver .env.example.',
    // Visible en TODOS los entornos mientras el formulario no esté activo
    // (a diferencia de devNotice, que es solo para quien desarrolla). Es lo
    // que evita que el visitante escriba al vacío sin enterarse.
    unavailable: {
      title: 'El formulario todavía no está activo',
      body: 'Mientras lo activamos, escríbenos directo por estas vías y te respondemos igual de rápido.',
      ctaPhone: 'Llámanos',
      ctaMail: 'Escríbenos',
    },
    // Cuando el envío por fetch falla (red o Web3Forms): un botón de
    // reintento y las vías que sí funcionan hoy, con lo escrito no perdido.
    error: {
      title: 'No pudimos enviar tu mensaje',
      body: 'Puede ser la conexión. Intenta de nuevo, o escríbenos directo por estas vías — no perdimos lo que escribiste.',
      retry: 'Reintentar',
      viaMail: 'Enviar por correo',
      viaWhatsapp: 'Enviar por WhatsApp',
    },
  },

  thanks: {
    eyebrow: 'Mensaje recibido',
    title: ['Gracias por', 'escribirnos'],
    body:
      'Recibimos tu solicitud. Un miembro de nuestro equipo se pondrá en contacto contigo a la brevedad para conversar en detalle.',
    urgentLabel: '¿Es urgente?',
    // Solo aparece cuando se llega desde el formulario de la guía
    // descargable Y company.leadMagnetFile tiene un archivo real.
    downloadTitle: 'Tu guía está lista',
    downloadBody: 'Descárgala ahora; también te la enviamos por correo.',
  },

  notFound: {
    eyebrow: 'Error 404',
    heading: 'Esta página no existe',
    body: 'El enlace puede estar roto o la página cambió de dirección. Volvamos a un lugar conocido.',
  },

  // Capa legal. Vigente desde el 2026-09-29: estructura estándar de la Ley
  // 19.628 y de la Ley 21.719 (vigente desde el 1 de diciembre de 2026),
  // más el RGPD porque Asecon capta clientes en la UE/EEE (sin establecimiento
  // ahí: art. 27.2). Los datos del estudio llegan desde `company` vía
  // marcadores. Pendiente, sin bloquear: la revisión de un abogado — hasta
  // entonces las páginas siguen con noindex y fuera del sitemap. Si cambian
  // los proveedores que reciben datos, cambian también "Con quién los
  // compartimos" y "Transferencias internacionales", y sube privacyVersion.
  legal: {
    updatedLabel: 'Última actualización:',
    updated: '29 de septiembre de 2026',
    // Las cuatro páginas legales ya no son borrador (decisión del usuario,
    // 2026-09-29): los datos del estudio están completos y el texto rige.
    // Siguen con noindex y fuera del sitemap hasta que un abogado confirme
    // que las revisó — ver NOINDEX en scripts/validate.mjs y la fila
    // "Legales indexables" del runbook del README. Si algún día hay que
    // volver a marcarlas como borrador, `draft: true` muestra el aviso.
    draft: false,
    draftTitle: 'Borrador pendiente de revisión',
    draftBody:
      'Este texto está pendiente de revisión y no debe tratarse como la versión vigente hasta que se confirme.',
    // Los textos de abajo usan marcadores que LegalPage.astro reemplaza con
    // los datos de `company` (arriba en este archivo), para que el RUT, la
    // dirección, el correo y el plazo de conservación vivan en un solo
    // lugar: {razonSocial} {rut} {direccion} {email} {cmf} {retencion}.
    privacy: {
      metaTitle: 'Política de Privacidad | Asecon S.A.',
      metaDescription:
        'Qué datos personales recopila Asecon S.A. en este sitio, para qué los usa, con quién los comparte, cuánto tiempo los conserva y cómo ejercer tus derechos.',
      eyebrow: 'Legal',
      title: 'Política de Privacidad',
      intro:
        'Esta política explica qué datos personales recopila {razonSocial} a través de aseconsa.com, para qué los usa, con quién los comparte, por cuánto tiempo los conserva y cómo puedes ejercer tus derechos. Se rige por la Ley N° 19.628 sobre Protección de la Vida Privada y, desde su entrada en vigencia el 1 de diciembre de 2026, por las modificaciones que introduce la Ley N° 21.719. Para quienes se encuentran en la Unión Europea o el Espacio Económico Europeo se aplica además el Reglamento General de Protección de Datos (RGPD).',
      sections: [
        {
          heading: 'Responsable del tratamiento',
          body: [
            '{razonSocial}, RUT {rut}, con domicilio en {direccion}, es la responsable del tratamiento de los datos personales que se recopilan a través de este sitio.',
            'Para cualquier consulta o solicitud sobre tus datos personales, escríbenos a {email} indicando en el asunto "Datos personales".',
          ],
        },
        {
          heading: 'Qué datos recopilamos',
          body: [
            'Formulario de contacto: nombre, correo electrónico, teléfono (opcional), tipo de contacto (empresa o particular), el área de servicio que te interesa y el mensaje que escribas.',
            'Formulario de la guía descargable: nombre y correo electrónico.',
            'Junto con cada formulario se envían datos técnicos que nos ayudan a responderte bien: el idioma del sitio, la página desde la que escribiste, el formulario que usaste y la versión de esta política que aceptaste al marcar la casilla de consentimiento.',
            'Datos de navegación: solo si lo aceptas en el aviso de cookies, Google Analytics registra datos de uso del sitio (páginas visitadas, tipo de dispositivo y navegador, ubicación aproximada y un identificador seudónimo). Además, como cualquier servidor web, nuestro proveedor de alojamiento registra de forma automática datos técnicos de cada visita, como la dirección IP y el navegador, para operar y proteger el sitio.',
            'No solicitamos datos sensibles. Te pedimos no incluir en el mensaje información sensible ni antecedentes financieros o tributarios detallados: si tu consulta los requiere, te los pediremos por un canal adecuado una vez que te contactemos.',
          ],
        },
        {
          heading: 'Para qué los usamos y con qué fundamento',
          body: [
            'Para responder tu consulta y, si corresponde, preparar una propuesta de servicios. El fundamento es tu consentimiento, que otorgas al marcar la casilla del formulario, y las gestiones previas a un posible contrato que tú mismo solicitaste.',
            'Para enviarte la guía que pediste. El fundamento es tu consentimiento.',
            'Para medir el uso del sitio y mejorarlo, solo con tu consentimiento previo en el aviso de cookies. Puedes retirarlo en cualquier momento desde "Preferencias de cookies", al pie de cada página.',
            'Para mantener la seguridad y el funcionamiento del sitio, mediante los registros técnicos del servidor y los reportes automáticos de seguridad del navegador (estos últimos no incluyen datos personales). El fundamento es nuestro interés legítimo en proteger el sitio y a quienes lo usan.',
            'No usamos tus datos para enviarte publicidad ni boletines que no hayas pedido, no los vendemos ni los cedemos a terceros para sus propios fines, y no tomamos decisiones automatizadas ni elaboramos perfiles a partir de ellos.',
          ],
        },
        {
          heading: 'Con quién los compartimos',
          body: [
            'Para operar este sitio trabajamos con proveedores que tratan datos por encargo nuestro, solo para los fines indicados en esta política:',
            'Web3Forms (Estados Unidos): recibe los formularios y los reenvía a nuestro correo. Puede conservar una copia del envío conforme a su propia política de privacidad.',
            'Microsoft (Microsoft 365): aloja el correo electrónico del estudio, donde llegan los mensajes de los formularios.',
            'Netlify (Estados Unidos): aloja el sitio y registra los datos técnicos de cada visita.',
            'Google (Estados Unidos): provee Google Analytics, solo si aceptaste la medición en el aviso de cookies.',
            'También podemos comunicar datos a autoridades públicas cuando una ley o una resolución judicial lo exija.',
          ],
        },
        {
          heading: 'Transferencias internacionales',
          body: [
            'Algunos de estos proveedores tratan los datos fuera de Chile, principalmente en Estados Unidos. Al enviar un formulario, tus datos se transfieren a ellos con los fines descritos en esta política.',
            'En esos casos nos apoyamos en las garantías que ofrece cada proveedor para la transferencia internacional de datos, como las cláusulas contractuales tipo o, cuando corresponde, su adhesión al Marco de Privacidad de Datos UE–EE.UU. (EU–U.S. Data Privacy Framework).',
          ],
        },
        {
          heading: 'Plazo de conservación',
          body: [
            'Consultas y solicitudes de la guía: conservamos los datos durante {retencion} meses desde nuestro último contacto contigo y luego los eliminamos o anonimizamos.',
            'Si pasas a ser cliente, tus datos se rigen por la relación profesional: se conservan mientras dure y, después, durante los plazos que exija la ley. Por ejemplo, la documentación tributaria se conserva al menos seis años (artículos 17 y 200 del Código Tributario).',
            'Datos de medición de Google Analytics: 14 meses. Registros técnicos del alojamiento: el plazo que fija Netlify para la operación y la seguridad de su servicio.',
            'Si nos pides suprimir tus datos antes de esos plazos, lo haremos, salvo que una obligación legal nos exija conservarlos.',
          ],
        },
        {
          heading: 'Tus derechos',
          body: [
            'Puedes ejercer en cualquier momento, y sin costo, tus derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo de tus datos personales. También puedes retirar el consentimiento que hayas otorgado, sin que eso afecte el tratamiento realizado antes de retirarlo.',
            'Para ejercerlos, escríbenos a {email} con el asunto "Datos personales", indicando qué derecho quieres ejercer. Para proteger tus datos, podemos pedirte que acredites tu identidad antes de responder.',
            'Acusaremos recibo y responderemos dentro del plazo legal. Desde el 1 de diciembre de 2026, ese plazo es de 30 días corridos, prorrogable por una sola vez por otros 30 días, conforme a la Ley N° 21.719; hasta esa fecha rige el plazo del artículo 16 de la Ley N° 19.628.',
            'Si no respondemos dentro de plazo o no estás de acuerdo con la respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales desde que entre en funciones o, hasta entonces, ante los tribunales conforme a la Ley N° 19.628. Si te encuentras en la Unión Europea o el Espacio Económico Europeo, también puedes presentar un reclamo ante la autoridad de control de protección de datos de tu país.',
          ],
        },
        {
          heading: 'Personas en la Unión Europea',
          body: [
            '{razonSocial} no tiene establecimiento en la Unión Europea. Como el tratamiento de datos de residentes en la Unión a través de este sitio es ocasional y no incluye datos sensibles a gran escala, no hemos designado un representante en la Unión, conforme al artículo 27.2 del RGPD. Las consultas desde la Unión Europea se atienden en {email}.',
          ],
        },
        {
          heading: 'Seguridad de la información',
          body: [
            'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: todo el sitio funciona sobre una conexión cifrada (HTTPS), el acceso a los mensajes está restringido al personal del estudio que los necesita para responder, y trabajamos con proveedores que aplican estándares de seguridad reconocidos. Si ocurriera un incidente de seguridad que afecte tus datos, lo informaremos conforme a la ley.',
          ],
        },
        {
          heading: 'Menores de edad',
          body: [
            'Este sitio está dirigido a empresas y a personas adultas. No recopilamos a sabiendas datos de menores de 14 años; si detectamos que los recibimos, los eliminaremos.',
          ],
        },
        {
          heading: 'Cambios a esta política',
          body: [
            'Podemos actualizar esta política para reflejar cambios legales o en el funcionamiento del sitio. La versión vigente es siempre la publicada en esta página, con su fecha de actualización. Si el cambio es relevante, lo indicaremos de forma visible en el sitio.',
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'Política de Cookies | Asecon S.A.',
      metaDescription: 'Qué cookies y tecnologías similares usa este sitio, para qué, y cómo aceptarlas, rechazarlas o cambiar tu decisión.',
      eyebrow: 'Legal',
      title: 'Política de Cookies',
      intro:
        'Esta política explica qué cookies y tecnologías similares usa aseconsa.com, para qué sirven y cómo puedes aceptarlas, rechazarlas o cambiar tu decisión.',
      sections: [
        {
          heading: 'Qué son',
          body: [
            'Una cookie es un pequeño archivo que un sitio guarda en tu navegador. El almacenamiento local del navegador (localStorage y sessionStorage) cumple una función parecida, sin enviar nada al servidor. Aquí explicamos los dos.',
          ],
        },
        {
          heading: 'Técnicas: necesarias para que el sitio funcione',
          body: [
            'Este sitio no coloca cookies propias. Solo usa el almacenamiento de tu navegador para lo siguiente, sin necesidad de consentimiento:',
            '"asecon-consent-v1" (almacenamiento local): recuerda si aceptaste o rechazaste la medición, para no volver a preguntarte en cada página. Se conserva hasta que la borres o cambies tu decisión.',
            '"asecon-lead-draft" (almacenamiento local): solo si el envío de un formulario falla, guarda un borrador de lo que escribiste para que no tengas que redactarlo de nuevo. Se borra cuando el envío se completa y nunca se envía a ningún servidor; también puedes eliminarlo borrando los datos de este sitio en tu navegador.',
            '"asecon-lead-fired" (almacenamiento de sesión): evita que un mismo envío se cuente dos veces en la medición. Se borra al cerrar la pestaña.',
          ],
        },
        {
          heading: 'Analíticas: solo con tu consentimiento',
          body: [
            'Usamos Google Analytics 4 para entender cómo se usa el sitio y mejorarlo. Nada de Google se carga hasta que aceptas la medición en el aviso de cookies: si la rechazas, no se instala ninguna cookie de medición.',
            '"_ga" (Google, 2 años): distingue a los visitantes con un identificador seudónimo.',
            '"_ga_<ID>" (Google, 2 años): mantiene el estado de la sesión.',
            'Los datos de medición se conservan 14 meses en Google Analytics. Google actúa como proveedor por encargo de Asecon S.A. (ver la Política de Privacidad).',
          ],
        },
        {
          heading: 'Cómo cambiar tu decisión',
          body: [
            'Puedes cambiar tu decisión en cualquier momento desde "Preferencias de cookies", al pie de cada página. Si retiras el consentimiento, dejamos de medir y borramos de tu navegador las cookies de Google Analytics.',
            'También puedes borrar o bloquear cookies desde la configuración de tu navegador. Hacerlo no afecta el envío de los formularios.',
          ],
        },
        {
          heading: 'Terceros',
          body: [
            'Al enviar un formulario, tus datos llegan a Web3Forms, que los reenvía a nuestro correo (ver la Política de Privacidad). Ni Web3Forms ni nuestro proveedor de alojamiento instalan cookies en tu navegador.',
          ],
        },
      ],
    },
    notice: {
      metaTitle: 'Aviso Legal | Asecon S.A.',
      metaDescription: 'Titularidad, propiedad intelectual y condiciones de uso del sitio aseconsa.com.',
      eyebrow: 'Legal',
      title: 'Aviso Legal',
      intro: 'Este aviso identifica al titular de este sitio y las condiciones generales bajo las que puede usarse.',
      sections: [
        {
          heading: 'Titularidad del sitio',
          body: [
            'Este sitio (aseconsa.com) es operado por {razonSocial}, RUT {rut}, con domicilio en {direccion}, inscrita en el Registro de Inspectores de Cuentas y Auditores Externos de la CMF bajo el N° {cmf}. Contacto: {email}.',
          ],
        },
        {
          heading: 'Objeto del sitio',
          body: [
            'Este sitio entrega información institucional sobre {razonSocial} y sus servicios, y un medio de contacto. No presta servicios contables, tributarios ni legales directamente a través del sitio: esos servicios se prestan mediante un mandato profesional independiente de este sitio.',
          ],
        },
        {
          heading: 'Propiedad intelectual',
          body: [
            'Los contenidos de este sitio (textos, imágenes, marca, logotipo y el Sello Asecon) son propiedad de {razonSocial} o se usan con la autorización correspondiente. No está permitida su reproducción sin autorización previa.',
          ],
        },
        {
          heading: 'Limitación de responsabilidad',
          body: [
            'La información publicada en este sitio es de carácter general y referencial. No constituye asesoría profesional para un caso particular ni sustituye una consulta directa con el estudio.',
          ],
        },
        {
          heading: 'Ley aplicable y jurisdicción',
          body: [
            'Este aviso se rige por las leyes de la República de Chile. Cualquier controversia relativa al uso de este sitio se someterá a los tribunales ordinarios de justicia de Santiago, sin perjuicio de los derechos que la ley reconozca a los consumidores.',
          ],
        },
      ],
    },
    terms: {
      metaTitle: 'Términos de Uso | Asecon S.A.',
      metaDescription: 'Condiciones de uso del sitio aseconsa.com.',
      eyebrow: 'Legal',
      title: 'Términos de Uso',
      intro: 'Al usar este sitio, aceptas las siguientes condiciones.',
      sections: [
        {
          heading: 'Aceptación de los términos',
          body: [
            'El uso de este sitio implica la aceptación de estos términos y de la Política de Privacidad. Si no estás de acuerdo, te pedimos no usar el sitio.',
          ],
        },
        {
          heading: 'Uso permitido',
          body: [
            'Puedes navegar el sitio, consultar sus contenidos y contactarnos a través de los medios dispuestos para ello. No está permitido un uso que busque vulnerar su seguridad o extraer contenido de forma automatizada sin autorización.',
          ],
        },
        {
          heading: 'Enlaces a terceros',
          body: [
            'Este sitio enlaza a servicios de terceros (por ejemplo, LinkedIn o Google Maps). {razonSocial} no controla ni se responsabiliza por el contenido o las prácticas de privacidad de esos sitios externos.',
          ],
        },
        {
          heading: 'Modificaciones',
          body: [
            'Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página.',
          ],
        },
        {
          heading: 'Contacto',
          body: [
            'Ante cualquier consulta sobre estos términos, escribe a {email}.',
          ],
        },
      ],
    },
  },

  // FAQPage (Fase 5), en Servicios y Contacto. Vacío a propósito: son
  // respuestas sobre tributación y contabilidad, y esas las tiene que
  // escribir o aprobar el estudio — no algo que corresponda inventar acá.
  // FAQ.astro no renderiza nada ni emite el JSON-LD mientras items esté
  // vacío.
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: ['Preguntas', 'frecuentes'],
    items: [],
  },

  meta: {
    homeTitle: 'Asecon S.A. | Estudio Tributario Contable Auditorías',
    homeDescription:
      'Estudio Tributario Contable Auditorías con más de 30 años de experiencia en Contabilidad, Impuestos, Auditoría, Remuneraciones, Legal y Finanzas Corporativas. Registro CMF N° 418.',
    servicesTitle: 'Servicios | Asecon S.A.',
    servicesDescription:
      'Contabilidad, Impuestos, Auditoría, Remuneraciones, Legal, Finanzas Corporativas, Reestructuraciones Patrimoniales y Representación de Empresas Extranjeras.',
    clientsTitle: 'Clientes | Asecon S.A.',
    clientsDescription:
      'Confianza y confidencialidad, pilares de nuestra relación con cada cliente: empresas productivas, PYME, family office, inversionistas de alto patrimonio y más.',
    sealTitle: 'Sello Asecon | Asecon S.A.',
    sealDescription:
      'Nuestra garantía siempre vigente: nos hacemos cargo de cualquier giro o multa generado como resultado de nuestra gestión.',
    technologyTitle: 'Tecnología | Asecon S.A.',
    technologyDescription:
      'Cómo incorporamos automatización, integraciones y seguridad de la información en el trabajo diario del estudio.',
    newsTitle: 'Novedades | Asecon S.A.',
    newsDescription:
      'Notas del equipo de Asecon sobre normativa contable y tributaria en Chile, auditoría bajo IFRS y el Sello Asecon.',
    teamTitle: 'Nuestro Equipo | Asecon S.A.',
    teamDescription:
      'Conoce al equipo de Asecon S.A.: dirección, gerencia, supervisión y equipo técnico con más de 30 años de trayectoria.',
    contactTitle: 'Contacto | Asecon S.A.',
    contactDescription:
      'Tomemos un café y conversemos. Completa el formulario y un miembro de nuestro equipo se pondrá en contacto contigo a la brevedad.',
    thanksTitle: 'Mensaje enviado | Asecon S.A.',
    thanksDescription:
      'Gracias por contactarte con Asecon S.A. Un miembro de nuestro equipo se pondrá en contacto contigo a la brevedad.',
    notFoundTitle: 'Página no encontrada | Asecon S.A.',
    notFoundDescription: 'La página que buscas no existe o cambió de dirección.',
    footerBlurb:
      'Estudio Tributario Contable Auditorías con más de 30 años de experiencia en Contabilidad, Impuestos, Auditoría, Remuneraciones, Legal y Finanzas Corporativas.',
  },

  serviceList: [
    {
      code: '01',
      img: '/services/contabilidad.jpg',
      name: 'Contabilidad',
      summary:
        'Soluciones contables para la gestión financiera de cualquier tamaño de empresa y sector económico: recolección, clasificación, registro, análisis e interpretación de la información financiera contable.',
      note: 'El objetivo es proporcionar información precisa y oportuna que permita la toma de decisiones gerenciales.',
      items: [
        'Contabilidad general, registro de transacciones económicas de la empresa.',
        'Proceso mensual, determinación y declaración de formulario 29.',
        'Elaboración de estados financieros: balances, estados de resultados y flujo de efectivo.',
        'Cumplimiento de obligaciones contables.',
      ],
    },
    {
      code: '02',
      img: '/services/tributaria.jpg',
      name: 'Impuestos',
      summary:
        'Soluciones integrales en el ámbito impositivo para cualquier tipo de empresa, sector y nivel de complejidad.',
      items: [
        'Cumplimiento de impuestos y consultoría permanente.',
        'Análisis de tratados para evitar la doble tributación.',
        'Determinación de impuestos mensuales.',
        'Operación renta empresas y personas naturales, nacionales y extranjeras.',
        'Renta líquida imponible, registro de rentas empresariales y declaraciones juradas.',
        'Solicitud de devolución de IVA exportador y de activo fijo.',
        'Fiscalizaciones y justificación de inversiones.',
        'Recuperación de impuestos pagados en exceso.',
        'Presentación de RAV, RAF y TTA.',
        'Determinación de rentas extranjeras y presentación DJ 1929.',
        'Términos de giro.',
      ],
    },
    {
      code: '03',
      img: '/services/auditoria.jpg',
      name: 'Auditoría',
      summary:
        'Soluciones integrales de auditoría bajo normativa vigente IFRS. Asecon está inscrita desde 2016 en el registro de Inspectores de Cuentas y Auditores Externos de la CMF (N° 418).',
      items: [
        'Convergencia a norma IFRS.',
        'Auditoría de Estados Financieros.',
        'Procedimientos previamente acordados.',
        'Apoyo en auditorías externas e internacionales.',
        'Inventario físico de existencias y activo fijo.',
        'Revisión y elaboración de procesos, ciclos y manuales.',
        'Auditoría de fraude, lavado de activos y forense.',
        'Due diligence.',
      ],
    },
    {
      code: '04',
      img: '/services/remuneraciones.jpg',
      name: 'Remuneraciones',
      summary:
        'Procesamiento de remuneraciones y aspectos de recursos humanos: nóminas, licencias médicas, leyes sociales, vacaciones y regularizaciones, con cumplimiento normativo de la Dirección del Trabajo.',
      items: [
        'Cálculo de liquidaciones: salarios, horas extras, bonos y beneficios.',
        'Gestión de nómina y emisión, asegurando cumplimiento de leyes laborales.',
        'Declaración de cotizaciones previsionales, salud y otros aportes en PreviRed.',
        'Asesoría en legislación laboral vigente.',
        'Reportes y análisis de costos laborales y estructura salarial.',
        'Cumplimiento ley de modernización de la Dirección del Trabajo.',
      ],
    },
    {
      code: '05',
      img: '/services/legal.jpg',
      name: 'Legal',
      summary:
        'Soluciones legales para que individuos, empresas y organizaciones operen conforme a la ley, integrando implicancias contables, tributarias y comerciales.',
      items: [
        'Constitución y modificación de sociedades.',
        'Asesoría jurídica corporativa.',
        'Representación en juicios y procedimientos de conciliación.',
        'Elaboración de contratos, mandatos y documentos legales.',
        'Cumplimiento normativo.',
      ],
    },
    {
      code: '06',
      img: '/services/finanzas-corporativas.jpg',
      name: 'Finanzas Corporativas',
      summary:
        'Gestión estratégica y financiera enfocada en maximizar el valor para socios y propietarios mediante decisiones informadas de inversión, financiación y riesgo.',
      items: [
        'Flujo de caja: emisión mensual y proyectado.',
        'Diseño y optimización de la estructura de capital.',
        'Reporte financiero de control de gestión a la medida.',
        'Planificación y análisis financiero de largo plazo.',
        'Gestión de inversiones y patrimonio junto a partners asociados.',
        'Apoyo en la obtención de financiamiento.',
      ],
    },
    {
      code: '07',
      img: '/services/reestructuraciones-patrimoniales.jpg',
      name: 'Reestructuraciones Patrimoniales',
      summary:
        'Diseño integral con foco en la optimización de recursos para el ordenamiento del patrimonio.',
      items: [
        'Ordenamiento de patrimonio sucesorio.',
        'Fusiones, divisiones y disoluciones.',
        'Herencia y donaciones.',
        'Aumentos y disminuciones de capital.',
        'Compraventa y tributación de enajenación de acciones y derechos sociales.',
        'MOU y venta de sociedades.',
        'Constitución y mantenimiento de empresas extranjeras operativas y de inversión pasiva.',
      ],
    },
    {
      code: '08',
      img: '/services/representacion-empresas-extranjeras.jpg',
      name: 'Representación de Empresas Extranjeras',
      summary:
        'Soluciones para inversionistas extranjeros que buscan una correcta operación y ejecución en Chile.',
      items: [
        'Gestión de mandato a través de consulados para constituir una sociedad en Chile.',
        'Constitución de sociedad y servicio de representación legal.',
        'Apoyo en apertura de cuentas bancarias.',
        'Servicio de custodia de fondos y procesamiento de pagos a proveedores.',
      ],
    },
  ],
};

const en = {
  tagline: 'Tax, Accounting & Audit Firm',

  nav: {
    home: 'Home',
    services: 'Services',
    clients: 'Clients',
    seal: 'The Asecon Seal',
    technology: 'Technology',
    team: 'Our Team',
    news: 'Insights',
    contact: 'Contact',
    privacy: 'Privacy',
    cookies: 'Cookies',
    legal: 'Legal notice',
    terms: 'Terms',
  },

  ui: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Main navigation',
    switchTo: 'Ver esta página en español',
    people: 'people',
    viewAllServices: 'View all services',
    requestInfo: 'Request more information',
    viewServices: 'View services',
    meetTheTeam: 'Meet the team',
    learnAboutSeal: 'About the Asecon Seal',
    goToContact: 'Go to Contact',
    backHome: 'Back to home',
    allRightsReserved: 'All rights reserved.',
    footerNavLabel: 'Site sections',
    legalNavLabel: 'Legal information',
    writeToUs: 'Get in touch',
    channelPending: 'This channel is under construction — visible only in this preview.',
    orPrefer: 'or if you prefer',
    pauseVideo: 'Pause video',
    playVideo: 'Play video',
    footerCmf: 'CMF Registry No. {n}',
  },

  channels: {
    call: 'Call',
    whatsapp: 'WhatsApp',
    email: 'Email',
    whatsappPrefill: 'Hi, I am writing from aseconsa.com. I would like to talk about my company.',
  },

  consent: {
    body: 'We use Google Analytics to understand how this site is used. It only activates if you accept.',
    accept: 'Accept',
    reject: 'Reject',
    link: 'View cookie policy',
    manage: 'Cookie preferences',
  },

  credentials: {
    label: 'Credentials',
    items: [
      { value: 'No. 418', label: 'CMF External Auditors Registry, since 2016' },
      { value: '1996', label: 'Founded in Santiago, Chile' },
      { value: '8', label: 'Practice areas, from accounting to foreign-company representation' },
      { value: 'Always', label: 'Asecon Seal guarantee on all our work' },
    ],
  },

  hero: {
    eyebrow: 'Tax, Accounting & Audit Firm · Since 1996',
    title: ['We take care of it,', 'so all you have to worry', 'about is growing.'],
    body:
      'Accounting, tax and audit for foreign companies operating in Chile, family offices and growing businesses. Backed by a guarantee that never lapses.',
  },

  teamStrip: {
    eyebrow: 'Meet Asecon',
    title: ['A team with', 'vision and proximity'],
    alt: 'The Asecon team in a working meeting at the office',
    body:
      '30 years working with the same companies is not sustained by processes: it is sustained by people who know each case from the inside.',
  },

  servicesTeaser: {
    eyebrow: 'Index of services',
    title: 'Our services.',
    body: '8 practice areas, each held to the same standard and covered by a guarantee that never lapses.',
    ui: {
      prev: 'Previous services',
      next: 'Next services',
    },
  },

  homeForm: {
    eyebrow: 'Let’s talk',
    title: ['Shall we talk', 'about your company?'],
    body: 'Tell us in a few words what you need and we will get back to you, or use whichever channel you prefer.',
  },

  services: {
    eyebrow: 'Services',
    title: ['8 practice', 'areas'],
    body: 'One firm for your accounting, taxes, audit and payroll in Chile.',
    ui: {
      indexLabel: 'Practice areas',
      includesLabel: 'What it covers',
      askAboutArea: 'Ask about this area',
    },
  },

  clients: {
    eyebrow: 'Client portfolio',
    title: ['Trust and', 'confidentiality'],
    body:
      'The two pillars of every client relationship. We protect your information with the utmost care and professionalism.',
    types: [
      { name: 'Manufacturing companies', resolves: 'Accounting, costing and tax compliance for day-to-day operations.' },
      { name: 'Service companies', resolves: 'Invoicing, payroll and reporting for teams that are growing fast.' },
      { name: 'Investment companies', resolves: 'Financial statements and corporate structure for the investment vehicle.' },
      { name: 'Small and mid-sized business', resolves: 'Accounting and tax obligations without needing an in-house team.' },
      { name: 'Foreign companies', resolves: 'Incorporation, legal representation and compliance to operate in Chile.' },
      { name: 'Branch offices', resolves: 'Accounting and compliance for branches and agencies of foreign parent companies.' },
      { name: 'Non-profit organisations', resolves: 'Accounting and accountability in line with non-profit regulations.' },
      { name: 'Family offices', resolves: 'Wealth consolidation and reporting across the family’s different entities.' },
      { name: 'Executives and private investors', resolves: 'Personal income tax filing and tax planning.' },
      { name: 'High-net-worth individuals', resolves: 'Wealth structuring and tax advisory on investments.' },
    ],
    logos: [],
    proof: {
      label: 'What you can verify',
      cmf: 'CMF External Auditors Registry No. {n}, since {year}',
      cmfCta: 'View the registry',
      founded: 'Founded in {year}, {years} years in continuous operation',
      seal: 'Asecon Seal guarantee on all our work',
    },
  },

  testimonials: {
    eyebrow: 'Testimonials',
    title: ['What our clients', 'say'],
    items: [],
  },

  seal: {
    eyebrow: 'The Asecon Seal',
    title: ['We stand behind our work,', 'always'],
    body1:
      'Our practice is built on understanding each client in depth and delivering personal attention, taking care of every detail to arrive at solutions that actually work.',
    body2:
      'Trust is our greatest asset. Our services meet high quality standards and we always guarantee our work: if our filings result in an assessment or a penalty, we take care of it.',
    teaserBody:
      'Trust is our greatest asset. We always guarantee our work: if our filings result in an assessment or a penalty, we take care of it.',
    yearsLabel: 'years',
    officeAlt: 'Asecon offices at {address}',
    ringText: 'ASECON SEAL - GUARANTEED - ',
  },

  technology: {
    eyebrow: 'Technology',
    title: ['Technology that', 'backs the work'],
    body:
      'We bring in tools and automation where they genuinely save time and cut down on error, so the team’s professional judgment stays focused on what software cannot resolve.',
    items: [
      {
        icon: 'portal',
        title: 'Client portal',
        body: 'Online access to reports, receipts and the status of each filing, without waiting on email back-and-forth.',
      },
      {
        icon: 'automation',
        title: 'Accounting and tax process automation',
        body: 'Recurring reconciliations, calculations and filings run with software support, freeing up the team’s time for analysis and judgment instead of data entry.',
      },
      {
        icon: 'integration',
        title: 'Integration with the SII and banks',
        body: 'Connections to the platforms we use every day, cutting down manual work and human error.',
      },
      {
        icon: 'reporting',
        title: 'Real-time reporting',
        body: 'Dashboards that update themselves, instead of a fixed report that lands once a month.',
      },
      {
        icon: 'signature',
        title: 'E-signature and document management',
        body: 'Paperless approval and filing workflows that are traceable and easy to audit.',
      },
      {
        icon: 'security',
        title: 'Information security',
        body: 'Access control and backups over each client’s financial information, handled with the same care as a bank.',
      },
    ],
  },

  teamPage: {
    eyebrow: 'People',
    title: ['Our', 'Team'],
    body:
      'Leadership, management, supervision, technical staff and support.',
  },

  roles: {
    ceo: 'CEO',
    director: 'Director',
    coo: 'Chief Operating Officer',
    directoraTributaria: 'Tax Director',
    gerenteContabilidad: 'Accounting Manager',
    gerenteAuditoria: 'Audit Manager',
    gerenteTributario: 'Tax Manager',
    gerenteRRHH: 'HR Manager',
    gerenteLegal: 'Senior Labor Lawyer',
    supervisorContable: 'Accounting Supervisor',
    supervisorRRHH: 'HR Supervisor',
    supervisorTributario: 'Tax Supervisor',
    seniorContabilidad: 'Senior Accountant',
    seniorTributario: 'Senior Tax Specialist',
    analistaContable: 'Accounting Analyst',
    analistaRRHH: 'HR Analyst',
    asistenteTributario: 'Tax Assistant',
    asistenteAuditoria: 'Audit Assistant',
    asistenteAdmin: 'Administrative Assistant',
    secretaria: 'Administrative Secretary',
    tramitador: 'Filings Clerk',
  },

  news: {
    eyebrow: 'Insights',
    title: ['What we are', 'watching'],
    body:
      'Short notes on the firm, the regulation we follow closely and the questions we get asked most. Written by the team, no filler.',
    readMore: 'Read the note',
    readingTime: '{n} min read',
    filterLabel: 'Filter',
    allCategories: 'All',
    noMatches: 'No notes in this category.',
    backToList: 'Back to Insights',
    empty: 'No notes published yet.',
    publishedOn: 'Published on',
    alsoRead: 'More notes',
    resultsLabel: '{n} notes found',
  },

  leadMagnet: {
    eyebrow: 'Downloadable guide',
    title: ['A checklist', 'for your year-end close'],
    body: 'The points we review with every client before closing the year. Leave your email and we will send it over.',
    bullets: [
      'Key deadlines and forms for the period.',
      'Documentation worth having in order before closing.',
      'Common mistakes that trigger SII inquiries.',
    ],
    formCta: 'Send and get the guide',
    fileLabel: 'Download the guide (PDF)',
  },

  org: {
    direccion: 'Leadership',
    gerencia: 'Management',
    equipo: 'Team',
    peopleCount: '{n} people',
    onePerson: '1 person',
    showAll: 'See the rest of the team',
    showLess: 'Show less',
    draftTitle: 'Preliminary structure',
    draftBody:
      'The structure is under review. Leadership reporting lines are confirmed; team-level lines were inferred by discipline and may change.',
  },

  cta: {
    action: 'Get in touch',
    home: 'Shall we talk about your company?',
    services: 'Which of these do you need solved?',
    clients: 'Does your company fit one of these profiles?',
    seal: 'Want the Asecon Seal on your books?',
    technology: 'Want to know how this applies to your company?',
    team: 'Want to talk to someone on the team?',
  },

  contact: {
    eyebrow: 'Contact',
    title: ['Let us buy you a coffee', 'and talk'],
    body: 'Fill in the form and a member of our team will get back to you shortly.',
    whatHappensTitle: 'What happens in this first conversation?',
    whatHappensItems: [
      'We understand your operation and what you need to solve first.',
      'We explain how we would work and what information we will ask you for.',
      'You leave with clear next steps, no strings attached.',
    ],
    labels: {
      phone: 'Phone',
      email: 'Email',
      office: 'Office',
      linkedin: 'LinkedIn',
      linkedinCta: 'Follow us on LinkedIn',
      name: 'Full name',
      type: 'Type',
      typePlaceholder: 'Select an option',
      typeCompany: 'Company',
      typeIndividual: 'Individual',
      emailField: 'Email',
      emailPlaceholder: 'you@email.com',
      phoneField: 'Phone (optional)',
      phonePlaceholder: '+1 555 123 4567',
      area: 'Area of interest (optional)',
      areaPlaceholder: 'Prefer not to say',
      message: 'Message',
      messagePlaceholder: 'Tell us how we can help',
      consent: ['I have read and accept the ', 'privacy policy', '.'],
      submit: 'Send request',
    },
    subject: 'New contact from aseconsa.com (EN)',
    subjectHome: 'New quick contact from the aseconsa.com homepage (EN)',
    subjectMagnet: 'Downloadable guide request — aseconsa.com (EN)',
    sendingLabel: 'Sending your request…',
    devNotice:
      'Development-only notice: PUBLIC_WEB3FORMS_KEY is not set in .env, so the form is not delivering messages yet. See .env.example.',
    unavailable: {
      title: 'The form is not active yet',
      body: 'While we turn it on, write to us directly through these — we reply just as fast.',
      ctaPhone: 'Call us',
      ctaMail: 'Email us',
    },
    error: {
      title: 'We could not send your message',
      body: 'It might be your connection. Try again, or write to us directly through these — what you wrote was not lost.',
      retry: 'Retry',
      viaMail: 'Send by email',
      viaWhatsapp: 'Send by WhatsApp',
    },
  },

  thanks: {
    eyebrow: 'Message received',
    title: ['Thank you for', 'writing to us'],
    body:
      'We have received your request. A member of our team will get in touch shortly to talk it through.',
    urgentLabel: 'Is it urgent?',
    downloadTitle: 'Your guide is ready',
    downloadBody: 'Download it now; we are also sending it to you by email.',
  },

  notFound: {
    eyebrow: 'Error 404',
    heading: 'This page does not exist',
    body: 'The link may be broken, or the page may have moved. Let’s get you somewhere familiar.',
  },

  // Legal layer — see the comment on the Spanish block. Same structure,
  // same placeholders, same number of sections and paragraphs.
  legal: {
    updatedLabel: 'Last updated:',
    updated: 'September 29, 2026',
    draft: false,
    draftTitle: 'Draft pending review',
    draftBody:
      'This text is pending review and should not be treated as the version in force until it is confirmed.',
    privacy: {
      metaTitle: 'Privacy Policy | Asecon S.A.',
      metaDescription:
        'What personal data Asecon S.A. collects on this site, what it is used for, who it is shared with, how long it is kept and how to exercise your rights.',
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      intro:
        'This policy explains what personal data {razonSocial} collects through aseconsa.com, what it uses it for, who it shares it with, how long it keeps it, and how you can exercise your rights. It is governed by Chile’s Law No. 19.628 on the Protection of Private Life and, from its entry into force on December 1, 2026, by the amendments introduced by Law No. 21.719. For those located in the European Union or the European Economic Area, the General Data Protection Regulation (GDPR) also applies.',
      sections: [
        {
          heading: 'Data controller',
          body: [
            '{razonSocial}, RUT (Chilean tax ID) {rut}, with registered address at {direccion}, is the controller of the personal data collected through this site.',
            'For any question or request about your personal data, write to us at {email} with the subject line "Personal data".',
          ],
        },
        {
          heading: 'What data we collect',
          body: [
            'Contact form: name, email, phone (optional), contact type (company or individual), the service area you are interested in, and the message you write.',
            'Downloadable guide form: name and email.',
            'Each form also sends technical data that helps us respond properly: the site language, the page you wrote from, the form you used, and the version of this policy you accepted when you checked the consent box.',
            'Browsing data: only if you accept it in the cookie notice, Google Analytics records site usage data (pages visited, device and browser type, approximate location and a pseudonymous identifier). In addition, like any web server, our hosting provider automatically records technical data about each visit, such as the IP address and browser, to operate and protect the site.',
            'We do not ask for sensitive data. Please do not include sensitive information or detailed financial or tax records in your message: if your enquiry requires them, we will ask for them through an appropriate channel once we contact you.',
          ],
        },
        {
          heading: 'What we use it for, and on what basis',
          body: [
            'To respond to your enquiry and, where appropriate, prepare a service proposal. The basis is your consent, which you give by checking the form’s box, and the pre-contractual steps you yourself requested.',
            'To send you the guide you requested. The basis is your consent.',
            'To measure site usage and improve it, only with your prior consent in the cookie notice. You can withdraw it at any time from "Cookie preferences", at the bottom of every page.',
            'To keep the site secure and running, through server technical logs and the browser’s automatic security reports (the latter contain no personal data). The basis is our legitimate interest in protecting the site and the people who use it.',
            'We do not use your data to send you advertising or newsletters you have not requested, we do not sell it or pass it to third parties for their own purposes, and we do not make automated decisions or build profiles from it.',
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            'To run this site we work with providers that process data on our behalf, only for the purposes set out in this policy:',
            'Web3Forms (United States): receives the forms and forwards them to our email. It may keep a copy of the submission under its own privacy policy.',
            'Microsoft (Microsoft 365): hosts the firm’s email, where form messages arrive.',
            'Netlify (United States): hosts the site and records technical data about each visit.',
            'Google (United States): provides Google Analytics, only if you accepted measurement in the cookie notice.',
            'We may also disclose data to public authorities when a law or a court order requires it.',
          ],
        },
        {
          heading: 'International transfers',
          body: [
            'Some of these providers process data outside Chile, mainly in the United States. When you submit a form, your data is transferred to them for the purposes described in this policy.',
            'In those cases we rely on the safeguards each provider offers for international data transfers, such as standard contractual clauses or, where applicable, its participation in the EU–U.S. Data Privacy Framework.',
          ],
        },
        {
          heading: 'Retention period',
          body: [
            'Enquiries and guide requests: we keep the data for {retencion} months from our last contact with you, and then delete or anonymise it.',
            'If you become a client, your data is governed by the professional relationship: it is kept for as long as that relationship lasts and, afterwards, for the periods the law requires. For example, tax records are kept for at least six years (articles 17 and 200 of Chile’s Tax Code).',
            'Google Analytics measurement data: 14 months. Hosting technical logs: the period Netlify sets for the operation and security of its service.',
            'If you ask us to delete your data before those periods end, we will do so, unless a legal obligation requires us to keep it.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'You can exercise, at any time and free of charge, your rights of access, rectification, erasure, objection, portability and blocking of your personal data. You can also withdraw any consent you have given, without affecting the processing carried out before you withdrew it.',
            'To exercise them, write to {email} with the subject line "Personal data", stating which right you want to exercise. To protect your data, we may ask you to verify your identity before we respond.',
            'We will acknowledge receipt and respond within the legal time limit. From December 1, 2026, that limit is 30 calendar days, extendable once by another 30 days, under Law No. 21.719; until that date, the time limit in article 16 of Law No. 19.628 applies.',
            'If we do not respond in time or you disagree with our response, you can file a complaint with Chile’s Personal Data Protection Agency once it begins operating or, until then, with the courts under Law No. 19.628. If you are located in the European Union or the European Economic Area, you can also lodge a complaint with the data protection supervisory authority in your country.',
          ],
        },
        {
          heading: 'People in the European Union',
          body: [
            '{razonSocial} has no establishment in the European Union. Because the processing of data of EU residents through this site is occasional and does not include large-scale sensitive data, we have not designated a representative in the Union, under Article 27(2) of the GDPR. Enquiries from the European Union are handled at {email}.',
          ],
        },
        {
          heading: 'Information security',
          body: [
            'We apply reasonable technical and organisational measures to protect your data: the whole site runs over an encrypted connection (HTTPS), access to messages is restricted to the firm’s staff who need them to respond, and we work with providers that apply recognised security standards. If a security incident affecting your data were to occur, we would report it as the law requires.',
          ],
        },
        {
          heading: 'Minors',
          body: [
            'This site is intended for companies and adults. We do not knowingly collect data from children under 14; if we find that we have received it, we will delete it.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: [
            'We may update this policy to reflect legal changes or changes in how the site works. The version in force is always the one published on this page, with its update date. If a change is significant, we will say so visibly on the site.',
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'Cookie Policy | Asecon S.A.',
      metaDescription: 'Which cookies and similar technologies this site uses, what for, and how to accept them, reject them or change your choice.',
      eyebrow: 'Legal',
      title: 'Cookie Policy',
      intro:
        'This policy explains which cookies and similar technologies aseconsa.com uses, what they are for, and how you can accept them, reject them or change your choice.',
      sections: [
        {
          heading: 'What they are',
          body: [
            'A cookie is a small file a site stores in your browser. The browser’s local storage (localStorage and sessionStorage) does something similar without sending anything to the server. We explain both here.',
          ],
        },
        {
          heading: 'Technical: needed for the site to work',
          body: [
            'This site sets no cookies of its own. It only uses your browser’s storage for the following, without requiring consent:',
            '"asecon-consent-v1" (local storage): remembers whether you accepted or rejected measurement, so we do not ask you again on every page. It stays until you delete it or change your choice.',
            '"asecon-lead-draft" (local storage): only if a form submission fails, it keeps a draft of what you wrote so you do not have to type it again. It is deleted once the submission succeeds and is never sent to any server; you can also remove it by clearing this site’s data in your browser.',
            '"asecon-lead-fired" (session storage): prevents the same submission from being counted twice in measurement. It is deleted when you close the tab.',
          ],
        },
        {
          heading: 'Analytics: only with your consent',
          body: [
            'We use Google Analytics 4 to understand how the site is used and improve it. Nothing from Google loads until you accept measurement in the cookie notice: if you reject it, no measurement cookie is set.',
            '"_ga" (Google, 2 years): distinguishes visitors with a pseudonymous identifier.',
            '"_ga_<ID>" (Google, 2 years): keeps the session state.',
            'Measurement data is kept for 14 months in Google Analytics. Google acts as a provider on behalf of Asecon S.A. (see the Privacy Policy).',
          ],
        },
        {
          heading: 'How to change your choice',
          body: [
            'You can change your choice at any time from "Cookie preferences", at the bottom of every page. If you withdraw consent, we stop measuring and delete the Google Analytics cookies from your browser.',
            'You can also delete or block cookies from your browser settings. Doing so does not affect submitting the forms.',
          ],
        },
        {
          heading: 'Third parties',
          body: [
            'When you submit a form, your data reaches Web3Forms, which forwards it to our email (see the Privacy Policy). Neither Web3Forms nor our hosting provider sets cookies in your browser.',
          ],
        },
      ],
    },
    notice: {
      metaTitle: 'Legal Notice | Asecon S.A.',
      metaDescription: 'Ownership, intellectual property and terms of use of the aseconsa.com site.',
      eyebrow: 'Legal',
      title: 'Legal Notice',
      intro: 'This notice identifies the owner of this site and the general conditions under which it may be used.',
      sections: [
        {
          heading: 'Site ownership',
          body: [
            'This site (aseconsa.com) is operated by {razonSocial}, RUT (Chilean tax ID) {rut}, with registered address at {direccion}, listed in the CMF’s Registry of Accounts Inspectors and External Auditors under No. {cmf}. Contact: {email}.',
          ],
        },
        {
          heading: 'Purpose of the site',
          body: [
            'This site provides institutional information about {razonSocial} and its services, and a means of contact. It does not provide accounting, tax or legal services directly through the site: those services are provided under a professional engagement independent of this site.',
          ],
        },
        {
          heading: 'Intellectual property',
          body: [
            'The contents of this site (text, images, brand, logo and the Asecon Seal) are the property of {razonSocial} or are used with the corresponding authorisation. Reproduction without prior authorisation is not permitted.',
          ],
        },
        {
          heading: 'Limitation of liability',
          body: [
            'The information published on this site is general and for reference only. It does not constitute professional advice for a specific case and does not replace a direct consultation with the firm.',
          ],
        },
        {
          heading: 'Governing law and jurisdiction',
          body: [
            'This notice is governed by the laws of the Republic of Chile. Any dispute relating to the use of this site shall be submitted to the ordinary courts of Santiago, without prejudice to the rights the law grants to consumers.',
          ],
        },
      ],
    },
    terms: {
      metaTitle: 'Terms of Use | Asecon S.A.',
      metaDescription: 'Terms of use of the aseconsa.com site.',
      eyebrow: 'Legal',
      title: 'Terms of Use',
      intro: 'By using this site, you accept the following terms.',
      sections: [
        {
          heading: 'Acceptance of the terms',
          body: [
            'Using this site implies acceptance of these terms and of the Privacy Policy. If you do not agree, please do not use the site.',
          ],
        },
        {
          heading: 'Permitted use',
          body: [
            'You may browse the site, consult its contents and contact us through the means provided for that purpose. Any use intended to compromise its security or to extract content automatically without authorisation is not permitted.',
          ],
        },
        {
          heading: 'Links to third parties',
          body: [
            'This site links to third-party services (for example, LinkedIn or Google Maps). {razonSocial} does not control and is not responsible for the content or privacy practices of those external sites.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'We may update these terms at any time. The version in force is always the one published on this page.',
          ],
        },
        {
          heading: 'Contact',
          body: [
            'For any questions about these terms, write to {email}.',
          ],
        },
      ],
    },
  },

  faq: {
    eyebrow: 'Frequently asked questions',
    title: ['Frequently asked', 'questions'],
    items: [],
  },

  meta: {
    homeTitle: 'Asecon S.A. | Tax, Accounting & Audit Firm in Santiago',
    homeDescription:
      'Chilean tax, accounting and audit firm with over 30 years of experience. Accounting, tax, IFRS audit, payroll, legal and corporate finance for foreign companies operating in Chile. CMF Registry No. 418.',
    servicesTitle: 'Services | Asecon S.A.',
    servicesDescription:
      'Accounting, Tax, IFRS Audit, Payroll, Legal, Corporate Finance, Estate Restructuring and Foreign Company Representation in Chile.',
    clientsTitle: 'Clients | Asecon S.A.',
    clientsDescription:
      'Trust and confidentiality, the pillars of every client relationship: manufacturing and service companies, SMEs, family offices, high-net-worth individuals and more.',
    sealTitle: 'The Asecon Seal | Asecon S.A.',
    sealDescription:
      'Our guarantee never lapses: we take responsibility for any assessment or penalty resulting from our work.',
    technologyTitle: 'Technology | Asecon S.A.',
    technologyDescription:
      'How we bring automation, integrations and information security into the firm’s day-to-day work.',
    newsTitle: 'Insights | Asecon S.A.',
    newsDescription:
      'Notes from the Asecon team on Chilean accounting and tax regulation, IFRS audit and the Asecon Seal.',
    teamTitle: 'Our Team | Asecon S.A.',
    teamDescription:
      'Meet the Asecon S.A. team: leadership, management, supervision and technical staff, with over 30 years of combined practice.',
    contactTitle: 'Contact | Asecon S.A.',
    contactDescription:
      'Let us buy you a coffee and talk. Fill in the form and a member of our team will get back to you shortly.',
    thanksTitle: 'Message sent | Asecon S.A.',
    thanksDescription:
      'Thank you for contacting Asecon S.A. A member of our team will get in touch with you shortly.',
    notFoundTitle: 'Page not found | Asecon S.A.',
    notFoundDescription: 'The page you are looking for does not exist or has moved.',
    footerBlurb:
      'Tax, accounting and audit firm with over 30 years of experience in Accounting, Tax, Audit, Payroll, Legal and Corporate Finance.',
  },

  serviceList: [
    {
      code: '01',
      img: '/services/contabilidad.jpg',
      name: 'Accounting',
      summary:
        'Accounting solutions for companies of any size and sector: collecting, classifying, recording, analysing and interpreting financial information.',
      note: 'The goal is accurate, timely information that management can actually make decisions on.',
      items: [
        'General accounting and recording of all company transactions.',
        'Monthly close, calculation and filing of Form 29 (VAT return).',
        'Financial statements: balance sheet, income statement and cash flow.',
        'Compliance with statutory accounting obligations.',
      ],
    },
    {
      code: '02',
      img: '/services/tributaria.jpg',
      name: 'Tax',
      summary:
        'End-to-end tax solutions for any company, sector and level of complexity under Chilean law.',
      items: [
        'Ongoing tax compliance and advisory.',
        'Analysis of double taxation treaties.',
        'Monthly tax determination.',
        'Annual income tax filings for companies and individuals, resident and non-resident.',
        'Net taxable income, corporate income registries and sworn statements.',
        'Exporter and fixed-asset VAT refund claims.',
        'Tax audits and justification of investments before the SII.',
        'Recovery of overpaid taxes.',
        'Administrative appeals (RAV, RAF) and Tax and Customs Court filings.',
        'Foreign-source income determination and Sworn Statement 1929.',
        'Business closure filings (término de giro).',
      ],
    },
    {
      code: '03',
      img: '/services/auditoria.jpg',
      name: 'Audit',
      summary:
        'Full-scope audit under current IFRS standards. Asecon has been listed since 2016 in the CMF Registry of Account Inspectors and External Auditors (No. 418).',
      items: [
        'Convergence to IFRS.',
        'Audit of financial statements.',
        'Agreed-upon procedures.',
        'Support in external and international audits.',
        'Physical inventory counts of stock and fixed assets.',
        'Review and drafting of processes, cycles and manuals.',
        'Fraud, anti-money-laundering and forensic audit.',
        'Due diligence.',
      ],
    },
    {
      code: '04',
      img: '/services/remuneraciones.jpg',
      name: 'Payroll',
      summary:
        'Payroll processing and HR administration: payslips, medical leave, social security contributions, holidays and back-filings, in compliance with the Chilean Labor Directorate.',
      items: [
        'Payslip calculation: salaries, overtime, bonuses and benefits.',
        'Payroll management and issuance in line with labour law.',
        'Filing of pension, health and other contributions via PreviRed.',
        'Advisory on current labour legislation.',
        'Reporting and analysis of labour costs and salary structure.',
        'Compliance with the Labor Directorate modernisation act.',
      ],
    },
    {
      code: '05',
      img: '/services/legal.jpg',
      name: 'Legal',
      summary:
        'Legal solutions so that individuals, companies and organisations operate within the law, integrating the accounting, tax and commercial implications.',
      items: [
        'Incorporation and amendment of companies.',
        'Corporate legal advisory.',
        'Representation in litigation and conciliation proceedings.',
        'Drafting of contracts, powers of attorney and legal documents.',
        'Regulatory compliance.',
      ],
    },
    {
      code: '06',
      img: '/services/finanzas-corporativas.jpg',
      name: 'Corporate Finance',
      summary:
        'Strategic and financial management focused on maximising value for partners and owners through informed investment, financing and risk decisions.',
      items: [
        'Cash flow: monthly reporting and forecasting.',
        'Capital structure design and optimisation.',
        'Tailored management reporting.',
        'Long-term financial planning and analysis.',
        'Investment and wealth management alongside associated partners.',
        'Support in securing financing.',
      ],
    },
    {
      code: '07',
      img: '/services/reestructuraciones-patrimoniales.jpg',
      name: 'Estate Restructuring',
      summary:
        'End-to-end design focused on optimising resources in the reorganisation of family and corporate wealth.',
      items: [
        'Reorganisation of inherited estates.',
        'Mergers, spin-offs and dissolutions.',
        'Inheritance and gifts.',
        'Capital increases and reductions.',
        'Sale and taxation of shares and partnership interests.',
        'MOUs and sale of companies.',
        'Incorporation and maintenance of foreign operating and passive investment vehicles.',
      ],
    },
    {
      code: '08',
      img: '/services/representacion-empresas-extranjeras.jpg',
      name: 'Foreign Company Representation',
      summary:
        'Solutions for foreign investors who need their Chilean operation set up and run correctly from day one.',
      items: [
        'Power of attorney handled through consulates to incorporate a Chilean company.',
        'Incorporation and legal representation services.',
        'Support opening local bank accounts.',
        'Fund custody and supplier payment processing.',
      ],
    },
  ],
};

export const content = { es, en };

/** Todo el contenido traducible del idioma pedido. */
export function getContent(lang) {
  return content[lang] ?? content.es;
}
