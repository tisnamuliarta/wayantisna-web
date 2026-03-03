import { Button } from '@/components/ui/button'
import { ArrowRight, Github, Linkedin, Twitter, Mail } from 'lucide-react'

export function HeroSection() {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 px-4 md:px-8">
            <div className="max-w-4xl w-full text-center">
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                        WT
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
                    I Wayan Tisna
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 font-light">
                    Middle to Senior Software Developer
                </p>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Passionate about building scalable, maintainable applications. 6+ years with Laravel & Vue.js, 3+ with React & Next.js. Specialized in REST APIs and database architecture.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button size="lg" className="rounded-lg px-8 bg-blue-600 hover:bg-blue-700 text-white">
                        View My Work <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-lg px-8 border-slate-300 dark:border-slate-600">
                        Get in Touch
                    </Button>
                </div>

                <div className="flex justify-center gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <Github className="w-6 h-6" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <Linkedin className="w-6 h-6" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <Twitter className="w-6 h-6" />
                    </a>
                    <a href="mailto:wayan@example.com" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <Mail className="w-6 h-6" />
                    </a>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    )
}
