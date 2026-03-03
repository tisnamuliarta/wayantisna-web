'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';
import Link from 'next/link';

function SearchIconButton() {
    const { enabled, setOpenSearch } = useSearchContext();

    if (!enabled) return null;

    return (
        <button
            type="button"
            onClick={() => setOpenSearch(true)}
            aria-label="Open search"
            className="h-9 w-9 rounded-xl border border-slate-300/70 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
            <Search className="mx-auto h-4 w-4" />
        </button>
    );
}

function SearchLargeButton() {
    const { enabled, setOpenSearch, hotKey } = useSearchContext();

    if (!enabled) return null;

    return (
        <button
            type="button"
            onClick={() => setOpenSearch(true)}
            className="inline-flex h-9 min-w-44 items-center gap-2 rounded-xl border border-slate-300/70 bg-white px-3 text-sm text-slate-500 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
            <Search className="h-4 w-4" />
            Search
            <span className="ml-auto inline-flex items-center gap-1">
                {hotKey.map((key, index) => (
                    <kbd
                        key={index}
                        className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0 text-xs text-slate-500 dark:border-white/15 dark:bg-black/40 dark:text-slate-400"
                    >
                        {key.display}
                    </kbd>
                ))}
            </span>
        </button>
    );
}

export function BlogHeaderControls() {
    return (
        <>
            <div className="flex items-center gap-2 md:hidden">
                <SearchIconButton />
                <ThemeToggle className="h-9 w-9 rounded-xl border border-slate-300/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10" />
            </div>
            <div className="hidden items-center gap-3 md:flex">
                <SearchLargeButton />
                <ThemeToggle className="h-9 w-9 rounded-xl border border-slate-300/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10" />
                <Link
                    href="/#contact"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                    Contact
                </Link>
            </div>
        </>
    );
}
