'use client';

import { Button } from '@/components/ui/button';
import { SectionLabel, ToolCard, compareJson } from './shared';
import { useMemo, useState } from 'react';

export function UuidTool() {
    const [count, setCount] = useState(3);
    const [length, setLength] = useState(12);
    const [ids, setIds] = useState<string[]>([]);

    const generate = () => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomId = () => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
        setIds([...Array.from({ length: count }, () => crypto.randomUUID()), ...Array.from({ length: count }, () => randomId())]);
    };

    return (
        <ToolCard>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                    <SectionLabel>Count</SectionLabel>
                    <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="text-sm">
                    <SectionLabel>Random ID Length</SectionLabel>
                    <input type="number" min={6} max={40} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
            </div>
            <div className="mt-3">
                <Button onClick={generate}>Generate IDs</Button>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
                {ids.map((id) => (
                    <li key={id} className="break-all rounded bg-slate-100 px-2 py-1 dark:bg-slate-900">{id}</li>
                ))}
            </ul>
        </ToolCard>
    );
}

export function PasswordTool() {
    const [length, setLength] = useState(16);
    const [uppercase, setUppercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(true);
    const [password, setPassword] = useState('');

    const generate = () => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const sym = '!@#$%^&*()_+-={}[]<>?';
        const pool = [lower, uppercase ? upper : '', numbers ? nums : '', symbols ? sym : ''].join('');
        if (!pool) return;
        setPassword(Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]).join(''));
    };

    return (
        <ToolCard>
            <label className="text-sm">
                <SectionLabel>Length</SectionLabel>
                <input type="number" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                <label><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="mr-2" />Uppercase</label>
                <label><input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="mr-2" />Numbers</label>
                <label><input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="mr-2" />Symbols</label>
            </div>
            <div className="mt-3"><Button onClick={generate}>Generate Password</Button></div>
            {password && <code className="mt-3 inline-block rounded bg-slate-100 px-2 py-1 text-sm dark:bg-slate-900">{password}</code>}
        </ToolCard>
    );
}

export function QrCodeTool() {
    const [text, setText] = useState('https://wayantisna.com');
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(text)}`;

    return (
        <ToolCard>
            <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-4">
                <img src={src} alt="Generated QR code" className="h-56 w-56 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800" />
            </div>
        </ToolCard>
    );
}

export function LoremTool() {
    const [paragraphs, setParagraphs] = useState(3);
    const [output, setOutput] = useState('');
    const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');
    const sentence = () => Array.from({ length: 10 + Math.floor(Math.random() * 8) }, () => words[Math.floor(Math.random() * words.length)]).join(' ') + '.';
    const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random() * 3) }, sentence).join(' ');

    return (
        <ToolCard>
            <label className="text-sm">
                <SectionLabel>Paragraphs</SectionLabel>
                <input type="number" min={1} max={12} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <div className="mt-3"><Button onClick={() => setOutput(Array.from({ length: paragraphs }, paragraph).join('\n\n'))}>Generate</Button></div>
            {output && <textarea value={output} readOnly className="mt-3 h-52 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />}
        </ToolCard>
    );
}

export function CodeDiffTool() {
    const [left, setLeft] = useState('const name = "Wayan";\nconsole.log(name);');
    const [right, setRight] = useState('const fullName = "Wayan";\nconsole.log(fullName);');
    const rows = useMemo(() => {
        const leftLines = left.split('\n');
        const rightLines = right.split('\n');
        const max = Math.max(leftLines.length, rightLines.length);
        return Array.from({ length: max }, (_, index) => {
            const l = leftLines[index] ?? '';
            const r = rightLines[index] ?? '';
            const status = l === r ? 'same' : l && r ? 'changed' : l ? 'removed' : 'added';
            return { l, r, status };
        });
    }, [left, right]);

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-2">
                <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                <textarea value={right} onChange={(e) => setRight(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <div className="mt-4 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
                {rows.map((row, index) => (
                    <div key={index} className={`grid grid-cols-2 text-xs ${row.status === 'changed' ? 'bg-amber-50 dark:bg-amber-900/20' : row.status === 'added' ? 'bg-emerald-50 dark:bg-emerald-900/20' : row.status === 'removed' ? 'bg-rose-50 dark:bg-rose-900/20' : ''}`}>
                        <pre className="border-r border-slate-200 px-2 py-1 dark:border-slate-800">{row.l || ' '}</pre>
                        <pre className="px-2 py-1">{row.r || ' '}</pre>
                    </div>
                ))}
            </div>
        </ToolCard>
    );
}

export function JsonDiffTool() {
    const [left, setLeft] = useState('{"name":"Wayan","skills":["Laravel","React"]}');
    const [right, setRight] = useState('{"name":"Wayan Tisna","skills":["Laravel","Next.js"]}');
    const [error, setError] = useState('');
    const diffs = useMemo(() => {
        try {
            setError('');
            return compareJson(JSON.parse(left), JSON.parse(right));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON');
            return [];
        }
    }, [left, right]);

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-2">
                <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                <textarea value={right} onChange={(e) => setRight(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
            {error ? (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : (
                <div className="mt-4 space-y-2 text-sm">
                    {diffs.length === 0 ? <p className="text-emerald-600">No differences.</p> : diffs.map((diff) => (
                        <div key={diff.path} className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
                            <p className="font-medium">{diff.path}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Left: {JSON.stringify(diff.left)}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Right: {JSON.stringify(diff.right)}</p>
                        </div>
                    ))}
                </div>
            )}
        </ToolCard>
    );
}
