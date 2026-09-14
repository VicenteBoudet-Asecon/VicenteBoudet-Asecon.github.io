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
  }),
});

export const collections = { posts };
