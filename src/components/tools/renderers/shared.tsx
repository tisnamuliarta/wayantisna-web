'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { useState } from 'react';

export function ToolCard({ children }: { children: React.ReactNode }) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">{children}</div>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{children}</p>;
}

export function CopyButton({ value, className }: { value: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Button type="button" variant="outline" size="sm" onClick={onCopy} className={cn(className)}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
        </Button>
    );
}

export function base64Encode(input: string) {
    return btoa(unescape(encodeURIComponent(input)));
}

export function base64Decode(input: string) {
    return decodeURIComponent(escape(atob(input)));
}

export function decodeJwtPart(part: string) {
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = base64Decode(padded);
    return JSON.parse(json);
}

export function formatHtml(html: string) {
    const tokens = html.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/g).filter(Boolean);
    let indent = 0;
    const lines: string[] = [];

    for (const token of tokens) {
        const trimmed = token.trim();
        if (!trimmed) continue;
        if (/^<\//.test(trimmed)) indent = Math.max(0, indent - 1);
        lines.push(`${'  '.repeat(indent)}${trimmed}`);
        if (/^<[^/!][^>]*[^/]>\s*$/.test(trimmed) && !/<(input|img|br|hr|meta|link)/i.test(trimmed)) indent += 1;
    }
    return lines.join('\n');
}

export function formatSql(sql: string) {
    const keywords = ['select', 'from', 'where', 'group by', 'order by', 'left join', 'right join', 'inner join', 'join', 'and', 'or', 'insert', 'update', 'delete', 'values', 'set', 'limit'];
    let output = sql.trim();
    for (const keyword of keywords) {
        const escaped = keyword.replace(' ', '\\s+');
        output = output.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), keyword.toUpperCase());
    }
    return output
        .replace(/\s+(FROM|WHERE|GROUP BY|ORDER BY|LIMIT|VALUES|SET)\b/g, '\n$1')
        .replace(/\s+(LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN)\b/g, '\n$1')
        .replace(/\s+(AND|OR)\b/g, '\n  $1');
}

export function formatXml(xml: string) {
    const cleaned = xml.replace(/>\s*</g, '><');
    const parts = cleaned.replace(/</g, '\n<').split('\n').filter(Boolean);
    let pad = 0;
    const lines: string[] = [];

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith('</')) pad = Math.max(0, pad - 1);
        lines.push(`${'  '.repeat(pad)}${trimmed}`);
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) pad += 1;
    }
    return lines.join('\n');
}

export function validateCronField(field: string, min: number, max: number) {
    if (field === '*') return true;
    if (/^\*\/\d+$/.test(field)) return true;
    const segments = field.split(',');
    return segments.every((segment) => {
        if (/^\d+$/.test(segment)) {
            const value = Number(segment);
            return value >= min && value <= max;
        }
        const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
        if (!rangeMatch) return false;
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        return start >= min && end <= max && start <= end;
    });
}

export function compareJson(left: unknown, right: unknown, path = ''): Array<{ path: string; left: unknown; right: unknown }> {
    if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
        return left === right ? [] : [{ path: path || 'root', left, right }];
    }

    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const keys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
    const diffs: Array<{ path: string; left: unknown; right: unknown }> = [];

    for (const key of keys) {
        const nextPath = path ? `${path}.${key}` : key;
        diffs.push(...compareJson(leftObj[key], rightObj[key], nextPath));
    }
    return diffs;
}

export function hexToRgb(hex: string) {
    const cleaned = hex.replace('#', '');
    const normalized = cleaned.length === 3 ? cleaned.split('').map((x) => x + x).join('') : cleaned;
    const value = Number.parseInt(normalized, 16);
    if (Number.isNaN(value)) return null;
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbToHex(r: number, g: number, b: number) {
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const diff = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

    if (diff !== 0) {
        if (max === rn) h = 60 * (((gn - bn) / diff) % 6);
        if (max === gn) h = 60 * ((bn - rn) / diff + 2);
        if (max === bn) h = 60 * ((rn - gn) / diff + 4);
    }

    return { h: Math.round((h + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToCmyk(r: number, g: number, b: number) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
        c: Math.round(((1 - rn - k) / (1 - k)) * 100),
        m: Math.round(((1 - gn - k) / (1 - k)) * 100),
        y: Math.round(((1 - bn - k) / (1 - k)) * 100),
        k: Math.round(k * 100),
    };
}
