// Segundo salto del mismo login (ver auth.js). GitHub redirige acá con
// ?code=...&state=...; este handler cambia ese code por un token usando el
// client secret (que nunca toca el navegador, vive solo en las variables de
// entorno de Cloudflare Pages) y se lo entrega a la ventana de Decap CMS con
// el protocolo postMessage que Decap/Netlify CMS esperan de cualquier
// proveedor de OAuth para el backend `github` — no es un formato propio,
// es el contrato que ya trae el propio editor.
export async function onRequestGet(context) {
  const { request, env } = context;
  const clientId = env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = env.GITHUB_OAUTH_CLIENT_SECRET;

  const paginaError = (mensaje) =>
    new Response(`<!doctype html><meta charset="utf-8"><p>${mensaje}</p>`, {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

  if (!clientId || !clientSecret) {
    return paginaError(
      'Editor no configurado todavía: faltan las variables de entorno de GitHub OAuth en este proyecto de Cloudflare Pages.',
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const estadoGuardado = (cookie.match(/decap_oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || !estadoGuardado || state !== estadoGuardado) {
    return paginaError('No se pudo verificar el inicio de sesión (state inválido o vencido). Vuelve a intentarlo desde /cms/.');
  }

  const redirectUri = `${url.origin}/api/callback`;
  const respuesta = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok || !datos.access_token) {
    return paginaError(`GitHub rechazó el intercambio de token: ${datos.error_description || datos.error || respuesta.status}`);
  }

  // Doble JSON.stringify a propósito: el primero arma el mensaje que Decap
  // espera ({token, provider}); el segundo lo embebe como literal de string
  // de JS dentro del <script> de abajo (escapando comillas/backslashes por
  // su cuenta). El .replace final evita que un '<' cualquiera cierre el
  // <script> antes de tiempo — < es una fuga de escape de JS, así que
  // el string ya decodificado en el navegador queda idéntico.
  const payload = JSON.stringify({ token: datos.access_token, provider: 'github' });
  const embebido = JSON.stringify(payload).replace(/</g, '\\u003c');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Autenticando…</title></head>
<body>
<script>
(function () {
  function receiveMessage(message) {
    window.opener.postMessage(
      'authorization:github:success:' + ${embebido},
      message.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Ya se usó: se limpia para que no quede una state vieja dando vueltas.
      'Set-Cookie': 'decap_oauth_state=; Path=/api; Max-Age=0',
    },
  });
}
