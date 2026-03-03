'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Send } from 'lucide-react'

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    })

    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formData)
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <section className="py-20 px-4 md:px-8" id="contact">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Get In Touch</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Have a project in mind? Let's discuss how we can work together.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Direct Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>

                        <div className="flex items-start">
                            <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-4 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white mb-1">Email</p>
                                <a href="mailto:wayan@example.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                    wayan@example.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-4 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.016 12.016 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white mb-1">GitHub</p>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                    github.com/wayantisna
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-4 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.002 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.81 0-9.728h3.554v1.375c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.382 3.704 4.357v5.591zM5.337 9.432c-1.144 0-1.915-.759-1.915-1.71 0-.953.77-1.71 1.959-1.71 1.188 0 1.914.757 1.942 1.71 0 .951-.771 1.71-1.986 1.71zm1.581 11.02H3.715V9.724h3.203v10.728zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white mb-1">LinkedIn</p>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                    linkedin.com/in/wayantisna
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                💡 <strong>Quick Response:</strong> I usually respond to emails within 24 hours. Feel free to reach out!
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-emerald-300 dark:border-emerald-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-emerald-300 dark:border-emerald-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-emerald-300 dark:border-emerald-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 resize-none h-32"
                                    placeholder="Tell me about your project..."
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white" size="lg">
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>

                            {submitted && (
                                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm">
                                    ✓ Message sent successfully! I'll be in touch soon.
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 rounded-lg p-8 text-center shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">Stay Updated</h3>
                    <p className="text-emerald-100 mb-6">Subscribe to my newsletter for tech insights and project updates.</p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-2 rounded-lg bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            required
                        />
                        <Button variant="outline" size="md" className="bg-white text-emerald-600 hover:bg-emerald-50 border-0 font-semibold">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    )
}
