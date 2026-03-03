import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { blogSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function BlogSectionLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <DocsLayout
            {...baseOptions()}
            tree={blogSource.pageTree}
            sidebar={{
                banner: (
                    <div className="rounded-lg border border-fd-border bg-fd-card p-3 text-sm text-fd-muted-foreground">
                        <p className="font-medium text-fd-foreground mb-1">📝 Blog</p>
                        <p>Articles about software development, best practices, and tech insights.</p>
                    </div>
                ),
                collapsible: true,
            }}
        >
            {children}
        </DocsLayout>
    );
}
