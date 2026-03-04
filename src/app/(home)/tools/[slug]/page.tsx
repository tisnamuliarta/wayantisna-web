import { AdBanner } from '@/components/ads-banner';
import { ToolRenderer } from '@/components/tools/tool-renderer';
import { getToolBySlug, toolsCatalog } from '@/lib/tools-catalog';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ToolDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const wideToolSlugs = new Set(['code-diff-checker', 'json-diff', 'css-gradient-generator']);

export async function generateStaticParams() {
    return toolsCatalog.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const tool = getToolBySlug(slug);

    if (!tool) return { title: 'Tool Not Found' };

    return {
        title: `${tool.title} Tool`,
        description: tool.description,
        alternates: {
            canonical: `/tools/${slug}`,
        },
    };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
    const { slug } = await params;
    const tool = getToolBySlug(slug);

    if (!tool) notFound();
    const isWideTool = wideToolSlugs.has(slug);

    return (
        <main className="mx-auto w-full max-w-[1360px] px-4 py-10 md:px-8 md:py-14">
            <div className="mb-7">
                <Link href="/tools" className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                    Back to tools
                </Link>
            </div>

            <header className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">{tool.category}</p>
                <h1 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">{tool.title}</h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
            </header>

            {isWideTool ? (
                <div className="space-y-6">
                    <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950" />
                    <ToolRenderer slug={slug} />
                    <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950" />
                </div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
                    <ToolRenderer slug={slug} />
                    <aside className="hidden xl:block">
                        <div className="sticky top-24 space-y-4">
                            <AdBanner className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950" />
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
