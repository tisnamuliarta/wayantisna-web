'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, formatHtml, formatSql, formatXml } from './shared';
import { useMemo, useState } from 'react';

type ValidationLevel = 'idle' | 'valid' | 'warning' | 'error';

interface ValidationReport {
    level: ValidationLevel;
    title: string;
    details: string[];
}

const reportTone: Record<ValidationLevel, string> = {
    idle: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    valid: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200',
};

function textMetrics(value: string) {
    return {
        chars: value.length,
        lines: value === '' ? 0 : value.split('\n').length,
        bytes: new TextEncoder().encode(value).length,
    };
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function minifyText(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

function sortJsonRecursively(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => sortJsonRecursively(item));
    }
    if (value !== null && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
        return Object.fromEntries(entries.map(([key, nested]) => [key, sortJsonRecursively(nested)]));
    }
    return value;
}

function extractJsonErrorDetail(source: string, message: string) {
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (!positionMatch) return message;
    const position = Number(positionMatch[1]);
    const safePosition = Number.isNaN(position) ? 0 : Math.min(Math.max(position, 0), source.length);
    const chunk = source.slice(0, safePosition);
    const line = chunk.split('\n').length;
    const col = chunk.length - (chunk.lastIndexOf('\n') + 1) + 1;
    return `At line ${line}, column ${col}: ${message}`;
}

function validateHtmlStructure(source: string): ValidationReport {
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const stack: string[] = [];
    const mismatches: string[] = [];

    const tagRegex = /<\/?([a-zA-Z0-9-]+)(\s[^>]*)?>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(source)) !== null) {
        const full = match[0];
        const tag = match[1].toLowerCase();
        const isClose = full.startsWith('</');
        const selfClose = full.endsWith('/>');
        if (voidTags.has(tag) || selfClose) continue;

        if (!isClose) {
            stack.push(tag);
            continue;
        }

        const top = stack[stack.length - 1];
        if (top === tag) {
            stack.pop();
            continue;
        }
        mismatches.push(`Unexpected closing tag </${tag}>.`);
    }

    if (stack.length > 0) {
        mismatches.push(`Unclosed tags: ${stack.slice(-4).map((tag) => `<${tag}>`).join(', ')}`);
    }

    if (mismatches.length > 0) {
        return {
            level: 'warning',
            title: 'Formatting completed with structural warnings',
            details: mismatches,
        };
    }

    return {
        level: 'valid',
        title: 'HTML structure looks consistent',
        details: ['No obvious tag mismatch detected.'],
    };
}

const sqlKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'ORDER BY',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'JOIN',
    'AND',
    'OR',
    'INSERT',
    'UPDATE',
    'DELETE',
    'VALUES',
    'SET',
    'LIMIT',
];

function toLowerSqlKeywords(source: string) {
    let output = source;
    for (const keyword of sqlKeywords) {
        const escaped = keyword.replace(' ', '\\s+');
        output = output.replace(new RegExp(`\\b${escaped}\\b`, 'g'), keyword.toLowerCase());
    }
    return output;
}

function analyzeSql(source: string): ValidationReport {
    const warnings: string[] = [];
    if (/\bselect\s+\*/i.test(source)) warnings.push('`SELECT *` found. Prefer explicit columns for predictable schema and lower payload.');
    if (/\bupdate\b/i.test(source) && !/\bwhere\b/i.test(source)) warnings.push('`UPDATE` without `WHERE` can modify all rows.');
    if (/\bdelete\s+from\b/i.test(source) && !/\bwhere\b/i.test(source)) warnings.push('`DELETE` without `WHERE` can remove all rows.');
    if ((source.match(/;/g) ?? []).length > 1) warnings.push('Multiple SQL statements detected. Validate batch execution safety.');
    if (/\bjoin\b/i.test(source) && !/\bon\b/i.test(source)) warnings.push('`JOIN` found without an `ON` clause. Check join condition.');

    if (warnings.length === 0) {
        return {
            level: 'valid',
            title: 'SQL looks clean for review',
            details: ['No high-risk pattern matched by quick checks.'],
        };
    }

    return {
        level: 'warning',
        title: 'Potential query risks found',
        details: warnings,
    };
}

function normalizeYaml(source: string) {
    return source
        .replace(/\t/g, '  ')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');
}

function validateYamlHeuristics(source: string): ValidationReport {
    const details: string[] = [];
    const lines = source.split('\n');

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        if (/\t/.test(line)) details.push(`Line ${lineNumber}: tab indentation detected, use spaces only.`);
        const indent = line.match(/^\s*/)?.[0].length ?? 0;
        if (indent % 2 !== 0) details.push(`Line ${lineNumber}: odd indentation (${indent} spaces), consider 2-space steps.`);
        if (/^\s*[^#\-\s][^:]*$/.test(line) && line.trim() !== '') {
            details.push(`Line ${lineNumber}: key-value separator ":" may be missing.`);
        }
    });

    if (details.length === 0) {
        return {
            level: 'valid',
            title: 'YAML indentation and key patterns look fine',
            details: ['No obvious YAML indentation issues detected.'],
        };
    }

    return {
        level: 'warning',
        title: 'YAML heuristics found potential issues',
        details,
    };
}

