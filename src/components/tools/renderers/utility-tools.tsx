'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard } from './shared';
import { CheckCircle2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

const compactButtonClass = 'h-8 rounded-lg px-3 text-xs';
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900';
const textAreaClass = 'w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900';
const initialNow = new Date();
const initialTimestamp = String(Math.floor(initialNow.getTime() / 1000));
const initialDateText = initialNow.toISOString().slice(0, 19);

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

function escapeHtml(input: string) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function parseHex(hex: string) {
    const cleaned = hex.replace('#', '');
    const normalized = cleaned.length === 3 ? cleaned.split('').map((ch) => ch + ch).join('') : cleaned;
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    const n = Number.parseInt(normalized, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(r: number, g: number, b: number) {
    const convert = (v: number) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function contrastRatio(hexA: string, hexB: string) {
    const a = parseHex(hexA);
    const b = parseHex(hexB);
    if (!a || !b) return null;
    const la = luminance(a.r, a.g, a.b);
    const lb = luminance(b.r, b.g, b.b);
    const high = Math.max(la, lb);
    const low = Math.min(la, lb);
    return (high + 0.05) / (low + 0.05);
}

function parseCsv(text: string, delimiter = ',') {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                field += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (char === delimiter && !inQuotes) {
            row.push(field);
            field = '';
            continue;
        }
        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i + 1] === '\n') i += 1;
            row.push(field);
            if (row.length > 1 || row[0] !== '') rows.push(row);
            row = [];
            field = '';
            continue;
        }
        field += char;
    }
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
    return rows;
}

function rowsToCsv(rows: string[][], delimiter = ',') {
    return rows
        .map((row) =>
            row
                .map((field) => {
                    const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    if (new RegExp(`["\\n${escaped}]`).test(field)) return `"${field.replaceAll('"', '""')}"`;
                    return field;
                })
                .join(delimiter),
        )
        .join('\n');
}

