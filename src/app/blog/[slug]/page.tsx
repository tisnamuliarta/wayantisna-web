import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    const posts = await getAllBlogPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const resolvedParams = await params
    const post = await getBlogPostBySlug(resolvedParams.slug)

    if (!post) {
        return {
            title: 'Post Not Found',
        }
    }

    return {
        title: `${post.frontmatter.title} - Wayan Tisna`,
        description: post.frontmatter.description,
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.description,
            type: 'article',
            publishedTime: post.frontmatter.publishedAt,
            authors: [post.frontmatter.author],
        },
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const resolvedParams = await params
    const post = await getBlogPostBySlug(resolvedParams.slug)

    if (!post) {
        notFound()
    }

    const readTime = Math.ceil(post.content.split(/\s+/).length / 200)

    return (
        <main className="bg-white dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-12 md:py-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-3xl mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        {post.frontmatter.title}
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        {post.frontmatter.description}
                    </p>

                    {/* Article Metadata */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-6">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {post.frontmatter.author}
                        </span>
                        <span>{readTime} min read</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        {post.frontmatter.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full"
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="prose dark:prose-invert max-w-none">
                    <MDXRemote source={post.content} />
                </div>

                {/* Author Info */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            WA
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{post.frontmatter.author}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Full-stack software developer</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-12 flex items-center justify-center">
                    <Link href="/blog">
                        <Button variant="outline">← Back to All Articles</Button>
                    </Link>
                </div>
            </article>

            {/* Related Articles CTA */}
            <div className="bg-blue-50 dark:bg-blue-900/20 py-12 px-4 mt-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Want to read more?</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Check out other articles on my blog for more insights on software development.
                    </p>
                    <Link href="/blog">
                        <Button>View All Articles →</Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}
