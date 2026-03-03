import { AdBanner } from '@/components/ads-banner';
import { blogSource } from '@/lib/source';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { CalendarDays, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '../../../../mdx-components';

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

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = blogSource.getPage([slug]);

    if (!page) {
        return { title: 'Post Not Found' };
    }

    return {
        title: page.data.title,
        description: page.data.description,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: page.data.title,
            description: page.data.description,
            type: 'article',
            publishedTime: page.data.publishedAt,
            authors: page.data.author ? [page.data.author] : undefined,
            url: `https://wayantisna.com/blog/${slug}`,
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
    const tocItems = page.data.toc ?? [];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: page.data.title,
        description: page.data.description,
        author: {
            '@type': 'Person',
            name: page.data.author ?? 'Wayan Tisna',
        },
        datePublished: page.data.publishedAt,
        dateModified: page.data.publishedAt,
        url: `https://wayantisna.com/blog/${slug}`,
    };

    return (
        <DocsPage toc={tocItems} full tableOfContent={{ enabled: false }} className="mx-auto w-full max-w-[1200px] px-0">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                {page.data.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(page.data.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                )}
                {page.data.author && <span>{page.data.author}</span>}
            </div>

            <DocsTitle className="text-balance">{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>

            <div className="not-prose mb-7 mt-4 flex flex-wrap gap-2">
                {page.data.tags.map((tag: string) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200"
                    >
                        <Tag className="h-3 w-3" />
                        {tag}
                    </span>
                ))}
            </div>

            <div className="not-prose mb-6 lg:hidden">
                <InlineTOC items={tocItems} defaultOpen />
            </div>

            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
                <DocsBody>
                    <MDX components={getMDXComponents()} />
                </DocsBody>

                <aside className="not-prose hidden xl:block">
                    <div className="sticky top-24 space-y-4">
                        <InlineTOC items={tocItems} defaultOpen />
                        <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950" />
                        <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950" />
                    </div>
                </aside>
            </div>
        </DocsPage>
    );
}
