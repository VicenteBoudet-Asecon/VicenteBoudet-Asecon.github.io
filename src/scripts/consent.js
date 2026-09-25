// Wiring del banner de consentimiento + segundo paso de GA4: gtag/js (el
// script que de verdad pide red a Google) nunca se carga hasta que hay un
// consentimiento guardado de una visita anterior, o la persona aprieta
// "Aceptar" ahora. Analytics.astro ya dejó definido window.gtag y
// window.__ASECON_GA_ID__ antes de que este script corra.
//
// Se empaqueta en todas las páginas (ver ConsentBanner.astro), así que tiene
// que ser inerte cuando no hay nada que medir: sin __ASECON_GA_ID__ ninguna
// función toca gtag ni la red, y sin #consent-banner no se cablea nada.

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

  function grantAnalytics() {
    const gaId = window.__ASECON_GA_ID__;
    if (!gaId || typeof window.gtag !== 'function') return;
    // Por si en esta misma página se había rechazado antes (ver revoke).
    window['ga-disable-' + gaId] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (document.getElementById('ga4-script')) return;
    const s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: true });
  }

  // Borra _ga, _ga_<ID> (y _gid/_gat si una versión vieja los dejó). GA4
  // las escribe con cookie_domain 'auto', es decir en el dominio más alto
  // que el navegador acepte (.aseconsa.com, no www.aseconsa.com): una cookie
  // solo se borra repitiendo el mismo Domain y Path, así que se prueba con
  // el host y cada uno de sus sufijos. Los que son sufijo público (.com,
  // .netlify.app) el navegador los ignora sin error.
  function clearGaCookies() {
    const names = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter((n) => /^_ga/.test(n) || n === '_gid');
    if (names.length === 0) return;
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    const expired = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    names.forEach((name) => {
      domains.forEach((d) => {
        document.cookie = name + expired + (d ? '; domain=' + d : '');
      });
    });
  }

  // "Rechazar" después de haber aceptado (desde el enlace del footer): no
  // basta con guardar la decisión para la próxima visita. En esta misma
  // página gtag/js ya está cargado, así que se le avisa que el
  // consentimiento cambió, se lo apaga con el interruptor oficial de GA
  // (window['ga-disable-<ID>']) para que no mande ni un ping más, y se
  // borran las cookies que ya había dejado.
  function revokeAnalytics() {
    const gaId = window.__ASECON_GA_ID__;
    if (gaId && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window['ga-disable-' + gaId] = true;
    }
    clearGaCookies();
  }

  // Si ya había una decisión de una visita anterior, se aplica sola: nadie
  // tiene que volver a decidir en cada página que abre.
  const saved = readConsent();
  if (saved && saved.analytics) grantAnalytics();

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
    grantAnalytics();
    hide();
  });

  document.getElementById('consent-reject')?.addEventListener('click', () => {
    saveConsent(false);
    revokeAnalytics();
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
