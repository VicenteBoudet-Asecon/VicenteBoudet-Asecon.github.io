import { defineCollection, z } from 'astro:content';

// Cada nota es un archivo .md en src/content/posts/.
// Para publicar una novedad nueva basta con crear el archivo: no hay que tocar
// ningún componente ni el menú. Con draft: true queda escrita pero sin publicar.
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.date(),
    lang: z.enum(['es', 'en']),
    category: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    // Identifica qué nota en el otro idioma es la traducción de esta: el
    // mismo valor en las dos (por convención, el slug de la versión en
    // español). Sin esto, keyFromPath() no reconoce /novedades/[slug] (no
    // está en el mapa de rutas) y la nota se publica sin hreflang — Google
    // la ve como contenido no traducido en vez de la misma pieza en dos
    // idiomas. Ver NewsPost.astro y las páginas de listado.
    pair: z.string(),
  }),
});

export const collections = { posts };
