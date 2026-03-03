import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, User } from 'lucide-react'

export function BlogPreviewSection() {
    const blogPosts = [
        {
            title: 'Building Scalable REST APIs with Laravel',
            excerpt: 'Learn best practices for designing robust REST APIs that can handle growth and complexity.',
            author: 'Wayan Tisna',
            date: 'Mar 3, 2026',
            readTime: '8 min read',
            tags: ['Laravel', 'REST API', 'Backend'],
            slug: 'building-scalable-rest-apis-laravel',
        },
        {
            title: 'Modern Frontend Development with React 19',
            excerpt: 'Explore the latest features in React 19 and how they improve developer experience and performance.',
            author: 'Wayan Tisna',
            date: 'Feb 28, 2026',
            readTime: '10 min read',
            tags: ['React', 'Frontend', 'JavaScript'],
            slug: 'modern-frontend-development-react-19',
        },
        {
            title: 'Database Optimization Techniques for PostgreSQL',
            excerpt: 'Discover query optimization, indexing strategies, and monitoring tools for better database performance.',
            author: 'Wayan Tisna',
            date: 'Feb 20, 2026',
            readTime: '12 min read',
            tags: ['Database', 'PostgreSQL', 'Performance'],
            slug: 'database-optimization-postgresql',
        },
    ]

    return (
        <section className="py-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Blog & Articles</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Thoughts on software development, best practices, and tech insights
                        </p>
                    </div>
                    <Button className="whitespace-nowrap">
                        View All Articles <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <article
                            key={post.slug}
                            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                        >
                            <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                <div className="text-6xl">📝</div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow line-clamp-2">
                                    {post.excerpt}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2 py-1 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {post.date}
                                            </span>
                                        </div>
                                        <span>{post.readTime}</span>
                                    </div>

                                    <a
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
                                    >
                                        Read More <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-blue-600 dark:bg-blue-700 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Want to learn more?</h3>
                    <p className="text-blue-100 mb-6">
                        Check out my comprehensive documentation and guides on web development, database optimization, and
                        modern architecture patterns.
                    </p>
                    <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-0">
                        Explore Documentation <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </section>
    )
}
