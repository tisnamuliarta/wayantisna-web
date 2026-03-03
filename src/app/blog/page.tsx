import { blogSource } from '@/lib/source';
import { DocsPage, DocsDescription, DocsBody, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AdBanner } from '@/components/ads-banner';

export const metadata = {
    title: 'Blog - Wayan Tisna',
    description: 'Articles about software development, best practices, and tech insights',
};

export default function BlogListingPage() {
    const pages = blogSource.getPages();

    // Sort by publishedAt descending
    const posts = pages
        .filter((p) => p.data.publishedAt)
        .sort(
            (a, b) =>
                new Date(b.data.publishedAt!).getTime() -
                new Date(a.data.publishedAt!).getTime(),
        );

    return (
        <DocsPage full>
            <DocsTitle>Blog</DocsTitle>
            <DocsDescription>
                Articles about software development, best practices, and tech insights.
            </DocsDescription>

            <DocsBody>
                {/* Ad Banner */}
                <AdBanner className="mb-8" />

                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-fd-muted-foreground text-lg">No blog posts yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6 not-prose">
                        {posts.map((post) => (
                            <article
                                key={post.url}
                                className="group rounded-xl border border-fd-border bg-fd-card p-6 transition-all hover:border-emerald-500/50 hover:shadow-md dark:hover:border-emerald-400/40"
                            >
                                {/* Tags */}
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {post.data.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="mb-2 text-xl font-bold text-fd-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    <Link href={post.url}>{post.data.title}</Link>
                                </h2>

                                <p className="mb-4 text-fd-muted-foreground line-clamp-2">
                                    {post.data.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-fd-muted-foreground">
                                        {post.data.publishedAt && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(post.data.publishedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        )}
                                        {post.data.author && <span>by {post.data.author}</span>}
                                    </div>
                                    <Link
                                        href={post.url}
                                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                                    >
                                        Read more <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </DocsBody>
        </DocsPage>
    );
}
