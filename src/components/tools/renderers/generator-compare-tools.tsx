'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, compareJson } from './shared';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { Download, FileText, KeyRound, QrCode, RefreshCcw, Sparkles } from 'lucide-react';

const DiffEditor = dynamic(
    () => import('@monaco-editor/react').then((module) => module.DiffEditor),
    { ssr: false },
);

const compactButtonClass = 'h-8 rounded-lg px-3 text-xs';
const ambiguousChars = new Set(['0', 'O', 'o', 'I', 'l', '1', '|', '`', '\'', '"']);

function randomFromPool(length: number, pool: string) {
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => pool[byte % pool.length]).join('');
}

function countBytes(value: string) {
    return new TextEncoder().encode(value).length;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function shuffle(value: string) {
    const chars = value.split('');
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

export function UuidTool() {
    const [count, setCount] = useState(20);
    const [length, setLength] = useState(16);
    const [strategy, setStrategy] = useState<'uuid' | 'custom' | 'both'>('both');
    const [prefix, setPrefix] = useState('');
    const [separator, setSeparator] = useState('');
    const [lowercase, setLowercase] = useState(true);
    const [uppercase, setUppercase] = useState(false);
    const [numbers, setNumbers] = useState(true);
    const [output, setOutput] = useState<string[]>([]);
    const [error, setError] = useState('');

    const summary = useMemo(() => {
        const uniqueCount = new Set(output).size;
        return {
            generated: output.length,
            unique: uniqueCount,
            collisions: Math.max(0, output.length - uniqueCount),
        };
    }, [output]);

    const generate = () => {
        const safeCount = Math.max(1, Math.min(500, count));
        const safeLength = Math.max(6, Math.min(64, length));
        const pool = [
            lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
            uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
            numbers ? '0123456789' : '',
        ].join('');

        if ((strategy === 'custom' || strategy === 'both') && pool.length === 0) {
            setError('Enable at least one character set for custom ID generation.');
            setOutput([]);
            return;
        }

        setError('');

        const rows: string[] = [];

        if (strategy === 'uuid' || strategy === 'both') {
            for (let i = 0; i < safeCount; i += 1) {
                rows.push(`${prefix}${separator}${crypto.randomUUID()}`);
            }
        }

        if (strategy === 'custom' || strategy === 'both') {
            for (let i = 0; i < safeCount; i += 1) {
                rows.push(`${prefix}${separator}${randomFromPool(safeLength, pool)}`);
            }
        }

        setOutput(rows);
    };

    const outputText = output.join('\n');

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'uuid' ? 'default' : 'outline'} onClick={() => setStrategy('uuid')}>
                        UUID v4
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'custom' ? 'default' : 'outline'} onClick={() => setStrategy('custom')}>
                        Custom ID
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'both' ? 'default' : 'outline'} onClick={() => setStrategy('both')}>
                        Both
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="text-sm">
                        <SectionLabel>Count (max 500)</SectionLabel>
                        <input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Custom Length</SectionLabel>
                        <input type="number" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Prefix</SectionLabel>
                        <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="optional" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Separator</SectionLabel>
                        <input value={separator} onChange={(e) => setSeparator(e.target.value)} placeholder="optional" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <label><input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="mr-2" />Lowercase</label>
                    <label><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="mr-2" />Uppercase</label>
                    <label><input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="mr-2" />Numbers</label>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={generate}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate IDs
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setOutput([])}>
                        Clear
                    </Button>
                    {output.length > 0 ? <CopyButton value={outputText} className={compactButtonClass} /> : null}
                </div>

                {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">{error}</p>
                ) : (
                    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3">
                        <p>Generated: {summary.generated}</p>
                        <p>Unique: {summary.unique}</p>
                        <p>Collisions: {summary.collisions}</p>
                    </div>
                )}

                <textarea value={outputText} readOnly placeholder="Generated IDs will appear here." className="h-56 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" />
            </div>
        </ToolCard>
    );
}

