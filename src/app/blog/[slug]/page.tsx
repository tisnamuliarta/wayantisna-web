import { AdBanner } from '@/components/ads-banner';
import { ShareButtons } from '@/components/blog/share-buttons';
import { blogSource } from '@/lib/source';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { CalendarDays, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
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
    const shareUrl = `https://wayantisna.com/blog/${slug}`;
    const shareTitle = page.data.title;

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
        <main className="mx-auto w-full max-w-[1300px] px-4 py-10 md:px-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_290px]">
                <article>
                    <Link
                        href="/blog"
                        className="mb-6 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        All Posts
                    </Link>

                    <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl dark:text-white">{page.data.title}</h1>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span>{page.data.tags[0] ?? 'Development'}</span>
                        <span>-</span>
                        {page.data.publishedAt && (
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {new Date(page.data.publishedAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        )}
                    </div>

                    <div className="mt-8 h-[380px] rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-500/70 via-indigo-500/70 to-fuchsia-500/70 p-5 dark:border-white/15">
                        <div className="h-full rounded-xl border border-white/30 bg-black/10 dark:border-white/20 dark:bg-black/25" />
                    </div>

                    <div className="mt-8 xl:hidden">
                        <InlineTOC
                            items={tocItems}
                            defaultOpen
                            className="border-slate-200 bg-white text-slate-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200"
                        />
                    </div>

                    <div className="blog-article mt-8">
                        <MDX components={getMDXComponents()} />
                    </div>
                </article>

                <aside className="hidden xl:block">
                    <div className="sticky top-24 space-y-4">
                        <InlineTOC
                            items={tocItems}
                            defaultOpen
                            className="border-slate-200 bg-white text-slate-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200"
                        />
                        <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/15 dark:bg-white/[0.04]" />
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/15 dark:bg-white/[0.04]">
                            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Share this post</p>
                            <ShareButtons title={shareTitle} url={shareUrl} />
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
