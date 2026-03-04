import { Header } from '@/components/sections/header';
import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05070b] dark:text-slate-100">
            <Header />
            {children}
        </div>
    );
}
