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
  privacyVersion: '2026-09-30',

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
// ESTRUCTURA PRELIMINAR (nota interna: la página pública ya no lo dice). Confirmadas
// por la dirección: Jeanette sobre Rafael, y bajo Rafael se abren Thomas (Operaciones)
// y Fernanda (Impuestos). El resto de las dependencias las dedujo el sitio por
// disciplina y hay que revisarlas.
// Para cambiar a alguien de jefatura basta editar su `reportsTo`.

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
    viewServices: 'Conoce nuestros servicios',
    meetTheTeam: 'Conoce al equipo',
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
    label: 'Trayectoria y respaldo',
    items: [
      { value: 'N° 418', label: 'Inscritos en el Registro de Auditores Externos de la CMF desde 2016' },
      {
        value: 'Desde 1996',
        label: 'Fundada en Santiago. Más de 30 años de experiencia construyendo relaciones de confianza con nuestros clientes.',
      },
      { value: '8', label: 'Áreas de especialidad' },
      // PENDIENTE (Rafael): confirmar si se publica la mención a la garantía.
      { value: 'Siempre', label: 'Así de vigente es la garantía Sello Asecon sobre nuestro trabajo' },
    ],
  },

  hero: {
    eyebrow: 'Estudio tributario, contable y de auditoría · Desde 1996',
    // El punto final va dentro del énfasis: con `after` vacío no queda un
    // espacio suelto antes del punto.
    title: ['Tus metas,', 'nuestro compromiso.', ''],
    body:
      'Acompañamos a empresas y personas en su crecimiento y expansión, con asesoría global, soluciones a la medida y un trato directo y cercano.',
  },

  teamStrip: {
    eyebrow: 'Equipo',
    title: ['Un equipo con', 'visión y cercanía'],
    alt: 'Equipo de Asecon en una reunión de trabajo en la oficina',
    body:
      'Somos un equipo multidisciplinario de contadores, auditores, abogados y especialistas financieros y en tecnología, con sólida formación y experiencia. Trabajamos de forma directa y personalizada, al servicio de las personas y empresas que confían en nosotros.',
  },

  servicesTeaser: {
    eyebrow: 'Servicios',
    title: 'Todo lo que tu empresa necesita, en un solo equipo.',
    body: 'Integramos experiencia tributaria, contable, legal y financiera para crear soluciones a la medida que protegen el patrimonio de empresas y personas, anticipan riesgos y aseguran el cumplimiento de sus obligaciones, en Chile y en el extranjero.',
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
    body: 'Cuéntanos qué necesitas y te contactamos a la brevedad. Si prefieres, escríbenos por el canal que más te acomode.',
  },

  services: {
    eyebrow: 'Servicios',
    title: ['8 áreas de especialidad,', 'un solo equipo'],
    body:
      'Soluciones integrales para empresas, family offices e inversionistas, en Chile y en el extranjero. Nuestras áreas trabajan coordinadas para darte una visión completa de tu negocio.',
    ui: {
      indexLabel: 'Áreas de especialidad',
      includesLabel: 'Qué incluye',
      askAboutArea: 'Consultar por esta área',
    },
  },

  clients: {
    eyebrow: 'Clientes',
    title: ['Confianza y', 'confidencialidad'],
    body:
      'Acompañamos a empresas, family offices e inversionistas de distintos rubros y tamaños. La confidencialidad es parte de nuestro trabajo: cuidamos tu información con el máximo rigor y profesionalismo.',
    typesTitle: 'A quiénes acompañamos',
    // Cada tipo lleva una línea concreta de qué resolvemos ahí — no una
    // cifra ni un caso inventado, solo el alcance real del servicio.
    types: [
      { name: 'Empresas productivas', resolves: 'Contabilidad, control de costos y cumplimiento tributario para que tu operación funcione sin interrupciones.' },
      { name: 'Empresas de servicios', resolves: 'Facturación, remuneraciones y reportes de gestión para equipos que crecen rápido.' },
      { name: 'Empresas de inversión', resolves: 'Estados financieros, estructura societaria y cumplimiento tributario de tus vehículos de inversión.' },
      { name: 'Pymes', resolves: 'Toda la contabilidad y los impuestos de tu empresa, sin necesidad de un equipo interno.' },
      { name: 'Empresas extranjeras', resolves: 'Constitución, representación legal y cumplimiento para instalarse y operar en Chile.' },
      { name: 'Agencias y sucursales extranjeras', resolves: 'Contabilidad y cumplimiento local para agencias y sucursales de matrices extranjeras, alineados con los reportes que exige la casa matriz.' },
      { name: 'Organizaciones sin fines de lucro', resolves: 'Contabilidad y rendición de cuentas conforme a la normativa de fundaciones y corporaciones.' },
      { name: 'Family offices', resolves: 'Consolidación patrimonial y reportes entre las distintas entidades de la familia, pensando en las próximas generaciones.' },
      { name: 'Ejecutivos y rentistas', resolves: 'Declaración de renta y planificación tributaria personal, incluidas inversiones en Chile y en el extranjero.' },
      { name: 'Inversionistas de alto patrimonio', resolves: 'Estructuración patrimonial y asesoría tributaria sobre inversiones locales e internacionales.' },
    ],
    // Logos con nombre real de cliente: vacío a propósito hasta que el
    // estudio autorice cuáles pueden mostrarse. Clients.astro no renderiza
    // nada mientras esté vacío — nunca un <img> a un logo que no existe.
    logos: [],
    // Prueba verificable en vez de testimonios anónimos: lo que cualquiera
    // puede comprobar por su cuenta, con enlace a la fuente pública.
    proof: {
      label: 'Respaldo verificable',
      cmf: 'Inscritos en el Registro de Auditores Externos de la CMF (N° {n}) desde {year}.',
      cmfCta: 'Ver el registro',
      founded: 'Desde {year}, más de {years} años de operación continua.',
      // PENDIENTE (Rafael): confirmar si se publica la mención a la garantía.
      seal: 'Garantía Sello Asecon, siempre vigente sobre nuestro trabajo.',
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
    // Bajada, tres pilares y cierre. Reemplazan los dos párrafos de antes.
    // PENDIENTE (Rafael): la garantía de hacerse cargo de giros o multas
    // quedó fuera de esta página hasta que se confirme si se publica.
    intro:
      'El Sello Asecon es nuestro compromiso con cada cliente: un servicio de excelencia, cercano y con altos estándares de calidad.',
    pillars: [
      { title: 'Conocimiento de cada cliente', body: 'Nos involucramos en cada negocio para entender sus necesidades y acompañarlo en sus decisiones.' },
      { title: 'Atención personalizada', body: 'Un equipo cercano, que cuida cada detalle del trabajo.' },
      { title: 'Altos estándares de calidad', body: 'Trabajo riguroso y profesional en cada servicio que entregamos.' },
    ],
    closing: 'Nuestro mayor activo es la confianza que construimos con cada cliente.',
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
    eyebrow: 'Equipo',
    title: ['Nuestro', 'Equipo'],
    body:
      'Un equipo multidisciplinario de contadores, auditores, abogados y especialistas financieros y en tecnología, con una dirección cercana y comprometida con cada cliente.',
  },

  roles: {
    ceo: 'CEO',
    // PENDIENTE: confirmar el cargo de Jeanette Lewitt (el documento dice "Directora").
    director: 'Directora',
    coo: 'Director de Operaciones',
    directoraTributaria: 'Directora de Impuestos',
    gerenteContabilidad: 'Gerente de Contabilidad',
    gerenteAuditoria: 'Gerente de Auditoría',
    gerenteTributario: 'Gerente de Impuestos',
    // PENDIENTE: el documento propone "Gerente de Personas" (o "Gerente de Recursos Humanos").
    gerenteRRHH: 'Gerente de Personas',
    gerenteLegal: 'Abogada Senior, Área Laboral',
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
    title: ['', 'Novedades'],
    body:
      'Cambios normativos, alertas tributarias y novedades del estudio, explicados en simple por nuestro equipo. Lo que necesitas saber para decidir a tiempo.',
    // Filtros fijos y en este orden. Una categoría sin notas igual se muestra
    // (queda vacía hasta que se escriba la primera); una nota con una categoría
    // que no esté en esta lista agrega su filtro al final.
    categories: [
      'Alertas tributarias',
      'Normativa',
      'Tributación internacional',
      'Auditoría',
      'Preguntas frecuentes',
      'Asecon',
    ],
    readMore: 'Leer nota',
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
    showAll: 'Ver equipo completo',
    showLess: 'Ver menos',
  },

  cta: {
    action: 'Escríbenos',
    home: '¿Conversamos sobre tu empresa?',
    services: '¿Cuál de estas áreas necesitas resolver?',
    clients: '¿Tu empresa calza con alguno de estos perfiles?',
    seal: '¿Quieres el respaldo del Sello Asecon en tu empresa?',
    technology: '¿Quieres saber cómo aplicamos esto a tu empresa?',
    team: '¿Quieres conversar con nuestro equipo?',
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
        'En base a la nueva normativa que entrará prontamente en vigencia y a las normativas internacionales, {razonSocial} se compromete al correcto uso de los datos personales de nuestros trabajadores y clientes, primando el cumplimiento normativo y de seguridad. Es en razón de esto que, a través de aseconsa.com, somos transparentes en el para qué se usan los datos, con quién se comparten, por cuánto tiempo se conservan y cómo puedes ejercer tus derechos.',
      sections: [
        {
          heading: 'Responsable del tratamiento',
          body: [
            'Como empresa, {razonSocial}, RUT {rut}, con domicilio en {direccion}, es la responsable del tratamiento de los datos personales que se recopilan a través de este sitio.',
            'Para cualquier consulta o solicitud sobre tus datos personales, no dudes en escribirnos a {email}, indicando tus dudas y poniendo en el asunto "Datos personales".',
          ],
        },
        {
          heading: 'Qué datos recopilamos',
          body: [
            'Formulario de contacto para poder suministrar el servicio acorde a las necesidades del cliente: nombre, correo electrónico, teléfono (opcional), tipo de contacto (empresa o particular), área de servicio que te interesa y solicitud.',
            'Junto con cada formulario, se remitirán los datos a nuestras áreas especializadas para responderte de la mejor forma posible. Sin perjuicio de lo anterior, al marcar la casilla de consentimiento, los datos serán compartidos, en conjunto con el formulario rellenado por el cliente, y el idioma seleccionado del sitio.',
            'En complementación de lo anterior, solo si aceptas el aviso de cookies, Google Analytics registra datos de uso del sitio (páginas visitadas, tipo de dispositivo y navegador, ubicación aproximada y un identificador seudónimo). Además, como cualquier servidor web, nuestro proveedor de alojamiento registra de forma automática datos técnicos de cada visita, como la dirección IP y el navegador, para operar y proteger el sitio.',
            'Ahora bien, en {razonSocial} no solicitamos datos sensibles. Razón por la cual, te pedimos no incluir en el mensaje información sensible ni antecedentes financieros o tributarios detallados: si tu consulta los requiere, te los pediremos por un canal adecuado una vez que te contactemos.',
          ],
        },
        {
          heading: 'Para qué los usamos y con qué fundamento',
          body: [
            'Para mantener la seguridad y el funcionamiento del sitio, mediante los registros técnicos del servidor y los reportes automáticos de seguridad del navegador, lo que no incluye datos personales.',
            'El fundamento y misión de {razonSocial} es nuestro interés legítimo en proteger el sitio y a quienes lo usan.',
            'No usamos tus datos para enviarte publicidad ni boletines que no hayas pedido, no los vendemos ni los cedemos a terceros para sus propios fines, y no tomamos decisiones automatizadas ni elaboramos perfiles a partir de ellos.',
          ],
        },
        {
          heading: 'Con quién los compartimos',
          body: [
            'Para operar este sitio trabajamos con proveedores externos, solo para los fines indicados en esta política. En mayor detalle:',
            'Web3Forms (Estados Unidos): recibe los formularios y los reenvía a nuestro correo. Puede conservar una copia del envío conforme a su propia política de privacidad.',
            'Microsoft (Microsoft 365): aloja el correo electrónico del estudio, donde llegan los mensajes de los formularios.',
            'Netlify (Estados Unidos): aloja el sitio y registra los datos técnicos de cada visita.',
            'Google (Estados Unidos): provee Google Analytics, solo si aceptaste la medición en el aviso de cookies.',
            'Adicionalmente, debemos comunicar datos a autoridades públicas cuando una ley o una resolución judicial lo exija.',
          ],
        },
        {
          heading: 'Plazo de conservación',
          body: [
            'Para tu tranquilidad, y a modo de transparencia, conservamos los datos durante {retencion} meses desde nuestro último contacto, y luego los eliminamos o anonimizamos.',
            'Asimismo, si pasas a ser cliente y contratas nuestros servicios, tus datos se rigen por la relación profesional: se conservan mientras dure la prestación de servicios y, después, durante los plazos que exija la ley.',
            'Ahora bien, si deseas que suprimamos tus datos antes de esos plazos, lo haremos sin problema, salvo que una obligación legal nos exija conservarlos.',
          ],
        },
        {
          heading: 'Tus derechos',
          body: [
            'Puedes ejercer en cualquier momento, y sin costo, tus derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo de tus datos personales.',
            'También puedes retirar el consentimiento que hayas otorgado, sin que eso afecte el tratamiento realizado antes de retirarlo.',
            'Para ejercer estos derechos, escríbenos a {email} con el asunto "Datos personales", indicando qué derecho quieres ejercer.',
            'Acusaremos recibo y responderemos dentro del plazo legal, acreditando tu identidad.',
            'A modo aclaratorio, desde el 1 de diciembre de 2026, el plazo es de 30 días corridos, prorrogable por una sola vez por otros 30 días, conforme a la Ley N° 21.719.',
            'Ahora bien, si no respondemos dentro de plazo o no estás de acuerdo con la respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales. Por otro lado, si te encuentras en la Unión Europea o el Espacio Económico Europeo, también puedes presentar un reclamo ante la autoridad de control de protección de datos de tu país.',
          ],
        },
        {
          heading: 'Seguridad de la información',
          body: [
            'Como empresa, aplicamos medidas técnicas y organizativas razonables para proteger tus datos, ya que todo el sitio funciona sobre una conexión cifrada (HTTPS), el acceso a los mensajes está restringido al personal de la empresa encargado de responder tus necesidades, y trabajamos con proveedores que aplican estándares de seguridad reconocidos tanto nacional como internacionalmente.',
          ],
        },
        {
          heading: 'Menores de edad',
          body: [
            'Este sitio está dirigido a empresas y a personas naturales mayores de edad.',
            'En caso de recibir datos de menores de 14 años, los eliminaremos automáticamente, en cumplimiento con la normativa vigente.',
          ],
        },
        {
          heading: 'Cambios a esta política',
          body: [
            'Podemos actualizar esta política según lo requiera la normativa legal o los cambios que establezca el gobierno de Chile.',
            'La versión vigente es siempre la publicada en esta página, con su fecha de actualización.',
            'Si el cambio es relevante, lo indicaremos de forma visible en el sitio.',
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
      'Estudio Tributario Contable Auditorías con más de 30 años de experiencia en Contabilidad, Impuestos, Auditoría, Remuneraciones, Asesoría Legal y Finanzas Corporativas. Registro CMF N° 418.',
    servicesTitle: 'Servicios | Asecon S.A.',
    servicesDescription:
      'Contabilidad, Impuestos, Auditoría, Remuneraciones, Asesoría Legal, Finanzas Corporativas, Reestructuraciones Patrimoniales y Representación de Empresas Extranjeras.',
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
      'Estudio Tributario Contable Auditorías con más de 30 años de experiencia en Contabilidad, Impuestos, Auditoría, Remuneraciones, Asesoría Legal y Finanzas Corporativas.',
  },

  serviceList: [
    {
      code: '01',
      img: '/services/contabilidad.jpg',
      name: 'Contabilidad',
      summary:
        'Una contabilidad ordenada es la base de toda buena decisión. Atendemos a empresas de todos los tamaños y sectores con soluciones integrales: desde el registro diario y los estados financieros hasta el cumplimiento de obligaciones tributarias.',
      note: 'Trabajamos codo a codo contigo para entregarte información precisa y oportuna, que convierta los números en una herramienta para crecer.',
      items: [
        'Contabilidad general y registro de las operaciones de la empresa.',
        'Proceso mensual: determinación y declaración del Formulario 29.',
        'Estados financieros: balance, estado de resultados y flujo de efectivo.',
        'Análisis e interpretación de la información financiera.',
        'Adaptación de la contabilidad de grupos internacionales a los requisitos locales para el cierre contable.',
        'Cumplimiento de obligaciones contables.',
      ],
    },
    {
      code: '02',
      img: '/services/tributaria.jpg',
      name: 'Impuestos',
      summary:
        'Asesoría tributaria integral para empresas y personas, nacionales y extranjeras, desde el cumplimiento mensual hasta los casos de mayor complejidad. Nos aseguramos de que cada estrategia se implemente correctamente desde la perspectiva contable y tributaria.',
      note: 'Gracias a nuestro conocimiento de los sistemas legales y tributarios de distintos países, asesoramos a clientes en la estructuración de sus inversiones en el extranjero y a inversionistas extranjeros que quieren invertir en Chile.',
      groups: [
        {
          title: 'Cumplimiento y asesoría local',
          items: [
            'Cumplimiento mensual: IVA, Impuesto Adicional e ITE.',
            'Cumplimiento anual: Operación Renta de empresas y personas, impuestos diferidos y declaraciones juradas.',
            'Renta líquida imponible y registros de rentas empresariales.',
            'Planificación tributaria y reestructuraciones empresariales.',
            'Due diligence y diagnóstico tributario.',
            'Asesoría permanente.',
            'Fiscalizaciones y asistencia ante el SII, incluida la justificación de inversiones.',
            'Solicitud de créditos tributarios y devoluciones: IVA exportador, activo fijo e impuestos pagados en exceso.',
            'Presentación de RAV, RAF y TTA.',
            'Término de giro.',
          ],
        },
        {
          title: 'Tributación internacional',
          items: [
            'Estructuración tributaria de inversiones en el extranjero.',
            'Asesoría a inversionistas extranjeros que invierten en Chile.',
            'Análisis y aplicación de convenios para evitar la doble tributación.',
            'Determinación de rentas de fuente extranjera y presentación de la DJ 1929.',
            'Cumplimiento tributario de inversiones internacionales.',
          ],
        },
      ],
    },
    {
      code: '03',
      img: '/services/auditoria.jpg',
      name: 'Auditoría',
      summary:
        'Revisión independiente y rigurosa de la información financiera, para que socios, bancos e inversionistas confíen plenamente en ella. Asecon está inscrita desde 2016 en el Registro de Inspectores de Cuentas y Auditores Externos de la CMF (N° 418).',
      items: [
        'Auditoría de estados financieros.',
        'Convergencia a normas IFRS.',
        'Procedimientos previamente acordados.',
        'Apoyo en auditorías externas e internacionales.',
        'Toma de inventario físico de existencias y activo fijo.',
        'Revisión y diseño de procesos, ciclos y manuales.',
        'Auditoría forense, de fraude y de lavado de activos.',
        'Due diligence.',
      ],
    },
    {
      code: '04',
      img: '/services/remuneraciones.jpg',
      name: 'Remuneraciones',
      summary:
        'Nos encargamos del proceso de remuneraciones de principio a fin, con pleno cumplimiento de la normativa laboral y previsional, para que tu equipo reciba lo correcto y a tiempo.',
      items: [
        'Cálculo de liquidaciones de sueldo: horas extra, bonos y beneficios.',
        'Gestión de nómina, licencias médicas, vacaciones y regularizaciones.',
        'Declaración y pago de cotizaciones previsionales y de salud en Previred.',
        'Asesoría en legislación laboral vigente.',
        'Reportes de costos laborales y estructura salarial.',
        'Cumplimiento de la Ley de Modernización de la Dirección del Trabajo.',
      ],
    },
    {
      code: '05',
      img: '/services/legal.jpg',
      name: 'Asesoría Legal',
      summary:
        'Asesoría jurídica para personas y empresas, con una mirada que integra los efectos contables, tributarios y comerciales de cada decisión.',
      items: [
        'Asesoría legal corporativa integral para las distintas áreas del negocio.',
        'Constitución y modificación de sociedades.',
        'Redacción y revisión de contratos, mandatos y documentos legales.',
        'Asesoría civil, laboral e inmobiliaria.',
        'Due diligence legal.',
        'Representación en juicios y procedimientos de conciliación.',
        'Cumplimiento normativo.',
      ],
    },
    {
      code: '06',
      img: '/services/finanzas-corporativas.jpg',
      name: 'Finanzas Corporativas',
      summary:
        'Te ayudamos a tomar decisiones de inversión, financiamiento y riesgo con información clara, para maximizar el valor de tu empresa para socios y propietarios.',
      items: [
        'Flujo de caja mensual y proyectado.',
        'Diseño y optimización de la estructura de capital.',
        'Reportes de control de gestión a la medida.',
        'Planificación y análisis financiero de largo plazo.',
        'Gestión de inversiones y patrimonio junto a partners asociados.',
      ],
    },
    {
      code: '07',
      img: '/services/reestructuraciones-patrimoniales.jpg',
      name: 'Reestructuraciones Patrimoniales',
      summary:
        'Asesoramos de forma permanente a grandes y medianas empresas y a grupos familiares en la estructuración de sus sociedades y en materias patrimoniales, personales y hereditarias. Acompañamos a family offices y sus empresas para preparar la continuidad de los negocios en las próximas generaciones.',
      items: [
        'Reorganizaciones empresariales: constitución, fusiones, divisiones, disoluciones y cambios de capital.',
        'Estrategias para el desarrollo y crecimiento de negocios.',
        'Gobierno corporativo y estructuras de decisión.',
        'Empresas familiares, herencias y sucesión.',
        'Planificación y proyección patrimonial familiar.',
        'Estructuración y conducción de family offices.',
        'Compraventa de empresas, acciones y derechos sociales, y su tributación.',
        'Sociedades extranjeras operativas y de inversión pasiva.',
      ],
    },
    {
      code: '08',
      img: '/services/representacion-empresas-extranjeras.jpg',
      name: 'Representación de Empresas Extranjeras',
      summary:
        'Acompañamos a inversionistas y empresas extranjeras a instalarse y operar en Chile de forma correcta y segura, desde la constitución de la sociedad hasta su operación diaria.',
      items: [
        'Gestión de poderes a través de consulados para constituir la sociedad en Chile.',
        'Constitución de la sociedad y representación legal.',
        'Apoyo en la apertura de cuentas bancarias.',
        'Custodia de fondos y pago a proveedores.',
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
    viewServices: 'Explore our services',
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
    label: 'Track record and credentials',
    items: [
      { value: 'No. 418', label: 'Registered with the CMF External Auditors Registry since 2016' },
      {
        value: 'Since 1996',
        label: 'Founded in Santiago. Over 30 years of experience building relationships of trust with our clients.',
      },
      { value: '8', label: 'Areas of expertise' },
      // PENDING (Rafael): confirm whether the guarantee is mentioned.
      { value: 'Always', label: 'That is how long the Asecon Seal guarantee stands behind our work' },
    ],
  },

  hero: {
    eyebrow: 'Tax, accounting and audit firm · Since 1996',
    // The full stop sits inside the emphasis, as in the Spanish block.
    title: ['Your goals,', 'our commitment.', ''],
    body:
      'We support companies and individuals in their growth and expansion, with global advice, tailored solutions and a direct, close working relationship.',
  },

  teamStrip: {
    eyebrow: 'Team',
    title: ['A team with', 'vision and proximity'],
    alt: 'The Asecon team in a working meeting at the office',
    body:
      'We are a multidisciplinary team of accountants, auditors, lawyers and finance and technology specialists, with solid training and experience. We work in a direct, personalised way, at the service of the people and companies that trust us.',
  },

  servicesTeaser: {
    eyebrow: 'Services',
    title: 'Everything your company needs, in one team.',
    body: 'We bring together tax, accounting, legal and financial expertise to create tailored solutions that protect the assets of companies and individuals, anticipate risks and ensure compliance with their obligations, in Chile and abroad.',
    ui: {
      prev: 'Previous services',
      next: 'Next services',
    },
  },

  homeForm: {
    eyebrow: 'Let’s talk',
    title: ['Shall we talk', 'about your company?'],
    body: 'Tell us what you need and we will get back to you shortly. If you prefer, write to us through whichever channel suits you best.',
  },

  services: {
    eyebrow: 'Services',
    title: ['8 areas of expertise,', 'one team'],
    body: 'Comprehensive solutions for companies, family offices and investors, in Chile and abroad. Our areas work in coordination to give you a complete view of your business.',
    ui: {
      indexLabel: 'Areas of expertise',
      includesLabel: 'What it covers',
      askAboutArea: 'Ask about this area',
    },
  },

  clients: {
    eyebrow: 'Clients',
    title: ['Trust and', 'confidentiality'],
    body:
      'We work with companies, family offices and investors of all kinds and sizes. Confidentiality is part of our work: we look after your information with the utmost rigour and professionalism.',
    typesTitle: 'Who we work with',
    types: [
      { name: 'Manufacturing companies', resolves: 'Accounting, cost control and tax compliance so your operation runs without interruption.' },
      { name: 'Service companies', resolves: 'Invoicing, payroll and management reporting for teams that are growing fast.' },
      { name: 'Investment companies', resolves: 'Financial statements, corporate structure and tax compliance for your investment vehicles.' },
      { name: 'Small and mid-sized businesses', resolves: 'All the accounting and taxes of your company, without needing an in-house team.' },
      { name: 'Foreign companies', resolves: 'Incorporation, legal representation and compliance to set up and operate in Chile.' },
      { name: 'Foreign agencies and branches', resolves: 'Local accounting and compliance for agencies and branches of foreign parent companies, aligned with the reporting the head office requires.' },
      { name: 'Non-profit organisations', resolves: 'Accounting and accountability in line with the regulations for foundations and corporations.' },
      { name: 'Family offices', resolves: 'Wealth consolidation and reporting across the family’s different entities, with the next generations in mind.' },
      { name: 'Executives and private investors', resolves: 'Income tax filing and personal tax planning, including investments in Chile and abroad.' },
      { name: 'High-net-worth individuals', resolves: 'Wealth structuring and tax advice on local and international investments.' },
    ],
    logos: [],
    proof: {
      label: 'Verifiable credentials',
      cmf: 'Registered with the CMF External Auditors Registry (No. {n}) since {year}.',
      cmfCta: 'View the registry',
      founded: 'Since {year}, over {years} years of continuous operation.',
      // PENDING (Rafael): confirm whether the guarantee is mentioned.
      seal: 'Asecon Seal guarantee, always in force on our work.',
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
    // Intro, three pillars and closing, as in the Spanish block. PENDING
    // (Rafael): the guarantee against assessments or penalties stays off this
    // page until it is confirmed whether it is published.
    intro:
      'The Asecon Seal is our commitment to every client: an excellent, close service held to high quality standards.',
    pillars: [
      { title: 'Knowing each client', body: 'We get involved in every business to understand its needs and support its decisions.' },
      { title: 'Personal attention', body: 'A close-knit team that looks after every detail of the work.' },
      { title: 'High quality standards', body: 'Rigorous, professional work in every service we deliver.' },
    ],
    closing: 'Our greatest asset is the trust we build with each client.',
    teaserBody:
      'Our greatest asset is the trust we build with each client. We always guarantee our work: if our filings result in an assessment or a penalty, we take care of it.',
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
    eyebrow: 'Team',
    title: ['Our', 'Team'],
    body:
      'A multidisciplinary team of accountants, auditors, lawyers and finance and technology specialists, with close leadership committed to every client.',
  },

  roles: {
    ceo: 'CEO',
    director: 'Director',
    coo: 'Chief Operating Officer',
    directoraTributaria: 'Tax Director',
    gerenteContabilidad: 'Accounting Manager',
    gerenteAuditoria: 'Audit Manager',
    gerenteTributario: 'Tax Manager',
    // PENDING: the document proposes "People Manager" (or "HR Manager").
    gerenteRRHH: 'People Manager',
    gerenteLegal: 'Senior Lawyer, Labour Law',
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
    title: ['', 'Insights'],
    body:
      'Regulatory changes, tax alerts and news from the firm, explained simply by our team. What you need to know to decide in time.',
    // Fixed filters, in this order (same list as the Spanish block). An
    // article whose category is not listed adds its own filter at the end.
    categories: [
      'Tax alerts',
      'Regulation',
      'International taxation',
      'Audit',
      'Frequently asked questions',
      'Asecon',
    ],
    readMore: 'Read note',
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
    showAll: 'See full team',
    showLess: 'Show less',
  },

  cta: {
    action: 'Get in touch',
    home: 'Shall we talk about your company?',
    services: 'Which of these do you need solved?',
    clients: 'Does your company fit one of these profiles?',
    seal: 'Want the backing of the Asecon Seal for your company?',
    technology: 'Want to know how this applies to your company?',
    team: 'Want to talk with our team?',
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
        'Based on the new regulation about to come into force, and on international standards, {razonSocial} is committed to the correct use of our employees’ and clients’ personal data, prioritising regulatory compliance and security. For this reason, through aseconsa.com we are transparent about what data is used for, who it is shared with, how long it is kept, and how you can exercise your rights.',
      sections: [
        {
          heading: 'Data controller',
          body: [
            'As a company, {razonSocial}, RUT (Chilean tax ID) {rut}, with registered address at {direccion}, is the controller of the personal data collected through this site.',
            'For any question or request about your personal data, feel free to write to us at {email}, stating your query and using the subject line "Personal data".',
          ],
        },
        {
          heading: 'What data we collect',
          body: [
            'Contact form, so we can provide the service that fits the client’s needs: name, email, phone (optional), contact type (company or individual), the service area you are interested in, and your enquiry.',
            'Along with each form, the data is forwarded to our specialised areas so we can respond to you as well as possible. In addition, by checking the consent box, the data is shared together with the form you filled in and the language selected on the site.',
            'Beyond the above, only if you accept the cookie notice, Google Analytics records site usage data (pages visited, device and browser type, approximate location and a pseudonymous identifier). In addition, like any web server, our hosting provider automatically records technical data about each visit, such as the IP address and browser, to operate and protect the site.',
            'We do not ask for sensitive data. For this reason, please do not include sensitive information or detailed financial or tax records in your message: if your enquiry requires them, we will ask for them through an appropriate channel once we contact you.',
          ],
        },
        {
          heading: 'What we use it for, and on what basis',
          body: [
            'To keep the site secure and running, through server technical logs and the browser’s automatic security reports, which contain no personal data.',
            'The basis and purpose of {razonSocial} is our legitimate interest in protecting the site and the people who use it.',
            'We do not use your data to send you advertising or newsletters you have not requested, we do not sell it or pass it to third parties for their own purposes, and we do not make automated decisions or build profiles from it.',
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            'To run this site we work with external providers, only for the purposes set out in this policy. In more detail:',
            'Web3Forms (United States): receives the forms and forwards them to our email. It may keep a copy of the submission under its own privacy policy.',
            'Microsoft (Microsoft 365): hosts the firm’s email, where form messages arrive.',
            'Netlify (United States): hosts the site and records technical data about each visit.',
            'Google (United States): provides Google Analytics, only if you accepted measurement in the cookie notice.',
            'In addition, we must disclose data to public authorities when a law or a court order requires it.',
          ],
        },
        {
          heading: 'Retention period',
          body: [
            'For your peace of mind, and for the sake of transparency, we keep the data for {retencion} months from our last contact with you, and then delete or anonymise it.',
            'Likewise, if you become a client and engage our services, your data is governed by the professional relationship: it is kept for as long as the services last and, afterwards, for the periods the law requires.',
            'That said, if you would like us to delete your data before those periods, we will do so without issue, unless a legal obligation requires us to keep it.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'You can exercise, at any time and free of charge, your rights of access, rectification, erasure, objection, portability and blocking of your personal data.',
            'You can also withdraw any consent you have given, without affecting the processing carried out before you withdrew it.',
            'To exercise these rights, write to us at {email} with the subject line "Personal data", stating which right you want to exercise.',
            'We will acknowledge receipt and respond within the legal time limit, verifying your identity.',
            'For clarity, from December 1, 2026, that limit is 30 calendar days, extendable once by another 30 days, under Law No. 21.719.',
            'That said, if we do not respond in time or you disagree with our response, you can file a complaint with Chile’s Personal Data Protection Agency. Separately, if you are located in the European Union or the European Economic Area, you can also lodge a complaint with the data protection supervisory authority in your country.',
          ],
        },
        {
          heading: 'Information security',
          body: [
            'As a company, we apply reasonable technical and organisational measures to protect your data, since the whole site runs over an encrypted connection (HTTPS), access to messages is restricted to the firm’s staff in charge of responding to your needs, and we work with providers that apply security standards recognised both nationally and internationally.',
          ],
        },
        {
          heading: 'Minors',
          body: [
            'This site is intended for companies and for individuals of legal age.',
            'If we receive data from children under 14, we will delete it automatically, in compliance with applicable law.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: [
            'We may update this policy as required by law or by changes the Chilean government introduces.',
            'The version in force is always the one published on this page, with its update date.',
            'If a change is significant, we will indicate it visibly on the site.',
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
      'Accounting, Tax, IFRS Audit, Payroll, Legal Advisory, Corporate Finance, Estate Restructuring and Foreign Company Representation in Chile.',
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
      'Tax, accounting and audit firm with over 30 years of experience in Accounting, Tax, Audit, Payroll, Legal Advisory and Corporate Finance.',
  },

  serviceList: [
    {
      code: '01',
      img: '/services/contabilidad.jpg',
      name: 'Accounting',
      summary:
        'Well-kept accounting is the basis of every good decision. We serve companies of every size and sector with comprehensive solutions: from day-to-day bookkeeping and financial statements to compliance with tax obligations.',
      note: 'We work side by side with you to give you accurate, timely information that turns the numbers into a tool for growth.',
      items: [
        'General accounting and recording of the company’s transactions.',
        'Monthly process: calculation and filing of Form 29 (VAT return).',
        'Financial statements: balance sheet, income statement and cash flow statement.',
        'Analysis and interpretation of financial information.',
        'Adapting the accounting of international groups to local requirements for the accounting close.',
        'Compliance with accounting obligations.',
      ],
    },
    {
      code: '02',
      img: '/services/tributaria.jpg',
      name: 'Tax',
      summary:
        'Comprehensive tax advisory for companies and individuals, Chilean and foreign, from monthly compliance to the most complex cases. We make sure every strategy is implemented correctly from both the accounting and the tax perspective.',
      note: 'Thanks to our knowledge of the legal and tax systems of different countries, we advise clients on structuring their investments abroad and foreign investors who want to invest in Chile.',
      groups: [
        {
          title: 'Compliance and local advisory',
          items: [
            'Monthly compliance: VAT, Additional Tax and ITE.',
            'Annual compliance: annual income tax filing (Operación Renta) for companies and individuals, deferred taxes and sworn statements.',
            'Net taxable income and corporate income registries.',
            'Tax planning and corporate restructurings.',
            'Due diligence and tax diagnostics.',
            'Ongoing advisory.',
            'Tax audits and assistance before the SII, including justification of investments.',
            'Requests for tax credits and refunds: exporter VAT, fixed assets and overpaid taxes.',
            'Filing of RAV, RAF and TTA.',
            'Business closure (término de giro).',
          ],
        },
        {
          title: 'International taxation',
          items: [
            'Tax structuring of investments abroad.',
            'Advisory for foreign investors investing in Chile.',
            'Analysis and application of double taxation treaties.',
            'Determination of foreign-source income and filing of Sworn Statement 1929.',
            'Tax compliance for international investments.',
          ],
        },
      ],
    },
    {
      code: '03',
      img: '/services/auditoria.jpg',
      name: 'Audit',
      summary:
        'Independent, rigorous review of financial information, so that partners, banks and investors can rely on it fully. Asecon has been registered since 2016 in the CMF Registry of Account Inspectors and External Auditors (No. 418).',
      items: [
        'Audit of financial statements.',
        'Convergence to IFRS.',
        'Agreed-upon procedures.',
        'Support in external and international audits.',
        'Physical inventory counts of stock and fixed assets.',
        'Review and design of processes, cycles and manuals.',
        'Forensic, fraud and anti-money-laundering audit.',
        'Due diligence.',
      ],
    },
    {
      code: '04',
      img: '/services/remuneraciones.jpg',
      name: 'Payroll',
      summary:
        'We handle the payroll process from start to finish, in full compliance with labour and social security regulations, so that your team receives the right pay on time.',
      items: [
        'Payslip calculation: overtime, bonuses and benefits.',
        'Management of payroll records, medical leave, holidays and regularisations.',
        'Filing and payment of pension and health contributions via Previred.',
        'Advisory on current labour legislation.',
        'Labour cost and salary structure reports.',
        'Compliance with the Labor Directorate Modernisation Act.',
      ],
    },
    {
      code: '05',
      img: '/services/legal.jpg',
      name: 'Legal Advisory',
      summary:
        'Legal advice for individuals and companies, with a perspective that integrates the accounting, tax and commercial effects of every decision.',
      items: [
        'Comprehensive corporate legal advisory for the different areas of the business.',
        'Incorporation and amendment of companies.',
        'Drafting and review of contracts, powers of attorney and legal documents.',
        'Civil, labour and real estate advisory.',
        'Legal due diligence.',
        'Representation in litigation and conciliation proceedings.',
        'Regulatory compliance.',
      ],
    },
    {
      code: '06',
      img: '/services/finanzas-corporativas.jpg',
      name: 'Corporate Finance',
      summary:
        'We help you make investment, financing and risk decisions with clear information, to maximise your company’s value for partners and owners.',
      items: [
        'Monthly and forecast cash flow.',
        'Capital structure design and optimisation.',
        'Tailored management control reports.',
        'Long-term financial planning and analysis.',
        'Investment and wealth management alongside associated partners.',
      ],
    },
    {
      code: '07',
      img: '/services/reestructuraciones-patrimoniales.jpg',
      name: 'Estate Restructuring',
      summary:
        'We advise large and mid-sized companies and family groups on an ongoing basis on structuring their companies and on wealth, personal and inheritance matters. We support family offices and their companies in preparing business continuity for the next generations.',
      items: [
        'Corporate reorganisations: incorporations, mergers, spin-offs, dissolutions and capital changes.',
        'Strategies for business development and growth.',
        'Corporate governance and decision-making structures.',
        'Family businesses, inheritance and succession.',
        'Family wealth planning and forecasting.',
        'Structuring and running family offices.',
        'Purchase and sale of companies, shares and partnership interests, and their taxation.',
        'Foreign operating and passive-investment companies.',
      ],
    },
    {
      code: '08',
      img: '/services/representacion-empresas-extranjeras.jpg',
      name: 'Foreign Company Representation',
      summary:
        'We help foreign investors and companies set up and operate in Chile correctly and safely, from incorporating the company through to its day-to-day operation.',
      items: [
        'Handling powers of attorney through consulates to incorporate the company in Chile.',
        'Incorporation of the company and legal representation.',
        'Support in opening bank accounts.',
        'Fund custody and supplier payments.',
      ],
    },
  ],
};

export const content = { es, en };

/** Todo el contenido traducible del idioma pedido. */
export function getContent(lang) {
  return content[lang] ?? content.es;
}
