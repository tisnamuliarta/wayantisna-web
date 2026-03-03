'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, hexToRgb, rgbToCmyk, rgbToHex, rgbToHsl } from './shared';
import { useState } from 'react';

export function ColorPickerTool() {
    const [hex, setHex] = useState('#0EA5E9');
    const rgb = hexToRgb(hex);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
    const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null;

    return (
        <ToolCard>
            <SectionLabel>Pick a color</SectionLabel>
            <input type="color" value={rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : '#000000'} onChange={(e) => setHex(e.target.value.toUpperCase())} className="mb-4 h-12 w-24 rounded-lg border border-slate-300 bg-transparent" />
            <input value={hex} onChange={(e) => setHex(e.target.value)} className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            {rgb && hsl && cmyk ? (
                <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <p>HEX: {rgbToHex(rgb.r, rgb.g, rgb.b)}</p>
                    <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
                    <p>HSL: {hsl.h}, {hsl.s}%, {hsl.l}%</p>
                    <p>CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%</p>
                </div>
            ) : (
                <p className="text-sm text-red-600">Invalid HEX value.</p>
            )}
        </ToolCard>
    );
}

export function CssGradientTool() {
    const [start, setStart] = useState('#06B6D4');
    const [end, setEnd] = useState('#8B5CF6');
    const [angle, setAngle] = useState(135);
    const css = `background: linear-gradient(${angle}deg, ${start}, ${end});`;

    return (
        <ToolCard>
            <div className="grid gap-3 md:grid-cols-3">
                <label className="text-sm">
                    <SectionLabel>Start</SectionLabel>
                    <input type="color" value={start} onChange={(e) => setStart(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                </label>
                <label className="text-sm">
                    <SectionLabel>End</SectionLabel>
                    <input type="color" value={end} onChange={(e) => setEnd(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent" />
                </label>
                <label className="text-sm">
                    <SectionLabel>Angle</SectionLabel>
                    <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
            </div>
            <div className="mt-4 h-44 rounded-xl border border-slate-200" style={{ background: `linear-gradient(${angle}deg, ${start}, ${end})` }} />
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <code className="rounded bg-slate-100 px-2 py-1 text-sm dark:bg-slate-900">{css}</code>
                <CopyButton value={css} />
            </div>
        </ToolCard>
    );
}

export function CssLayoutGeneratorTool() {
    const [mode, setMode] = useState<'grid' | 'flex'>('grid');
    const [columns, setColumns] = useState(3);
    const [gap, setGap] = useState(12);
    const [direction, setDirection] = useState('row');
    const [justify, setJustify] = useState('center');
    const [align, setAlign] = useState('center');

    const css =
        mode === 'grid'
            ? `display: grid;\ngrid-template-columns: repeat(${columns}, minmax(0, 1fr));\ngap: ${gap}px;`
            : `display: flex;\nflex-direction: ${direction};\njustify-content: ${justify};\nalign-items: ${align};\ngap: ${gap}px;`;

    return (
        <ToolCard>
            <div className="mb-4 flex gap-2">
                <Button onClick={() => setMode('grid')} variant={mode === 'grid' ? 'default' : 'outline'} size="sm">Grid</Button>
                <Button onClick={() => setMode('flex')} variant={mode === 'flex' ? 'default' : 'outline'} size="sm">Flexbox</Button>
            </div>
            {mode === 'grid' ? (
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Columns</SectionLabel>
                        <input type="number" min={1} max={8} value={columns} onChange={(e) => setColumns(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Gap (px)</SectionLabel>
                        <input type="number" min={0} max={64} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                </div>
            ) : (
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Direction</SectionLabel>
                        <select value={direction} onChange={(e) => setDirection(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="row">row</option>
                            <option value="column">column</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Justify</SectionLabel>
                        <select value={justify} onChange={(e) => setJustify(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="flex-start">flex-start</option>
                            <option value="center">center</option>
                            <option value="space-between">space-between</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Align</SectionLabel>
                        <select value={align} onChange={(e) => setAlign(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="stretch">stretch</option>
                            <option value="center">center</option>
                            <option value="flex-start">flex-start</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Gap (px)</SectionLabel>
                        <input type="number" min={0} max={64} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    </label>
                </div>
            )}
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <div
                    style={
                        mode === 'grid'
                            ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${gap}px` }
                            : { display: 'flex', flexDirection: direction as 'row' | 'column', justifyContent: justify as 'flex-start' | 'center' | 'space-between', alignItems: align as 'stretch' | 'center' | 'flex-start', gap: `${gap}px` }
                    }
                >
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded bg-cyan-600 px-3 py-2 text-center text-xs text-white">Item {i + 1}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <pre className="rounded bg-slate-100 px-3 py-2 text-sm dark:bg-slate-900">{css}</pre>
                <CopyButton value={css} />
            </div>
        </ToolCard>
    );
}
