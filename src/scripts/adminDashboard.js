import {
  buildDashboard,
  formatCompact,
  formatDuration,
  formatPercent,
  formatDelta,
  formatDateShort,
  formatDateTime,
  lineChartGeometry,
  donutGeometry,
} from '../data/adminAnalytics.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
const PLUM = { light: '#B78FC1', mid: '#8B3E9C', main: '#6B1F7E', deep: '#42134E' };
const STATUS = { good: '#0ca30c', critical: '#d03b3b' };
const CHROME = { line: '#E4DCE8', muted: '#8A7F91', surfaceDim: '#F4F1F6' };

function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

function applyAttrs(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, String(value));
  }
}

function appendChildren(node, children) {
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// --- Tooltip compartido por todos los gráficos ---

let tooltipEl = null;

function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = h('div', {
      class: 'pointer-events-none fixed z-50 hidden max-w-[220px] rounded-lg bg-ink px-3 py-2 text-xs text-paper shadow-lg',
    });
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function showTooltip(x, y, rows) {
  const tip = getTooltip();
  clear(tip);
  rows.forEach(({ dot, value, label }) => {
    tip.appendChild(
      h('div', { class: 'flex items-center gap-2 whitespace-nowrap' }, [
        dot ? h('span', { class: 'inline-block h-2 w-2 shrink-0 rounded-full', style: `background:${dot}` }) : null,
        h('span', { class: 'font-mono font-semibold', text: value }),
        label ? h('span', { class: 'text-paper/60', text: label }) : null,
      ])
    );
  });
  tip.classList.remove('hidden');
  const pad = 14;
  const rect = tip.getBoundingClientRect();
  let left = x + pad;
  let top = y + pad;
  if (left + rect.width > window.innerWidth - 8) left = x - rect.width - pad;
  if (top + rect.height > window.innerHeight - 8) top = y - rect.height - pad;
  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.add('hidden');
}

// --- Piezas del panel ---

function deltaMeta(stat) {
  const direction = stat.deltaPct >= 0 ? 'up' : 'down';
  const isGood = direction === stat.goodDirection;
  return {
    color: isGood ? STATUS.good : STATUS.critical,
    arrow: direction === 'up' ? '▲' : '▼',
    text: formatDelta(stat.deltaPct),
  };
}

function statTile({ label, value, stat, accent = false }) {
  const meta = deltaMeta(stat);
  return h(
    'div',
    { class: `rounded-2xl border ${accent ? 'border-brass/40 bg-brass/5' : 'border-plum/15 bg-white'} p-5` },
    [
      h('p', { class: 'text-sm text-ink-soft', text: label }),
      h('p', { class: 'mt-2 font-mono text-2xl font-semibold text-ink', text: value }),
      h('p', { class: 'mt-2 flex items-center gap-1.5 text-xs font-medium', style: `color:${meta.color}` }, [
        h('span', { 'aria-hidden': 'true', text: meta.arrow }),
        h('span', { text: `${meta.text} vs. periodo anterior` }),
      ]),
    ]
  );
}

function renderStatTiles(root, data) {
  clear(root);
  const s = data.stats;
  const tiles = [
    { label: 'Sesiones', value: formatCompact(s.sessions.value), stat: s.sessions },
    { label: 'Usuarios', value: formatCompact(s.users.value), stat: s.users },
    { label: 'Páginas vistas', value: formatCompact(s.pageviews.value), stat: s.pageviews },
    { label: 'Duración media', value: formatDuration(s.avgDuration.value), stat: s.avgDuration },
    { label: 'Tasa de rebote', value: formatPercent(s.bounceRate.value), stat: s.bounceRate },
    { label: 'Formularios enviados', value: formatCompact(s.forms.value), stat: s.forms, accent: true },
  ];
  tiles.forEach((tile) => root.appendChild(statTile(tile)));
}

function renderVisitsChart(root, data) {
  clear(root);
  const width = 640;
  const height = 220;
  const geo = lineChartGeometry(data.series, { width, height });

  const chart = svg('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'h-auto w-full',
    role: 'img',
    'aria-label': `Sesiones diarias, ${data.days} días`,
  });

  geo.yTicks.forEach((tick) => {
    chart.appendChild(svg('line', { x1: 4, x2: width - 4, y1: tick.y, y2: tick.y, stroke: CHROME.line, 'stroke-width': 1 }));
    chart.appendChild(
      svg('text', { x: 6, y: tick.y - 4, style: `fill:${CHROME.muted};font-size:10px;`, text: tick.label })
    );
  });

  chart.appendChild(svg('path', { d: geo.areaPath, fill: PLUM.main, 'fill-opacity': '0.1' }));
  chart.appendChild(
    svg('path', {
      d: geo.linePath,
      fill: 'none',
      stroke: PLUM.main,
      'stroke-width': 2,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    })
  );

  const first = geo.points[0];
  const mid = geo.points[Math.floor(geo.points.length / 2)];
  const last = geo.points[geo.points.length - 1];
  [
    [first, 'start'],
    [mid, 'middle'],
    [last, 'end'],
  ].forEach(([p, anchor]) => {
    chart.appendChild(
      svg('text', {
        x: p.x,
        y: height - 8,
        'text-anchor': anchor,
        style: `fill:${CHROME.muted};font-size:10px;`,
        text: formatDateShort(p.date),
      })
    );
  });

  const crosshair = svg('line', {
    x1: first.x,
    x2: first.x,
    y1: 12,
    y2: geo.baseline,
    stroke: '#3A2C44',
    'stroke-width': 1,
    class: 'hidden',
  });
  const dot = svg('circle', {
    cx: first.x,
    cy: first.y,
    r: 5,
    fill: PLUM.deep,
    stroke: '#FFFFFF',
    'stroke-width': 2,
    class: 'hidden',
  });
  const hit = svg('rect', { x: 0, y: 0, width, height, fill: 'transparent' });

  function pointAt(clientX) {
    const rect = chart.getBoundingClientRect();
    const scaleX = width / rect.width;
    const localX = (clientX - rect.left) * scaleX;
    const innerW = width - 8;
    let idx = Math.round(((localX - 4) / innerW) * (geo.points.length - 1));
    return geo.points[Math.max(0, Math.min(geo.points.length - 1, idx))];
  }

  function onMove(event) {
    const p = pointAt(event.clientX);
    crosshair.setAttribute('x1', p.x);
    crosshair.setAttribute('x2', p.x);
    crosshair.classList.remove('hidden');
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    dot.classList.remove('hidden');
    showTooltip(event.clientX, event.clientY, [
      { dot: PLUM.main, value: `${formatCompact(p.sessions)} sesiones`, label: formatDateShort(p.date) },
    ]);
  }

  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerleave', () => {
    crosshair.classList.add('hidden');
    dot.classList.add('hidden');
    hideTooltip();
  });

  chart.appendChild(crosshair);
  chart.appendChild(dot);
  chart.appendChild(hit);
  root.appendChild(chart);
}

