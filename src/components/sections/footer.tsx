import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        {
            name: 'GitHub',
            icon: Github,
            url: 'https://github.com',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: 'https://linkedin.com',
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: 'https://twitter.com',
        },
        {
            name: 'Email',
            icon: Mail,
            url: 'mailto:wayan@example.com',
        },
    ]

    return (
        <footer className="bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border-t border-emerald-200 dark:border-emerald-900/30">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 font-bold text-lg mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                                WT
                            </div>
                            Wayan Tisna
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Full-stack developer passionate about building scalable web applications.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Navigation</h3>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                            <li><a href="#home" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</a></li>
                            <li><a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">About</a></li>
                            <li><a href="#portfolio" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Portfolio</a></li>
                            <li><a href="#blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Blog</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Resources</h3>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Documentation</a></li>
                            <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Blog</a></li>
                            <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Projects</a></li>
                            <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Contact</a></li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Follow</h3>
                        <div className="flex gap-3">
                            {socialLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white rounded-lg transition"
                                        title={link.name}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-emerald-200 dark:border-emerald-900/30 my-8" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center text-slate-600 dark:text-slate-400 text-sm">
                    <p className="flex items-center gap-1 mb-4 md:mb-0">
                        Made with <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> by Wayan Tisna © {currentYear}
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Privacy</a>
                        <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Terms</a>
                        <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
