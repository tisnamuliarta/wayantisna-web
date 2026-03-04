'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, rgbToCmyk, rgbToHex, rgbToHsl } from './shared';
import { useMemo, useState } from 'react';

type Rgba = { r: number; g: number; b: number; a: number };

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function parseHexToRgba(hex: string): Rgba | null {
    const raw = hex.trim().replace('#', '');
    if (![3, 4, 6, 8].includes(raw.length)) return null;
    const normalized = raw.length <= 4 ? raw.split('').map((c) => c + c).join('') : raw;
    if (!/^[\da-fA-F]+$/.test(normalized)) return null;
    const value = Number.parseInt(normalized, 16);

    if (normalized.length === 6) {
        return {
            r: (value >> 16) & 255,
            g: (value >> 8) & 255,
            b: value & 255,
            a: 1,
        };
    }

    return {
        r: (value >> 24) & 255,
        g: (value >> 16) & 255,
        b: (value >> 8) & 255,
        a: Number(((value & 255) / 255).toFixed(2)),
    };
}

function rgbaToHex(rgba: Rgba, withAlpha = false) {
    const base = rgbToHex(rgba.r, rgba.g, rgba.b).replace('#', '');
    if (!withAlpha) return `#${base}`;
    const alpha = Math.round(clamp(rgba.a, 0, 1) * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
    return `#${base}${alpha}`;
}

function hslToRgb(h: number, s: number, l: number) {
    const hn = clamp(h, 0, 360) / 360;
    const sn = clamp(s, 0, 100) / 100;
    const ln = clamp(l, 0, 100) / 100;

    if (sn === 0) {
        const gray = Math.round(ln * 255);
        return { r: gray, g: gray, b: gray };
    }

    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;

    const hueToChannel = (t: number) => {
        let n = t;
        if (n < 0) n += 1;
        if (n > 1) n -= 1;
        if (n < 1 / 6) return p + (q - p) * 6 * n;
        if (n < 1 / 2) return q;
        if (n < 2 / 3) return p + (q - p) * (2 / 3 - n) * 6;
        return p;
    };

    return {
        r: Math.round(hueToChannel(hn + 1 / 3) * 255),
        g: Math.round(hueToChannel(hn) * 255),
        b: Math.round(hueToChannel(hn - 1 / 3) * 255),
    };
}

function cmykToRgb(c: number, m: number, y: number, k: number) {
    const cn = clamp(c, 0, 100) / 100;
    const mn = clamp(m, 0, 100) / 100;
    const yn = clamp(y, 0, 100) / 100;
    const kn = clamp(k, 0, 100) / 100;

    return {
        r: Math.round(255 * (1 - cn) * (1 - kn)),
        g: Math.round(255 * (1 - mn) * (1 - kn)),
        b: Math.round(255 * (1 - yn) * (1 - kn)),
    };
}

function luminance({ r, g, b }: Pick<Rgba, 'r' | 'g' | 'b'>) {
    const transform = (v: number) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function contrastRatio(a: Pick<Rgba, 'r' | 'g' | 'b'>, b: Pick<Rgba, 'r' | 'g' | 'b'>) {
    const la = luminance(a);
    const lb = luminance(b);
    const high = Math.max(la, lb);
    const low = Math.min(la, lb);
    return (high + 0.05) / (low + 0.05);
}

function mixColors(source: Pick<Rgba, 'r' | 'g' | 'b'>, target: Pick<Rgba, 'r' | 'g' | 'b'>, amount: number) {
    return {
        r: Math.round(source.r + (target.r - source.r) * amount),
        g: Math.round(source.g + (target.g - source.g) * amount),
        b: Math.round(source.b + (target.b - source.b) * amount),
    };
}

export function ColorPickerTool() {
    const [color, setColor] = useState<Rgba>({ r: 14, g: 165, b: 233, a: 1 });
    const [hexInput, setHexInput] = useState('#0EA5E9');
    const [hexError, setHexError] = useState('');
    const hsl = useMemo(() => rgbToHsl(color.r, color.g, color.b), [color.b, color.g, color.r]);
    const cmyk = useMemo(() => rgbToCmyk(color.r, color.g, color.b), [color.b, color.g, color.r]);

    const withAlphaHex = useMemo(() => rgbaToHex(color, true), [color]);
    const plainHex = useMemo(() => rgbaToHex(color, false), [color]);
    const rgbText = `rgb(${color.r}, ${color.g}, ${color.b})`;
    const rgbaText = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
    const hslText = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const hslaText = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${color.a.toFixed(2)})`;
    const cmykText = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    const whiteContrast = contrastRatio(color, { r: 255, g: 255, b: 255 });
    const blackContrast = contrastRatio(color, { r: 0, g: 0, b: 0 });
    const recommendedText = whiteContrast >= blackContrast ? '#FFFFFF' : '#000000';

    const scales = useMemo(() => {
        const white = { r: 255, g: 255, b: 255 };
        const black = { r: 0, g: 0, b: 0 };
        return [
            { label: '50', rgb: mixColors(color, white, 0.92) },
            { label: '100', rgb: mixColors(color, white, 0.82) },
            { label: '200', rgb: mixColors(color, white, 0.65) },
            { label: '300', rgb: mixColors(color, white, 0.45) },
            { label: '400', rgb: mixColors(color, white, 0.2) },
            { label: '500', rgb: { r: color.r, g: color.g, b: color.b } },
            { label: '600', rgb: mixColors(color, black, 0.15) },
            { label: '700', rgb: mixColors(color, black, 0.3) },
            { label: '800', rgb: mixColors(color, black, 0.45) },
            { label: '900', rgb: mixColors(color, black, 0.62) },
        ].map((item) => ({ ...item, hex: rgbToHex(item.rgb.r, item.rgb.g, item.rgb.b) }));
    }, [color]);

    const harmony = useMemo(() => {
        const shifts = [
            { label: 'Analogous -30', delta: -30 },
            { label: 'Complementary', delta: 180 },
            { label: 'Analogous +30', delta: 30 },
            { label: 'Triadic +120', delta: 120 },
            { label: 'Triadic -120', delta: -120 },
        ];

        return shifts.map((item) => {
            const hue = (hsl.h + item.delta + 360) % 360;
            const rgb = hslToRgb(hue, hsl.s, hsl.l);
            return { label: item.label, hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb };
        });
    }, [hsl.h, hsl.l, hsl.s]);

    const updateRgbChannel = (channel: 'r' | 'g' | 'b', value: number) => {
        const next = { ...color, [channel]: clamp(value, 0, 255) };
        setColor(next);
        setHexInput(rgbaToHex(next));
    };

    const updateHslChannel = (channel: 'h' | 's' | 'l', value: number) => {
        const nextHsl = { ...hsl, [channel]: channel === 'h' ? clamp(value, 0, 360) : clamp(value, 0, 100) };
        const nextRgb = hslToRgb(nextHsl.h, nextHsl.s, nextHsl.l);
        const next = { ...color, ...nextRgb };
        setColor(next);
        setHexInput(rgbaToHex(next));
    };

    const updateCmykChannel = (channel: 'c' | 'm' | 'y' | 'k', value: number) => {
        const nextCmyk = { ...cmyk, [channel]: clamp(value, 0, 100) };
        const nextRgb = cmykToRgb(nextCmyk.c, nextCmyk.m, nextCmyk.y, nextCmyk.k);
        const next = { ...color, ...nextRgb };
        setColor(next);
        setHexInput(rgbaToHex(next));
    };

    const applyHexInput = (value: string) => {
        setHexInput(value);
        const parsed = parseHexToRgba(value);
        if (!parsed) {
            setHexError('Invalid HEX format. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.');
            return;
        }
        setHexError('');
        setColor(parsed);
    };

    const wcagLabel = (ratio: number) => {
        if (ratio >= 7) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        if (ratio >= 3) return 'AA Large';
        return 'Fail';
    };

    return (
        <ToolCard>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <SectionLabel>Color Controls</SectionLabel>

                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <div
                            className="h-28 rounded-lg border border-slate-200 dark:border-slate-700"
                            style={{
                                backgroundImage:
                                    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                            }}
                        >
                            <div className="h-full w-full rounded-lg" style={{ backgroundColor: rgbaText }} />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm">
                            <SectionLabel>Native Picker</SectionLabel>
                            <input
                                type="color"
                                value={plainHex}
                                onChange={(e) => applyHexInput(e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-300 bg-transparent"
                            />
                        </label>
                        <label className="text-sm">
                            <SectionLabel>HEX / HEXA</SectionLabel>
                            <input
                                value={hexInput}
                                onChange={(e) => applyHexInput(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                            />
                        </label>
                    </div>
                    {hexError && <p className="text-xs text-red-600">{hexError}</p>}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm">
                            <SectionLabel>Alpha ({Math.round(color.a * 100)}%)</SectionLabel>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={Math.round(color.a * 100)}
                                onChange={(e) => setColor((prev) => ({ ...prev, a: clamp(Number(e.target.value), 0, 100) / 100 }))}
                                className="w-full accent-cyan-700"
                            />
                        </label>
                        <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                            Recommended text color: <strong>{recommendedText}</strong>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="space-y-2">
                            <SectionLabel>RGB</SectionLabel>
                            <input type="number" min={0} max={255} value={color.r} onChange={(e) => updateRgbChannel('r', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={255} value={color.g} onChange={(e) => updateRgbChannel('g', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={255} value={color.b} onChange={(e) => updateRgbChannel('b', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2">
                            <SectionLabel>HSL</SectionLabel>
                            <input type="number" min={0} max={360} value={hsl.h} onChange={(e) => updateHslChannel('h', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={100} value={hsl.s} onChange={(e) => updateHslChannel('s', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={100} value={hsl.l} onChange={(e) => updateHslChannel('l', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2">
                            <SectionLabel>CMYK</SectionLabel>
                            <input type="number" min={0} max={100} value={cmyk.c} onChange={(e) => updateCmykChannel('c', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={100} value={cmyk.m} onChange={(e) => updateCmykChannel('m', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={100} value={cmyk.y} onChange={(e) => updateCmykChannel('y', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                            <input type="number" min={0} max={100} value={cmyk.k} onChange={(e) => updateCmykChannel('k', Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <SectionLabel>Production Outputs</SectionLabel>
                    <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                        <div className="flex items-center justify-between gap-2">
                            <code>{plainHex}</code>
                            <CopyButton value={plainHex} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{withAlphaHex}</code>
                            <CopyButton value={withAlphaHex} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{rgbText}</code>
                            <CopyButton value={rgbText} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{rgbaText}</code>
                            <CopyButton value={rgbaText} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{hslText}</code>
                            <CopyButton value={hslText} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{hslaText}</code>
                            <CopyButton value={hslaText} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code>{cmykText}</code>
                            <CopyButton value={cmykText} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                        <p className="mb-2 font-medium">WCAG Contrast</p>
                        <p>Against White: {whiteContrast.toFixed(2)} ({wcagLabel(whiteContrast)})</p>
                        <p>Against Black: {blackContrast.toFixed(2)} ({wcagLabel(blackContrast)})</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <p className="mb-2 text-sm font-medium">Scale (50-900)</p>
                        <div className="grid grid-cols-5 gap-2">
                            {scales.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => applyHexInput(item.hex)}
                                    className="rounded-md border border-slate-200 p-1 text-[11px] dark:border-slate-700"
                                    title={`${item.label} ${item.hex}`}
                                >
                                    <div className="mb-1 h-7 rounded" style={{ backgroundColor: item.hex }} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <p className="mb-2 text-sm font-medium">Color Harmony</p>
                        <div className="space-y-2">
                            {harmony.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => applyHexInput(item.hex)}
                                    className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-left text-xs dark:border-slate-700"
                                >
                                    <span className="inline-block h-5 w-5 rounded" style={{ backgroundColor: item.hex }} />
                                    <span className="flex-1">{item.label}</span>
                                    <span>{item.hex}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
}

export function CssGradientTool() {
    type GradientStop = { id: number; color: string; position: number; alpha: number };
    type GradientType = 'linear' | 'radial' | 'conic';
    type RadialShape = 'ellipse' | 'circle';
    type RadialSize = 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner';

    const [gradientType, setGradientType] = useState<GradientType>('linear');
    const [repeating, setRepeating] = useState(false);
    const [angle, setAngle] = useState(135);
    const [positionX, setPositionX] = useState(50);
    const [positionY, setPositionY] = useState(50);
    const [radialShape, setRadialShape] = useState<RadialShape>('ellipse');
    const [radialSize, setRadialSize] = useState<RadialSize>('farthest-corner');
    const [stops, setStops] = useState<GradientStop[]>([
        { id: 1, color: '#06B6D4', position: 0, alpha: 100 },
        { id: 2, color: '#3B82F6', position: 45, alpha: 100 },
        { id: 3, color: '#8B5CF6', position: 100, alpha: 100 },
    ]);

    const presets: Array<{
        label: string;
        type: GradientType;
        repeating: boolean;
        angle: number;
        positionX: number;
        positionY: number;
        radialShape: RadialShape;
        radialSize: RadialSize;
        stops: GradientStop[];
    }> = [
        {
            label: 'Ocean Depth',
            type: 'linear',
            repeating: false,
            angle: 135,
            positionX: 50,
            positionY: 50,
            radialShape: 'ellipse',
            radialSize: 'farthest-corner',
            stops: [
                { id: 11, color: '#0EA5E9', position: 0, alpha: 100 },
                { id: 12, color: '#2563EB', position: 55, alpha: 100 },
                { id: 13, color: '#7C3AED', position: 100, alpha: 100 },
            ],
        },
        {
            label: 'Hero Warm Glow',
            type: 'radial',
            repeating: false,
            angle: 160,
            positionX: 35,
            positionY: 30,
            radialShape: 'circle',
            radialSize: 'farthest-corner',
            stops: [
                { id: 21, color: '#FDBA74', position: 0, alpha: 95 },
                { id: 22, color: '#FB7185', position: 50, alpha: 90 },
                { id: 23, color: '#7C3AED', position: 100, alpha: 92 },
            ],
        },
        {
            label: 'Conic Brand Ring',
            type: 'conic',
            repeating: false,
            angle: 90,
            positionX: 50,
            positionY: 50,
            radialShape: 'ellipse',
            radialSize: 'farthest-corner',
            stops: [
                { id: 31, color: '#06B6D4', position: 0, alpha: 100 },
                { id: 32, color: '#10B981', position: 33, alpha: 100 },
                { id: 33, color: '#F59E0B', position: 66, alpha: 100 },
                { id: 34, color: '#8B5CF6', position: 100, alpha: 100 },
            ],
        },
        {
            label: 'Mesh Repeat',
            type: 'linear',
            repeating: true,
            angle: 45,
            positionX: 50,
            positionY: 50,
            radialShape: 'ellipse',
            radialSize: 'farthest-corner',
            stops: [
                { id: 41, color: '#111827', position: 0, alpha: 100 },
                { id: 42, color: '#1D4ED8', position: 20, alpha: 80 },
                { id: 43, color: '#9333EA', position: 40, alpha: 70 },
                { id: 44, color: '#111827', position: 60, alpha: 100 },
                { id: 45, color: '#06B6D4', position: 80, alpha: 65 },
                { id: 46, color: '#111827', position: 100, alpha: 100 },
            ],
        },
    ];

    const nextStopId = useMemo(() => Math.max(0, ...stops.map((stop) => stop.id)) + 1, [stops]);

    const normalizedStops = useMemo(
        () =>
            [...stops]
                .sort((a, b) => a.position - b.position)
                .map((stop) => {
                    const parsed = parseHexToRgba(stop.color);
                    if (!parsed) return `#000000 ${clamp(stop.position, 0, 100)}%`;
                    const alpha = Number((clamp(stop.alpha, 0, 100) / 100).toFixed(2));
                    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha}) ${clamp(stop.position, 0, 100)}%`;
                }),
        [stops],
    );

    const gradientFunctionName = `${repeating ? 'repeating-' : ''}${gradientType}-gradient`;
    const gradientValue = useMemo(() => {
        if (gradientType === 'linear') {
            return `${gradientFunctionName}(${clamp(angle, 0, 360)}deg, ${normalizedStops.join(', ')})`;
        }
        if (gradientType === 'radial') {
            return `${gradientFunctionName}(${radialShape} ${radialSize} at ${clamp(positionX, 0, 100)}% ${clamp(positionY, 0, 100)}%, ${normalizedStops.join(', ')})`;
        }
        return `${gradientFunctionName}(from ${clamp(angle, 0, 360)}deg at ${clamp(positionX, 0, 100)}% ${clamp(positionY, 0, 100)}%, ${normalizedStops.join(', ')})`;
    }, [angle, gradientFunctionName, gradientType, normalizedStops, positionX, positionY, radialShape, radialSize]);

    const cssBackground = `background: ${gradientValue};`;
    const cssBackgroundImage = `background-image: ${gradientValue};`;
    const tailwindArbitrary = `bg-[${gradientValue.replaceAll(' ', '_')}]`;
    const figmaHint = `${gradientType.toUpperCase()} / ${stops.length} stops / ${repeating ? 'repeating' : 'single-pass'}`;

    const updateStop = (id: number, patch: Partial<GradientStop>) => {
        setStops((prev) =>
            prev.map((stop) =>
                stop.id === id
                    ? {
                          ...stop,
                          ...patch,
                          position: patch.position === undefined ? stop.position : clamp(patch.position, 0, 100),
                          alpha: patch.alpha === undefined ? stop.alpha : clamp(patch.alpha, 0, 100),
                      }
                    : stop,
            ),
        );
    };

    const addStop = () => {
        const fallbackColor = stops[stops.length - 1]?.color ?? '#8B5CF6';
        const position = stops.length === 0 ? 0 : Math.min(100, Math.round((stops.length / (stops.length + 1)) * 100));
        setStops((prev) => [...prev, { id: nextStopId, color: fallbackColor, position, alpha: 100 }]);
    };

    const removeStop = (id: number) => {
        setStops((prev) => {
            if (prev.length <= 2) return prev;
            return prev.filter((stop) => stop.id !== id);
        });
    };

    const reverseStops = () => {
        setStops((prev) =>
            [...prev]
                .map((stop) => ({ ...stop, position: 100 - stop.position }))
                .sort((a, b) => a.position - b.position),
        );
    };

    const distributeStopsEvenly = () => {
        setStops((prev) =>
            [...prev]
                .sort((a, b) => a.position - b.position)
                .map((stop, index, list) => {
                    if (list.length === 1) return { ...stop, position: 50 };
                    return { ...stop, position: Math.round((index / (list.length - 1)) * 100) };
                }),
        );
    };

    const applyPreset = (label: string) => {
        const preset = presets.find((item) => item.label === label);
        if (!preset) return;
        setGradientType(preset.type);
        setRepeating(preset.repeating);
        setAngle(preset.angle);
        setPositionX(preset.positionX);
        setPositionY(preset.positionY);
        setRadialShape(preset.radialShape);
        setRadialSize(preset.radialSize);
        setStops(preset.stops);
    };

    return (
        <ToolCard>
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <label className="text-sm">
                            <SectionLabel>Gradient Type</SectionLabel>
                            <select
                                value={gradientType}
                                onChange={(e) => setGradientType(e.target.value as GradientType)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                            >
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                                <option value="conic">Conic</option>
                            </select>
                        </label>

                        <label className="text-sm">
                            <SectionLabel>Angle / From</SectionLabel>
                            <input
                                type="number"
                                min={0}
                                max={360}
                                value={angle}
                                onChange={(e) => setAngle(clamp(Number(e.target.value), 0, 360))}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                            />
                        </label>

                        <label className="text-sm">
                            <SectionLabel>Origin X ({positionX}%)</SectionLabel>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={positionX}
                                onChange={(e) => setPositionX(clamp(Number(e.target.value), 0, 100))}
                                className="w-full accent-cyan-700"
                            />
                        </label>

                        <label className="text-sm">
                            <SectionLabel>Origin Y ({positionY}%)</SectionLabel>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={positionY}
                                onChange={(e) => setPositionY(clamp(Number(e.target.value), 0, 100))}
                                className="w-full accent-cyan-700"
                            />
                        </label>
                    </div>

                    {gradientType === 'radial' ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm">
                                <SectionLabel>Radial Shape</SectionLabel>
                                <select
                                    value={radialShape}
                                    onChange={(e) => setRadialShape(e.target.value as RadialShape)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <option value="ellipse">ellipse</option>
                                    <option value="circle">circle</option>
                                </select>
                            </label>
                            <label className="text-sm">
                                <SectionLabel>Radial Size</SectionLabel>
                                <select
                                    value={radialSize}
                                    onChange={(e) => setRadialSize(e.target.value as RadialSize)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <option value="closest-side">closest-side</option>
                                    <option value="closest-corner">closest-corner</option>
                                    <option value="farthest-side">farthest-side</option>
                                    <option value="farthest-corner">farthest-corner</option>
                                </select>
                            </label>
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={repeating ? 'default' : 'outline'}
                            onClick={() => setRepeating((prev) => !prev)}
                        >
                            {repeating ? 'Repeating: On' : 'Repeating: Off'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={addStop}>
                            Add Color Stop
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={distributeStopsEvenly}>
                            Distribute Stops
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={reverseStops}>
                            Reverse
                        </Button>
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <SectionLabel>Color Stops</SectionLabel>
                        {stops.map((stop) => (
                            <div
                                key={stop.id}
                                className="grid items-end gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700 md:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                            >
                                <div className="space-y-1">
                                    <SectionLabel>Color</SectionLabel>
                                    <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                        className="h-9 w-full rounded border border-slate-300 bg-transparent"
                                    />
                                </div>
                                <label className="space-y-1">
                                    <SectionLabel>Position ({stop.position}%)</SectionLabel>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={stop.position}
                                        onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                                        className="w-full accent-cyan-700"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <SectionLabel>Opacity ({stop.alpha}%)</SectionLabel>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={stop.alpha}
                                        onChange={(e) => updateStop(stop.id, { alpha: Number(e.target.value) })}
                                        className="w-full accent-cyan-700"
                                    />
                                </label>
                                <div className="flex items-end">
                                    <Button type="button" size="sm" variant="outline" onClick={() => removeStop(stop.id)} disabled={stops.length <= 2}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <SectionLabel>Presets</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <Button key={preset.label} type="button" size="sm" variant="outline" onClick={() => applyPreset(preset.label)}>
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="min-w-0 space-y-4">
                    <SectionLabel>Live Preview</SectionLabel>
                    <div
                        className="h-64 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                        style={{
                            backgroundImage:
                                'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        }}
                    >
                        <div className="h-full rounded-lg border border-white/30" style={{ background: gradientValue }} />
                    </div>

                    <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                        <div className="space-y-1">
                            <SectionLabel>CSS Background</SectionLabel>
                            <div className="flex min-w-0 items-start gap-2">
                                <pre className="max-h-28 flex-1 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-900">
                                    {cssBackground}
                                </pre>
                                <CopyButton value={cssBackground} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <SectionLabel>CSS Background Image</SectionLabel>
                            <div className="flex min-w-0 items-start gap-2">
                                <pre className="max-h-28 flex-1 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-900">
                                    {cssBackgroundImage}
                                </pre>
                                <CopyButton value={cssBackgroundImage} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <SectionLabel>Tailwind Arbitrary Value</SectionLabel>
                            <div className="flex min-w-0 items-start gap-2">
                                <pre className="max-h-28 flex-1 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-900">
                                    {tailwindArbitrary}
                                </pre>
                                <CopyButton value={tailwindArbitrary} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Preset summary: {figmaHint}</p>
                    </div>
                </div>
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
