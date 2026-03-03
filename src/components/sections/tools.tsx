import { Button } from '@/components/ui/button';
import { toolsCatalog } from '@/lib/tools-catalog';
import { ArrowRight, Wrench } from 'lucide-react';
import Link from 'next/link';

export function ToolsSection() {
    const featuredTools = toolsCatalog.slice(0, 6);

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                        Developer Tools Hub
                    </p>
                    <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                        Dedicated tools page with searchable utilities for daily engineering work
                    </h2>
                </div>
                <Link href="/tools">
                    <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        Browse All Tools
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featuredTools.map((tool) => (
                    <article
                        key={tool.slug}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                    >
                        <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <Wrench className="h-4 w-4" />
                        </div>
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
}
