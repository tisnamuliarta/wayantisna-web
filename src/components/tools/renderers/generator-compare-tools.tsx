'use client';

import { Button } from '@/components/ui/button';
import { SectionLabel, ToolCard, compareJson } from './shared';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';

const DiffEditor = dynamic(
    () => import('@monaco-editor/react').then((module) => module.DiffEditor),
    { ssr: false },
);

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
    const [language, setLanguage] = useState<'typescript' | 'javascript' | 'json' | 'sql' | 'html' | 'css' | 'plaintext'>('typescript');
    const { resolvedTheme } = useTheme();

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <SectionLabel>Original</SectionLabel>
                    <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </div>
                <div>
                    <SectionLabel>Modified</SectionLabel>
                    <textarea value={right} onChange={(e) => setRight(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Monaco Diff View (GitLens-style)
                </p>
                <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as typeof language)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="json">JSON</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="plaintext">Plain Text</option>
                </select>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <DiffEditor
                    height="620px"
                    original={left}
                    modified={right}
                    language={language === 'plaintext' ? undefined : language}
                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        readOnly: true,
                        renderSideBySide: true,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        diffWordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        ignoreTrimWhitespace: false,
                        overviewRulerBorder: false,
                        fontSize: 13,
                        padding: { top: 10, bottom: 10 },
                    }}
                />
            </div>
        </ToolCard>
    );
}

export function JsonDiffTool() {
    const [left, setLeft] = useState('{"name":"Wayan","skills":["Laravel","React"]}');
    const [right, setRight] = useState('{"name":"Wayan Tisna","skills":["Laravel","Next.js"]}');
    const result = useMemo(() => {
        try {
            return {
                error: '',
                diffs: compareJson(JSON.parse(left), JSON.parse(right)),
            };
        } catch (err) {
            return {
                error: err instanceof Error ? err.message : 'Invalid JSON',
                diffs: [] as ReturnType<typeof compareJson>,
            };
        }
    }, [left, right]);

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-2">
                <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                <textarea value={right} onChange={(e) => setRight(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
            {result.error ? (
                <p className="mt-3 text-sm text-red-600">{result.error}</p>
            ) : (
                <div className="mt-4 space-y-2 text-sm">
                    {result.diffs.length === 0 ? <p className="text-emerald-600">No differences.</p> : result.diffs.map((diff) => (
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
