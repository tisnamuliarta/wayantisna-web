// source.config.ts
import { defineDocs, defineConfig, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
var blog = defineDocs({
  dir: "src/content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      author: z.string().optional(),
      publishedAt: z.coerce.string().optional(),
      tags: z.array(z.string()).default([])
    })
  }
});
var source_config_default = defineConfig();
export {
  blog,
  source_config_default as default
};
