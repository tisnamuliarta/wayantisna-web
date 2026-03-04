import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout as FumaHomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <FumaHomeLayout
            {...baseOptions()}
            className="bg-transparent"
            nav={{
                title: 'Wayan Tisna',
                url: '/',
            }}
        >
            {children}
        </FumaHomeLayout>
    );
}
