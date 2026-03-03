import { skills } from '@/lib/utils'
import { Code2, Database, Zap } from 'lucide-react'

export function AboutSection() {
    return (
        <section className="py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-slate-900 dark:text-white">About Me</h2>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            I'm a passionate software developer with a strong background in full-stack web development. My expertise spans from backend API design to modern frontend frameworks.
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            With 6+ years of professional experience, I've worked on various projects ranging from small startups to large-scale applications. I'm committed to writing clean, maintainable code and following best practices in software development.
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            Currently exploring new technologies and continuously improving my skills in cloud architecture, performance optimization, and modern development workflows.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-8 border border-emerald-200 dark:border-emerald-800/30">
                        <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Quick Facts</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                                <span className="text-slate-600 dark:text-slate-300">6+ years of professional development experience</span>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                                <span className="text-slate-600 dark:text-slate-300">Full-stack development with modern frameworks</span>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                                <span className="text-slate-600 dark:text-slate-300">Specialized in REST API design and optimization</span>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                                <span className="text-slate-600 dark:text-slate-300">Database design and query optimization</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg p-8 border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center mb-6">
                            <Code2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mr-3" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Frontend</h3>
                        </div>
                        <ul className="space-y-3">
                            {skills.frontend.map((skill) => (
                                <li key={skill.name} className="flex justify-between">
                                    <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{skill.level}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-lg p-8 border border-teal-200 dark:border-teal-800/30">
                        <div className="flex items-center mb-6">
                            <Zap className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-3" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Backend</h3>
                        </div>
                        <ul className="space-y-3">
                            {skills.backend.map((skill) => (
                                <li key={skill.name} className="flex justify-between">
                                    <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                                    <span className="text-teal-600 dark:text-teal-400 font-semibold">{skill.level}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-lg p-8 border border-cyan-200 dark:border-cyan-800/30">
                        <div className="flex items-center mb-6">
                            <Database className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Database</h3>
                        </div>
                        <ul className="space-y-3">
                            {skills.database.map((skill) => (
                                <li key={skill.name} className="flex justify-between">
                                    <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{skill.level}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
