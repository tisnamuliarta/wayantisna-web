import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout as FumaHomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <FumaHomeLayout
            {...baseOptions()}
            className="bg-[#f5f5f5] text-fd-foreground dark:bg-fd-background"
            nav={{
                title: 'Wayan Tisna',
                url: '/',
            }}
        >
            <div className="min-h-screen bg-[#f5f5f5] font-sans text-fd-foreground dark:bg-fd-background">{children}</div>
        </FumaHomeLayout>
    );
}
