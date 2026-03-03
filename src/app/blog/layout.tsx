import { baseOptions } from '@/lib/layout.shared';
import { blogSource } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function BlogSectionLayout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            {...baseOptions()}
            tree={blogSource.pageTree}
            sidebar={{
                banner: (
                    <div className="rounded-lg border border-fd-border bg-fd-card p-3 text-sm text-fd-muted-foreground">
                        <p className="mb-1 font-medium text-fd-foreground">Engineering Blog</p>
                        <p>Production notes on Laravel, API architecture, SQL performance, and modern frontend systems.</p>
                    </div>
                ),
                collapsible: true,
            }}
        >
            {children}
        </DocsLayout>
    );
}
