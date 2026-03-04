'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, base64Decode, base64Encode, decodeJwtPart, validateCronField } from './shared';
import { AlertTriangle, ArrowDownUp, CalendarClock, CheckCircle2, FileText, Link2, Search, Shield, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type ReportLevel = 'idle' | 'valid' | 'warning' | 'error';

interface ToolReport {
    level: ReportLevel;
    title: string;
    details: string[];
}

const reportTone: Record<ReportLevel, string> = {
    idle: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    valid: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200',
};

const compactButtonClass = 'h-8 rounded-lg px-3 text-xs';

function bytesCount(value: string) {
    return new TextEncoder().encode(value).length;
}

function formatBytes(value: number) {
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function base64ToUrlSafe(value: string) {
    return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function urlSafeToBase64(value: string) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    return normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
}

function normalizeSplitInput(value: string, separator: 'newline' | 'csv', preserveEmpty = false) {
    const rows =
        separator === 'newline'
            ? value.split(/\r?\n/)
            : value
                  .split(',')
                  .map((item) => item.trim());
    return preserveEmpty ? rows : rows.filter((item) => item.length > 0);
}

function extractDataUriPayload(value: string) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('data:')) return trimmed;
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex < 0) throw new Error('Invalid data URI: missing comma separator.');
    const meta = trimmed.slice(0, commaIndex);
    if (!/;base64$/i.test(meta)) throw new Error('Data URI is not base64 encoded.');
    return trimmed.slice(commaIndex + 1);
}

function replaceCronMacro(value: string) {
    const map: Record<string, string> = {
        '@yearly': '0 0 1 1 *',
        '@annually': '0 0 1 1 *',
        '@monthly': '0 0 1 * *',
        '@weekly': '0 0 * * 0',
        '@daily': '0 0 * * *',
        '@midnight': '0 0 * * *',
        '@hourly': '0 * * * *',
    };
    return map[value.toLowerCase()] ?? value;
}

function parsedUrlOrFallback(value: string) {
    try {
        return new URL(value).toString();
    } catch {
        return value;
    }
}

function reportIcon(level: ReportLevel) {
    if (level === 'valid') return <CheckCircle2 className="h-4 w-4 shrink-0" />;
    if (level === 'warning') return <AlertTriangle className="h-4 w-4 shrink-0" />;
    if (level === 'error') return <AlertTriangle className="h-4 w-4 shrink-0" />;
    return <Search className="h-4 w-4 shrink-0" />;
}

