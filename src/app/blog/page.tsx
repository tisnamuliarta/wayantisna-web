import { blogSource } from '@/lib/source';
import type { Metadata } from 'next';
import Link from 'next/link';

const cardGradients = [
    'from-cyan-500/70 via-indigo-500/70 to-fuchsia-500/70',
    'from-orange-500/80 via-amber-500/70 to-rose-500/70',
    'from-sky-500/75 via-blue-500/70 to-violet-500/70',
];

export const metadata: Metadata = {
    title: 'Blog',
    description:
        'Software development articles by Wayan Tisna about Laravel architecture, REST APIs, SQL performance, and modern frontend engineering.',
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
        <main className="mx-auto w-full max-w-[1300px] bg-[#f5f5f5] px-4 py-12 font-sans text-fd-foreground dark:bg-fd-background md:px-8 md:py-14">
            <header className="mb-10">
                <h1 className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-fd-foreground md:text-7xl">Blog</h1>
            </header>

            {posts.length === 0 ? (
                <div className="rounded-3xl border border-fd-border bg-fd-card p-8 text-fd-muted-foreground">
                    No published posts yet.
                </div>
            ) : (
                <section className="grid gap-5 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <article
                            key={post.url}
                            className="overflow-hidden rounded-2xl border border-fd-border bg-fd-card transition hover:-translate-y-1 hover:border-fd-primary/40"
                        >
                            <div className={`h-52 bg-gradient-to-br ${cardGradients[index % cardGradients.length]} p-5`}>
                                <div className="h-full w-full rounded-xl border border-white/30 bg-black/10 dark:border-white/20 dark:bg-black/20" />
                            </div>
                            <div className="space-y-3 p-5">
                                <p className="text-sm text-fd-muted-foreground">{post.data.tags[0] ?? 'Development'}</p>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-fd-foreground">
                                    <Link href={post.url} className="text-slate-900 transition hover:text-slate-900 dark:text-fd-foreground dark:hover:text-fd-foreground">
                                        {post.data.title}
                                    </Link>
                                </h2>
                                <p className="line-clamp-2 text-sm text-fd-muted-foreground">{post.data.description}</p>
                                <p className="text-sm text-fd-muted-foreground">
                                    {post.data.publishedAt
                                        ? new Date(post.data.publishedAt).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : 'Draft'}
                                </p>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}
