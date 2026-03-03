import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const blog = defineDocs({
    dir: 'src/content/blog',
    docs: {
        schema: frontmatterSchema.extend({
            author: z.string().optional(),
            publishedAt: z.coerce.string().optional(),
            tags: z.array(z.string()).default([]),
        }),
    },
});

export default defineConfig();
