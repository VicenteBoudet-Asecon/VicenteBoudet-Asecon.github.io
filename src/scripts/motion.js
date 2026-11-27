// Efectos de movimiento del sitio. JavaScript propio, sin dependencias.
//
// Reglas que se respetan (no negociables en este sitio):
//  · Sin JavaScript todo el contenido se ve: nada queda oculto por CSS. Los
//    elementos se ocultan desde acá, y solo los que están bajo el pliegue.
//  · prefers-reduced-motion: no hay aparición ni paralaje (la barra de progreso
//    y la sombra del encabezado no son movimiento, así que se mantienen).
//  · Nada se mueve solo ni en bucle: todo responde al desplazamiento.
//  · Solo transform y opacity (sin saltos de maquetación) y los efectos se
//    desmontan al terminar, para no chocar con los hover de las tarjetas.
//
// Aparición: no hace falta marcar nada en las plantillas. Cada hijo directo de
// un `.wrap` (y el carrusel de la portada) es un bloque que aparece; si dentro
// hay una grilla de 3 o más tarjetas, estas entran escalonadas. Para excluir
// algo, ponerle data-no-reveal.

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Línea fina arriba que avanza con la lectura de la página. */
function barraDeProgreso() {
  const barra = document.createElement('div');
  barra.className = 'scroll-progress';
  barra.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barra);

  let pendiente = false;
  const pintar = () => {
    pendiente = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
  }, { passive: true });
  window.addEventListener('resize', pintar);
  pintar();
}

/** El encabezado se despega del contenido con una sombra al bajar. */
function sombraDelEncabezado() {
  const h = document.querySelector('header.sticky');
  if (!h) return;
  const f = () => h.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', f, { passive: true });
  f();
}

// ── Aparición al desplazarse ────────────────────────────────────────────────
const GRILLA = 'ul, ol, .grid, .rejilla, [data-posts]';
const hijos = (el) => [...el.children].filter((c) => c.getBoundingClientRect().height > 0);

function revelar() {
  const bajoElPliegue = (el) => {
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.top > window.innerHeight * 0.98;
  };

  /** Qué se anima de un bloque: sus partes sueltas y, aparte, las tarjetas de una grilla. */
  const partesDe = (bloque) => {
    const grilla = bloque.matches(GRILLA) ? bloque : [...bloque.children].find((c) => c.matches(GRILLA));
    if (!grilla) return { sueltas: [bloque], tarjetas: [] };
    const tarjetas = hijos(grilla);
    if (tarjetas.length < 3) return { sueltas: [bloque], tarjetas: [] };
    const sueltas = grilla === bloque ? [] : [...bloque.children].filter((c) => c !== grilla && c.getBoundingClientRect().height > 0);
    return { sueltas, tarjetas, grilla };
  };

  const objetivos = [];
  const bloques = document.querySelectorAll('main .wrap > *, main > section > [data-teaser-track]');
  bloques.forEach((bloque) => {
    if (bloque.closest('[data-no-reveal]')) return;
    const { sueltas, tarjetas, grilla } = partesDe(bloque);
    // Se decide pieza por pieza: una grilla puede empezar en pantalla y tener
    // filas más abajo, y esas filas sí deben aparecer al llegar.
    sueltas.forEach((el) => { if (bajoElPliegue(el)) objetivos.push({ el, retraso: 0 }); });
    if (tarjetas.length) {
      // Una ola por filas: el retraso depende de la columna, no del número de orden.
      const columnas = Math.max(1, getComputedStyle(grilla).gridTemplateColumns.split(' ').length);
      tarjetas.forEach((el, i) => {
        if (bajoElPliegue(el)) objetivos.push({ el, retraso: Math.min(i % columnas, 5) * 90 + (sueltas.length ? 80 : 0) });
      });
    }
  });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      observador.unobserve(e.target);
      mostrar(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  function mostrar(el) {
    if (!el.classList.contains('rv')) return;
    el.classList.add('rv-in');
    // Al terminar se quita todo: así no quedan transform ni will-change
    // peleando con los hover de las tarjetas.
    const limpiar = () => { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv-d'); };
    el.addEventListener('transitionend', (ev) => { if (ev.propertyName === 'opacity') limpiar(); }, { once: true });
    setTimeout(limpiar, 1800);
  }

  objetivos.forEach(({ el, retraso }) => {
    el.classList.add('rv');
    el.style.setProperty('--rv-d', `${retraso}ms`);
    observador.observe(el);
  });

  // Quien navega con teclado puede llegar a algo que aún no apareció: se muestra.
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest && e.target.closest('.rv');
    if (el) { observador.unobserve(el); el.style.setProperty('--rv-d', '0ms'); mostrar(el); }
  });
}

// ── Paralaje sutil ──────────────────────────────────────────────────────────
// El fondo se mueve algo más lento que la página. Se usa la propiedad `translate`
// (se compone con el `transform` de Tailwind, p. ej. las rotaciones) y los fondos
// se agrandan un 12 % para que no queden bordes vacíos.
function paralaje() {
  const items = [];
  const agrandado = (el, k) => { el.style.scale = '1.12'; items.push({ el, k, agrandado: true }); };

  const video = document.getElementById('hero-video');
  if (video) agrandado(video, 0.16);
  document.querySelectorAll('main > section:first-child > img[fetchpriority], main > section:first-child > div.flex[aria-hidden="true"]')
    .forEach((el) => agrandado(el, 0.2));
  document.querySelectorAll('section img.pointer-events-none[aria-hidden="true"][src$="Isotipo.svg"]')
    .forEach((el) => items.push({ el, k: 0.1, agrandado: false }));
  if (!items.length) return;

  const visibles = new Set();
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      // Varios elementos pueden compartir sección (el video y una marca de agua).
      items.filter((x) => x.host === e.target).forEach((it) => {
        e.isIntersecting ? visibles.add(it) : visibles.delete(it);
      });
    });
    pedir();
  }, { rootMargin: '10% 0px 10% 0px' });
  items.forEach((it) => { it.host = it.el.closest('section'); if (it.host) io.observe(it.host); });

  let pendiente = false;
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }
  function pintar() {
    pendiente = false;
    const centro = window.innerHeight / 2;
    visibles.forEach((it) => {
      const r = it.host.getBoundingClientRect();
      const limite = it.agrandado ? it.el.offsetHeight * 0.06 - 2 : 60;
      const y = Math.max(-limite, Math.min(limite, (centro - (r.top + r.height / 2)) * it.k));
      it.el.style.translate = `0 ${y.toFixed(1)}px`;
    });
  }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
}

// ── Arranque ────────────────────────────────────────────────────────────────
// Va al final a propósito: las constantes de arriba (GRILLA, hijos) tienen que
// estar definidas antes de llamar a las funciones que las usan.
barraDeProgreso();
sombraDelEncabezado();
if (!reducido.matches && 'IntersectionObserver' in window) {
  revelar();
  paralaje();
}
