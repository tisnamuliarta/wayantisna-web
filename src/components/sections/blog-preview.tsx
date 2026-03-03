import { Button } from '@/components/ui/button';
import { blogSource } from '@/lib/source';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export function BlogPreviewSection() {
    const posts = blogSource
        .getPages()
        .filter((page) => page.data.publishedAt)
        .sort((a, b) => new Date(b.data.publishedAt!).getTime() - new Date(a.data.publishedAt!).getTime())
        .slice(0, 3);

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
                        Engineering Blog
                    </p>
                    <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                        Technical writing about APIs, performance, architecture, and modern frontend development
                    </h2>
                </div>
                <Link href="/blog">
                    <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        Browse All Articles
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                {posts.map((post) => (
                    <article
                        key={post.url}
                        className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                    >
                        <p className="inline-flex rounded-full border border-cyan-300/60 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200">
                            {post.data.tags[0] ?? 'Software Development'}
                        </p>

                        <h3 className="mt-4 text-xl font-semibold text-slate-900 transition group-hover:text-cyan-700 dark:text-slate-100 dark:group-hover:text-cyan-300">
                            <Link href={post.url}>{post.data.title}</Link>
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{post.data.description}</p>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {post.data.publishedAt
                                    ? new Date(post.data.publishedAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                      })
                                    : 'Coming soon'}
                            </span>
                            <Link href={post.url} className="font-semibold text-slate-900 dark:text-slate-100">
                                Read article
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
