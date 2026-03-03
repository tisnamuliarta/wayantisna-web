import { getAllBlogPosts } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Blog - Wayan Tisna',
    description: 'Articles about software development, best practices, and tech insights',
}

export default async function BlogPage() {
    const posts = await getAllBlogPosts()

    return (
        <main className="bg-white dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Blog</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Articles about software development, best practices, and tech insights
                    </p>
                </div>
            </div>

            {/* Blog Posts */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No blog posts yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {posts.map((post) => (
                            <article
                                key={post.slug}
                                className="border-b border-slate-200 dark:border-slate-700 pb-8 last:border-0"
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                                    <div className="flex-grow">
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                            {post.frontmatter.title}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                            {post.frontmatter.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <span>by {post.frontmatter.author}</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.frontmatter.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Read More Link */}
                                <Link href={`/blog/${post.slug}`}>
                                    <Button variant="outline" size="sm">
                                        Read Article →
                                    </Button>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
