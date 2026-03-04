'use client';

import { toolCategoryOrder, toolsCatalog, type ToolCategory, type ToolDefinition } from '@/lib/tools-catalog';
import {
    Braces,
    ChevronRight,
    Contrast,
    FileCode2,
    Filter,
    type LucideIcon,
    Paintbrush,
    Search,
    TestTube2,
    WandSparkles,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type CategoryFilter = 'All' | ToolCategory;
type QuickFilter = 'All' | 'Converter' | 'Formatter' | 'Generator' | 'Validator' | 'Tester';

const categoryStyles: Record<ToolCategory, { chip: string; accent: string }> = {
    'Design & Color': {
        chip: 'border-fuchsia-300/70 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/70 dark:bg-fuchsia-950/30 dark:text-fuchsia-300',
        accent: 'from-fuchsia-500/25 via-fuchsia-400/10 to-transparent',
    },
    'Formatters & Validators': {
        chip: 'border-cyan-300/70 bg-cyan-50 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-300',
        accent: 'from-cyan-500/25 via-cyan-400/10 to-transparent',
    },
    'Encoders & Decoders': {
        chip: 'border-violet-300/70 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-300',
        accent: 'from-violet-500/25 via-violet-400/10 to-transparent',
    },
    Testers: {
        chip: 'border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300',
        accent: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
    },
    Generators: {
        chip: 'border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300',
        accent: 'from-amber-500/25 via-amber-400/10 to-transparent',
    },
    Comparators: {
        chip: 'border-slate-300/70 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
        accent: 'from-slate-500/25 via-slate-400/10 to-transparent',
    },
};

const categoryIcons: Record<ToolCategory, LucideIcon> = {
    'Design & Color': Paintbrush,
    'Formatters & Validators': FileCode2,
    'Encoders & Decoders': Braces,
    Testers: TestTube2,
    Generators: WandSparkles,
    Comparators: Contrast,
};

const toolIcons: Record<string, string> = {
    'color-picker-converter': '🎨',
    'css-gradient-generator': '🌈',
    'css-grid-flexbox-generator': '🧩',
    'json-formatter-validator': '🧾',
    'html-formatter': '📰',
    'sql-formatter': '🗄️',
    'xml-yaml-formatter': '📄',
    'json-schema-validator': '✅',
    'markdown-to-html-converter': '📝',
    'csv-json-converter': '🔄',
    'css-js-minifier': '🗜️',
    'html-entity-encoder': '🔐',
    'base64-encoder-decoder': '🧬',
    'url-encoder-decoder': '🔗',
    'jwt-decoder': '🪪',
    'hash-generator': '#️⃣',
    'ssl-certificate-checker': '🛡️',
    'api-load-tester': '⚡',
    'webhook-tester': '🪝',
    'openapi-swagger-editor': '📘',
    'regex-tester': '🔍',
    'cron-expression-tester': '⏰',
    'unix-timestamp-converter': '🕒',
    'color-contrast-checker': '🌓',
    'ip-subnet-calculator': '🌐',
    'password-strength-checker': '🔒',
    'cloud-cost-calculator': '☁️',
    'sql-query-optimizer-explainer': '🚀',
    'uuid-random-id-generator': '🆔',
    'password-generator': '🔑',
    'qr-code-generator': '▦',
    'lorem-ipsum-generator': '✍️',
    'cicd-pipeline-generator': '⚙️',
    'docker-compose-generator': '🐳',
    'kubernetes-yaml-generator': '⎈',
    'graphql-query-builder': '🕸️',
    'htaccess-generator': '🧱',
    'robots-txt-generator': '🤖',
    'gitignore-generator': '🙈',
    'code-diff-checker': '🆚',
    'json-diff': '📊',
};

function getQuickTags(tool: ToolDefinition): Exclude<QuickFilter, 'All'>[] {
    const haystack = `${tool.title} ${tool.description} ${tool.category}`.toLowerCase();
    const tags: Exclude<QuickFilter, 'All'>[] = [];

    if (haystack.includes('converter') || haystack.includes('decode') || haystack.includes('encode')) tags.push('Converter');
    if (haystack.includes('formatter') || haystack.includes('minifier')) tags.push('Formatter');
    if (haystack.includes('generator')) tags.push('Generator');
    if (haystack.includes('validator')) tags.push('Validator');
    if (haystack.includes('tester') || haystack.includes('checker') || haystack.includes('load')) tags.push('Tester');

    return tags.length ? tags : ['Generator'];
}

export function ToolsIndexClient() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<CategoryFilter>('All');
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('All');

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return toolsCatalog.filter((tool) => {
            const searchable = [tool.title, tool.description, tool.category].join(' ').toLowerCase();
            const matchesQuery = !keyword || searchable.includes(keyword);
            const matchesCategory = category === 'All' || tool.category === category;
            const matchesQuick = quickFilter === 'All' || getQuickTags(tool).includes(quickFilter);
            return matchesQuery && matchesCategory && matchesQuick;
        });
    }, [query, category, quickFilter]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof filtered>();
        for (const category of toolCategoryOrder) {
            map.set(category, filtered.filter((item) => item.category === category));
        }
        return map;
    }, [filtered]);

    const hasActiveFilter = query.trim().length > 0 || category !== 'All' || quickFilter !== 'All';

    return (
        <div className="space-y-10">
            <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-cyan-50/70 via-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                <div className="max-w-2xl">
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

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <Filter className="h-3.5 w-3.5" />
                        Filter by category
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['All', ...toolCategoryOrder] as CategoryFilter[]).map((item) => {
                            const active = category === item;
                            const style = item === 'All' ? 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300' : categoryStyles[item].chip;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${style} ${active ? 'ring-2 ring-cyan-500/40' : 'hover:opacity-85'}`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quick filter</p>
                    <div className="flex flex-wrap gap-2">
                        {(['All', 'Converter', 'Formatter', 'Generator', 'Validator', 'Tester'] as QuickFilter[]).map((item) => {
                            const active = quickFilter === item;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setQuickFilter(item)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active
                                        ? 'border-cyan-400 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/30 dark:border-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900">
                        Showing {filtered.length} of {toolsCatalog.length} tools
                    </span>
                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setCategory('All');
                                setQuickFilter('All');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {toolCategoryOrder.map((category) => {
                const list = grouped.get(category) ?? [];
                if (list.length === 0) return null;
                const CategoryIcon = categoryIcons[category];

                return (
                    <section key={category} className="space-y-4">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            <span className={`rounded-lg border p-1.5 ${categoryStyles[category].chip}`}>
                                <CategoryIcon className="h-4 w-4" />
                            </span>
                            {category}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {list.map((tool) => (
                                <article
                                    key={tool.slug}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${categoryStyles[category].accent}`} />
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        <span aria-hidden="true">{toolIcons[tool.slug] ?? '🛠️'}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tool.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
                                    <Link
                                        href={`/tools/${tool.slug}`}
                                        className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                                    >
                                        Open tool
                                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
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
