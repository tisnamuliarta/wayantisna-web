'use client';

import { toolCategoryOrder, toolsCatalog } from '@/lib/tools-catalog';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export function ToolsIndexClient() {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return toolsCatalog;
        return toolsCatalog.filter((tool) =>
            [tool.title, tool.description, tool.category].join(' ').toLowerCase().includes(keyword),
        );
    }, [query]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof filtered>();
        for (const category of toolCategoryOrder) {
            map.set(category, filtered.filter((item) => item.category === category));
        }
        return map;
    }, [filtered]);

    return (
        <div className="space-y-10">
            <div className="max-w-xl">
                <label htmlFor="tool-search" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Search tools
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="tool-search"
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Try: JSON, Gradient, JWT, Password..."
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </div>
            </div>

            {toolCategoryOrder.map((category) => {
                const list = grouped.get(category) ?? [];
                if (list.length === 0) return null;

                return (
                    <section key={category} className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{category}</h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {list.map((tool) => (
                                <article
                                    key={tool.slug}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tool.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
                                    <Link
                                        href={`/tools/${tool.slug}`}
                                        className="mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                                    >
                                        Open tool
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                );
            })}

            {filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    No tools matched "{query}". Try another keyword.
                </div>
            )}
        </div>
    );
}
