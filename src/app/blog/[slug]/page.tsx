import { blogSource } from '@/lib/source';
import {
    DocsPage,
    DocsDescription,
    DocsBody,
    DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '../../../../mdx-components';
import { Calendar, Tag } from 'lucide-react';
import { AdBanner } from '@/components/ads-banner';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return blogSource.getPages().map((page) => ({
        slug: page.slugs[0],
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const page = blogSource.getPage([slug]);

    if (!page) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${page.data.title} - Wayan Tisna`,
        description: page.data.description,
        openGraph: {
            title: page.data.title,
            description: page.data.description,
            type: 'article',
            publishedTime: page.data.publishedAt,
            authors: page.data.author ? [page.data.author] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const page = blogSource.getPage([slug]);

    if (!page) {
        notFound();
    }

    const MDX = page.data.body;

    return (
        <DocsPage toc={page.data.toc} tableOfContent={{ style: 'clerk' }}>
            {/* Article header metadata (above title) */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground not-prose">
                {page.data.publishedAt && (
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(page.data.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                )}
                {page.data.author && <span>by {page.data.author}</span>}
            </div>

            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>

            {/* Tags */}
            {page.data.tags && page.data.tags.length > 0 && (
                <div className="not-prose mb-6 flex flex-wrap gap-2">
                    {page.data.tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        >
                            <Tag className="h-3 w-3" />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Top ad after header */}
            <AdBanner className="not-prose mb-8" />

            <DocsBody>
                <MDX components={getMDXComponents()} />
            </DocsBody>

            {/* Bottom ad */}
            <AdBanner className="not-prose mt-8" />
        </DocsPage>
    );
}
