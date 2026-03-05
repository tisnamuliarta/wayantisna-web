import { cn } from '@/lib/utils';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ImageProps } from 'fumadocs-core/framework';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { HTMLAttributes, ImgHTMLAttributes } from 'react';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
    const enhancedComponents: MDXComponents = {
        pre: (props: HTMLAttributes<HTMLPreElement>) => (
            <CodeBlock keepBackground {...props}>
                <Pre>{props.children}</Pre>
            </CodeBlock>
        ),
        img: (props: ImgHTMLAttributes<HTMLImageElement> & { sizes?: string }) => {
            const { src, className, sizes, ...rest } = props;
            if (typeof src !== 'string' && typeof src !== 'undefined') return null;

            const imageProps: ImageProps = {
                ...(rest as Omit<ImageProps, 'src'>),
                src,
                sizes: sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px',
                className: cn('rounded-xl', className),
            };

            return <ImageZoom {...imageProps} />;
        },
        // custom list renderers with consistent spacing and indent
        ul: ({ className, ...props }: HTMLAttributes<HTMLUListElement>) => (
            <ul
                className={cn('ml-6 list-disc list-inside space-y-1', className)}
                {...props}
            />
        ),
        ol: ({ className, ...props }: HTMLAttributes<HTMLOListElement>) => (
            <ol
                className={cn('ml-6 list-decimal list-inside space-y-1', className)}
                {...props}
            />
        ),
    };

    return {
        ...defaultMdxComponents,
        ...enhancedComponents,
        ...components,
    };
}

// Required export for Next.js MDX
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return getMDXComponents(components);
}