export function PasswordTool() {
    const [length, setLength] = useState(20);
    const [count, setCount] = useState(10);
    const [lowercase, setLowercase] = useState(true);
    const [uppercase, setUppercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(true);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
    const [requireEverySet, setRequireEverySet] = useState(true);
    const [passwords, setPasswords] = useState<string[]>([]);
    const [error, setError] = useState('');

    const groups = useMemo(() => {
        const base = [
            lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
            uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
            numbers ? '0123456789' : '',
            symbols ? '!@#$%^&*()_+-={}[]<>?~' : '',
        ].filter(Boolean);
        if (!excludeAmbiguous) return base;
        return base.map((group) => group.split('').filter((char) => !ambiguousChars.has(char)).join('')).filter(Boolean);
    }, [excludeAmbiguous, lowercase, numbers, symbols, uppercase]);

    const pool = groups.join('');

    const entropy = useMemo(() => {
        if (pool.length === 0) return 0;
        return Math.log2(pool.length) * Math.max(1, length);
    }, [length, pool.length]);

    const strengthLabel = useMemo(() => {
        if (entropy < 45) return 'Weak';
        if (entropy < 70) return 'Medium';
        if (entropy < 95) return 'Strong';
        return 'Very Strong';
    }, [entropy]);

    const generate = () => {
        const safeLength = Math.max(8, Math.min(128, length));
        const safeCount = Math.max(1, Math.min(200, count));

        if (pool.length === 0) {
            setError('Enable at least one character set.');
            setPasswords([]);
            return;
        }
        if (requireEverySet && groups.length > safeLength) {
            setError('Length is too short to include all selected character sets.');
            setPasswords([]);
            return;
        }

        setError('');
        const list: string[] = [];

        for (let i = 0; i < safeCount; i += 1) {
            let next = '';
            if (requireEverySet) {
                const required = groups.map((group) => randomFromPool(1, group)).join('');
                const remaining = randomFromPool(safeLength - groups.length, pool);
                next = shuffle(required + remaining);
            } else {
                next = randomFromPool(safeLength, pool);
            }
            list.push(next);
        }

        setPasswords(list);
    };

    const outputText = passwords.join('\n');

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Length</SectionLabel>
                        <input type="number" min={8} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Count</SectionLabel>
                        <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                    <label><input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="mr-2" />Lowercase</label>
                    <label><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="mr-2" />Uppercase</label>
                    <label><input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="mr-2" />Numbers</label>
                    <label><input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="mr-2" />Symbols</label>
                    <label><input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="mr-2" />Exclude ambiguous</label>
                    <label><input type="checkbox" checked={requireEverySet} onChange={(e) => setRequireEverySet(e.target.checked)} className="mr-2" />Require all sets</label>
                </div>

                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3">
                    <p>Pool size: {pool.length}</p>
                    <p>Entropy: {entropy.toFixed(1)} bits</p>
                    <p>Strength: {strengthLabel}</p>
                </div>

                {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={generate}>
                        <KeyRound className="h-3.5 w-3.5" />
                        Generate Passwords
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setPasswords([])}>
                        Clear
                    </Button>
                    {passwords.length > 0 ? <CopyButton value={outputText} className={compactButtonClass} /> : null}
                </div>

                <textarea value={outputText} readOnly placeholder="Generated passwords will appear here." className="h-56 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" />
            </div>
        </ToolCard>
    );
}

