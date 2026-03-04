import { ToolsIndexClient } from '@/components/tools/tools-index-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Developer Tools',
    description:
        'Search and use practical developer tools by Wayan Tisna: formatters, encoders, testers, generators, and comparators.',
    alternates: {
        canonical: '/tools',
    },
};

export default function ToolsIndexPage() {
    return (
        <main className="mx-auto w-full max-w-[1300px] px-4 py-12 md:px-8 md:py-16">
            <header className="mb-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Custom Developer Tools</p>
                <h1 className="text-balance text-4xl font-semibold text-slate-900 md:text-6xl dark:text-slate-100">Find the tool you need and open it instantly</h1>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    A curated collection of utilities for design, formatting, encoding, testing, generating, and comparing developer data.
                </p>
            </header>

            <ToolsIndexClient />
        </main>
    );
}
