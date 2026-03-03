// @ts-nocheck
import * as __fd_glob_2 from "../src/content/blog/modern-frontend-development-react-19.mdx?collection=blog"
import * as __fd_glob_1 from "../src/content/blog/database-optimization-postgresql.mdx?collection=blog"
import * as __fd_glob_0 from "../src/content/blog/building-scalable-rest-apis-laravel.mdx?collection=blog"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const blog = await create.docs("blog", "src/content/blog", {}, {"building-scalable-rest-apis-laravel.mdx": __fd_glob_0, "database-optimization-postgresql.mdx": __fd_glob_1, "modern-frontend-development-react-19.mdx": __fd_glob_2, });