function validateXmlContent(source: string): ValidationReport {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(source, 'application/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            return {
                level: 'error',
                title: 'Invalid XML syntax',
                details: [parseError.textContent?.trim() ?? 'Parser error detected.'],
            };
        }
        return {
            level: 'valid',
            title: 'XML is well-formed',
            details: ['Parser validation passed.'],
        };
    } catch {
        return {
            level: 'warning',
            title: 'XML parser unavailable in this environment',
            details: ['Formatting still works, but parser-level validation could not run.'],
        };
    }
}

function OutputPanel({ value, placeholder }: { value: string; placeholder: string }) {
    if (!value) {
        return <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{placeholder}</p>;
    }

    return (
        <div className="space-y-2">
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900">
                {value}
            </pre>
            <CopyButton value={value} />
        </div>
    );
}

function ValidationPanel({ report }: { report: ValidationReport }) {
    return (
        <div className={`rounded-xl border p-3 text-sm ${reportTone[report.level]}`}>
            <p className="font-semibold">{report.title}</p>
            <ul className="mt-2 space-y-1 text-xs">
                {report.details.map((detail) => (
                    <li key={detail}>- {detail}</li>
                ))}
            </ul>
        </div>
    );
}

function MetricsBar({ input, output }: { input: string; output: string }) {
    const inMetric = textMetrics(input);
    const outMetric = textMetrics(output);

    return (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:grid-cols-2">
            <p>
                Input: {inMetric.lines} lines, {inMetric.chars} chars, {formatBytes(inMetric.bytes)}
            </p>
            <p>
                Output: {outMetric.lines} lines, {outMetric.chars} chars, {formatBytes(outMetric.bytes)}
            </p>
        </div>
    );
}

export function JsonFormatterTool() {
    const sample = '{\n  "name": "Wayan",\n  "skills": ["Laravel", "Next.js"],\n  "experienceYears": 7,\n  "active": true\n}';
    const [input, setInput] = useState(sample);
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ValidationReport>({
        level: 'idle',
        title: 'Ready to validate',
        details: ['Format, minify, or sort keys to review payload quality.'],
    });

    const runJson = (mode: 'format' | 'minify' | 'sort') => {
        try {
            const parsed = JSON.parse(input);
            const data = mode === 'sort' ? sortJsonRecursively(parsed) : parsed;
            const next = mode === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, 2);
            setOutput(next);
            setReport({
                level: 'valid',
                title: `JSON ${mode === 'format' ? 'formatted' : mode === 'minify' ? 'minified' : 'sorted'} successfully`,
                details: [`Top-level type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`],
            });
        } catch (error) {
            setOutput('');
            setReport({
                level: 'error',
                title: 'Invalid JSON',
                details: [extractJsonErrorDetail(input, error instanceof Error ? error.message : 'Parsing failed')],
            });
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => runJson('format')}>Format</Button>
                    <Button variant="outline" onClick={() => runJson('minify')}>Minify</Button>
                    <Button variant="outline" onClick={() => runJson('sort')}>Sort Keys</Button>
                    <Button variant="outline" onClick={() => setInput(sample)}>Sample</Button>
                    <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Clear</Button>
                </div>

                <MetricsBar input={input} output={output} />
                <ValidationPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input JSON</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste JSON payload"
                            className="h-[420px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel>Output</SectionLabel>
                        <OutputPanel value={output} placeholder="Formatted JSON will appear here." />
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}

