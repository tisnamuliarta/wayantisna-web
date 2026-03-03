'use client';

import { Button } from '@/components/ui/button';
import { ToolCard, formatHtml, formatSql, formatXml } from './shared';
import { useState } from 'react';

export function JsonFormatterTool() {
    const [input, setInput] = useState('{"name":"Wayan","skills":["Laravel","Next.js"]}');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const onFormat = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON');
            setOutput('');
        }
    };

    return (
        <ToolCard>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={onFormat}>Format & Validate JSON</Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}

export function HtmlFormatterTool() {
    const [input, setInput] = useState('<div><h1>Title</h1><p>Hello</p></div>');
    const [output, setOutput] = useState('');

    return (
        <ToolCard>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={() => setOutput(formatHtml(input))}>Format HTML</Button>
            </div>
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}

export function SqlFormatterTool() {
    const [input, setInput] = useState('select id,name from users where active = 1 order by created_at desc');
    const [output, setOutput] = useState('');

    return (
        <ToolCard>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={() => setOutput(formatSql(input))}>Format SQL</Button>
            </div>
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}

export function XmlYamlFormatterTool() {
    const [mode, setMode] = useState<'xml' | 'yaml'>('xml');
    const [input, setInput] = useState('<root><item>Hello</item></root>');
    const [output, setOutput] = useState('');

    const onFormat = () => {
        if (mode === 'xml') {
            setOutput(formatXml(input));
            return;
        }
        const yaml = input
            .split('\n')
            .map((line) => line.trimEnd().replace(/\t/g, '  '))
            .join('\n');
        setOutput(yaml);
    };

    return (
        <ToolCard>
            <div className="mb-3 flex gap-2">
                <Button onClick={() => setMode('xml')} variant={mode === 'xml' ? 'default' : 'outline'} size="sm">XML</Button>
                <Button onClick={() => setMode('yaml')} variant={mode === 'yaml' ? 'default' : 'outline'} size="sm">YAML</Button>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <div className="mt-3">
                <Button onClick={onFormat}>Format {mode.toUpperCase()}</Button>
            </div>
            {output && <pre className="mt-3 overflow-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">{output}</pre>}
        </ToolCard>
    );
}
