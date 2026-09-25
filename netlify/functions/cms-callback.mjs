// Segundo salto del mismo login (ver cms-auth.mjs). GitHub redirige acá con
// ?code=...&state=...; esta función cambia ese code por un token usando el
// client secret (que nunca toca el navegador, vive solo en las variables de
// entorno del sitio) y se lo entrega a la ventana de Decap CMS con el
// protocolo postMessage que Decap/Netlify CMS esperan de cualquier proveedor
// de OAuth para el backend `github` — no es un formato propio, es el
// contrato que ya trae el propio editor.
//
// El protocolo (decap-cms-lib-auth, netlify-auth.js → handshakeCallback y
// authorizeCallback), en tres mensajes:
//   1. este popup → opener: 'authorizing:github'. El opener (la página
//      /cms) solo lo acepta si e.origin === base_url del config.yml.
//   2. opener → popup: le devuelve el mismo 'authorizing:github', con
//      targetOrigin = origen del popup.
//   3. popup → opener: 'authorization:github:success:{token}'.
// El token solo viaja en el 3. Por eso el popup no se lo manda a
// cualquiera que conteste el 1: solo a una ventana del **mismo origen que
// esta función** (new URL(req.url).origin). Sin esa comprobación, una
// página ajena que abriera /api/auth como popup recibía el token de GitHub
// del editor (con permiso de escritura sobre el repo) sin que el editor
// hiciera nada más que tener la sesión de GitHub abierta. En producción el
// origen propio es base_url (https://aseconsa.com), el mismo desde el que
// se abre /cms, así que el flujo legítimo no cambia.

// Netlify no aplica public/_headers a las funciones: las cabeceras de una
// respuesta de función van en la propia Response.
const CABECERAS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

const escaparHtml = (texto) =>
  String(texto).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export default async (req) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  // `mensaje` siempre es un texto fijo de esta función, pero se escapa
  // igual: así ningún cambio futuro puede colar en esta página algo que
  // venga de GitHub o de la URL.
  const paginaError = (mensaje) =>
    new Response(`<!doctype html><meta charset="utf-8"><p>${escaparHtml(mensaje)}</p>`, {
      status: 400,
      headers: { ...CABECERAS, 'content-type': 'text/html; charset=utf-8' },
    });

  if (!clientId || !clientSecret) {
    return paginaError(
      'Editor no configurado todavía: faltan las variables de entorno de GitHub OAuth en este sitio de Netlify.',
    );
  }

  const url = new URL(req.url);
  const origenPropio = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = req.headers.get('cookie') || '';
  // Anclada al inicio de la cabecera o a un "; ": sin el ancla, una cookie
  // llamada, por ejemplo, x_decap_oauth_state también calzaba.
  const estadoGuardado = (cookie.match(/(?:^|;\s*)decap_oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || !estadoGuardado || state !== estadoGuardado) {
    return paginaError('No se pudo verificar el inicio de sesión (state inválido o vencido). Vuelve a intentarlo desde /cms/.');
  }

  const redirectUri = `${origenPropio}/api/callback`;
  let respuesta;
  let datos;
  try {
    respuesta = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
    });
    datos = await respuesta.json();
  } catch (e) {
    // GitHub caído, respuesta que no es JSON, red cortada: mensaje genérico.
    return paginaError('No se pudo completar el inicio de sesión con GitHub. Vuelve a intentarlo desde /cms/ en unos minutos.');
  }

  if (!respuesta.ok || !datos || typeof datos.access_token !== 'string' || !datos.access_token) {
    // Ni error ni error_description se muestran: son texto de un tercero, y
    // al editor no le sirven para nada que no diga ya este mensaje. El
    // código de estado (un número) sí ayuda a quien lo diagnostique.
    return paginaError(
      `GitHub rechazó el inicio de sesión (${Number(respuesta.status) || 'sin código'}). Vuelve a intentarlo desde /cms/.`,
    );
  }

  // Doble JSON.stringify a propósito: el primero arma el mensaje que Decap
  // espera ({token, provider}); el segundo lo embebe como literal de string
  // de JS dentro del <script> de abajo (escapando comillas/backslashes por
  // su cuenta). El .replace final evita que un '<' cualquiera cierre el
  // <script> antes de tiempo — < es una fuga de escape de JS, así que
  // el string ya decodificado en el navegador queda idéntico. El origen
  // propio pasa por el mismo tratamiento.
  const payload = JSON.stringify({ token: datos.access_token, provider: 'github' });
  const embebido = JSON.stringify(payload).replace(/</g, '\\u003c');
  const origenEmbebido = JSON.stringify(origenPropio).replace(/</g, '\\u003c');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Autenticando…</title></head>
<body>
<script>
(function () {
  var ORIGEN = ${origenEmbebido};
  if (!window.opener) return;
  function receiveMessage(message) {
    // Solo la ventana que abrió este popup, solo desde el origen propio y
    // solo como respuesta al aviso de abajo. Cualquier otra cosa se ignora.
    if (message.origin !== ORIGEN) return;
    if (message.source !== window.opener) return;
    if (message.data !== 'authorizing:github') return;
    window.removeEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorization:github:success:' + ${embebido}, ORIGEN);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', ORIGEN);
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: {
      ...CABECERAS,
      'content-type': 'text/html; charset=utf-8',
      // Ya se usó: se limpia para que no quede una state vieja dando vueltas.
      'Set-Cookie': 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
};

export const config = {
  path: '/api/callback',
};
