// Mejora progresiva sobre <form data-form="lead"> (LeadForm.astro): un solo
// listener delegado, así que cualquier cantidad de formularios en la página
// quedan cubiertos sin nada por instancia. El <form> sigue funcionando igual
// sin JavaScript (POST nativo a Web3Forms + redirect); acá se evita que el
// visitante salga del sitio a la respuesta de un tercero y se agregan los
// estados de envío/error que un <form> nativo no puede mostrar.

if (!window.__asecon_leadform_init__) {
  window.__asecon_leadform_init__ = true;

  const setStatus = (form, text) => {
    const status = form.querySelector('[data-form-status]');
    if (status) status.textContent = text || '';
  };

  // Ante un fallo, el mailto de emergencia se completa con lo que la persona
  // ya escribió: no tiene que volver a redactar el mensaje a mano.
  const buildMailto = (form) => {
    const link = form.querySelector('[data-error-mailto]');
    if (!link) return;
    try {
      const data = new FormData(form);
      const lines = ['name', 'email', 'phone', 'message']
        .map((k) => `${k}: ${data.get(k) || ''}`)
        .join('\n');
      const url = new URL(link.href);
      url.searchParams.set('body', lines);
      link.href = url.toString();
    } catch (e) {
      // El mailto estático (sin cuerpo prellenado) ya sirve como piso.
    }
  };

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.form !== 'lead') return;
    // Sin clave de Web3Forms, form.action ni siquiera existe (ver
    // LeadForm.astro) y el botón ya es type="button": esto es cinturón y
    // tirantes, no la defensa principal.
    if (!form.action) return;

    event.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const errorBox = form.querySelector('[data-form-error]');
    const redirectTo = form.querySelector('input[name="redirect"]')?.value;
    const sendingLabel = form.dataset.sendingLabel || '';
    const submitLabelEl = form.querySelector('[data-submit-label]');
    const originalLabel = submitLabelEl ? submitLabelEl.textContent : null;

    form.dataset.formState = 'sending';
    if (submitBtn) submitBtn.disabled = true;
    if (submitLabelEl && sendingLabel) submitLabelEl.textContent = sendingLabel;
    if (errorBox) errorBox.hidden = true;
    setStatus(form, sendingLabel);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || json.success === false) throw new Error('web3forms');

      form.dataset.formState = 'ok';
      document.dispatchEvent(
        new CustomEvent('asecon:lead', {
          detail: {
            variant: form.dataset.formVariant,
            source: form.querySelector('input[name="source"]')?.value,
            area: form.querySelector('[name="service_interest"]')?.value || null,
            state: 'ok',
          },
        })
      );
      try {
        localStorage.removeItem('asecon-lead-draft');
      } catch (e) {}
      // Navegación al propio sitio, nunca al dominio de Web3Forms: es lo que
      // mantiene la atribución de la conversión intacta.
      if (redirectTo) window.location.href = redirectTo;
    } catch (err) {
      form.dataset.formState = 'error';
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabelEl && originalLabel) submitLabelEl.textContent = originalLabel;
      if (errorBox) errorBox.hidden = false;
      setStatus(form, '');
      buildMailto(form);
      document.dispatchEvent(
        new CustomEvent('asecon:lead', {
          detail: { variant: form.dataset.formVariant, state: 'error' },
        })
      );
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        delete data.access_key;
        delete data.botcheck;
        localStorage.setItem('asecon-lead-draft', JSON.stringify(data));
      } catch (e) {}
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Restaura lo escrito si un envío anterior en esta misma sesión falló.
    let draft = null;
    try {
      draft = JSON.parse(localStorage.getItem('asecon-lead-draft') || 'null');
    } catch (e) {
      draft = null;
    }
    if (draft) {
      document.querySelectorAll('form[data-form="lead"]').forEach((form) => {
        for (const [key, value] of Object.entries(draft)) {
          const field = form.elements.namedItem(key);
          if (field && 'value' in field && !field.value) field.value = value;
        }
      });
    }

    // Prefill del área consultada desde ?area=NN (ver los CTA de Services.astro).
    const area = new URLSearchParams(location.search).get('area');
    if (area) {
      document.querySelectorAll('[data-area-select]').forEach((select) => {
        if ([...select.options].some((o) => o.value === area)) select.value = area;
      });
    }
  });
}
