'use client';

import { Button } from '@/components/ui/button';
import { ToolCard, base64Decode, base64Encode, decodeJwtPart, validateCronField } from './shared';
import { useMemo, useState } from 'react';

export function Base64Tool() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('hello world');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const run = () => {
        try {
            setOutput(mode === 'encode' ? base64Encode(input) : base64Decode(input));
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process value');
            setOutput('');
        }
    };

    return (
        <ToolCard>
            <div className="mb-3 flex gap-2">
                <Button onClick={() => setMode('encode')} variant={mode === 'encode' ? 'default' : 'outline'} size="sm">Encode</Button>
                <Button onClick={() => setMode('decode')} variant={mode === 'decode' ? 'default' : 'outline'} size="sm">Decode</Button>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-40 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={run}>Run</Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}

export function UrlTool() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('https://wayantisna.com/blog?tag=api test');
    const [output, setOutput] = useState('');

    return (
        <ToolCard>
            <div className="mb-3 flex gap-2">
                <Button onClick={() => setMode('encode')} variant={mode === 'encode' ? 'default' : 'outline'} size="sm">Encode</Button>
                <Button onClick={() => setMode('decode')} variant={mode === 'decode' ? 'default' : 'outline'} size="sm">Decode</Button>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-40 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={() => setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))}>Run</Button>
            </div>
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}

export function JwtTool() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState('');

    const decode = () => {
        try {
            const parts = token.split('.');
            if (parts.length < 2) throw new Error('Invalid JWT format');
            setHeader(JSON.stringify(decodeJwtPart(parts[0]), null, 2));
            setPayload(JSON.stringify(decodeJwtPart(parts[1]), null, 2));
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decode token');
            setHeader('');
            setPayload('');
        }
    };

    return (
        <ToolCard>
            <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste JWT token here..." className="h-32 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={decode}>Decode JWT</Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <pre className="overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{header || 'Header output'}</pre>
                <pre className="overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{payload || 'Payload output'}</pre>
            </div>
        </ToolCard>
    );
}

export function RegexTesterTool() {
    const [pattern, setPattern] = useState('\\b\\w{4}\\b');
    const [flags, setFlags] = useState('g');
    const [text, setText] = useState('This regex finds four word letters.');
    const [error, setError] = useState('');

    const matches = useMemo(() => {
        try {
            const regex = new RegExp(pattern, flags);
            setError('');
            return [...text.matchAll(regex)].map((match) => ({ value: match[0], index: match.index ?? 0 }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid regex');
            return [];
        }
    }, [flags, pattern, text]);

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Pattern" />
                <input value={flags} onChange={(e) => setFlags(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Flags" />
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-3 h-36 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{matches.length} match(es)</p>}
        </ToolCard>
    );
}

export function CronTesterTool() {
    const [expression, setExpression] = useState('*/5 * * * *');
    const fields = expression.trim().split(/\s+/);
    const valid =
        fields.length === 5 &&
        validateCronField(fields[0], 0, 59) &&
        validateCronField(fields[1], 0, 23) &&
        validateCronField(fields[2], 1, 31) &&
        validateCronField(fields[3], 1, 12) &&
        validateCronField(fields[4], 0, 6);

    return (
        <ToolCard>
            <input value={expression} onChange={(e) => setExpression(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <p className={`mt-3 text-sm font-medium ${valid ? 'text-emerald-600' : 'text-red-600'}`}>{valid ? 'Valid cron expression' : 'Invalid cron expression (5-field format expected)'}</p>
        </ToolCard>
    );
}
