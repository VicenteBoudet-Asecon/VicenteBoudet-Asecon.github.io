// Cloudflare Pages Function — primer salto del login del editor de
// Novedades (Decap CMS, backend `github`, ver public/cms/config.yml).
// Reemplaza a Netlify Identity + Git Gateway, que no existen fuera de
// Netlify: acá es este mismo proyecto de Cloudflare Pages el que hace de
// proveedor de OAuth frente a GitHub.
//
// Inerte hasta que existan, como variables de entorno del proyecto de
// Cloudflare Pages (Settings → Environment variables — no son variables de
// Astro, no van en .env ni llevan prefijo PUBLIC_):
//   GITHUB_OAUTH_CLIENT_ID
//   GITHUB_OAUTH_CLIENT_SECRET
// Se consiguen registrando una GitHub OAuth App (GitHub → Settings →
// Developer settings → OAuth Apps → New OAuth App) con "Authorization
// callback URL" = <dominio del sitio>/api/callback. Ver README ("Novedades:
// editor para el equipo").
export async function onRequestGet(context) {
  const { request, env } = context;
  const clientId = env.GITHUB_OAUTH_CLIENT_ID;

  if (!clientId) {
    return new Response(
      'Editor no configurado todavía: falta GITHUB_OAUTH_CLIENT_ID en las variables de entorno de este proyecto de Cloudflare Pages.',
      { status: 501, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo');
  authorizeUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      // HttpOnly + Secure + SameSite=Lax: vuelve con la navegación de nivel
      // superior que hace GitHub al redirigir (Lax la deja pasar), pero
      // ningún script de terceros puede leerla ni escribirla.
      'Set-Cookie': `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
