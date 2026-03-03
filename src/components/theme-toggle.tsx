'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
                'rounded-lg transition hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
                className,
            )}
            title="Toggle theme"
        >
            <Moon className="h-4 w-4 dark:hidden" />
            <Sun className="hidden h-4 w-4 dark:block" />
        </Button>
    )
}

