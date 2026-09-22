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
  headcount: 50,
  practiceAreas: 8,
  cmfRegistry: '418',
  cmfSince: 2016,
  phone1: '+562 2951 9191',
  phone2: '+562 2951 9192',
  email: 'info@aseconsa.com',
  address: 'Los Militares 5953 of. 302, Las Condes, Santiago, Chile.',
  mapUrl: 'https://maps.app.goo.gl/Weid4zP3PUe5pLTdA',
  linkedin: 'https://www.linkedin.com/company/aseconsa',
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
  },

  ui: {
    skipToContent: 'Saltar al contenido',
    openMenu: 'Abrir menú',
    switchTo: 'View this page in English',
    people: 'personas',
    viewAllServices: 'Ver todos los servicios',
    requestInfo: 'Solicitar más información',
    scheduleMeeting: 'Agendar una reunión',
    viewServices: 'Ver servicios',
    meetTheTeam: 'Conocer al equipo',
    learnAboutSeal: 'Conoce el Sello Asecon',
    goToContact: 'Ir a Contacto',
    backHome: 'Volver al inicio',
    allRightsReserved: 'Todos los derechos reservados.',
  },

  credentials: {
    label: 'Respaldo',
    items: [
      { value: 'N° 418', label: 'Registro CMF de Auditores Externos, desde 2016' },
      { value: '1996', label: 'Año de fundación en Santiago de Chile' },
      { value: '50', label: 'Profesionales en contabilidad, impuestos y auditoría' },
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
    types: [
      'Empresas productivas',
      'Empresas de servicios',
      'Empresas de inversión',
      'PYME',
      'Empresas extranjeras',
      'Agencias',
      'OSFL',
      'Family office',
      'Gerentes y rentistas',
      'Inversionistas de alto patrimonio',
    ],
  },

  testimonials: {
    eyebrow: 'Testimonios',
    title: ['Lo que dicen', 'de nosotros'],
    items: [
      {
        quote:
          'La confianza y tranquilidad que Sello Asecon nos brinda es invaluable. Su compromiso con la excelencia se refleja en cada detalle de su trabajo.',
        author: 'Cliente anónimo',
        industry: 'Industria Financiera',
      },
      {
        quote:
          'Desde que comenzamos a trabajar juntos, hemos notado una mejora significativa en nuestra gestión contable y legal. Su equipo estuvo siempre dispuesto a ayudarnos en cualquier situación.',
        author: 'Cliente anónimo',
        industry: 'Industria Comercial',
      },
    ],
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
    ringText: 'SELLO ASECON - GARANTIA SIEMPRE VIGENTE - ',
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
      '50 profesionales en dirección, gerencia, supervisión, equipo técnico y soporte.',
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
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos en qué podemos ayudarte',
      submit: 'Enviar solicitud',
    },
    subject: 'Nuevo contacto desde aseconsa.com',
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
  },

  thanks: {
    eyebrow: 'Mensaje recibido',
    title: ['Gracias por', 'escribirnos'],
    body:
      'Recibimos tu solicitud. Un miembro de nuestro equipo se pondrá en contacto contigo a la brevedad para conversar en detalle.',
    urgentLabel: '¿Es urgente?',
  },

  notFound: {
    eyebrow: 'Error 404',
    heading: 'Esta página no existe',
    body: 'El enlace puede estar roto o la página cambió de dirección. Volvamos a un lugar conocido.',
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
  },

  ui: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    switchTo: 'Ver esta página en español',
    people: 'people',
    viewAllServices: 'View all services',
    requestInfo: 'Request more information',
    scheduleMeeting: 'Schedule a meeting',
    viewServices: 'View services',
    meetTheTeam: 'Meet the team',
    learnAboutSeal: 'About the Asecon Seal',
    goToContact: 'Go to Contact',
    backHome: 'Back to home',
    allRightsReserved: 'All rights reserved.',
  },

  credentials: {
    label: 'Credentials',
    items: [
      { value: 'No. 418', label: 'CMF External Auditors Registry, since 2016' },
      { value: '1996', label: 'Founded in Santiago, Chile' },
      { value: '50', label: 'Professionals across accounting, tax and audit' },
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
      'Manufacturing companies',
      'Service companies',
      'Investment companies',
      'Small and mid-sized business',
      'Foreign companies',
      'Branch offices',
      'Non-profit organisations',
      'Family offices',
      'Executives and private investors',
      'High-net-worth individuals',
    ],
  },

  testimonials: {
    eyebrow: 'Testimonials',
    title: ['What our clients', 'say'],
    items: [
      {
        quote:
          'The confidence and peace of mind the Asecon Seal gives us is invaluable. Their commitment to excellence shows in every detail of their work.',
        author: 'Anonymous client',
        industry: 'Financial industry',
      },
      {
        quote:
          'Since we started working together we have seen a significant improvement in our accounting and legal management. Their team was always willing to help us in any situation.',
        author: 'Anonymous client',
        industry: 'Commercial industry',
      },
    ],
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
    ringText: 'ASECON SEAL - ALWAYS GUARANTEED - ',
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
      '50 professionals across leadership, management, supervision, technical staff and support.',
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
      message: 'Message',
      messagePlaceholder: 'Tell us how we can help',
      submit: 'Send request',
    },
    subject: 'New contact from aseconsa.com (EN)',
    devNotice:
      'Development-only notice: PUBLIC_WEB3FORMS_KEY is not set in .env, so the form is not delivering messages yet. See .env.example.',
    unavailable: {
      title: 'The form is not active yet',
      body: 'While we turn it on, write to us directly through these — we reply just as fast.',
      ctaPhone: 'Call us',
      ctaMail: 'Email us',
    },
  },

  thanks: {
    eyebrow: 'Message received',
    title: ['Thank you for', 'writing to us'],
    body:
      'We have received your request. A member of our team will get in touch shortly to talk it through.',
    urgentLabel: 'Is it urgent?',
  },

  notFound: {
    eyebrow: 'Error 404',
    heading: 'This page does not exist',
    body: 'The link may be broken, or the page may have moved. Let’s get you somewhere familiar.',
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
