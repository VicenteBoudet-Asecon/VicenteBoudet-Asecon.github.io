// Netlify Function — primer salto del login del editor de Novedades
// (Decap CMS, backend `github`, ver public/cms/config.yml). Este proyecto
// hace de proveedor de OAuth frente a GitHub, así que el editor no depende
// de Netlify Identity ni de Git Gateway (que están en estado legado).
//
// `config.path` la publica en /api/auth en vez de la ruta por defecto
// /.netlify/functions/..., que es lo que espera `auth_endpoint` del
// config.yml del CMS.
//
// Inerte hasta que existan, como variables de entorno del sitio en Netlify
// (Site configuration → Environment variables — no son variables de Astro,
// no van en .env ni llevan prefijo PUBLIC_):
//   GITHUB_OAUTH_CLIENT_ID
//   GITHUB_OAUTH_CLIENT_SECRET
// Se consiguen registrando una GitHub OAuth App (GitHub → Settings →
// Developer settings → OAuth Apps → New OAuth App) con "Authorization
// callback URL" = <dominio del sitio>/api/callback. Ver README ("Novedades:
// editor para el equipo").
export default async (req) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;

  if (!clientId) {
    return new Response(
      'Editor no configurado todavía: falta GITHUB_OAUTH_CLIENT_ID en las variables de entorno de este sitio de Netlify.',
      { status: 501, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const url = new URL(req.url);
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
};

export const config = {
  path: '/api/auth',
};