function ReportPanel({ report }: { report: ToolReport }) {
    return (
        <div className={`rounded-xl border p-3 text-sm ${reportTone[report.level]}`}>
            <div className="flex items-start gap-2">
                {reportIcon(report.level)}
                <div className="min-w-0">
                    <p className="font-semibold">{report.title}</p>
                    <ul className="mt-1 space-y-1 text-xs">
                        {report.details.map((detail) => (
                            <li key={detail}>- {detail}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function OutputBox({ title, value, placeholder }: { title: string; value: string; placeholder: string }) {
    return (
        <div className="space-y-2">
            <SectionLabel>{title}</SectionLabel>
            {value ? (
                <div className="space-y-2">
                    <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900">
                        {value}
                    </pre>
                    <CopyButton value={value} />
                </div>
            ) : (
                <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {placeholder}
                </p>
            )}
        </div>
    );
}

export function Base64Tool() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [variant, setVariant] = useState<'standard' | 'urlsafe'>('standard');
    const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');
    const [separator, setSeparator] = useState<'newline' | 'csv'>('newline');
    const [preserveEmptyRows, setPreserveEmptyRows] = useState(false);
    const [decodeDataUri, setDecodeDataUri] = useState(false);
    const [input, setInput] = useState('Authorization: Bearer my-secret-token');
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'Ready to process Base64',
        details: ['Choose mode, variant, and input style, then run conversion.'],
    });

    const run = () => {
        try {
            const rows = inputMode === 'batch' ? normalizeSplitInput(input, separator, preserveEmptyRows) : [input];
            const processed: string[] = [];
            const errors: string[] = [];

            rows.forEach((row, index) => {
                try {
                    if (mode === 'encode') {
                        const encoded = base64Encode(row);
                        processed.push(variant === 'urlsafe' ? base64ToUrlSafe(encoded) : encoded);
                        return;
                    }

                    const candidate = decodeDataUri ? extractDataUriPayload(row) : row;
                    const prepared = variant === 'urlsafe' ? urlSafeToBase64(candidate.trim()) : candidate.trim();
                    processed.push(base64Decode(prepared));
                } catch (error) {
                    errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Processing failed'}`);
                }
            });

            const joined = processed.join('\n');
            setOutput(joined);
            if (errors.length === 0) {
                setReport({
                    level: 'valid',
                    title: `${mode === 'encode' ? 'Encoded' : 'Decoded'} successfully`,
                    details: [
                        `Processed rows: ${processed.length}`,
                        `Input size: ${formatBytes(bytesCount(input))}`,
                        `Output size: ${formatBytes(bytesCount(joined))}`,
                    ],
                });
                return;
            }

            setReport({
                level: processed.length > 0 ? 'warning' : 'error',
                title: 'Conversion completed with issues',
                details: [`Successful rows: ${processed.length}`, `Failed rows: ${errors.length}`, ...errors.slice(0, 4)],
            });
        } catch (error) {
            setOutput('');
            setReport({
                level: 'error',
                title: 'Base64 processing failed',
                details: [error instanceof Error ? error.message : 'Invalid Base64 input'],
            });
        }
    };

    const onSwap = () => {
        setInput(output);
        setOutput(input);
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>
                        Encode
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>
                        Decode
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={variant === 'standard' ? 'default' : 'outline'} onClick={() => setVariant('standard')}>
                        Standard
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={variant === 'urlsafe' ? 'default' : 'outline'} onClick={() => setVariant('urlsafe')}>
                        URL-safe
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={inputMode === 'single' ? 'default' : 'outline'} onClick={() => setInputMode('single')}>
                        Single
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={inputMode === 'batch' ? 'default' : 'outline'} onClick={() => setInputMode('batch')}>
                        Batch
                    </Button>
                </div>

                {inputMode === 'batch' ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <label className="inline-flex items-center gap-1">
                            <input
                                type="radio"
                                checked={separator === 'newline'}
                                onChange={() => setSeparator('newline')}
                                className="h-3.5 w-3.5"
                            />
                            New line split
                        </label>
                        <label className="inline-flex items-center gap-1">
                            <input
                                type="radio"
                                checked={separator === 'csv'}
                                onChange={() => setSeparator('csv')}
                                className="h-3.5 w-3.5"
                            />
                            CSV split
                        </label>
                        <label className="inline-flex items-center gap-1">
                            <input
                                type="checkbox"
                                checked={preserveEmptyRows}
                                onChange={(event) => setPreserveEmptyRows(event.target.checked)}
                                className="h-3.5 w-3.5"
                            />
                            Keep empty rows
                        </label>
                    </div>
                ) : null}

                {mode === 'decode' ? (
                    <label className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={decodeDataUri}
                            onChange={(event) => setDecodeDataUri(event.target.checked)}
                            className="h-3.5 w-3.5"
                        />
                        Decode data URI (`data:*;base64,...`)
                    </label>
                ) : null}

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={run}>
                        <Shield className="h-3.5 w-3.5" />
                        Run
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={onSwap} disabled={!output}>
                        <ArrowDownUp className="h-3.5 w-3.5" />
                        Swap I/O
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setInput('hello world')}>
                        <FileText className="h-3.5 w-3.5" />
                        Sample Text
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setInput('aGVsbG8gd29ybGQ=')}>
                        <FileText className="h-3.5 w-3.5" />
                        Sample Base64
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setInput(''); setOutput(''); }}>
                        Clear
                    </Button>
                </div>

                <ReportPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="h-[280px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                            placeholder={
                                inputMode === 'batch'
                                    ? mode === 'encode'
                                        ? 'Paste multiple plain values (one per line or comma separated)'
                                        : 'Paste multiple Base64 values (one per line or comma separated)'
                                    : mode === 'encode'
                                      ? 'Paste plain text'
                                      : 'Paste Base64 string'
                            }
                        />
                    </div>
                    <OutputBox
                        title="Output"
                        value={output}
                        placeholder={mode === 'encode' ? 'Encoded Base64 output appears here.' : 'Decoded output appears here.'}
                    />
                </div>
            </div>
        </ToolCard>
    );
}

