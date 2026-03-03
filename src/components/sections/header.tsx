'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()
    const router = useRouter()

    const navLinks = [
        { name: 'Home', href: '/#home' },
        { name: 'About', href: '/#about' },
        { name: 'Portfolio', href: '/#portfolio' },
        { name: 'Tools', href: '/#tools' },
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
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
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
                                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="rounded-lg"
                            title="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4" />
                            )}
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                    <nav className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => handleMobileNavClick(link.href)}
                                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