export function QrCodeTool() {
    const [text, setText] = useState('https://wayantisna.com');
    const [size, setSize] = useState(320);
    const [margin, setMargin] = useState(2);
    const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M');
    const [format, setFormat] = useState<'png' | 'svg'>('png');
    const [fgColor, setFgColor] = useState('#111827');
    const [bgColor, setBgColor] = useState('#FFFFFF');

    const src = useMemo(
        () =>
            `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=${margin}&ecc=${ecc}&format=${format}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&data=${encodeURIComponent(text)}`,
        [bgColor, ecc, fgColor, format, margin, size, text],
    );

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={() => setText('https://wayantisna.com')}>
                        <FileText className="h-3.5 w-3.5" />
                        URL Payload
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setText('WIFI:S:Office-WiFi;T:WPA;P:your-password;;')}>
                        <FileText className="h-3.5 w-3.5" />
                        WiFi Payload
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setText('BEGIN:VCARD\nFN:Wayan Tisna\nTEL:+62-812-3456-7890\nEMAIL:wayan@example.com\nEND:VCARD')}>
                        <FileText className="h-3.5 w-3.5" />
                        vCard Payload
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setText('')}>
                        Clear
                    </Button>
                </div>

                <textarea value={text} onChange={(e) => setText(e.target.value)} className="h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Enter payload for QR" />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <label className="text-sm">
                        <SectionLabel>Size</SectionLabel>
                        <input type="number" min={128} max={1024} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Margin</SectionLabel>
                        <input type="number" min={0} max={24} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Error Correction</SectionLabel>
                        <select value={ecc} onChange={(e) => setEcc(e.target.value as typeof ecc)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="L">L</option>
                            <option value="M">M</option>
                            <option value="Q">Q</option>
                            <option value="H">H</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Format</SectionLabel>
                        <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="png">PNG</option>
                            <option value="svg">SVG</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Foreground</SectionLabel>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Background</SectionLabel>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                    </label>
                </div>

                <div className="flex flex-wrap gap-2">
                    <CopyButton value={text} className={compactButtonClass} />
                    <a href={src} download={`qr-code.${format}`} target="_blank" rel="noreferrer">
                        <Button size="sm" className={compactButtonClass} variant="outline">
                            <Download className="h-3.5 w-3.5" />
                            Download
                        </Button>
                    </a>
                </div>

                <div className="grid gap-4 xl:grid-cols-[auto_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                        {text.trim() ? (
                            <Image src={src} alt="Generated QR code" width={size} height={size} unoptimized className="h-56 w-56 rounded-lg border border-slate-200 object-contain dark:border-slate-800" />
                        ) : (
                            <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                <QrCode className="mr-2 h-4 w-4" />
                                Enter payload
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <p>Payload size: {formatBytes(countBytes(text))}</p>
                        <p>Error correction: {ecc}</p>
                        <p>Format: {format.toUpperCase()}</p>
                        <p>Suggested use: higher ECC for printed codes, lower ECC for dense payloads.</p>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}

