'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const navLinks = [
        { name: 'Home', href: '/#home' },
        { name: 'About', href: '/#about' },
        { name: 'Portfolio', href: '/#portfolio' },
        { name: 'Tools', href: '/tools' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/#contact' },
    ]

    const handleMobileNavClick = (href: string) => {
        setIsOpen(false)
        // If it's a hash link, use router for smooth scrolling
        if (href.startsWith('/')) {
            router.push(href)
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-900/30 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            WT
                        </div>
                        Wayan
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition"
                        >
                            {isOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <nav className="md:hidden pb-4 border-t border-emerald-200 dark:border-emerald-900/30 transition-colors">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => handleMobileNavClick(link.href)}
                                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    )
}
