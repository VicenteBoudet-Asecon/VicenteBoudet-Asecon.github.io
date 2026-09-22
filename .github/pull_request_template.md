## Qué cambia y por qué

<!-- Una o dos frases. Si toca contenido, di qué archivo de content.js. -->

## Checklist antes de pedir revisión

- [ ] `npm run validate` corre en 0 fallas localmente (CI lo corre igual, pero conviene saberlo antes de pedir revisión).
- [ ] Si el cambio toca texto: se editó `content.es` **y** `content.en` con las mismas claves.
- [ ] Si el cambio toca una página nueva o una ruta: se agregó a `routes` (y a `navOrder` o `legalOrder` si corresponde) en `src/i18n/config.js`, nunca un enlace escrito a mano.
- [ ] Si el cambio toca un canal sin activar (WhatsApp, agendamiento, GA4, Turnstile, `/admin`): sigue construido pero sin activar — ver `src/data/channels.js` y `.env.example`.
- [ ] Si el cambio toca algo visual: se revisó en móvil y escritorio, con teclado, y con `prefers-reduced-motion`.

## Para quien revisa

CI corre `npm run validate` automáticamente en este PR — revisa la pestaña Checks antes de aprobar. Si algo quedó fuera de alcance a propósito, decirlo acá en vez de dejarlo implícito.
