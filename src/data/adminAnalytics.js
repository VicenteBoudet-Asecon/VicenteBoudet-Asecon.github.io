// Datos de ejemplo para el panel de /admin. No hay analítica real conectada:
// todo se genera con un generador pseudoaleatorio con semilla fija por rango,
// así los números son estables entre recargas pero cambian al elegir otro
// rango de fechas. Ver README para cómo conectar una fuente real.

export const RANGE_OPTIONS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

// Rutas reales del sitio (src/i18n/config.js) para que "Páginas más vistas"
// se sienta anclado al contenido real en vez de inventar URLs sueltas.
const PAGES = [
  { path: '/', label: 'Inicio', weight: 1 },
  { path: '/servicios', label: 'Servicios', weight: 0.62 },
  { path: '/contacto', label: 'Contacto', weight: 0.48 },
  { path: '/equipo', label: 'Nuestro Equipo', weight: 0.4 },
  { path: '/sello-asecon', label: 'Sello Asecon', weight: 0.33 },
  { path: '/clientes', label: 'Clientes', weight: 0.27 },
  { path: '/novedades', label: 'Novedades', weight: 0.22 },
  { path: '/en/*', label: 'Sitio en inglés', weight: 0.16 },
];

const TRAFFIC_SOURCES = [
  { key: 'organico', label: 'Búsqueda orgánica', base: 0.38 },
  { key: 'directo', label: 'Directo', base: 0.27 },
  { key: 'social', label: 'Redes sociales', base: 0.16 },
  { key: 'referido', label: 'Referidos', base: 0.12 },
  { key: 'email', label: 'Email', base: 0.07 },
];

const DEVICES = [
  { key: 'desktop', label: 'Escritorio', base: 0.57 },
  { key: 'movil', label: 'Móvil', base: 0.37 },
  { key: 'tablet', label: 'Tablet', base: 0.06 },
];

const DEMO_LEADS = [
  { org: 'Constructora Ejemplo SpA', page: '/contacto', lang: 'ES' },
  { org: 'Comercial Demo Ltda.', page: '/soluciones', lang: 'ES' },
  { org: 'Inversiones Prueba S.A.', page: '/sello-asecon', lang: 'ES' },
  { org: 'Sample Holdings Inc.', page: '/en/contact', lang: 'EN' },
  { org: 'Distribuidora Modelo Ltda.', page: '/equipo', lang: 'ES' },
  { org: 'Ejemplo Consultores SpA', page: '/contacto', lang: 'ES' },
  { org: 'Test Trading Co.', page: '/en/services', lang: 'EN' },
  { org: 'Servicios Muestra Ltda.', page: '/clientes', lang: 'ES' },
];

// mulberry32: PRNG chico y determinista — misma semilla, misma secuencia.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromRange(days, offset = 0) {
  return days * 1000 + offset;
}

function dailySeries(days, seed) {
  const rng = mulberry32(seed);
  const spikeDay = Math.floor(days * 0.62);
  const out = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayIndex = days - 1 - i;
    const weekday = date.getDay(); // 0 domingo .. 6 sábado

    const weekendFactor = weekday === 0 ? 0.45 : weekday === 6 ? 0.55 : 1.05;
    const trend = 1 + (dayIndex / days) * 0.18;
    const noise = 0.88 + rng() * 0.24;
    const spike = dayIndex === spikeDay ? 1.45 : 1;

    const base = 340 * weekendFactor * trend * noise * spike;
    const sessions = Math.round(base);
    const pagesPerSession = 2.3 + rng() * 0.6;
    const users = Math.round(sessions * (0.78 + rng() * 0.1));
    const avgDuration = Math.round(96 + rng() * 78);
    const bounceRate = 30 + rng() * 18;

    out.push({
      date,
      sessions,
      pageviews: Math.round(sessions * pagesPerSession),
      users,
      avgDuration,
      bounceRate,
    });
  }
  return out;
}

function sum(arr, pick) {
  return arr.reduce((acc, item) => acc + pick(item), 0);
}

function weightedAvg(arr, pick, weightPick) {
  const totalWeight = sum(arr, weightPick) || 1;
  return sum(arr, (item) => pick(item) * weightPick(item)) / totalWeight;
}

