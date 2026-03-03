import { profile, socialLinks } from '@/lib/utils';
import { Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Tools', href: '/#tools' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
];

export function Footer() {
    return (
        <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 md:px-8 md:py-12">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{profile.shortName}</h2>
                        <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">{profile.summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={socialLinks.github} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                            <Github className="h-4 w-4" />
                        </a>
                        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                            <Linkedin className="h-4 w-4" />
                        </a>
                        <a href={`mailto:${socialLinks.email}`} className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                            <Mail className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
                    {footerLinks.map((item) => (
                        <Link key={item.name} href={item.href} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                            {item.name}
                        </Link>
                    ))}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date().getFullYear()} {profile.fullName}. Built with Next.js, shadcn-style components, and Fumadocs.
                </p>
            </div>
        </footer>
    );
}