function renderVisitsTable(root, data) {
  clear(root);
  const table = h('table', { class: 'w-full text-left text-sm' }, [
    h('thead', {}, [
      h('tr', { class: 'text-xs uppercase tracking-wide text-ink-soft' }, [
        h('th', { class: 'py-1 pr-4 font-medium', text: 'Fecha' }),
        h('th', { class: 'py-1 pr-4 font-medium', text: 'Sesiones' }),
      ]),
    ]),
  ]);
  const tbody = h('tbody');
  data.series.forEach((d) => {
    tbody.appendChild(
      h('tr', { class: 'border-t border-plum/10' }, [
        h('td', { class: 'py-1 pr-4', text: formatDateShort(d.date) }),
        h('td', { class: 'py-1 pr-4 font-mono tabular-nums', text: formatCompact(d.sessions) }),
      ])
    );
  });
  table.appendChild(tbody);
  root.appendChild(table);
}

function renderDonut(root, segments, { label }) {
  clear(root);
  const size = 168;
  const geo = donutGeometry(segments, { size, thickness: 24 });
  const total = segments.reduce((a, s) => a + s.sessions, 0);

  const wrap = h('div', { class: 'flex flex-col items-center gap-5 sm:flex-row' });

  const chart = svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, role: 'img', 'aria-label': label });
  geo.arcs.forEach((arc, i) => {
    const color = CATEGORICAL[i % CATEGORICAL.length];
    const path = svg('path', {
      d: arc.d,
      fill: color,
      stroke: '#FFFFFF',
      'stroke-width': 2,
      tabindex: '0',
      class: 'cursor-pointer transition-[filter] duration-150 hover:brightness-110 focus-visible:brightness-110 focus-visible:outline-none',
    });
    const show = (clientX, clientY) => {
      showTooltip(clientX, clientY, [
        { dot: color, value: formatPercent(arc.pct), label: `${arc.label} · ${formatCompact(arc.sessions)} sesiones` },
      ]);
    };
    path.addEventListener('pointermove', (e) => show(e.clientX, e.clientY));
    path.addEventListener('pointerenter', (e) => show(e.clientX, e.clientY));
    path.addEventListener('pointerleave', hideTooltip);
    path.addEventListener('focus', () => {
      const r = path.getBoundingClientRect();
      show(r.left + r.width / 2, r.top + r.height / 2);
    });
    path.addEventListener('blur', hideTooltip);
    chart.appendChild(path);
  });
  chart.appendChild(
    svg('text', {
      x: size / 2,
      y: size / 2 - 4,
      'text-anchor': 'middle',
      style: 'fill:#1F1726;font-size:20px;font-weight:600;font-family:"IBM Plex Mono",monospace;',
      text: formatCompact(total),
    })
  );
  chart.appendChild(
    svg('text', {
      x: size / 2,
      y: size / 2 + 14,
      'text-anchor': 'middle',
      style: `fill:${CHROME.muted};font-size:10px;`,
      text: 'sesiones',
    })
  );

  const legend = h(
    'ul',
    { class: 'flex-1 space-y-2 text-sm' },
    geo.arcs.map((arc, i) =>
      h('li', { class: 'flex items-center justify-between gap-3' }, [
        h('span', { class: 'flex items-center gap-2 text-ink-soft' }, [
          h('span', { class: 'inline-block h-2.5 w-2.5 rounded-sm', style: `background:${CATEGORICAL[i % CATEGORICAL.length]}` }),
          h('span', { text: arc.label }),
        ]),
        h('span', { class: 'font-mono tabular-nums text-ink', text: formatPercent(arc.pct) }),
      ])
    )
  );

  wrap.appendChild(chart);
  wrap.appendChild(legend);
  root.appendChild(wrap);
}

