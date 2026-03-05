// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blog: create.doc("blog", {"building-scalable-rest-apis-laravel.mdx": () => import("../src/content/blog/building-scalable-rest-apis-laravel.mdx?collection=blog"), "database-optimization-postgresql.mdx": () => import("../src/content/blog/database-optimization-postgresql.mdx?collection=blog"), "modern-frontend-development-react-19.mdx": () => import("../src/content/blog/modern-frontend-development-react-19.mdx?collection=blog"), "optimize-sql-server-query-performance.mdx": () => import("../src/content/blog/optimize-sql-server-query-performance.mdx?collection=blog"), "sql-server-date-format-convert.mdx": () => import("../src/content/blog/sql-server-date-format-convert.mdx?collection=blog"), }),
};
export default browserCollections;