'use client';

import { Button } from '@/components/ui/button';
import { profile, socialLinks } from '@/lib/utils';
import { Github, Linkedin, Mail, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ContactSection() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        project: '',
    });

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setFormData({ name: '', email: '', project: '' });
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Contact</p>
                    <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-4xl dark:text-slate-100">
                        Build faster with a developer who ships maintainable systems
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {profile.shortName} helps teams deliver Laravel APIs, SQL Server-backed services, and modern Next.js or Vue frontends with
                        reliable architecture and production-focused implementation.
                    </p>

                    <div className="mt-6 space-y-3 text-sm">
                        <a href={`mailto:${socialLinks.email}`} className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300">
                            <Mail className="h-4 w-4" />
                            {socialLinks.email}
                        </a>
                        <a href={socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300">
                            <Github className="h-4 w-4" />
                            github.com/wayantisna
                        </a>
                        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300">
                            <Linkedin className="h-4 w-4" />
                            linkedin.com/in/wayantisna
                        </a>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-300/60 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/80 dark:bg-emerald-950/60 dark:text-emerald-200">
                        Availability: {profile.availability}
                    </div>

                    <div className="mt-6">
                        <Link href="/blog">
                            <Button variant="outline" className="rounded-full px-5">
                                Explore Technical Blog
                            </Button>
                        </Link>
                    </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Project Brief Form</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Share your timeline and technical scope. I usually reply in under 24 hours.
                    </p>

                    <form onSubmit={onSubmit} className="mt-5 space-y-4">
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Name</span>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Your name"
                            />
                        </label>

                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Email</span>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="you@company.com"
                            />
                        </label>

                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Project goals</span>
                            <textarea
                                required
                                value={formData.project}
                                onChange={(event) => setFormData((prev) => ({ ...prev, project: event.target.value }))}
                                className="h-32 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="What are you building and what do you need help with?"
                            />
                        </label>

                        <Button type="submit" className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                            <SendHorizontal className="mr-2 h-4 w-4" />
                            Send Inquiry
                        </Button>

                        {submitted && (
                            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                                Thanks. Your message is queued for review.
                            </p>
                        )}
                    </form>
                </article>
            </div>
        </section>
    );
}
