// Traduce lo que ya está instrumentado con data-cta / data-form / el evento
// asecon:lead a eventos de gtag, sin que ningún componente tenga que
// importar código de analítica. Se monta en todas las páginas (Layout.astro)
// independientemente de si GA4 está activo: si window.gtag no existe, send()
// no hace nada — así el gancho queda listo desde ya y no hay que volver a
// tocar cada componente cuando se active la medición.

(function () {
  function send(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  const CTA_EVENTS = {
    whatsapp: 'contact_whatsapp',
    call: 'contact_phone',
    email: 'contact_email',
    'service-area': 'select_content',
    'lead-magnet-download': 'file_download',
  };

  document.addEventListener('click', (event) => {
    const cta = event.target.closest('[data-cta]');
    if (cta) {
      const kind = cta.dataset.cta;
      const location = cta.dataset.ctaLocation || '';
      const eventName = CTA_EVENTS[kind] || 'cta_click';
      send(eventName, { cta: kind, location, link_url: cta.getAttribute('href') || undefined });
      return; // ya es un CTA conocido: no lo cuentes también como outbound.
    }

    // Enlaces salientes que no tienen su propio data-cta (LinkedIn, el
    // registro de la CMF, el mapa, LinkedIn).
    const link = event.target.closest('a[target="_blank"]');
    if (!link) return;
    try {
      const host = new URL(link.href, location.href).hostname;
      if (host && host !== window.location.hostname) send('outbound_click', { link_domain: host });
    } catch (e) {
      /* href relativo o inválido: no es un enlace saliente real */
    }
  });

  // Primer foco en un campo de un formulario de leads: permite calcular
  // abandono (cuántos empiezan vs. cuántos completan generate_lead).
  const started = new WeakSet();
  document.addEventListener('focusin', (event) => {
    const form = event.target.closest('form[data-form="lead"]');
    if (!form || started.has(form)) return;
    started.add(form);
    send('form_start', { form_location: form.dataset.formVariant });
  });

  // Lo dispara leadForm.js al terminar un envío (éxito o error) — ver
  // src/scripts/leadForm.js. Es la fuente principal de generate_lead; el
  // camino sin JS lo dispara gracias.astro / en/thank-you.astro en su lugar
  // (con guarda para no contarlo dos veces si además hubo JS).
  document.addEventListener('asecon:lead', (event) => {
    const d = event.detail || {};
    if (d.state === 'ok') {
      send('generate_lead', { method: d.variant, form_location: d.source, service_interest: d.area || undefined });
    } else if (d.state === 'error') {
      send('form_error', { form_location: d.source });
    }
  });

  // Conmutador de idioma del header.
  document.querySelectorAll('a[hreflang]').forEach((a) => {
    a.addEventListener('click', () => {
      send('language_switch', { to: a.getAttribute('hreflang') });
    });
  });
})();
