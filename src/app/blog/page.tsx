import { AdBanner } from '@/components/ads-banner';
import { blogSource } from '@/lib/source';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Software Engineering Blog',
    description:
        'Technical blog by Wayan Tisna covering Laravel, REST API design, SQL Server optimization, Next.js architecture, and frontend engineering best practices.',
    keywords: [
        'software engineering blog',
        'Laravel blog',
        'REST API best practices',
        'SQL Server performance',
        'Next.js blog',
        'frontend development articles',
    ],
    alternates: {
        canonical: '/blog',
    },
};

export default function BlogListingPage() {
    const posts = blogSource
        .getPages()
        .filter((page) => page.data.publishedAt)
        .sort((a, b) => new Date(b.data.publishedAt!).getTime() - new Date(a.data.publishedAt!).getTime());

    return (
        <main className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
            <header className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Blog</p>
                <h1 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                    Articles on software architecture, scalable APIs, and web platform delivery
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    This blog documents real engineering patterns from production projects, with practical notes for backend developers,
                    full-stack teams, and technical leads.
                </p>
            </header>

            <div className="mb-8">
                <AdBanner className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950" />
            </div>

            {posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    Blog posts will appear here once content is published.
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {posts.map((post) => (
                        <article
                            key={post.url}
                            className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="mb-4 flex flex-wrap gap-2">
                                {post.data.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-900 transition group-hover:text-cyan-700 dark:text-slate-100 dark:group-hover:text-cyan-300">
                                <Link href={post.url}>{post.data.title}</Link>
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{post.data.description}</p>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <CalendarDays className="h-4 w-4" />
                                    {post.data.publishedAt
                                        ? new Date(post.data.publishedAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : 'Draft'}
                                </span>
                                <Link href={post.url} className="inline-flex items-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Read post
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
