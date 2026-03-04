'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';

type FeedbackOpinion = 'good' | 'bad';

interface PageFeedbackProps {
    pageKey: string;
}

export function PageFeedback({ pageKey }: PageFeedbackProps) {
    const storageKey = `tool-feedback:${pageKey}`;
    const [selected, setSelected] = useState<FeedbackOpinion | null>(null);

    useEffect(() => {
        const saved = window.localStorage.getItem(storageKey);
        if (saved === 'good' || saved === 'bad') {
            setSelected(saved);
        }
    }, [storageKey]);

    const onSelect = (value: FeedbackOpinion) => {
        setSelected(value);
        window.localStorage.setItem(storageKey, value);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">How is this guide?</p>
            <button
                type="button"
                onClick={() => onSelect('good')}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition ${selected === 'good'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
                    }`}
                aria-pressed={selected === 'good'}
            >
                <ThumbsUp className="h-4 w-4" />
                Good
            </button>
            <button
                type="button"
                onClick={() => onSelect('bad')}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition ${selected === 'bad'
                        ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
                    }`}
                aria-pressed={selected === 'bad'}
            >
                <ThumbsDown className="h-4 w-4" />
                Bad
            </button>
            {selected ? <span className="text-xs text-slate-500 dark:text-slate-400">Thanks! Your feedback was saved.</span> : null}
        </div>
    );
}