export function UrlTool() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [strategy, setStrategy] = useState<'component' | 'full-url' | 'form'>('component');
    const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');
    const [sortQueryKeys, setSortQueryKeys] = useState(false);
    const [decodePlusAsSpace, setDecodePlusAsSpace] = useState(true);
    const [input, setInput] = useState('https://wayantisna.com/blog?tag=rest api&topic=next.js');
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'Ready to process URL data',
        details: ['Choose encoding strategy and run conversion.'],
    });

    const run = () => {
        try {
            const rows = inputMode === 'batch' ? normalizeSplitInput(input, 'newline') : [input];
            const converted: string[] = [];
            const errors: string[] = [];

            rows.forEach((row, index) => {
                try {
                    let next = '';
                    if (mode === 'encode') {
                        if (strategy === 'component') next = encodeURIComponent(row);
                        if (strategy === 'full-url') {
                            const parsed = new URL(row);
                            if (sortQueryKeys) {
                                const sorted = new URLSearchParams(Array.from(parsed.searchParams.entries()).sort((a, b) => a[0].localeCompare(b[0])));
                                parsed.search = sorted.toString();
                            }
                            next = parsed.toString();
                        }
                        if (strategy === 'form') next = new URLSearchParams({ value: row }).toString().replace(/^value=/, '');
                    } else {
                        if (strategy === 'form') {
                            next = decodeURIComponent(decodePlusAsSpace ? row.replace(/\+/g, ' ') : row);
                        } else if (strategy === 'full-url') {
                            const decoded = decodeURI(row);
                            if (sortQueryKeys) {
                                const parsed = new URL(decoded);
                                const sorted = new URLSearchParams(Array.from(parsed.searchParams.entries()).sort((a, b) => a[0].localeCompare(b[0])));
                                parsed.search = sorted.toString();
                                next = parsed.toString();
                            } else {
                                next = parsedUrlOrFallback(decoded);
                            }
                        } else {
                            next = decodeURIComponent(row);
                        }
                    }
                    converted.push(next);
                } catch (error) {
                    errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'URL processing failed'}`);
                }
            });

            const joined = converted.join('\n');
            setOutput(joined);

            setReport({
                level: errors.length === 0 ? 'valid' : converted.length > 0 ? 'warning' : 'error',
                title: errors.length === 0 ? `${mode === 'encode' ? 'Encoded' : 'Decoded'} successfully` : 'URL conversion completed with issues',
                details: [
                    `Strategy: ${strategy}`,
                    `Processed rows: ${converted.length}`,
                    errors.length > 0 ? `Failed rows: ${errors.length}` : 'Failed rows: 0',
                    `Input size: ${formatBytes(bytesCount(input))}`,
                    `Output size: ${formatBytes(bytesCount(joined))}`,
                    ...errors.slice(0, 3),
                ],
            });
        } catch (error) {
            setOutput('');
            setReport({
                level: 'error',
                title: 'URL conversion failed',
                details: [error instanceof Error ? error.message : 'Malformed URL encoding sequence'],
            });
        }
    };

    const queryPreview = useMemo(() => {
        const candidate = mode === 'decode' ? output : input;
        if (!candidate.includes('?')) return [] as string[];
        try {
            const parsed = new URL(candidate);
            return Array.from(parsed.searchParams.entries()).map(([key, value]) => `${key} = ${value}`);
        } catch {
            return [];
        }
    }, [input, mode, output]);

    const urlDetails = useMemo(() => {
        const candidate = (mode === 'decode' ? output : input).split('\n')[0]?.trim();
        if (!candidate) return null;
        try {
            const parsed = new URL(candidate);
            return {
                origin: parsed.origin,
                host: parsed.host,
                pathname: parsed.pathname || '/',
                hash: parsed.hash || '(none)',
                params: Array.from(parsed.searchParams.keys()).length,
            };
        } catch {
            return null;
        }
    }, [input, mode, output]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>
                        Encode
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>
                        Decode
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={inputMode === 'single' ? 'default' : 'outline'} onClick={() => setInputMode('single')}>
                        Single
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={inputMode === 'batch' ? 'default' : 'outline'} onClick={() => setInputMode('batch')}>
                        Batch
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'component' ? 'default' : 'outline'} onClick={() => setStrategy('component')}>
                        URI Component
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'full-url' ? 'default' : 'outline'} onClick={() => setStrategy('full-url')}>
                        Full URL
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={strategy === 'form' ? 'default' : 'outline'} onClick={() => setStrategy('form')}>
                        Form Body
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                    <label className="inline-flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={sortQueryKeys}
                            onChange={(event) => setSortQueryKeys(event.target.checked)}
                            className="h-3.5 w-3.5"
                        />
                        Sort query params
                    </label>
                    {mode === 'decode' && strategy === 'form' ? (
                        <label className="inline-flex items-center gap-1">
                            <input
                                type="checkbox"
                                checked={decodePlusAsSpace}
                                onChange={(event) => setDecodePlusAsSpace(event.target.checked)}
                                className="h-3.5 w-3.5"
                            />
                            Convert `+` to space
                        </label>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={run}>
                        <Link2 className="h-3.5 w-3.5" />
                        Run
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setInput('https://wayantisna.com/blog?tag=rest api&topic=next.js')}>
                        <FileText className="h-3.5 w-3.5" />
                        URL Sample
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setInput('tag=rest+api&topic=next.js')}>
                        <FileText className="h-3.5 w-3.5" />
                        Form Sample
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setInput(''); setOutput(''); }}>
                        Clear
                    </Button>
                </div>

                <ReportPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="h-[260px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                            placeholder={
                                inputMode === 'batch'
                                    ? mode === 'encode'
                                        ? 'Paste one URL/value per line'
                                        : 'Paste one encoded value per line'
                                    : mode === 'encode'
                                      ? 'Paste raw URL string or query value'
                                      : 'Paste encoded URL value'
                            }
                        />
                    </div>
                    <OutputBox title="Output" value={output} placeholder="Processed output appears here." />
                </div>

                {urlDetails ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <p className="mb-1 font-semibold">URL Breakdown (first row)</p>
                        <ul className="space-y-1">
                            <li>- Origin: {urlDetails.origin}</li>
                            <li>- Host: {urlDetails.host}</li>
                            <li>- Path: {urlDetails.pathname}</li>
                            <li>- Hash: {urlDetails.hash}</li>
                            <li>- Query params: {urlDetails.params}</li>
                        </ul>
                    </div>
                ) : null}

                {queryPreview.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <p className="mb-1 font-semibold">Query Parameter Preview</p>
                        <ul className="space-y-1">
                            {queryPreview.map((item) => (
                                <li key={item}>- {item}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

export function JwtTool() {
    const sampleToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldheWFuIFRpc25hIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiZGV2ZWxvcGVyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const [mode, setMode] = useState<'decode' | 'generate'>('decode');
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [signature, setSignature] = useState('');
    const [headerInput, setHeaderInput] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    const [payloadInput, setPayloadInput] = useState('{\n  "sub": "1234567890",\n  "name": "Wayan Tisna",\n  "role": "developer",\n  "iat": 1710000000\n}');
    const [secret, setSecret] = useState('change-this-secret');
    const [verifySecret, setVerifySecret] = useState('');
    const [requiredClaimsText, setRequiredClaimsText] = useState('sub,exp,iat');
    const [clockSkewSeconds, setClockSkewSeconds] = useState(60);
    const [generatedToken, setGeneratedToken] = useState('');
    const [verificationReport, setVerificationReport] = useState<ToolReport | null>(null);
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'JWT toolkit ready',
        details: ['Decode, generate, and verify HS256 tokens with claim checks.'],
    });

    const toBase64Url = (input: string) => base64ToUrlSafe(base64Encode(input));

    const signHs256 = async (value: string, key: string) => {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign'],
        );
        const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
        const bytes = Array.from(new Uint8Array(signatureBuffer));
        const binary = bytes.map((byte) => String.fromCharCode(byte)).join('');
        return base64ToUrlSafe(btoa(binary));
    };

    const analyzeClaims = (payloadValue: Record<string, unknown>) => {
        const details: string[] = [];
        const nowEpoch = Math.floor(Date.now() / 1000);
        const requiredClaims = requiredClaimsText
            .split(',')
            .map((claim) => claim.trim())
            .filter(Boolean);

        requiredClaims.forEach((claim) => {
            if (!(claim in payloadValue)) {
                details.push(`Missing required claim "${claim}".`);
            }
        });

        if (typeof payloadValue.exp === 'number') {
            const expIso = new Date(payloadValue.exp * 1000).toISOString();
            const remaining = payloadValue.exp - nowEpoch;
            if (remaining < -clockSkewSeconds) {
                details.push(`Token expired at ${expIso}.`);
            } else {
                details.push(`Token expires at ${expIso} (${remaining}s remaining).`);
            }
        }

        if (typeof payloadValue.nbf === 'number') {
            const nbfIso = new Date(payloadValue.nbf * 1000).toISOString();
            if (payloadValue.nbf > nowEpoch + clockSkewSeconds) {
                details.push(`Token is not active until ${nbfIso}.`);
            } else {
                details.push(`Not before: ${nbfIso}.`);
            }
        }

        if (typeof payloadValue.iat === 'number') {
            const iatIso = new Date(payloadValue.iat * 1000).toISOString();
            details.push(`Issued at: ${iatIso}.`);
        }

        return details;
    };

    const decode = () => {
        try {
            const parts = token.trim().split('.');
            if (parts.length < 2 || parts.length > 3) {
                throw new Error('JWT must contain 2 or 3 dot-separated segments.');
            }

            const headerValue = decodeJwtPart(parts[0]);
            const payloadValue = decodeJwtPart(parts[1]);
            const signatureValue = parts[2] ?? '';

            const details: string[] = [];
            if (typeof headerValue.alg === 'string') details.push(`Algorithm: ${headerValue.alg}`);
            if (typeof payloadValue.sub === 'string') details.push(`Subject: ${payloadValue.sub}`);
            if (typeof payloadValue.iss === 'string') details.push(`Issuer: ${payloadValue.iss}`);
            if (typeof payloadValue.aud === 'string') details.push(`Audience: ${payloadValue.aud}`);
            details.push(...analyzeClaims(payloadValue));

            if (signatureValue.length > 0) {
                details.push(`Signature segment length: ${signatureValue.length} chars.`);
            }

            setHeader(JSON.stringify(headerValue, null, 2));
            setPayload(JSON.stringify(payloadValue, null, 2));
            setSignature(signatureValue);
            setGeneratedToken('');
            setVerificationReport(null);
            setReport({
                level: 'valid',
                title: 'JWT decoded successfully',
                details: details.length ? details : ['Header and payload decoded.'],
            });
        } catch (error) {
            setHeader('');
            setPayload('');
            setSignature('');
            setGeneratedToken('');
            setVerificationReport(null);
            setReport({
                level: 'error',
                title: 'JWT decode failed',
                details: [error instanceof Error ? error.message : 'Invalid JWT value'],
            });
        }
    };

    const verify = async () => {
        try {
            const parts = token.trim().split('.');
            if (parts.length !== 3) throw new Error('Verification requires a signed JWT with 3 segments.');
            if (!verifySecret.trim()) throw new Error('Verification secret is required.');

            const decodedHeader = decodeJwtPart(parts[0]) as Record<string, unknown>;
            const decodedPayload = decodeJwtPart(parts[1]) as Record<string, unknown>;
            const algorithm = String(decodedHeader.alg ?? '').toUpperCase();
            if (algorithm !== 'HS256') throw new Error(`Algorithm ${algorithm || '(none)'} is not supported by local verifier.`);

            const signingInput = `${parts[0]}.${parts[1]}`;
            const expectedSignature = await signHs256(signingInput, verifySecret.trim());
            const signatureMatch = expectedSignature === parts[2];
            const claimDetails = analyzeClaims(decodedPayload);
            const missingRequired = claimDetails.filter((detail) => detail.startsWith('Missing required claim'));
            const timeWarnings = claimDetails.filter((detail) => detail.includes('expired') || detail.includes('not active'));

            setVerificationReport({
                level: signatureMatch && missingRequired.length === 0 && timeWarnings.length === 0 ? 'valid' : signatureMatch ? 'warning' : 'error',
                title: signatureMatch ? 'Signature verification passed' : 'Signature verification failed',
                details: [
                    `Expected signature: ${expectedSignature.slice(0, 20)}...`,
                    `Provided signature: ${parts[2].slice(0, 20)}...`,
                    ...claimDetails.slice(0, 6),
                ],
            });
        } catch (error) {
            setVerificationReport({
                level: 'error',
                title: 'Verification failed',
                details: [error instanceof Error ? error.message : 'Unknown verification error'],
            });
        }
    };

    const generate = async () => {
        try {
            const parsedHeader = JSON.parse(headerInput) as Record<string, unknown>;
            const parsedPayload = JSON.parse(payloadInput) as Record<string, unknown>;
            const alg = String(parsedHeader.alg ?? 'none').toUpperCase();
            const headerSegment = toBase64Url(JSON.stringify(parsedHeader));
            const payloadSegment = toBase64Url(JSON.stringify(parsedPayload));
            const signingInput = `${headerSegment}.${payloadSegment}`;
            let signatureSegment = '';

            if (alg === 'HS256') {
                if (!secret.trim()) throw new Error('Secret is required for HS256.');
                signatureSegment = await signHs256(signingInput, secret.trim());
            } else if (alg !== 'NONE') {
                throw new Error('Only HS256 and NONE are supported in this generator.');
            }

            const generated = `${signingInput}.${signatureSegment}`;
            setGeneratedToken(generated);
            setToken(generated);
            setHeader(JSON.stringify(parsedHeader, null, 2));
            setPayload(JSON.stringify(parsedPayload, null, 2));
            setSignature(signatureSegment);
            setVerificationReport(null);
            setReport({
                level: alg === 'NONE' ? 'warning' : 'valid',
                title: 'JWT generated successfully',
                details: [
                    `Algorithm: ${alg}`,
                    `Token size: ${generated.length} chars`,
                    alg === 'NONE' ? 'Unsigned token generated for testing only.' : 'Signed with HS256.',
                ],
            });
        } catch (error) {
            setGeneratedToken('');
            setReport({
                level: 'error',
                title: 'JWT generation failed',
                details: [error instanceof Error ? error.message : 'Invalid generator input'],
            });
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>
                        Decode
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant={mode === 'generate' ? 'default' : 'outline'} onClick={() => setMode('generate')}>
                        Generate
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {mode === 'decode' ? (
                        <Button size="sm" className={compactButtonClass} onClick={decode}>
                            <Shield className="h-3.5 w-3.5" />
                            Decode JWT
                        </Button>
                    ) : (
                        <Button size="sm" className={compactButtonClass} onClick={generate}>
                            <Shield className="h-3.5 w-3.5" />
                            Generate JWT
                        </Button>
                    )}
                    {mode === 'decode' ? (
                        <Button size="sm" className={compactButtonClass} variant="outline" onClick={verify}>
                            <Shield className="h-3.5 w-3.5" />
                            Verify HS256
                        </Button>
                    ) : null}
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setToken(sampleToken)}>
                        <FileText className="h-3.5 w-3.5" />
                        Sample Token
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setToken(''); setHeader(''); setPayload(''); setSignature(''); setGeneratedToken(''); }}>
                        Clear
                    </Button>
                </div>

                <ReportPanel report={report} />

                {mode === 'decode' ? (
                    <div className="space-y-2">
                        <SectionLabel>JWT Input</SectionLabel>
                        <textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste JWT token here..."
                            className="h-32 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <label className="text-sm">
                                <SectionLabel>Required Claims</SectionLabel>
                                <input
                                    value={requiredClaimsText}
                                    onChange={(event) => setRequiredClaimsText(event.target.value)}
                                    placeholder="Required claims, comma separated (e.g. sub,exp,iat)"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                                />
                            </label>
                            <div className="grid gap-2">
                                <label className="text-sm">
                                    <SectionLabel>Verification Secret</SectionLabel>
                                    <input
                                        value={verifySecret}
                                        onChange={(event) => setVerifySecret(event.target.value)}
                                        placeholder="Verification secret"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                                    />
                                </label>
                                <label className="text-sm">
                                    <SectionLabel>Clock Skew (Seconds)</SectionLabel>
                                    <input
                                        type="number"
                                        min={0}
                                        max={600}
                                        value={clockSkewSeconds}
                                        onChange={(event) => setClockSkewSeconds(Number(event.target.value))}
                                        placeholder="Clock skew seconds"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm">
                                <SectionLabel>JWT Header JSON</SectionLabel>
                                <textarea
                                    value={headerInput}
                                    onChange={(e) => setHeaderInput(e.target.value)}
                                    placeholder="JWT Header JSON"
                                    className="h-36 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                                />
                            </label>
                            <label className="text-sm">
                                <SectionLabel>JWT Payload JSON</SectionLabel>
                                <textarea
                                    value={payloadInput}
                                    onChange={(e) => setPayloadInput(e.target.value)}
                                    placeholder="JWT Payload JSON"
                                    className="h-36 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                                />
                            </label>
                        </div>
                        <label className="text-sm">
                            <SectionLabel>Signing Secret (HS256)</SectionLabel>
                            <input
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="Signing secret (HS256)"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                            />
                        </label>
                        <OutputBox title="Generated Token" value={generatedToken} placeholder="Generated token appears here." />
                    </div>
                )}

                {verificationReport ? <ReportPanel report={verificationReport} /> : null}

                <div className="grid gap-4 xl:grid-cols-3">
                    <OutputBox title="Header" value={header} placeholder="Decoded header appears here." />
                    <OutputBox title="Payload" value={payload} placeholder="Decoded payload appears here." />
                    <OutputBox title="Signature (raw)" value={signature} placeholder="Raw signature segment appears here." />
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-200">
                    <p className="flex items-center gap-1 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Security Note
                    </p>
                    <p className="mt-1">JWT decoding here is local-only and does not verify signature integrity or trust chain.</p>
                </div>
            </div>
        </ToolCard>
    );
}

export function RegexTesterTool() {
    const [pattern, setPattern] = useState('\\b\\w{4}\\b');
    const [flags, setFlags] = useState('g');
    const [text, setText] = useState('This regex finds four word letters in this sentence.');
    const [replacement, setReplacement] = useState('[$&]');
    const [testCases, setTestCases] = useState('dev@wayantisna.com => true\ninvalid_mail => false');

    const applyPreset = (type: 'email' | 'api-log' | 'uuid') => {
        if (type === 'email') {
            setPattern('[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}');
            setFlags('gi');
            setText('Contact: dev@wayantisna.com and team@example.org');
            setReplacement('<redacted-email>');
            setTestCases('dev@wayantisna.com => true\nops@company.io => true\nmissing-at-sign => false');
            return;
        }
        if (type === 'api-log') {
            setPattern('status=(\\d{3})');
            setFlags('g');
            setText('GET /users status=200 latency=140ms\nPOST /login status=401 latency=90ms');
            setReplacement('status=<code:$1>');
            setTestCases('status=200 => true\nstatus=999 => true\nstatus=ok => false');
            return;
        }
        setPattern('[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}');
        setFlags('gi');
        setText('IDs: 2d931510-d99f-494a-8c67-87feb05e1594 and invalid-uuid');
        setReplacement('<uuid>');
        setTestCases('2d931510-d99f-494a-8c67-87feb05e1594 => true\ninvalid-uuid => false');
    };

    const result = useMemo(() => {
        try {
            const regex = new RegExp(pattern, flags);
            const matchRegex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
            const matches = Array.from(text.matchAll(matchRegex)).slice(0, 300).map((match) => ({
                value: match[0],
                index: match.index ?? 0,
                groups: match.slice(1).filter(Boolean),
                namedGroups: match.groups ? Object.entries(match.groups).map(([k, v]) => `${k}=${String(v)}`) : [],
            }));
            const compileCostScore = Math.max(1, Math.round((pattern.length + flags.length) / 2));
            const executeCostScore = Math.max(1, Math.round((text.length * Math.max(1, matches.length)) / 200));
            const replaced = text.replace(regex, replacement);
            const uniqueMatches = new Set(matches.map((item) => item.value)).size;
            const testResults = testCases
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const [candidate, expectedRaw] = line.split(/\s*=>\s*/);
                    const expected = String(expectedRaw ?? '').toLowerCase() === 'true';
                    const evaluatedRegex = new RegExp(pattern, flags.replaceAll('g', ''));
                    const pass = evaluatedRegex.test(candidate ?? '');
                    return {
                        candidate: candidate ?? '',
                        expected,
                        pass,
                        ok: pass === expected,
                    };
                });
            return {
                error: '',
                matches,
                replaced,
                uniqueMatches,
                compileCostScore,
                executeCostScore,
                testResults,
            };
        } catch (err) {
            return {
                error: err instanceof Error ? err.message : 'Invalid regex',
                matches: [] as Array<{ value: string; index: number; groups: string[]; namedGroups: string[] }>,
                replaced: '',
                uniqueMatches: 0,
                compileCostScore: 0,
                executeCostScore: 0,
                testResults: [] as Array<{ candidate: string; expected: boolean; pass: boolean; ok: boolean }>,
            };
        }
    }, [flags, pattern, replacement, testCases, text]);

    const summary: ToolReport = result.error
        ? {
              level: 'error',
              title: 'Regex parse error',
              details: [result.error],
          }
        : {
              level: 'valid',
              title: 'Regex compiled successfully',
              details: [
                  `Matches: ${result.matches.length}`,
                  `Unique values: ${result.uniqueMatches}`,
                  `Flags: ${flags || '(none)'}`,
                  `Compile complexity score: ${result.compileCostScore}`,
                  `Execution complexity score: ${result.executeCostScore}`,
              ],
          };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={() => applyPreset('email')}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Email Preset
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => applyPreset('api-log')}>
                        <Sparkles className="h-3.5 w-3.5" />
                        API Log Preset
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => applyPreset('uuid')}>
                        <Sparkles className="h-3.5 w-3.5" />
                        UUID Preset
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setText(''); setReplacement(''); }}>
                        Clear
                    </Button>
                </div>

                <ReportPanel report={summary} />

                <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                    <label className="text-sm">
                        <SectionLabel>Regex Pattern</SectionLabel>
                        <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Pattern (without / /)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Flags</SectionLabel>
                        <input value={flags} onChange={(e) => setFlags(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Flags" />
                    </label>
                </div>

                <label className="text-sm">
                    <SectionLabel>Replacement Pattern</SectionLabel>
                    <input value={replacement} onChange={(e) => setReplacement(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Replacement pattern (e.g. [$1])" />
                </label>

                <label className="text-sm">
                    <SectionLabel>Input Text</SectionLabel>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="text-sm">
                    <SectionLabel>Test Cases</SectionLabel>
                    <textarea
                        value={testCases}
                        onChange={(e) => setTestCases(e.target.value)}
                        className="h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                        placeholder="One test per line: input => true|false"
                    />
                </label>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Match Diagnostics</SectionLabel>
                        {result.error ? (
                            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">{result.error}</p>
                        ) : result.matches.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">No matches found for the current pattern.</p>
                        ) : (
                            <div className="max-h-64 space-y-2 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                                {result.matches.map((match, index) => (
                                    <div key={`${match.index}-${index}`} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                                        <p className="font-semibold">#{index + 1} at index {match.index}</p>
                                        <p className="mt-1 break-all text-slate-700 dark:text-slate-200">{match.value}</p>
                                        {match.groups.length > 0 ? <p className="mt-1 text-slate-500 dark:text-slate-400">Groups: {match.groups.join(', ')}</p> : null}
                                        {match.namedGroups.length > 0 ? <p className="mt-1 text-slate-500 dark:text-slate-400">Named: {match.namedGroups.join(', ')}</p> : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <SectionLabel>Replace Preview</SectionLabel>
                        {result.replaced ? (
                            <div className="space-y-2">
                                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                                    {result.replaced}
                                </pre>
                                <CopyButton value={result.replaced} />
                            </div>
                        ) : (
                            <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">Replacement output appears here.</p>
                        )}
                    </div>
                </div>

                {result.testResults.length > 0 ? (
                    <div className="space-y-2">
                        <SectionLabel>Assertion Runner</SectionLabel>
                        <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                            {result.testResults.map((item) => (
                                <p
                                    key={`${item.candidate}-${item.expected}`}
                                    className={item.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}
                                >
                                    {item.ok ? 'PASS' : 'FAIL'} - `{item.candidate}` expected {String(item.expected)} got {String(item.pass)}
                                </p>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

type CronFieldSpec = {
    label: string;
    key: 'minute' | 'hour' | 'day' | 'month' | 'weekday';
    min: number;
    max: number;
    description: string;
};

const cronSpecs: CronFieldSpec[] = [
    { label: 'Minute', key: 'minute', min: 0, max: 59, description: '0-59' },
    { label: 'Hour', key: 'hour', min: 0, max: 23, description: '0-23' },
    { label: 'Day of Month', key: 'day', min: 1, max: 31, description: '1-31' },
    { label: 'Month', key: 'month', min: 1, max: 12, description: '1-12' },
    { label: 'Day of Week', key: 'weekday', min: 0, max: 6, description: '0-6 (Sun-Sat)' },
];

function expandCronField(field: string, min: number, max: number) {
    const values = new Set<number>();
    const segments = field.split(',');

    const addRange = (start: number, end: number, step = 1) => {
        for (let value = start; value <= end; value += step) values.add(value);
    };

    for (const segment of segments) {
        if (segment === '*') {
            addRange(min, max);
            continue;
        }
        const stepMatch = segment.match(/^\*\/(\d+)$/);
        if (stepMatch) {
            const step = Number(stepMatch[1]);
            if (step <= 0) return null;
            addRange(min, max, step);
            continue;
        }
        const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
            const start = Number(rangeMatch[1]);
            const end = Number(rangeMatch[2]);
            if (start < min || end > max || start > end) return null;
            addRange(start, end);
            continue;
        }
        const single = Number(segment);
        if (Number.isNaN(single) || single < min || single > max) return null;
        values.add(single);
    }

    return values;
}

function matchesCronDate(date: Date, expanded: Array<Set<number>>, wildcards: boolean[]) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const weekday = date.getDay();

    if (!expanded[0].has(minute)) return false;
    if (!expanded[1].has(hour)) return false;
    if (!expanded[3].has(month)) return false;

    const dayMatches = expanded[2].has(day);
    const weekdayMatches = expanded[4].has(weekday);
    const dayWildcard = wildcards[2];
    const weekdayWildcard = wildcards[4];

    if (dayWildcard && weekdayWildcard) return true;
    if (dayWildcard) return weekdayMatches;
    if (weekdayWildcard) return dayMatches;
    return dayMatches || weekdayMatches;
}

export function CronTesterTool() {
    const [expression, setExpression] = useState('*/5 * * * *');
    const [previewCount, setPreviewCount] = useState(8);
    const [timezoneView, setTimezoneView] = useState<'local' | 'utc'>('local');

    const analysis = useMemo(() => {
        const resolvedExpression = replaceCronMacro(expression.trim());
        const parts = resolvedExpression.split(/\s+/);
        if (parts.length !== 5) {
            return {
                valid: false,
                normalized: resolvedExpression,
                report: {
                    level: 'error' as ReportLevel,
                    title: 'Invalid cron structure',
                    details: ['Cron must contain exactly 5 fields: minute hour day month weekday.'],
                },
                statuses: [] as Array<{ label: string; value: string; valid: boolean; description: string }>,
                nextRuns: [] as string[],
            };
        }

        const statuses = cronSpecs.map((spec, index) => ({
            label: spec.label,
            value: parts[index],
            valid: validateCronField(parts[index], spec.min, spec.max),
            description: spec.description,
        }));
        const invalid = statuses.filter((status) => !status.valid);
        if (invalid.length > 0) {
            return {
                valid: false,
                report: {
                    level: 'error' as ReportLevel,
                    title: 'Field validation failed',
                    details: invalid.map((item) => `${item.label} "${item.value}" is invalid (expected ${item.description}).`),
                },
                statuses,
                normalized: resolvedExpression,
                nextRuns: [] as string[],
            };
        }

        const expanded = cronSpecs.map((spec, index) => expandCronField(parts[index], spec.min, spec.max));
        if (expanded.some((item) => !item)) {
            return {
                valid: false,
                report: {
                    level: 'error' as ReportLevel,
                    title: 'Unable to expand cron fields',
                    details: ['Use supported syntax: "*", "*/n", "a-b", comma list, or a single value.'],
                },
                statuses,
                normalized: resolvedExpression,
                nextRuns: [] as string[],
            };
        }

        const casted = expanded as Array<Set<number>>;
        const wildcards = parts.map((value) => value === '*');
        const nextRuns: string[] = [];
        const cursor = new Date();
        cursor.setSeconds(0, 0);
        cursor.setMinutes(cursor.getMinutes() + 1);

        let guard = 0;
        while (nextRuns.length < Math.max(1, Math.min(previewCount, 20)) && guard < 525600) {
            if (matchesCronDate(cursor, casted, wildcards)) {
                nextRuns.push(
                    timezoneView === 'utc'
                        ? `${cursor.toISOString().replace('T', ' ').replace('.000Z', ' UTC')}`
                        : cursor.toLocaleString(),
                );
            }
            cursor.setMinutes(cursor.getMinutes() + 1);
            guard += 1;
        }

        return {
            valid: true,
            report: {
                level: 'valid' as ReportLevel,
                title: 'Cron expression is valid',
                details: [
                    `Normalized: ${resolvedExpression}`,
                    `Timezone preview: ${timezoneView === 'utc' ? 'UTC' : 'Local'}`,
                    `Minute slots selected: ${casted[0].size}/60`,
                    `Hour slots selected: ${casted[1].size}/24`,
                    `Next ${nextRuns.length} run(s) generated.`,
                ],
            },
            statuses,
            normalized: resolvedExpression,
            nextRuns,
        };
    }, [expression, previewCount, timezoneView]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={() => setExpression('*/5 * * * *')}>
                        <WandSparkles className="h-3.5 w-3.5" />
                        Every 5 minutes
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setExpression('0 * * * *')}>
                        <WandSparkles className="h-3.5 w-3.5" />
                        Hourly
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setExpression('0 9 * * 1-5')}>
                        <WandSparkles className="h-3.5 w-3.5" />
                        Weekday 9AM
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setExpression('0 0 1 * *')}>
                        <WandSparkles className="h-3.5 w-3.5" />
                        Monthly
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setExpression('@hourly')}>
                        <WandSparkles className="h-3.5 w-3.5" />
                        Macro @hourly
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_140px]">
                    <label className="text-sm">
                        <SectionLabel>Cron Expression</SectionLabel>
                        <input value={expression} onChange={(e) => setExpression(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="* * * * *" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Preview Count</SectionLabel>
                        <input type="number" min={1} max={20} value={previewCount} onChange={(e) => setPreviewCount(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Timezone</SectionLabel>
                        <select value={timezoneView} onChange={(e) => setTimezoneView(e.target.value as 'local' | 'utc')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="local">Local TZ</option>
                            <option value="utc">UTC</option>
                        </select>
                    </label>
                </div>

                <ReportPanel report={analysis.report} />

                {analysis.normalized !== expression.trim() ? (
                    <p className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-200">
                        Macro expanded to: {analysis.normalized}
                    </p>
                ) : null}

                {analysis.statuses.length > 0 ? (
                    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
                        {analysis.statuses.map((status) => (
                            <div key={status.label} className={`rounded-lg border px-2 py-1.5 ${status.valid ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200'}`}>
                                <p className="font-semibold">{status.label}</p>
                                <p>{status.value}</p>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="space-y-2">
                    <SectionLabel>Next Run Preview</SectionLabel>
                    {analysis.nextRuns.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">No schedule preview available for the current expression.</p>
                    ) : (
                        <div className="space-y-2">
                            <ul className="max-h-64 space-y-1 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                                {analysis.nextRuns.map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <CalendarClock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <CopyButton value={analysis.nextRuns.join('\n')} />
                        </div>
                    )}
                </div>
            </div>
        </ToolCard>
    );
}