function ipToInt(ip: string) {
    const parts = ip.split('.').map((p) => Number(p));
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(value: number) {
    return `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`;
}

function validateSimpleSchema(schema: unknown, data: unknown, path = 'root'): ValidationResult {
    const errors: string[] = [];
    const node = schema as Record<string, unknown>;
    const type = node.type as string | undefined;

    if (type) {
        const typeOk =
            (type === 'object' && typeof data === 'object' && data !== null && !Array.isArray(data)) ||
            (type === 'array' && Array.isArray(data)) ||
            (type === 'string' && typeof data === 'string') ||
            (type === 'number' && typeof data === 'number') ||
            (type === 'integer' && Number.isInteger(data)) ||
            (type === 'boolean' && typeof data === 'boolean') ||
            (type === 'null' && data === null);
        if (!typeOk) errors.push(`${path}: expected ${type}`);
    }

    if (Array.isArray(node.enum) && !node.enum.includes(data)) {
        errors.push(`${path}: must be one of enum values`);
    }

    if (type === 'string' && typeof data === 'string') {
        const minLength = typeof node.minLength === 'number' ? node.minLength : null;
        const maxLength = typeof node.maxLength === 'number' ? node.maxLength : null;
        if (minLength !== null && data.length < minLength) errors.push(`${path}: minLength ${minLength}`);
        if (maxLength !== null && data.length > maxLength) errors.push(`${path}: maxLength ${maxLength}`);
        if (typeof node.pattern === 'string') {
            const regex = new RegExp(node.pattern);
            if (!regex.test(data)) errors.push(`${path}: pattern mismatch`);
        }
    }

    if ((type === 'number' || type === 'integer') && typeof data === 'number') {
        if (typeof node.minimum === 'number' && data < node.minimum) errors.push(`${path}: minimum ${node.minimum}`);
        if (typeof node.maximum === 'number' && data > node.maximum) errors.push(`${path}: maximum ${node.maximum}`);
    }

    if (type === 'array' && Array.isArray(data) && node.items) {
        data.forEach((item, index) => {
            const child = validateSimpleSchema(node.items, item, `${path}[${index}]`);
            errors.push(...child.errors);
        });
    }

    if (type === 'object' && typeof data === 'object' && data !== null && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        const required = Array.isArray(node.required) ? (node.required as string[]) : [];
        required.forEach((key) => {
            if (!(key in obj)) errors.push(`${path}.${key}: required`);
        });

        const properties = node.properties as Record<string, unknown> | undefined;
        if (properties) {
            Object.entries(properties).forEach(([key, subSchema]) => {
                if (key in obj) {
                    const child = validateSimpleSchema(subSchema, obj[key], `${path}.${key}`);
                    errors.push(...child.errors);
                }
            });
        }
    }

    return { valid: errors.length === 0, errors };
}

function md5(input: string) {
    function rotateLeft(lValue: number, shiftBits: number) {
        return (lValue << shiftBits) | (lValue >>> (32 - shiftBits));
    }
    function addUnsigned(lX: number, lY: number) {
        const lX8 = lX & 0x80000000;
        const lY8 = lY & 0x80000000;
        const lX4 = lX & 0x40000000;
        const lY4 = lY & 0x40000000;
        const result = (lX & 0x3fffffff) + (lY & 0x3fffffff);
        if (lX4 & lY4) return result ^ 0x80000000 ^ lX8 ^ lY8;
        if (lX4 | lY4) {
            if (result & 0x40000000) return result ^ 0xc0000000 ^ lX8 ^ lY8;
            return result ^ 0x40000000 ^ lX8 ^ lY8;
        }
        return result ^ lX8 ^ lY8;
    }
    function f(x: number, y: number, z: number) { return (x & y) | (~x & z); }
    function g(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
    function h(x: number, y: number, z: number) { return x ^ y ^ z; }
    function i(x: number, y: number, z: number) { return y ^ (x | ~z); }
    function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function convertToWordArray(str: string) {
        const lWordCount = (((str.length + 8 - ((str.length + 8) % 64)) / 64) + 1) * 16;
        const wordArray = new Array<number>(lWordCount - 1);
        let bytePos = 0;
        let byteCount = 0;
        while (byteCount < str.length) {
            const wordPos = (byteCount - (byteCount % 4)) / 4;
            bytePos = (byteCount % 4) * 8;
            wordArray[wordPos] = wordArray[wordPos] | (str.charCodeAt(byteCount) << bytePos);
            byteCount += 1;
        }
        const wordPos = (byteCount - (byteCount % 4)) / 4;
        bytePos = (byteCount % 4) * 8;
        wordArray[wordPos] = wordArray[wordPos] | (0x80 << bytePos);
        wordArray[lWordCount - 2] = str.length << 3;
        wordArray[lWordCount - 1] = str.length >>> 29;
        return wordArray;
    }
    function wordToHex(lValue: number) {
        let wordToHexValue = '';
        for (let count = 0; count <= 3; count += 1) {
            const byte = (lValue >>> (count * 8)) & 255;
            const temp = `0${byte.toString(16)}`;
            wordToHexValue += temp.substring(temp.length - 2, temp.length);
        }
        return wordToHexValue;
    }

    const x = convertToWordArray(unescape(encodeURIComponent(input)));
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
        const aa = a; const bb = b; const cc = c; const dd = d;
        a = ff(a, b, c, d, x[k], 7, 0xd76aa478); d = ff(d, a, b, c, x[k + 1], 12, 0xe8c7b756); c = ff(c, d, a, b, x[k + 2], 17, 0x242070db); b = ff(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
        a = ff(a, b, c, d, x[k + 4], 7, 0xf57c0faf); d = ff(d, a, b, c, x[k + 5], 12, 0x4787c62a); c = ff(c, d, a, b, x[k + 6], 17, 0xa8304613); b = ff(b, c, d, a, x[k + 7], 22, 0xfd469501);
        a = ff(a, b, c, d, x[k + 8], 7, 0x698098d8); d = ff(d, a, b, c, x[k + 9], 12, 0x8b44f7af); c = ff(c, d, a, b, x[k + 10], 17, 0xffff5bb1); b = ff(b, c, d, a, x[k + 11], 22, 0x895cd7be);
        a = ff(a, b, c, d, x[k + 12], 7, 0x6b901122); d = ff(d, a, b, c, x[k + 13], 12, 0xfd987193); c = ff(c, d, a, b, x[k + 14], 17, 0xa679438e); b = ff(b, c, d, a, x[k + 15], 22, 0x49b40821);
        a = gg(a, b, c, d, x[k + 1], 5, 0xf61e2562); d = gg(d, a, b, c, x[k + 6], 9, 0xc040b340); c = gg(c, d, a, b, x[k + 11], 14, 0x265e5a51); b = gg(b, c, d, a, x[k], 20, 0xe9b6c7aa);
        a = gg(a, b, c, d, x[k + 5], 5, 0xd62f105d); d = gg(d, a, b, c, x[k + 10], 9, 0x02441453); c = gg(c, d, a, b, x[k + 15], 14, 0xd8a1e681); b = gg(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
        a = gg(a, b, c, d, x[k + 9], 5, 0x21e1cde6); d = gg(d, a, b, c, x[k + 14], 9, 0xc33707d6); c = gg(c, d, a, b, x[k + 3], 14, 0xf4d50d87); b = gg(b, c, d, a, x[k + 8], 20, 0x455a14ed);
        a = gg(a, b, c, d, x[k + 13], 5, 0xa9e3e905); d = gg(d, a, b, c, x[k + 2], 9, 0xfcefa3f8); c = gg(c, d, a, b, x[k + 7], 14, 0x676f02d9); b = gg(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
        a = hh(a, b, c, d, x[k + 5], 4, 0xfffa3942); d = hh(d, a, b, c, x[k + 8], 11, 0x8771f681); c = hh(c, d, a, b, x[k + 11], 16, 0x6d9d6122); b = hh(b, c, d, a, x[k + 14], 23, 0xfde5380c);
        a = hh(a, b, c, d, x[k + 1], 4, 0xa4beea44); d = hh(d, a, b, c, x[k + 4], 11, 0x4bdecfa9); c = hh(c, d, a, b, x[k + 7], 16, 0xf6bb4b60); b = hh(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
        a = hh(a, b, c, d, x[k + 13], 4, 0x289b7ec6); d = hh(d, a, b, c, x[k], 11, 0xeaa127fa); c = hh(c, d, a, b, x[k + 3], 16, 0xd4ef3085); b = hh(b, c, d, a, x[k + 6], 23, 0x04881d05);
        a = hh(a, b, c, d, x[k + 9], 4, 0xd9d4d039); d = hh(d, a, b, c, x[k + 12], 11, 0xe6db99e5); c = hh(c, d, a, b, x[k + 15], 16, 0x1fa27cf8); b = hh(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
        a = ii(a, b, c, d, x[k], 6, 0xf4292244); d = ii(d, a, b, c, x[k + 7], 10, 0x432aff97); c = ii(c, d, a, b, x[k + 14], 15, 0xab9423a7); b = ii(b, c, d, a, x[k + 5], 21, 0xfc93a039);
        a = ii(a, b, c, d, x[k + 12], 6, 0x655b59c3); d = ii(d, a, b, c, x[k + 3], 10, 0x8f0ccc92); c = ii(c, d, a, b, x[k + 10], 15, 0xffeff47d); b = ii(b, c, d, a, x[k + 1], 21, 0x85845dd1);
        a = ii(a, b, c, d, x[k + 8], 6, 0x6fa87e4f); d = ii(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0); c = ii(c, d, a, b, x[k + 6], 15, 0xa3014314); b = ii(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
        a = ii(a, b, c, d, x[k + 4], 6, 0xf7537e82); d = ii(d, a, b, c, x[k + 11], 10, 0xbd3af235); c = ii(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb); b = ii(b, c, d, a, x[k + 9], 21, 0xeb86d391);
        a = addUnsigned(a, aa); b = addUnsigned(b, bb); c = addUnsigned(c, cc); d = addUnsigned(d, dd);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

function bytesToHex(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function digestText(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', value: string) {
    const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
    return bytesToHex(digest);
}

function entropyBits(password: string) {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/\d/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 33;
    if (pool === 0 || password.length === 0) return 0;
    return password.length * Math.log2(pool);
}

function humanDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return 'instant';
    const years = seconds / (365 * 24 * 3600);
    if (years > 1000) return '> 1000 years';
    if (years >= 1) return `${years.toFixed(1)} years`;
    const days = seconds / (24 * 3600);
    if (days >= 1) return `${days.toFixed(1)} days`;
    const hours = seconds / 3600;
    if (hours >= 1) return `${hours.toFixed(1)} hours`;
    const mins = seconds / 60;
    if (mins >= 1) return `${mins.toFixed(1)} minutes`;
    return `${seconds.toFixed(1)} seconds`;
}

export function JsonSchemaValidatorTool() {
    const [schemaText, setSchemaText] = useState('{\n  "type": "object",\n  "required": ["name"],\n  "properties": {\n    "name": { "type": "string", "minLength": 2 },\n    "age": { "type": "integer", "minimum": 18 }\n  }\n}');
    const [dataText, setDataText] = useState('{\n  "name": "Wayan",\n  "age": 28\n}');
    const [mode, setMode] = useState<'single' | 'batch-array'>('single');
    const [maxErrors, setMaxErrors] = useState(50);
    const [result, setResult] = useState<{ valid: boolean; errors: string[]; checked: number } | null>(null);

    const onValidate = () => {
        try {
            const schema = JSON.parse(schemaText);
            const data = JSON.parse(dataText);
            if (mode === 'single') {
                const checked = validateSimpleSchema(schema, data);
                setResult({
                    valid: checked.valid,
                    errors: checked.errors.slice(0, maxErrors),
                    checked: 1,
                });
                return;
            }

            if (!Array.isArray(data)) throw new Error('Batch mode expects JSON array payload.');
            const allErrors: string[] = [];
            data.forEach((item, index) => {
                const rowResult = validateSimpleSchema(schema, item, `item[${index}]`);
                allErrors.push(...rowResult.errors);
            });
            setResult({
                valid: allErrors.length === 0,
                errors: allErrors.slice(0, maxErrors),
                checked: data.length,
            });
        } catch (error) {
            setResult({ valid: false, errors: [error instanceof Error ? error.message : 'Invalid JSON'], checked: 0 });
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'single' ? 'default' : 'outline'} onClick={() => setMode('single')}>
                        Single Payload
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'batch-array' ? 'default' : 'outline'} onClick={() => setMode('batch-array')}>
                        Batch Array
                    </Button>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        Max Errors
                        <input type="number" min={5} max={500} value={maxErrors} onChange={(e) => setMaxErrors(Number(e.target.value))} className={`${inputClass} w-28`} />
                    </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>JSON Schema</SectionLabel>
                        <textarea value={schemaText} onChange={(e) => setSchemaText(e.target.value)} className={`${textAreaClass} h-40`} placeholder="JSON Schema" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>JSON Data</SectionLabel>
                        <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} className={`${textAreaClass} h-40`} placeholder="JSON Data" />
                    </label>
                </div>
                <Button size="sm" className={compactButtonClass} onClick={onValidate}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Validate
                </Button>
                {result ? (
                    <div className={`rounded-xl border p-3 text-xs ${result.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200'}`}>
                        <p className="font-semibold">{result.valid ? 'Schema validation passed' : 'Schema validation failed'}</p>
                        <p className="mt-1">Checked payloads: {result.checked}</p>
                        <ul className="mt-1 space-y-1">{result.errors.map((err) => <li key={err}>- {err}</li>)}</ul>
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

function markdownToHtml(markdown: string) {
    const lines = markdown.split('\n');
    const html: string[] = [];
    let inList = false;
    let inCode = false;

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (line.startsWith('```')) {
            inCode = !inCode;
            if (inCode) html.push('<pre><code>');
            else html.push('</code></pre>');
            continue;
        }
        if (inCode) {
            html.push(escapeHtml(rawLine));
            continue;
        }
        if (/^[-*]\s+/.test(line)) {
            if (!inList) html.push('<ul>');
            inList = true;
            html.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }
        if (inList) {
            html.push('</ul>');
            inList = false;
        }
        if (/^###\s+/.test(line)) html.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ''))}</h3>`);
        else if (/^##\s+/.test(line)) html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`);
        else if (/^#\s+/.test(line)) html.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ''))}</h1>`);
        else if (line === '') html.push('');
        else html.push(`<p>${escapeHtml(line)}</p>`);
    }
    if (inList) html.push('</ul>');
    return html.join('\n');
}

export function MarkdownToHtmlConverterTool() {
    const [markdown, setMarkdown] = useState('# Portfolio\n\n- Laravel\n- Next.js');
    const html = useMemo(() => markdownToHtml(markdown), [markdown]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Markdown Input</SectionLabel>
                        <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} className={`${textAreaClass} h-44`} />
                    </label>
                    <div className="space-y-2">
                        <SectionLabel>HTML Output</SectionLabel>
                        <pre className="max-h-44 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{html}</pre>
                    </div>
                </div>
                <CopyButton value={html} className={compactButtonClass} />
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                    <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </div>
        </ToolCard>
    );
}

export function CsvJsonConverterTool() {
    const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
    const [input, setInput] = useState('name,role\nWayan,Developer');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [delimiter, setDelimiter] = useState(',');
    const [csvHasHeader, setCsvHasHeader] = useState(true);
    const [prettyJson, setPrettyJson] = useState(true);
    const [diagnostics, setDiagnostics] = useState<string[]>([]);

    const onConvert = () => {
        try {
            if (mode === 'csv-to-json') {
                const rows = parseCsv(input, delimiter || ',');
                if (rows.length < 1) throw new Error('CSV is empty.');
                const header = csvHasHeader ? rows[0] : rows[0].map((_, index) => `col_${index + 1}`);
                const body = csvHasHeader ? rows.slice(1) : rows;
                const mapped = body.map((row) => Object.fromEntries(header.map((key, idx) => [key, row[idx] ?? ''])));
                setOutput(prettyJson ? JSON.stringify(mapped, null, 2) : JSON.stringify(mapped));
                setDiagnostics([`Rows parsed: ${rows.length}`, `Output objects: ${mapped.length}`, `Columns: ${header.length}`]);
            } else {
                const parsed = JSON.parse(input) as Array<Record<string, unknown>> | Record<string, unknown>;
                const normalized = Array.isArray(parsed) ? parsed : [parsed];
                if (normalized.length === 0) throw new Error('JSON input is empty.');
                const keys = Array.from(new Set(normalized.flatMap((item) => Object.keys(item))));
                const rows = [
                    keys,
                    ...normalized.map((item) =>
                        keys.map((key) => {
                            const value = item[key];
                            if (value === null || value === undefined) return '';
                            return typeof value === 'object' ? JSON.stringify(value) : String(value);
                        }),
                    ),
                ];
                const csvRows = csvHasHeader ? rows : rows.slice(1);
                setOutput(rowsToCsv(csvRows, delimiter || ','));
                setDiagnostics([`JSON records: ${normalized.length}`, `Columns exported: ${keys.length}`, `Delimiter: "${delimiter || ','}"`]);
            }
            setError('');
        } catch (err) {
            setOutput('');
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setDiagnostics([]);
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'csv-to-json' ? 'default' : 'outline'} onClick={() => setMode('csv-to-json')}>
                        CSV to JSON
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'json-to-csv' ? 'default' : 'outline'} onClick={() => setMode('json-to-csv')}>
                        JSON to CSV
                    </Button>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        Delimiter
                        <input value={delimiter} onChange={(e) => setDelimiter(e.target.value.slice(0, 1))} className={`${inputClass} w-14`} />
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700">
                        <input type="checkbox" checked={csvHasHeader} onChange={(e) => setCsvHasHeader(e.target.checked)} className="h-3.5 w-3.5" />
                        Header row
                    </label>
                    {mode === 'csv-to-json' ? (
                        <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700">
                            <input type="checkbox" checked={prettyJson} onChange={(e) => setPrettyJson(e.target.checked)} className="h-3.5 w-3.5" />
                            Pretty JSON
                        </label>
                    ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>{mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}</SectionLabel>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} className={`${textAreaClass} h-40`} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>{mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}</SectionLabel>
                        <textarea value={output} readOnly className={`${textAreaClass} h-40`} />
                    </label>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={onConvert}>Convert</Button>
                    {output ? <CopyButton value={output} className={compactButtonClass} /> : null}
                </div>
                {diagnostics.length > 0 ? (
                    <ul className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {diagnostics.map((item) => (
                            <li key={item}>- {item}</li>
                        ))}
                    </ul>
                ) : null}
                {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
            </div>
        </ToolCard>
    );
}

export function UnixTimestampConverterTool() {
    const [timestamp, setTimestamp] = useState(initialTimestamp);
    const [dateText, setDateText] = useState(initialDateText);
    const [relativeInput, setRelativeInput] = useState('now+15m');
    const [snapshot, setSnapshot] = useState('');
    const [referenceNowMs, setReferenceNowMs] = useState(initialNow.getTime());

    const parsedDate = useMemo(() => {
        const n = Number(timestamp.trim());
        if (Number.isNaN(n)) return null;
        const ms = timestamp.trim().length <= 10 ? n * 1000 : n;
        const date = new Date(ms);
        if (Number.isNaN(date.getTime())) return null;
        return date;
    }, [timestamp]);

    const fromDate = useMemo(() => {
        const date = new Date(dateText);
        if (Number.isNaN(date.getTime())) return null;
        return {
            sec: Math.floor(date.getTime() / 1000),
            ms: date.getTime(),
        };
    }, [dateText]);

    const relativeDate = useMemo(() => {
        const trimmed = relativeInput.replace(/\s+/g, '');
        const match = trimmed.match(/^now([+-])(\d+)(s|m|h|d)$/i);
        if (!match) return null;
        const [, op, amountText, unit] = match;
        const amount = Number(amountText);
        if (Number.isNaN(amount)) return null;
        const unitMs = unit.toLowerCase() === 's' ? 1000 : unit.toLowerCase() === 'm' ? 60000 : unit.toLowerCase() === 'h' ? 3600000 : 86400000;
        const delta = amount * unitMs;
        const target = new Date(referenceNowMs + (op === '+' ? delta : -delta));
        return {
            iso: target.toISOString(),
            sec: Math.floor(target.getTime() / 1000),
            ms: target.getTime(),
        };
    }, [referenceNowMs, relativeInput]);

    const nowDiffLabel = useMemo(() => {
        if (!parsedDate) return 'Invalid';
        const diffSec = Math.round((parsedDate.getTime() - referenceNowMs) / 1000);
        if (diffSec === 0) return 'now';
        const direction = diffSec > 0 ? 'from now' : 'ago';
        const abs = Math.abs(diffSec);
        if (abs >= 86400) return `${(abs / 86400).toFixed(2)} days ${direction}`;
        if (abs >= 3600) return `${(abs / 3600).toFixed(2)} hours ${direction}`;
        if (abs >= 60) return `${(abs / 60).toFixed(2)} minutes ${direction}`;
        return `${abs} seconds ${direction}`;
    }, [parsedDate, referenceNowMs]);

    const buildSnapshot = () => {
        const payload = {
            timestampInput: timestamp,
            dateInput: dateText,
            referenceNow: new Date(referenceNowMs).toISOString(),
            timestampToUtc: parsedDate?.toISOString() ?? null,
            timestampToLocal: parsedDate?.toString() ?? null,
            timestampDeltaFromNow: nowDiffLabel,
            dateToSeconds: fromDate?.sec ?? null,
            dateToMilliseconds: fromDate?.ms ?? null,
            relative: relativeDate,
        };
        setSnapshot(JSON.stringify(payload, null, 2));
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Unix Timestamp</SectionLabel>
                        <input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Date to Timestamp</SectionLabel>
                        <input value={dateText} onChange={(e) => setDateText(e.target.value)} className={inputClass} />
                    </label>
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <label className="text-sm">
                        <SectionLabel>Relative Expression</SectionLabel>
                        <input value={relativeInput} onChange={(e) => setRelativeInput(e.target.value)} className={inputClass} placeholder="Relative time (e.g. now+15m, now-2h)" />
                    </label>
                    <div className="flex gap-2">
                        <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setReferenceNowMs(Date.now())}>
                            Refresh Now
                        </Button>
                        <Button size="sm" className={compactButtonClass} onClick={buildSnapshot}>
                            Build Snapshot
                        </Button>
                    </div>
                </div>
                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                    <p>From timestamp (UTC): {parsedDate ? parsedDate.toISOString() : 'Invalid'}</p>
                    <p>From timestamp (local): {parsedDate ? parsedDate.toString() : 'Invalid'}</p>
                    <p>Timestamp delta: {nowDiffLabel}</p>
                    <p>From date to sec: {fromDate ? fromDate.sec : 'Invalid'}</p>
                    <p>From date to ms: {fromDate ? fromDate.ms : 'Invalid'}</p>
                    <p>Relative result: {relativeDate ? `${relativeDate.iso} (${relativeDate.sec})` : 'Invalid relative format'}</p>
                </div>
                {snapshot ? (
                    <div className="space-y-2">
                        <pre className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{snapshot}</pre>
                        <CopyButton value={snapshot} className={compactButtonClass} />
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

export function ColorContrastCheckerTool() {
    const [foreground, setForeground] = useState('#111827');
    const [background, setBackground] = useState('#FFFFFF');
    const ratio = useMemo(() => contrastRatio(foreground, background), [background, foreground]);
    const normalAA = ratio !== null && ratio >= 4.5;
    const normalAAA = ratio !== null && ratio >= 7;
    const largeAA = ratio !== null && ratio >= 3;

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Foreground</SectionLabel>
                        <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Background</SectionLabel>
                        <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                    </label>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" style={{ color: foreground, backgroundColor: background }}>
                    Accessibility preview text for UI and blog content.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                    <p>Contrast ratio: {ratio ? ratio.toFixed(2) : 'Invalid'}</p>
                    <p>WCAG AA (normal): {normalAA ? 'Pass' : 'Fail'}</p>
                    <p>WCAG AAA (normal): {normalAAA ? 'Pass' : 'Fail'}</p>
                    <p>WCAG AA (large text): {largeAA ? 'Pass' : 'Fail'}</p>
                </div>
            </div>
        </ToolCard>
    );
}

function minifyCss(input: string) {
    return input
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>])\s*/g, '$1')
        .trim();
}

function minifyJs(input: string) {
    return input
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}();,:=+\-*/<>])\s*/g, '$1')
        .trim();
}

export function CssJsMinifierTool() {
    const [mode, setMode] = useState<'css' | 'js'>('css');
    const [input, setInput] = useState('body {\n  margin: 0;\n  color: #111827;\n}');
    const output = useMemo(() => (mode === 'css' ? minifyCss(input) : minifyJs(input)), [input, mode]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'css' ? 'default' : 'outline'} onClick={() => setMode('css')}>CSS</Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'js' ? 'default' : 'outline'} onClick={() => setMode('js')}>JS</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>{mode.toUpperCase()} Input</SectionLabel>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} className={`${textAreaClass} h-40`} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Minified Output</SectionLabel>
                        <textarea value={output} readOnly className={`${textAreaClass} h-40`} />
                    </label>
                </div>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

function encodeEntities(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function decodeEntities(value: string) {
    if (typeof document === 'undefined') return value;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = value;
    return textArea.value;
}

export function HtmlEntityEncoderTool() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('<h1>Wayan & Team</h1>');
    const output = useMemo(() => (mode === 'encode' ? encodeEntities(input) : decodeEntities(input)), [input, mode]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>Encode</Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>Decode</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Input</SectionLabel>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} className={`${textAreaClass} h-36`} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Output</SectionLabel>
                        <textarea value={output} readOnly className={`${textAreaClass} h-36`} />
                    </label>
                </div>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function IpSubnetCalculatorTool() {
    const [cidr, setCidr] = useState('192.168.10.15/24');
    const [newPrefix, setNewPrefix] = useState(26);
    const [previewSubnets, setPreviewSubnets] = useState(4);
    const result = useMemo(() => {
        const [ipRaw, prefixRaw] = cidr.split('/');
        const prefix = Number(prefixRaw);
        const ipInt = ipToInt(ipRaw ?? '');
        if (ipInt === null || Number.isNaN(prefix) || prefix < 0 || prefix > 32) return null;

        const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
        const network = ipInt & mask;
        const broadcast = network | (~mask >>> 0);
        const totalAddresses = 2 ** (32 - prefix);
        const hosts = prefix >= 31 ? 0 : totalAddresses - 2;
        const firstHost = prefix >= 31 ? network : network + 1;
        const lastHost = prefix >= 31 ? broadcast : broadcast - 1;
        const wildcardMask = (~mask >>> 0);
        const subnetList: Array<{ network: string; broadcast: string; cidr: string }> = [];
        if (newPrefix > prefix && newPrefix <= 32) {
            const step = 2 ** (32 - newPrefix);
            const totalSubnets = 2 ** (newPrefix - prefix);
            for (let i = 0; i < Math.min(totalSubnets, Math.max(1, previewSubnets)); i += 1) {
                const net = (network + i * step) >>> 0;
                const broad = (net + step - 1) >>> 0;
                subnetList.push({
                    network: intToIp(net),
                    broadcast: intToIp(broad),
                    cidr: `${intToIp(net)}/${newPrefix}`,
                });
            }
        }

        return {
            network: intToIp(network),
            broadcast: intToIp(broadcast),
            firstHost: intToIp(firstHost >>> 0),
            lastHost: intToIp(lastHost >>> 0),
            subnetMask: intToIp(mask),
            wildcardMask: intToIp(wildcardMask),
            usableHosts: hosts,
            totalAddresses,
            subnetList,
        };
    }, [cidr, newPrefix, previewSubnets]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <label className="text-sm">
                    <SectionLabel>CIDR Input</SectionLabel>
                    <input value={cidr} onChange={(e) => setCidr(e.target.value)} className={inputClass} placeholder="192.168.1.10/24" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Subnet Split Prefix</SectionLabel>
                        <input type="number" min={0} max={32} value={newPrefix} onChange={(e) => setNewPrefix(Number(e.target.value))} className={inputClass} placeholder="Subnet split prefix" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Preview Subnets</SectionLabel>
                        <input type="number" min={1} max={32} value={previewSubnets} onChange={(e) => setPreviewSubnets(Number(e.target.value))} className={inputClass} placeholder="Preview subnets" />
                    </label>
                </div>
                {result ? (
                    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <p>Subnet mask: {result.subnetMask}</p>
                        <p>Wildcard mask: {result.wildcardMask}</p>
                        <p>Network: {result.network}</p>
                        <p>Broadcast: {result.broadcast}</p>
                        <p>First host: {result.firstHost}</p>
                        <p>Last host: {result.lastHost}</p>
                        <p>Total addresses: {result.totalAddresses}</p>
                        <p>Usable hosts: {result.usableHosts}</p>
                        {result.subnetList.length > 0 ? (
                            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
                                <p className="mb-1 font-semibold">Subnet split preview</p>
                                <ul className="space-y-1">
                                    {result.subnetList.map((subnet) => (
                                        <li key={subnet.cidr}>
                                            - {subnet.cidr} ({`${subnet.network} -> ${subnet.broadcast}`})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">Invalid CIDR format.</p>
                )}
            </div>
        </ToolCard>
    );
}

export function PasswordStrengthCheckerTool() {
    const [password, setPassword] = useState('');
    const [guessesPerSecond, setGuessesPerSecond] = useState(1e10);

    const analysis = useMemo(() => {
        let score = 0;
        const tips: string[] = [];
        if (password.length >= 12) score += 35;
        else if (password.length >= 8) score += 20;
        else tips.push('Use at least 12 characters.');
        if (/[a-z]/.test(password)) score += 15; else tips.push('Add lowercase letters.');
        if (/[A-Z]/.test(password)) score += 15; else tips.push('Add uppercase letters.');
        if (/\d/.test(password)) score += 15; else tips.push('Add numbers.');
        if (/[^A-Za-z0-9]/.test(password)) score += 20; else tips.push('Add symbols.');
        if (/(.)\1{2,}/.test(password)) {
            score -= 15;
            tips.push('Avoid repeated characters.');
        }
        if (/password|12345|qwerty|admin/i.test(password)) {
            score -= 25;
            tips.push('Avoid common password patterns.');
        }
        score = Math.max(0, Math.min(100, score));
        const level = score >= 85 ? 'Very Strong' : score >= 65 ? 'Strong' : score >= 45 ? 'Medium' : 'Weak';
        const entropy = entropyBits(password);
        const combinations = 2 ** entropy;
        const averageCrackSeconds = combinations / Math.max(1, guessesPerSecond) / 2;
        const onlineCrackSeconds = combinations / 100 / 2;
        return { score, level, tips, entropy, averageCrackSeconds, onlineCrackSeconds };
    }, [guessesPerSecond, password]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <label className="text-sm">
                    <SectionLabel>Password</SectionLabel>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter password to evaluate" />
                </label>
                <label className="text-sm">
                    <SectionLabel>Offline guesses/sec assumption</SectionLabel>
                    <input type="number" min={1000} max={1e13} step={1000} value={guessesPerSecond} onChange={(e) => setGuessesPerSecond(Number(e.target.value))} className={inputClass} />
                </label>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-2 rounded-full ${analysis.score >= 65 ? 'bg-emerald-500' : analysis.score >= 45 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} />
                </div>
                <p className="text-sm font-semibold">Strength: {analysis.level} ({analysis.score}/100)</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                    <p>Entropy: {analysis.entropy.toFixed(1)} bits</p>
                    <p>Estimated crack time (offline): {humanDuration(analysis.averageCrackSeconds)}</p>
                    <p>Estimated crack time (online, 100 guesses/s): {humanDuration(analysis.onlineCrackSeconds)}</p>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {analysis.tips.map((tip) => <li key={tip}>- {tip}</li>)}
                </ul>
            </div>
        </ToolCard>
    );
}

export function HashGeneratorTool() {
    const [input, setInput] = useState('Wayan Tisna');
    const [batchMode, setBatchMode] = useState(false);
    const [includeSha1, setIncludeSha1] = useState(true);
    const [includeSha512, setIncludeSha512] = useState(true);
    const [useHmacSha256, setUseHmacSha256] = useState(false);
    const [hmacSecret, setHmacSecret] = useState('');
    const [output, setOutput] = useState('');

    const genHashes = async () => {
        const rows = batchMode
            ? input
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean)
            : [input];
        const result: Array<Record<string, string>> = [];

        for (const row of rows) {
            const item: Record<string, string> = {
                input: row,
                md5: md5(row),
                sha256: await digestText('SHA-256', row),
            };
            if (includeSha1) item.sha1 = await digestText('SHA-1', row);
            if (includeSha512) item.sha512 = await digestText('SHA-512', row);
            if (useHmacSha256 && hmacSecret.trim()) {
                const key = await crypto.subtle.importKey(
                    'raw',
                    new TextEncoder().encode(hmacSecret.trim()),
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign'],
                );
                const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(row));
                item.hmacSha256 = bytesToHex(signature);
            }
            result.push(item);
        }

        setOutput(JSON.stringify(result, null, 2));
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={!batchMode ? 'default' : 'outline'} onClick={() => setBatchMode(false)}>
                        Single
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={batchMode ? 'default' : 'outline'} onClick={() => setBatchMode(true)}>
                        Batch
                    </Button>
                </div>
                <label className="text-sm">
                    <SectionLabel>{batchMode ? 'Batch Input' : 'Input Text'}</SectionLabel>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={`${textAreaClass} h-24`}
                        placeholder={batchMode ? 'One value per line' : 'Text to hash'}
                    />
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                    <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1.5 dark:border-slate-700">
                        <input type="checkbox" checked={includeSha1} onChange={(e) => setIncludeSha1(e.target.checked)} className="h-3.5 w-3.5" />
                        SHA-1
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1.5 dark:border-slate-700">
                        <input type="checkbox" checked={includeSha512} onChange={(e) => setIncludeSha512(e.target.checked)} className="h-3.5 w-3.5" />
                        SHA-512
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1.5 dark:border-slate-700">
                        <input type="checkbox" checked={useHmacSha256} onChange={(e) => setUseHmacSha256(e.target.checked)} className="h-3.5 w-3.5" />
                        HMAC-SHA256
                    </label>
                </div>
                {useHmacSha256 ? (
                    <label className="text-sm">
                        <SectionLabel>HMAC Secret Key</SectionLabel>
                        <input value={hmacSecret} onChange={(e) => setHmacSecret(e.target.value)} className={inputClass} placeholder="HMAC secret key" />
                    </label>
                ) : null}
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={genHashes}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Generate Hashes
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setInput('')}>
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                </div>
                <div className="space-y-2 text-xs">
                    <SectionLabel>Hash Output</SectionLabel>
                    <pre className="max-h-72 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">{output || 'Click "Generate Hashes" to produce output.'}</pre>
                    {output ? <CopyButton value={output} className={compactButtonClass} /> : null}
                </div>
            </div>
        </ToolCard>
    );
}