function pctDelta(current, previous) {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function normalizeShares(list, rng) {
  const jittered = list.map((item) => Math.max(0.02, item.base * (0.85 + rng() * 0.3)));
  const total = jittered.reduce((a, b) => a + b, 0);
  return list.map((item, i) => ({ ...item, share: jittered[i] / total }));
}

export function buildDashboard(days) {
  const current = dailySeries(days, seedFromRange(days, 0));
  const previous = dailySeries(days, seedFromRange(days, 1));
  const rng = mulberry32(seedFromRange(days, 2));

  const sessions = sum(current, (d) => d.sessions);
  const prevSessions = sum(previous, (d) => d.sessions);
  const pageviews = sum(current, (d) => d.pageviews);
  const prevPageviews = sum(previous, (d) => d.pageviews);
  const users = sum(current, (d) => d.users);
  const prevUsers = sum(previous, (d) => d.users);
  const avgDuration = weightedAvg(current, (d) => d.avgDuration, (d) => d.sessions);
  const prevAvgDuration = weightedAvg(previous, (d) => d.avgDuration, (d) => d.sessions);
  const bounceRate = weightedAvg(current, (d) => d.bounceRate, (d) => d.sessions);
  const prevBounceRate = weightedAvg(previous, (d) => d.bounceRate, (d) => d.sessions);

  const formRate = 0.0038 + rng() * 0.0018;
  const prevFormRate = 0.0038 + rng() * 0.0018;
  const forms = Math.max(1, Math.round(sessions * formRate));
  const prevForms = Math.max(1, Math.round(prevSessions * prevFormRate));

  const contactViews = Math.round(sessions * (0.09 + rng() * 0.04));
  const funnel = [
    { label: 'Visitas al sitio', value: sessions },
    { label: 'Vieron la página de Contacto', value: Math.max(contactViews, forms + 4) },
    { label: 'Enviaron el formulario', value: forms },
  ];

  const trafficSources = normalizeShares(TRAFFIC_SOURCES, rng).map((s) => ({
    ...s,
    sessions: Math.round(sessions * s.share),
  }));

  const devices = normalizeShares(DEVICES, rng).map((d) => ({
    ...d,
    sessions: Math.round(sessions * d.share),
  }));

  const totalPageWeight = PAGES.reduce((a, p) => a + p.weight, 0);
  const topPages = PAGES.map((p) => ({
    path: p.path,
    label: p.label,
    pageviews: Math.round((pageviews * p.weight * (0.9 + rng() * 0.2)) / totalPageWeight),
    avgTime: Math.round(60 + rng() * 150),
  })).sort((a, b) => b.pageviews - a.pageviews);

  const leadCount = Math.min(DEMO_LEADS.length, Math.max(4, Math.round(forms / Math.max(1, Math.round(days / 6)))));
  const leads = DEMO_LEADS.slice(0, leadCount).map((lead, i) => {
    const hoursAgo = i * (days * 3.1) + rng() * 10;
    const when = new Date(Date.now() - hoursAgo * 3600 * 1000);
    return { ...lead, id: i, when };
  });

  return {
    days,
    series: current,
    stats: {
      sessions: { value: sessions, deltaPct: pctDelta(sessions, prevSessions), goodDirection: 'up' },
      users: { value: users, deltaPct: pctDelta(users, prevUsers), goodDirection: 'up' },
      pageviews: { value: pageviews, deltaPct: pctDelta(pageviews, prevPageviews), goodDirection: 'up' },
      avgDuration: { value: avgDuration, deltaPct: pctDelta(avgDuration, prevAvgDuration), goodDirection: 'up' },
      bounceRate: { value: bounceRate, deltaPct: pctDelta(bounceRate, prevBounceRate), goodDirection: 'down' },
      forms: { value: forms, deltaPct: pctDelta(forms, prevForms), goodDirection: 'up' },
    },
    trafficSources,
    devices,
    topPages,
    funnel,
    leads,
  };
}

export function formatCompact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function formatPercent(n, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function formatDelta(pct) {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatDateShort(date) {
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

export function formatDateTime(date) {
  return date.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// --- Geometría de gráficos: funciones puras (sin DOM) usadas tanto en el
// render inicial (Astro/servidor) como al cambiar de rango (navegador). ---

export function lineChartGeometry(series, { width, height, padTop = 12, padBottom = 28, padLeft = 4, padRight = 4 }) {
  const values = series.map((d) => d.sessions);
  const max = Math.max(...values) * 1.12;
  const min = 0;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const points = series.map((d, i) => {
    const x = padLeft + (series.length === 1 ? 0 : (i / (series.length - 1)) * innerW);
    const y = padTop + innerH - ((d.sessions - min) / (max - min)) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const baseline = padTop + innerH;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${baseline} L${points[0].x.toFixed(2)},${baseline} Z`;

  const yTicks = [0, 0.5, 1].map((f) => ({
    y: padTop + innerH - f * innerH,
    label: formatCompact(min + f * (max - min)),
  }));

  return { points, linePath, areaPath, yTicks, baseline };
}

export function donutGeometry(segments, { size, thickness }) {
  const r = size / 2;
  const innerR = r - thickness;
  const cx = r;
  const cy = r;
  const total = segments.reduce((a, s) => a + s.share, 0) || 1;

  let angle = -Math.PI / 2;
  const arcs = segments.map((s) => {
    const frac = s.share / total;
    const startAngle = angle;
    const endAngle = angle + frac * Math.PI * 2;
    angle = endAngle;

    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const p = (a, radius) => [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
    const [x1, y1] = p(startAngle, r);
    const [x2, y2] = p(endAngle, r);
    const [x3, y3] = p(endAngle, innerR);
    const [x4, y4] = p(startAngle, innerR);

    const d = [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      'Z',
    ].join(' ');

    return { ...s, d, pct: frac * 100 };
  });

  return { arcs, cx, cy, r, innerR };
}
