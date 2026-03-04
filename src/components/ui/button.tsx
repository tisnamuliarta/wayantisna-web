import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent font-medium tracking-[0.01em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950'

        const variants = {
            default:
                'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_10px_24px_-14px_rgba(8,145,178,0.8)] hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_14px_28px_-14px_rgba(8,145,178,0.9)] dark:from-cyan-500 dark:to-blue-500',
            outline:
                'border-slate-300 bg-white/90 text-slate-800 shadow-sm hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900 dark:border-slate-700 dark:bg-slate-950/85 dark:text-slate-100 dark:hover:border-cyan-700 dark:hover:bg-slate-900 dark:hover:text-cyan-200',
            ghost:
                'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        }

        const sizes = {
            sm: 'h-10 px-4 text-sm',
            md: 'h-11 px-5 text-sm',
            lg: 'h-12 px-6 text-base',
        }

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'
