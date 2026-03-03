'use client';

import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareOnX = () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    const shareOnLinkedIn = () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            <button
                type="button"
                onClick={shareOnX}
                className="rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-black/20 dark:text-slate-300 dark:hover:bg-black/30"
            >
                X
            </button>
            <button
                type="button"
                onClick={shareOnLinkedIn}
                className="rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-black/20 dark:text-slate-300 dark:hover:bg-black/30"
            >
                in
            </button>
            <button
                type="button"
                onClick={copyLink}
                className="rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-black/20 dark:text-slate-300 dark:hover:bg-black/30"
            >
                {copied ? 'copied' : 'copy'}
            </button>
        </div>
    );
}