function renderTopPages(root, data) {
  clear(root);
  const max = Math.max(...data.topPages.map((p) => p.pageviews)) || 1;
  const list = h(
    'ul',
    { class: 'space-y-3' },
    data.topPages.map((page) => {
      const widthPct = Math.max(4, (page.pageviews / max) * 100);
      return h('li', {}, [
        h('div', { class: 'mb-1 flex items-baseline justify-between gap-3 text-sm' }, [
          h('span', { class: 'truncate font-mono text-ink', text: page.path }),
          h('span', { class: 'shrink-0 font-mono tabular-nums text-ink-soft', text: formatCompact(page.pageviews) }),
        ]),
        h('div', { class: 'h-2.5 rounded-full', style: `background:${CHROME.surfaceDim}` }, [
          h('div', { class: 'h-2.5 rounded-full', style: `width:${widthPct}%;background:${PLUM.mid}` }),
        ]),
      ]);
    })
  );
  root.appendChild(list);
}

function renderFunnel(root, data) {
  clear(root);
  const colors = [PLUM.light, PLUM.main, PLUM.deep];
  const base = data.funnel[0].value || 1;
  const rows = h('div', { class: 'space-y-4' });

  data.funnel.forEach((stage, i) => {
    const pctOfBase = (stage.value / base) * 100;
    rows.appendChild(
      h('div', {}, [
        h('div', { class: 'mb-1 flex items-baseline justify-between text-sm' }, [
          h('span', { class: 'text-ink-soft', text: stage.label }),
          h('span', { class: 'font-mono tabular-nums text-ink', text: formatCompact(stage.value) }),
        ]),
        h('div', { class: 'h-3 rounded-full', style: `background:${CHROME.surfaceDim}` }, [
          h('div', {
            class: 'h-3 rounded-full transition-[width] duration-300',
            style: `width:${Math.max(6, pctOfBase)}%;background:${colors[i % colors.length]}`,
          }),
        ]),
      ])
    );
    if (i < data.funnel.length - 1) {
      const next = data.funnel[i + 1];
      const convPct = stage.value > 0 ? (next.value / stage.value) * 100 : 0;
      rows.appendChild(
        h('p', { class: 'pl-1 text-xs text-ink-soft', text: `↳ ${formatPercent(convPct)} avanzó al siguiente paso` })
      );
    }
  });

  root.appendChild(rows);
}

