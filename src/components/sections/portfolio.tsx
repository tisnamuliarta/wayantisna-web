import { Button } from '@/components/ui/button'
import { ExternalLink, Github } from 'lucide-react'

export function PortfolioSection() {
    const projects = [
        {
            title: 'E-commerce Platform',
            description: 'A full-featured e-commerce platform with real-time inventory management, payment processing, and admin dashboard.',
            technologies: ['Laravel', 'Vue.js', 'MySQL', 'REST API'],
            image: '🛍️',
            link: '#',
        },
        {
            title: 'Real-time Analytics Dashboard',
            description: 'Interactive dashboard for real-time data visualization with advanced filtering and reporting capabilities.',
            technologies: ['React', 'Next.js', 'TypeScript', 'Chart.js'],
            image: '📊',
            link: '#',
        },
        {
            title: 'API Gateway Service',
            description: 'High-performance REST API gateway with authentication, rate limiting, and comprehensive documentation.',
            technologies: ['Laravel', '.NET', 'SQL Server', 'Redis'],
            image: '🔌',
            link: '#',
        },
        {
            title: 'CMS Application',
            description: 'Content management system with rich text editing, user roles, and automated publishing workflows.',
            technologies: ['Nuxt.js', 'Laravel', 'PostgreSQL', 'Tailwind CSS'],
            image: '📝',
            link: '#',
        },
        {
            title: 'Mobile App Backend',
            description: 'Scalable mobile app backend with push notifications, offline sync, and real-time updates.',
            technologies: ['Node.js', 'MongoDB', 'WebSocket', 'Docker'],
            image: '📱',
            link: '#',
        },
        {
            title: 'Data Visualization Tool',
            description: 'Interactive tool for converting raw data into beautiful, shareable visualizations and reports.',
            technologies: ['React', 'D3.js', 'Python', 'Flask'],
            image: '📈',
            link: '#',
        },
    ]

    return (
        <section className="py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Portfolio</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">Selected projects showcasing my skills and experience</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.title} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-emerald-100 dark:border-emerald-900/30">
                            <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center text-6xl transition-transform hover:scale-105">
                                {project.image}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.technologies.map((tech) => (
                                        <span key={tech} className="inline-block bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800/50">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                        <ExternalLink className="w-4 h-4 mr-1" /> View
                                    </Button>
                                    <Button size="sm" variant="ghost" className="px-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                        <Github className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
