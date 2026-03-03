import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
    return {
        ...defaultMdxComponents,
        ...components,
    };
}

// Required export for Next.js MDX
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return getMDXComponents(components);
}
