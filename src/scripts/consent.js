// Wiring del banner de consentimiento + segundo paso de GA4: gtag/js (el
// script que de verdad pide red a Google) nunca se carga hasta que hay un
// consentimiento guardado de una visita anterior, o la persona aprieta
// "Aceptar" ahora. Analytics.astro ya dejó definido window.gtag y
// window.__ASECON_GA_ID__ antes de que este script corra.

(function () {
  const STORAGE_KEY = 'asecon-consent-v1';
  const banner = document.getElementById('consent-banner');

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
    } catch (e) {}
  }

  function loadGtagScript() {
    const gaId = window.__ASECON_GA_ID__;
    if (!gaId || typeof window.gtag !== 'function' || document.getElementById('ga4-script')) return;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    const s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: true });
  }

  // Si ya había una decisión de una visita anterior, se aplica sola: nadie
  // tiene que volver a decidir en cada página que abre.
  const saved = readConsent();
  if (saved && saved.analytics) loadGtagScript();

  if (!banner) return;

  const show = () => {
    banner.hidden = false;
  };
  const hide = () => {
    banner.hidden = true;
  };

  if (saved === null) show();

  document.getElementById('consent-accept')?.addEventListener('click', () => {
    saveConsent(true);
    loadGtagScript();
    hide();
  });

  document.getElementById('consent-reject')?.addEventListener('click', () => {
    saveConsent(false);
    hide();
  });

  // Enlace permanente en el footer (ver Footer.astro) para reabrir y
  // cambiar la decisión en cualquier momento.
  document.querySelectorAll('[data-reopen-consent]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      show();
    });
  });
})();
