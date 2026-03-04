'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, base64Decode, base64Encode, decodeJwtPart, validateCronField } from './shared';
import { AlertTriangle, ArrowDownUp, CheckCircle2, FileText, Link2, Search, Shield } from 'lucide-react';
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
    const [input, setInput] = useState('Authorization: Bearer my-secret-token');
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'Ready to process Base64',
        details: ['Choose mode and variant, then run conversion.'],
    });

    const run = () => {
        try {
            if (mode === 'encode') {
                const encoded = base64Encode(input);
                const finalValue = variant === 'urlsafe' ? base64ToUrlSafe(encoded) : encoded;
                setOutput(finalValue);
                setReport({
                    level: 'valid',
                    title: 'Encoded successfully',
                    details: [
                        `Input size: ${formatBytes(bytesCount(input))}`,
                        `Output size: ${formatBytes(bytesCount(finalValue))}`,
                    ],
                });
                return;
            }

            const prepared = variant === 'urlsafe' ? urlSafeToBase64(input.trim()) : input.trim();
            const decoded = base64Decode(prepared);
            setOutput(decoded);
            setReport({
                level: 'valid',
                title: 'Decoded successfully',
                details: [
                    `Input size: ${formatBytes(bytesCount(input))}`,
                    `Decoded size: ${formatBytes(bytesCount(decoded))}`,
                ],
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
                </div>

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
                            placeholder={mode === 'encode' ? 'Paste plain text' : 'Paste Base64 string'}
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
    const [input, setInput] = useState('https://wayantisna.com/blog?tag=rest api&topic=next.js');
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'Ready to process URL data',
        details: ['Choose encoding strategy and run conversion.'],
    });

    const run = () => {
        try {
            let next = '';
            if (mode === 'encode') {
                if (strategy === 'component') next = encodeURIComponent(input);
                if (strategy === 'full-url') next = encodeURI(input);
                if (strategy === 'form') next = new URLSearchParams({ value: input }).toString().replace(/^value=/, '');
            } else {
                if (strategy === 'form') {
                    next = decodeURIComponent(input.replace(/\+/g, ' '));
                } else {
                    next = decodeURIComponent(input);
                }
            }

            setOutput(next);
            setReport({
                level: 'valid',
                title: `${mode === 'encode' ? 'Encoded' : 'Decoded'} successfully`,
                details: [
                    `Strategy: ${strategy}`,
                    `Input size: ${formatBytes(bytesCount(input))}`,
                    `Output size: ${formatBytes(bytesCount(next))}`,
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
        if (!candidate.includes('?')) return [];
        try {
            const parsed = new URL(candidate);
            return Array.from(parsed.searchParams.entries()).map(([key, value]) => `${key} = ${value}`);
        } catch {
            return [];
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
                            placeholder={mode === 'encode' ? 'Paste raw URL string or query value' : 'Paste encoded URL value'}
                        />
                    </div>
                    <OutputBox title="Output" value={output} placeholder="Processed output appears here." />
                </div>

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
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [signature, setSignature] = useState('');
    const [report, setReport] = useState<ToolReport>({
        level: 'idle',
        title: 'Paste token and decode',
        details: ['This tool decodes JWT locally and does not validate signature cryptographically.'],
    });

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

            const nowEpoch = Math.floor(Date.now() / 1000);
            if (typeof payloadValue.exp === 'number') {
                const expIso = new Date(payloadValue.exp * 1000).toISOString();
                if (payloadValue.exp < nowEpoch) {
                    details.push(`Token expired at ${expIso}.`);
                } else {
                    details.push(`Token expires at ${expIso}.`);
                }
            }

            if (typeof payloadValue.nbf === 'number') {
                const nbfIso = new Date(payloadValue.nbf * 1000).toISOString();
                details.push(`Not before: ${nbfIso}.`);
            }

            if (typeof payloadValue.iat === 'number') {
                const iatIso = new Date(payloadValue.iat * 1000).toISOString();
                details.push(`Issued at: ${iatIso}.`);
            }

            if (signatureValue.length > 0) {
                details.push(`Signature segment length: ${signatureValue.length} chars.`);
            }

            setHeader(JSON.stringify(headerValue, null, 2));
            setPayload(JSON.stringify(payloadValue, null, 2));
            setSignature(signatureValue);
            setReport({
                level: 'valid',
                title: 'JWT decoded successfully',
                details: details.length ? details : ['Header and payload decoded.'],
            });
        } catch (error) {
            setHeader('');
            setPayload('');
            setSignature('');
            setReport({
                level: 'error',
                title: 'JWT decode failed',
                details: [error instanceof Error ? error.message : 'Invalid JWT value'],
            });
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={compactButtonClass} onClick={decode}>
                        <Shield className="h-3.5 w-3.5" />
                        Decode JWT
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => setToken(sampleToken)}>
                        <FileText className="h-3.5 w-3.5" />
                        Sample Token
                    </Button>
                    <Button size="sm" className={compactButtonClass} variant="outline" onClick={() => { setToken(''); setHeader(''); setPayload(''); setSignature(''); }}>
                        Clear
                    </Button>
                </div>

                <ReportPanel report={report} />

                <div className="space-y-2">
                    <SectionLabel>JWT Input</SectionLabel>
                    <textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste JWT token here..."
                        className="h-32 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                    />
                </div>

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
    const [text, setText] = useState('This regex finds four word letters.');

    const result = useMemo(() => {
        try {
            const regex = new RegExp(pattern, flags);
            return {
                error: '',
                matches: [...text.matchAll(regex)].map((match) => ({ value: match[0], index: match.index ?? 0 })),
            };
        } catch (err) {
            return {
                error: err instanceof Error ? err.message : 'Invalid regex',
                matches: [] as Array<{ value: string; index: number }>,
            };
        }
    }, [flags, pattern, text]);

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Pattern" />
                <input value={flags} onChange={(e) => setFlags(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Flags" />
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-3 h-36 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            {result.error ? <p className="mt-3 text-sm text-red-600">{result.error}</p> : <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{result.matches.length} match(es)</p>}
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
