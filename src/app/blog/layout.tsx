import { BlogHeaderControls } from '@/components/blog/blog-header-controls';
import { profile } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/#portfolio' },
    { label: 'Tools', href: '/tools' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/#contact' },
];

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05070b] dark:text-slate-100">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
                <div className="mx-auto flex h-16 w-full max-w-[1300px] items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-7">
                        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                            {profile.shortName}
                        </Link>
                        <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex dark:text-slate-300">
                            {navLinks.map((item) => (
                                <Link key={item.label} href={item.href} className="transition hover:text-slate-900 dark:hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <BlogHeaderControls />
                </div>
            </header>
            {children}
        </div>
    );
}