export function LoremTool() {
    const [mode, setMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [asHtml, setAsHtml] = useState(false);
    const [output, setOutput] = useState('');

    const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');

    const randomWord = () => words[Math.floor(Math.random() * words.length)];
    const makeSentence = () => {
        const length = 10 + Math.floor(Math.random() * 10);
        const items = Array.from({ length }, randomWord);
        const sentence = `${items.join(' ')}.`;
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    };
    const makeParagraph = () => Array.from({ length: 3 + Math.floor(Math.random() * 4) }, makeSentence).join(' ');

    const generate = () => {
        const safeCount = Math.max(1, Math.min(50, count));
        let result = '';

        if (mode === 'words') {
            const items = Array.from({ length: safeCount }, randomWord);
            if (startWithLorem) {
                items[0] = 'lorem';
                if (items.length > 1) items[1] = 'ipsum';
            }
            result = items.join(' ');
        } else if (mode === 'sentences') {
            const items = Array.from({ length: safeCount }, makeSentence);
            if (startWithLorem && items.length > 0) items[0] = `Lorem ipsum dolor sit amet, ${items[0].toLowerCase()}`;
            result = items.join(' ');
        } else {
            const items = Array.from({ length: safeCount }, makeParagraph);
            if (startWithLorem && items.length > 0) {
                items[0] = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${items[0]}`;
            }
            result = asHtml ? items.map((item) => `<p>${item}</p>`).join('\n') : items.join('\n\n');
        }

        setOutput(result);
    };

    const wordCount = useMemo(() => (output.trim() ? output.trim().split(/\s+/).length : 0), [output]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'paragraphs' ? 'default' : 'outline'} onClick={() => setMode('paragraphs')}>
                        Paragraphs
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'sentences' ? 'default' : 'outline'} onClick={() => setMode('sentences')}>
                        Sentences
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'words' ? 'default' : 'outline'} onClick={() => setMode('words')}>
                        Words
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Count</SectionLabel>
                        <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <p>Words: {wordCount}</p>
                        <p>Characters: {output.length}</p>
                        <p>Bytes: {formatBytes(countBytes(output))}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <label><input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="mr-2" />Start with &quot;Lorem ipsum&quot;</label>
                    {mode === 'paragraphs' ? <label><input type="checkbox" checked={asHtml} onChange={(e) => setAsHtml(e.target.checked)} className="mr-2" />Output as HTML paragraphs</label> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={generate}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setOutput('')}>
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                    {output ? <CopyButton value={output} className={compactButtonClass} /> : null}
                </div>

                <textarea value={output} readOnly className="h-64 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Generated text appears here." />
            </div>
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
    const sampleLeft = '{\n  "name": "Wayan",\n  "skills": ["Laravel", "React"],\n  "profile": {\n    "active": true,\n    "role": "developer"\n  }\n}';
    const sampleRight = '{\n  "name": "Wayan Tisna",\n  "skills": ["Laravel", "Next.js"],\n  "profile": {\n    "active": true,\n    "role": "senior developer"\n  },\n  "location": "Bali"\n}';

    const [left, setLeft] = useState(sampleLeft);
    const [right, setRight] = useState(sampleRight);

    const result = useMemo(() => {
        try {
            const parsedLeft = JSON.parse(left);
            const parsedRight = JSON.parse(right);
            const leftKeys = parsedLeft && typeof parsedLeft === 'object' ? Object.keys(parsedLeft as Record<string, unknown>).length : 0;
            const rightKeys = parsedRight && typeof parsedRight === 'object' ? Object.keys(parsedRight as Record<string, unknown>).length : 0;
            return {
                error: '',
                leftPretty: JSON.stringify(parsedLeft, null, 2),
                rightPretty: JSON.stringify(parsedRight, null, 2),
                leftKeys,
                rightKeys,
                diffs: compareJson(parsedLeft, parsedRight),
            };
        } catch (err) {
            return {
                error: err instanceof Error ? err.message : 'Invalid JSON',
                leftPretty: '',
                rightPretty: '',
                leftKeys: 0,
                rightKeys: 0,
                diffs: [] as ReturnType<typeof compareJson>,
            };
        }
    }, [left, right]);

    const summary = useMemo(() => {
        const changed = result.diffs.length;
        const added = result.diffs.filter((item) => typeof item.left === 'undefined' && typeof item.right !== 'undefined').length;
        const removed = result.diffs.filter((item) => typeof item.left !== 'undefined' && typeof item.right === 'undefined').length;
        const updated = Math.max(0, changed - added - removed);
        return { changed, added, removed, updated };
    }, [result.diffs]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={() => { setLeft(sampleLeft); setRight(sampleRight); }}>
                        <FileText className="h-3.5 w-3.5" />
                        Sample
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setLeft(''); setRight(''); }}>
                        Clear
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Left JSON</SectionLabel>
                        <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="h-52 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Right JSON</SectionLabel>
                        <textarea value={right} onChange={(e) => setRight(e.target.value)} className="h-52 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                </div>

                {result.error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">{result.error}</p>
                ) : (
                    <>
                        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3 lg:grid-cols-6">
                            <p>Left keys: {result.leftKeys}</p>
                            <p>Right keys: {result.rightKeys}</p>
                            <p>Total changed: {summary.changed}</p>
                            <p className="text-emerald-700 dark:text-emerald-300">Added: {summary.added}</p>
                            <p className="text-amber-700 dark:text-amber-300">Updated: {summary.updated}</p>
                            <p className="text-red-700 dark:text-red-300">Removed: {summary.removed}</p>
                        </div>

                        <div className="space-y-2 text-sm">
                            {result.diffs.length === 0 ? (
                                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200">
                                    No differences detected.
                                </p>
                            ) : (
                                result.diffs.map((diff) => {
                                    const isAdded = typeof diff.left === 'undefined' && typeof diff.right !== 'undefined';
                                    const isRemoved = typeof diff.left !== 'undefined' && typeof diff.right === 'undefined';
                                    const tone = isAdded
                                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/80 dark:bg-emerald-950/30'
                                        : isRemoved
                                            ? 'border-red-200 bg-red-50 dark:border-red-900/80 dark:bg-red-950/30'
                                            : 'border-amber-200 bg-amber-50 dark:border-amber-900/80 dark:bg-amber-950/30';

                                    return (
                                        <div key={diff.path} className={`rounded-lg border p-3 ${tone}`}>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{diff.path}</p>
                                            <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                {isAdded ? 'Added' : isRemoved ? 'Removed' : 'Updated'}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">Left: {JSON.stringify(diff.left)}</p>
                                            <p className="text-xs text-slate-700 dark:text-slate-200">Right: {JSON.stringify(diff.right)}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <SectionLabel>Left (normalized)</SectionLabel>
                                <pre className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                                    {result.leftPretty}
                                </pre>
                            </div>
                            <div className="space-y-2">
                                <SectionLabel>Right (normalized)</SectionLabel>
                                <pre className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                                    {result.rightPretty}
                                </pre>
                            </div>
                        </div>
                    </>
                )}

                {!result.error && result.diffs.length > 0 ? <CopyButton value={JSON.stringify(result.diffs, null, 2)} className={compactButtonClass} /> : null}
            </div>
        </ToolCard>
    );
}