function renderLeadsTable(root, data) {
  clear(root);
  const table = h('table', { class: 'w-full text-left text-sm' }, [
    h('thead', {}, [
      h('tr', { class: 'text-xs uppercase tracking-wide text-ink-soft' }, [
        h('th', { class: 'py-2 pr-4 font-medium', text: 'Empresa (ejemplo)' }),
        h('th', { class: 'py-2 pr-4 font-medium', text: 'Página de origen' }),
        h('th', { class: 'py-2 pr-4 font-medium', text: 'Idioma' }),
        h('th', { class: 'py-2 pr-4 font-medium', text: 'Fecha' }),
      ]),
    ]),
  ]);
  const tbody = h('tbody');
  if (data.leads.length === 0) {
    tbody.appendChild(
      h('tr', {}, [h('td', { colspan: '4', class: 'py-4 text-ink-soft', text: 'Sin envíos en este rango.' })])
    );
  }
  data.leads.forEach((lead) => {
    tbody.appendChild(
      h('tr', { class: 'border-t border-plum/10' }, [
        h('td', { class: 'py-2 pr-4 text-ink', text: lead.org }),
        h('td', { class: 'py-2 pr-4 font-mono text-ink-soft', text: lead.page }),
        h('td', { class: 'py-2 pr-4 text-ink-soft', text: lead.lang }),
        h('td', { class: 'py-2 pr-4 font-mono tabular-nums text-ink-soft', text: formatDateTime(lead.when) }),
      ])
    );
  });
  table.appendChild(tbody);
  root.appendChild(table);
}

export function mountAdminDashboard() {
  const root = document.getElementById('admin-dashboard');
  if (!root) return;

  const refs = {
    tiles: root.querySelector('#admin-stat-tiles'),
    visits: root.querySelector('#admin-chart-visits'),
    visitsTable: root.querySelector('#admin-chart-visits-table'),
    traffic: root.querySelector('#admin-chart-traffic'),
    devices: root.querySelector('#admin-chart-devices'),
    topPages: root.querySelector('#admin-list-top-pages'),
    funnel: root.querySelector('#admin-funnel'),
    leads: root.querySelector('#admin-table-leads'),
    updatedAt: root.querySelector('#admin-updated-at'),
    rangeButtons: Array.from(root.querySelectorAll('[data-range-days]')),
    tableToggle: root.querySelector('#admin-visits-table-toggle'),
  };

  function render(days) {
    const data = buildDashboard(days);
    renderStatTiles(refs.tiles, data);
    renderVisitsChart(refs.visits, data);
    renderVisitsTable(refs.visitsTable, data);
    renderDonut(refs.traffic, data.trafficSources, { label: 'Fuentes de tráfico' });
    renderDonut(refs.devices, data.devices, { label: 'Dispositivo' });
    renderTopPages(refs.topPages, data);
    renderFunnel(refs.funnel, data);
    renderLeadsTable(refs.leads, data);
    refs.updatedAt.textContent = `Actualizado ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · datos de ejemplo`;

    refs.rangeButtons.forEach((btn) => {
      const active = Number(btn.dataset.rangeDays) === days;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('bg-plum', active);
      btn.classList.toggle('text-paper', active);
      btn.classList.toggle('text-ink-soft', !active);
    });
  }

  refs.rangeButtons.forEach((btn) => {
    btn.addEventListener('click', () => render(Number(btn.dataset.rangeDays)));
  });

  if (refs.tableToggle) {
    refs.tableToggle.addEventListener('click', () => {
      const hidden = refs.visitsTable.classList.toggle('hidden');
      refs.visits.classList.toggle('hidden', !hidden);
      refs.tableToggle.textContent = hidden ? 'Ver como tabla' : 'Ver como gráfico';
    });
  }

  render(30);
}