export function HtmlFormatterTool() {
    const sample = '<section><h1>Portfolio</h1><div><p>Hello from Wayan</p><button>Contact</button></div></section>';
    const [input, setInput] = useState(sample);
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ValidationReport>({
        level: 'idle',
        title: 'Ready to process HTML',
        details: ['Use format for readable structure or minify for production payload.'],
    });

    const onFormat = () => {
        const next = formatHtml(input);
        setOutput(next);
        setReport(validateHtmlStructure(next));
    };

    const onMinify = () => {
        const next = minifyText(input);
        setOutput(next);
        setReport({
            level: 'valid',
            title: 'HTML minified',
            details: ['Whitespace collapsed for compact transfer.'],
        });
    };

    const onValidateOnly = () => {
        setReport(validateHtmlStructure(input));
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={onFormat}>Format HTML</Button>
                    <Button variant="outline" onClick={onMinify}>Minify</Button>
                    <Button variant="outline" onClick={onValidateOnly}>Validate</Button>
                    <Button variant="outline" onClick={() => setInput(sample)}>Sample</Button>
                    <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Clear</Button>
                </div>

                <MetricsBar input={input} output={output} />
                <ValidationPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input HTML</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste HTML"
                            className="h-[420px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel>Output</SectionLabel>
                        <OutputPanel value={output} placeholder="Formatted or minified HTML will appear here." />
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}

export function SqlFormatterTool() {
    const sample = 'select u.id, u.name, r.name role_name from users u left join roles r on r.id = u.role_id where u.active = 1 order by u.created_at desc';
    const [input, setInput] = useState(sample);
    const [output, setOutput] = useState('');
    const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>('upper');
    const [report, setReport] = useState<ValidationReport>({
        level: 'idle',
        title: 'Ready to format SQL',
        details: ['Formatting and risk checks help reduce deployment mistakes.'],
    });

    const onFormat = () => {
        const formatted = formatSql(input);
        const next = keywordCase === 'lower' ? toLowerSqlKeywords(formatted) : formatted;
        setOutput(next);
        setReport(analyzeSql(next));
    };

    const onMinify = () => {
        const next = minifyText(input);
        setOutput(next);
        setReport({
            level: 'valid',
            title: 'SQL minified',
            details: ['Whitespace compacted while preserving query text.'],
        });
    };

    const onAnalyzeOnly = () => {
        setReport(analyzeSql(input));
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={onFormat}>Format SQL</Button>
                    <Button variant="outline" onClick={onMinify}>Minify</Button>
                    <Button variant="outline" onClick={onAnalyzeOnly}>Analyze Risks</Button>
                    <Button variant="outline" onClick={() => setInput(sample)}>Sample</Button>
                    <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Clear</Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <SectionLabel>Keyword Case</SectionLabel>
                    <Button size="sm" variant={keywordCase === 'upper' ? 'default' : 'outline'} onClick={() => setKeywordCase('upper')}>
                        UPPERCASE
                    </Button>
                    <Button size="sm" variant={keywordCase === 'lower' ? 'default' : 'outline'} onClick={() => setKeywordCase('lower')}>
                        lowercase
                    </Button>
                </div>

                <MetricsBar input={input} output={output} />
                <ValidationPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input SQL</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste SQL query"
                            className="h-[420px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel>Output</SectionLabel>
                        <OutputPanel value={output} placeholder="Formatted SQL will appear here." />
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}

export function XmlYamlFormatterTool() {
    const xmlSample = '<root><service name="api"><status>ok</status></service></root>';
    const yamlSample = 'service:\n  name: portfolio-api\n  env: production\n  replicas: 3';
    const [mode, setMode] = useState<'xml' | 'yaml'>('xml');
    const [input, setInput] = useState(xmlSample);
    const [output, setOutput] = useState('');
    const [report, setReport] = useState<ValidationReport>({
        level: 'idle',
        title: 'Ready to process XML/YAML',
        details: ['Switch mode, then run format or validate checks.'],
    });

    const onFormat = () => {
        if (mode === 'xml') {
            const next = formatXml(input);
            setOutput(next);
            setReport(validateXmlContent(next));
            return;
        }

        const next = normalizeYaml(input);
        setOutput(next);
        setReport(validateYamlHeuristics(next));
    };

    const onValidateOnly = () => {
        setReport(mode === 'xml' ? validateXmlContent(input) : validateYamlHeuristics(input));
    };

    const onSample = () => {
        const next = mode === 'xml' ? xmlSample : yamlSample;
        setInput(next);
        setOutput('');
    };

    const modeHelp = useMemo(
        () =>
            mode === 'xml'
                ? 'XML mode includes parser-level well-formed checks.'
                : 'YAML mode provides indentation and key structure heuristics.',
        [mode],
    );

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={mode === 'xml' ? 'default' : 'outline'} onClick={() => { setMode('xml'); setInput(xmlSample); setOutput(''); }}>
                        XML
                    </Button>
                    <Button size="sm" variant={mode === 'yaml' ? 'default' : 'outline'} onClick={() => { setMode('yaml'); setInput(yamlSample); setOutput(''); }}>
                        YAML
                    </Button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">{modeHelp}</p>

                <div className="flex flex-wrap gap-2">
                    <Button onClick={onFormat}>Format {mode.toUpperCase()}</Button>
                    <Button variant="outline" onClick={onValidateOnly}>Validate</Button>
                    <Button variant="outline" onClick={onSample}>Sample</Button>
                    <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Clear</Button>
                </div>

                <MetricsBar input={input} output={output} />
                <ValidationPanel report={report} />

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                        <SectionLabel>Input {mode.toUpperCase()}</SectionLabel>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Paste ${mode.toUpperCase()} payload`}
                            className="h-[420px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel>Output</SectionLabel>
                        <OutputPanel value={output} placeholder={`Formatted ${mode.toUpperCase()} will appear here.`} />
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}
