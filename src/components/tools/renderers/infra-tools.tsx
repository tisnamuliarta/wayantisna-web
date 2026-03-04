'use client';

import { Button } from '@/components/ui/button';
import { CopyButton, SectionLabel, ToolCard, formatSql } from './shared';
import { Cloud, FileCode2, Search, ShieldCheck, Rocket, Webhook } from 'lucide-react';
import { useMemo, useState } from 'react';

const compactButtonClass = 'h-8 rounded-lg px-3 text-xs';
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900';
const textAreaClass = 'w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none ring-cyan-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900';

type ReportLevel = 'idle' | 'valid' | 'warning' | 'error';
interface ReportState {
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

const gitignoreTemplates: Record<string, string[]> = {
    node: ['node_modules/', 'npm-debug.log*', 'yarn-error.log*', '.env*'],
    next: ['.next/', 'out/', 'next-env.d.ts'],
    laravel: ['/vendor/', '/storage/*.key', '/bootstrap/cache/*.php', '.env'],
    python: ['__pycache__/', '*.pyc', '.venv/', '.pytest_cache/'],
    docker: ['.docker/', '*.log', 'docker-compose.override.yml'],
};

function ReportBox({ report }: { report: ReportState }) {
    return (
        <div className={`rounded-xl border p-3 text-sm ${reportTone[report.level]}`}>
            <p className="font-semibold">{report.title}</p>
            <ul className="mt-1 space-y-1 text-xs">
                {report.details.map((item) => (
                    <li key={item}>- {item}</li>
                ))}
            </ul>
        </div>
    );
}

function parseHeadersInput(text: string) {
    if (!text.trim()) return {} as Record<string, string>;
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, String(v ?? '')]),
    );
}

function percentile(values: number[], p: number) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[idx];
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hmacSha256Hex(message: string, key: string) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export function SslCertificateCheckerTool() {
    const [target, setTarget] = useState('wayantisna.com');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to check SSL certificate',
        details: ['Enter host/domain and run certificate check.'],
    });
    const [result, setResult] = useState<Record<string, unknown> | null>(null);

    const onCheck = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/tools/ssl-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target }),
            });
            const data = (await response.json()) as Record<string, unknown>;
            if (!response.ok) throw new Error(String(data.error ?? 'Failed to check SSL certificate.'));

            setResult(data);
            const days = typeof data.daysUntilExpiry === 'number' ? data.daysUntilExpiry : null;
            setReport({
                level: typeof days === 'number' && days < 15 ? 'warning' : 'valid',
                title: 'Certificate fetched successfully',
                details: [
                    `Host: ${String(data.host ?? '-')}`,
                    `Expires: ${String(data.validTo ?? '-')}`,
                    typeof days === 'number' ? `Days remaining: ${days}` : 'Days remaining: n/a',
                ],
            });
        } catch (error) {
            setResult(null);
            setReport({
                level: 'error',
                title: 'SSL check failed',
                details: [error instanceof Error ? error.message : 'Unknown error'],
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <label className="text-sm">
                        <SectionLabel>Domain or URL</SectionLabel>
                        <input value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} placeholder="example.com or https://example.com" />
                    </label>
                    <Button size="sm" className={compactButtonClass} onClick={onCheck} disabled={loading}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {loading ? 'Checking...' : 'Check Certificate'}
                    </Button>
                </div>

                <ReportBox report={report} />

                {result ? (
                    <div className="space-y-2">
                        <div className="grid gap-2 text-xs text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                            <p><strong>Issuer:</strong> {JSON.stringify(result.issuer ?? {})}</p>
                            <p><strong>Subject:</strong> {JSON.stringify(result.subject ?? {})}</p>
                            <p><strong>Valid From:</strong> {String(result.validFrom ?? '-')}</p>
                            <p><strong>Valid To:</strong> {String(result.validTo ?? '-')}</p>
                            <p><strong>Serial:</strong> {String(result.serialNumber ?? '-')}</p>
                            <p><strong>Fingerprint:</strong> {String(result.fingerprint256 ?? '-')}</p>
                        </div>
                        <CopyButton value={JSON.stringify(result, null, 2)} className={compactButtonClass} />
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

type CloudProvider = 'aws' | 'gcp' | 'azure';

const providerRates: Record<CloudProvider, { compute: number; storage: number; egress: number }> = {
    aws: { compute: 0.096, storage: 0.1, egress: 0.09 },
    gcp: { compute: 0.087, storage: 0.085, egress: 0.08 },
    azure: { compute: 0.091, storage: 0.09, egress: 0.087 },
};

export function CloudCostCalculatorTool() {
    const [provider, setProvider] = useState<CloudProvider>('aws');
    const [instances, setInstances] = useState(4);
    const [hoursPerMonth, setHoursPerMonth] = useState(730);
    const [computeRate, setComputeRate] = useState(providerRates.aws.compute);
    const [storageGb, setStorageGb] = useState(500);
    const [storageRate, setStorageRate] = useState(providerRates.aws.storage);
    const [egressGb, setEgressGb] = useState(1200);
    const [egressRate, setEgressRate] = useState(providerRates.aws.egress);
    const [discount, setDiscount] = useState(0);
    const [reservedDiscount, setReservedDiscount] = useState(22);
    const [haMultiplier, setHaMultiplier] = useState(1);
    const [annualGrowth, setAnnualGrowth] = useState(15);
    const [splitDev, setSplitDev] = useState(20);
    const [splitStage, setSplitStage] = useState(15);
    const [splitProd, setSplitProd] = useState(65);

    const calc = useMemo(() => {
        const normalizedSplitTotal = Math.max(1, splitDev + splitStage + splitProd);
        const envRatios = {
            dev: splitDev / normalizedSplitTotal,
            stage: splitStage / normalizedSplitTotal,
            prod: splitProd / normalizedSplitTotal,
        };
        const computeCost = instances * hoursPerMonth * computeRate * haMultiplier;
        const storageCost = storageGb * storageRate;
        const egressCost = egressGb * egressRate;
        const subtotal = computeCost + storageCost + egressCost;
        const discounted = subtotal * (1 - discount / 100);
        const reservedTotal = discounted * (1 - reservedDiscount / 100);
        const annualOnDemand = discounted * 12;
        const annualReserved = reservedTotal * 12;
        const nextYearProjected = annualReserved * (1 + annualGrowth / 100);
        return {
            computeCost,
            storageCost,
            egressCost,
            subtotal,
            discounted,
            reservedTotal,
            annualOnDemand,
            annualReserved,
            nextYearProjected,
            envRatios,
            envMonthly: {
                dev: reservedTotal * envRatios.dev,
                stage: reservedTotal * envRatios.stage,
                prod: reservedTotal * envRatios.prod,
            },
        };
    }, [annualGrowth, computeRate, discount, egressGb, egressRate, haMultiplier, hoursPerMonth, instances, reservedDiscount, splitDev, splitProd, splitStage, storageGb, storageRate]);

    const onProviderChange = (next: CloudProvider) => {
        setProvider(next);
        setComputeRate(providerRates[next].compute);
        setStorageRate(providerRates[next].storage);
        setEgressRate(providerRates[next].egress);
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {(['aws', 'gcp', 'azure'] as CloudProvider[]).map((item) => (
                        <Button key={item} size="sm" className={compactButtonClass} variant={provider === item ? 'default' : 'outline'} onClick={() => onProviderChange(item)}>
                            <Cloud className="h-3.5 w-3.5" />
                            {item.toUpperCase()}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="text-sm">
                        <SectionLabel>Instances</SectionLabel>
                        <input type="number" min={1} value={instances} onChange={(e) => setInstances(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Hours / Month</SectionLabel>
                        <input type="number" min={1} value={hoursPerMonth} onChange={(e) => setHoursPerMonth(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Compute Rate ($/hour)</SectionLabel>
                        <input type="number" min={0} step="0.001" value={computeRate} onChange={(e) => setComputeRate(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Discount (%)</SectionLabel>
                        <input type="number" min={0} max={90} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Reserved Savings (%)</SectionLabel>
                        <input type="number" min={0} max={80} value={reservedDiscount} onChange={(e) => setReservedDiscount(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Storage (GB)</SectionLabel>
                        <input type="number" min={0} value={storageGb} onChange={(e) => setStorageGb(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Storage Rate ($/GB)</SectionLabel>
                        <input type="number" min={0} step="0.001" value={storageRate} onChange={(e) => setStorageRate(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Egress (GB)</SectionLabel>
                        <input type="number" min={0} value={egressGb} onChange={(e) => setEgressGb(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Egress Rate ($/GB)</SectionLabel>
                        <input type="number" min={0} step="0.001" value={egressRate} onChange={(e) => setEgressRate(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>HA Multiplier</SectionLabel>
                        <input type="number" min={1} max={4} step="0.1" value={haMultiplier} onChange={(e) => setHaMultiplier(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Annual Growth (%)</SectionLabel>
                        <input type="number" min={0} max={200} value={annualGrowth} onChange={(e) => setAnnualGrowth(Number(e.target.value))} className={inputClass} />
                    </label>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                    <p>Compute: ${calc.computeCost.toFixed(2)}</p>
                    <p>Storage: ${calc.storageCost.toFixed(2)}</p>
                    <p>Egress: ${calc.egressCost.toFixed(2)}</p>
                    <p className="mt-1">Subtotal: ${calc.subtotal.toFixed(2)}</p>
                    <p>After discount: ${calc.discounted.toFixed(2)}</p>
                    <p className="font-semibold">Estimated Monthly Total (reserved): ${calc.reservedTotal.toFixed(2)}</p>
                    <p className="mt-2">Annual On-demand: ${calc.annualOnDemand.toFixed(2)}</p>
                    <p>Annual Reserved: ${calc.annualReserved.toFixed(2)}</p>
                    <p>Projected next year: ${calc.nextYearProjected.toFixed(2)}</p>
                </div>

                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900 md:grid-cols-3">
                    <label>
                        <SectionLabel>Dev Split (%)</SectionLabel>
                        <input type="number" min={0} max={100} value={splitDev} onChange={(e) => setSplitDev(Number(e.target.value))} className={inputClass} />
                        <p className="mt-1 text-slate-500 dark:text-slate-400">${calc.envMonthly.dev.toFixed(2)}/mo</p>
                    </label>
                    <label>
                        <SectionLabel>Stage Split (%)</SectionLabel>
                        <input type="number" min={0} max={100} value={splitStage} onChange={(e) => setSplitStage(Number(e.target.value))} className={inputClass} />
                        <p className="mt-1 text-slate-500 dark:text-slate-400">${calc.envMonthly.stage.toFixed(2)}/mo</p>
                    </label>
                    <label>
                        <SectionLabel>Prod Split (%)</SectionLabel>
                        <input type="number" min={0} max={100} value={splitProd} onChange={(e) => setSplitProd(Number(e.target.value))} className={inputClass} />
                        <p className="mt-1 text-slate-500 dark:text-slate-400">${calc.envMonthly.prod.toFixed(2)}/mo</p>
                    </label>
                </div>
            </div>
        </ToolCard>
    );
}

export function ApiLoadTesterTool() {
    const [url, setUrl] = useState('https://httpbin.org/post');
    const [method, setMethod] = useState<'GET' | 'POST'>('POST');
    const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
    const [bodyText, setBodyText] = useState('{"event":"ping"}');
    const [requests, setRequests] = useState(30);
    const [concurrency, setConcurrency] = useState(5);
    const [requestDelayMs, setRequestDelayMs] = useState(0);
    const [rampBatches, setRampBatches] = useState(1);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultSnapshot, setResultSnapshot] = useState('');
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to run load test',
        details: ['Server-side proxy test with concurrency, ramp-up, and latency percentiles.'],
    });

    const onRun = async () => {
        setRunning(true);
        setProgress(0);
        setResultSnapshot('');
        try {
            const total = Math.max(1, Math.min(300, requests));
            const workers = Math.max(1, Math.min(20, concurrency));
            const batches = Math.max(1, Math.min(10, rampBatches));
            const parsedHeaders = parseHeadersInput(headersText);

            let cursor = 0;
            let done = 0;
            let success = 0;
            let failed = 0;
            const latencies: number[] = [];
            const statusBuckets: Record<string, number> = {};
            const failureBuckets: Record<string, number> = {};
            const startedAt = performance.now();

            const runWorker = async (limit: number) => {
                while (true) {
                    const index = cursor;
                    cursor += 1;
                    if (index >= limit) break;
                    const started = performance.now();
                    try {
                        const response = await fetch('/api/tools/webhook-test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                url,
                                method,
                                headers: parsedHeaders,
                                body: method === 'GET' ? '' : bodyText,
                            }),
                        });
                        const data = (await response.json()) as { ok?: boolean; status?: number; error?: string };
                        const statusKey = String(data.status ?? response.status ?? 'n/a');
                        statusBuckets[statusKey] = (statusBuckets[statusKey] ?? 0) + 1;
                        if (response.ok && data.ok) {
                            success += 1;
                        } else {
                            failed += 1;
                            const reason = data.error ? String(data.error) : `HTTP ${statusKey}`;
                            failureBuckets[reason] = (failureBuckets[reason] ?? 0) + 1;
                        }
                    } catch (error) {
                        failed += 1;
                        const reason = error instanceof Error ? error.message : 'Network error';
                        failureBuckets[reason] = (failureBuckets[reason] ?? 0) + 1;
                    } finally {
                        const elapsed = performance.now() - started;
                        latencies.push(elapsed);
                        done += 1;
                        setProgress(Math.round((done / total) * 100));
                        if (requestDelayMs > 0) await wait(requestDelayMs);
                    }
                }
            };

            const workersPerBatch = Math.max(1, Math.ceil(workers / batches));
            const perBatch = Math.ceil(total / batches);
            for (let batch = 0; batch < batches; batch += 1) {
                const batchLimit = Math.min(total, (batch + 1) * perBatch);
                await Promise.all(Array.from({ length: workersPerBatch }, () => runWorker(batchLimit)));
                if (batch < batches - 1) await wait(150);
            }
            const avg = latencies.length ? latencies.reduce((sum, v) => sum + v, 0) / latencies.length : 0;
            const elapsedSeconds = Math.max(0.001, (performance.now() - startedAt) / 1000);
            const throughput = total / elapsedSeconds;
            const errorRate = (failed / total) * 100;
            const snapshot = {
                total,
                workers,
                rampBatches: batches,
                success,
                failed,
                errorRate: Number(errorRate.toFixed(2)),
                throughputRps: Number(throughput.toFixed(2)),
                avgLatencyMs: Number(avg.toFixed(1)),
                p50Ms: Number(percentile(latencies, 50).toFixed(1)),
                p95Ms: Number(percentile(latencies, 95).toFixed(1)),
                p99Ms: Number(percentile(latencies, 99).toFixed(1)),
                statusBuckets,
                failureBuckets,
            };
            setResultSnapshot(JSON.stringify(snapshot, null, 2));

            setReport({
                level: failed > 0 ? (errorRate > 10 ? 'error' : 'warning') : 'valid',
                title: 'Load test completed',
                details: [
                    `Total requests: ${total}`,
                    `Success: ${success}`,
                    `Failed: ${failed}`,
                    `Error rate: ${errorRate.toFixed(1)}%`,
                    `Throughput: ${throughput.toFixed(2)} req/s`,
                    `Avg latency: ${avg.toFixed(1)} ms`,
                    `P50: ${percentile(latencies, 50).toFixed(1)} ms`,
                    `P95: ${percentile(latencies, 95).toFixed(1)} ms`,
                    `P99: ${percentile(latencies, 99).toFixed(1)} ms`,
                ],
            });
        } catch (error) {
            setReport({
                level: 'error',
                title: 'Load test failed',
                details: [error instanceof Error ? error.message : 'Unknown error'],
            });
        } finally {
            setRunning(false);
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Target URL</SectionLabel>
                        <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Method</SectionLabel>
                        <select value={method} onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')} className={inputClass}>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Total Requests</SectionLabel>
                        <input type="number" min={1} max={300} value={requests} onChange={(e) => setRequests(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Concurrency</SectionLabel>
                        <input type="number" min={1} max={20} value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Ramp Batches</SectionLabel>
                        <input type="number" min={1} max={10} value={rampBatches} onChange={(e) => setRampBatches(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Delay per Request (ms)</SectionLabel>
                        <input type="number" min={0} max={2000} value={requestDelayMs} onChange={(e) => setRequestDelayMs(Number(e.target.value))} className={inputClass} />
                    </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Headers JSON</SectionLabel>
                        <textarea value={headersText} onChange={(e) => setHeadersText(e.target.value)} className={`${textAreaClass} h-28`} placeholder='Headers JSON' />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Request Body</SectionLabel>
                        <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Request body (for POST)" />
                    </label>
                </div>

                <Button size="sm" className={compactButtonClass} onClick={onRun} disabled={running}>
                    <Rocket className="h-3.5 w-3.5" />
                    {running ? `Running ${progress}%` : 'Run Load Test'}
                </Button>

                <ReportBox report={report} />

                {resultSnapshot ? (
                    <div className="space-y-2">
                        <SectionLabel>Run Snapshot (JSON)</SectionLabel>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                            {resultSnapshot}
                        </pre>
                        <CopyButton value={resultSnapshot} className={compactButtonClass} />
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

export function SqlQueryOptimizerTool() {
    const [sql, setSql] = useState("select * from users where lower(email) like '%wayan%' order by created_at desc;");

    const analysis = useMemo(() => {
        const input = sql.toLowerCase();
        const issues: Array<{ severity: 'warning' | 'info'; text: string }> = [];
        if (/\bselect\s+\*/.test(input)) issues.push({ severity: 'warning', text: 'Avoid SELECT * in production queries; select explicit columns.' });
        if (/\blower\(|\bupper\(|\bdate\(/.test(input)) issues.push({ severity: 'warning', text: 'Functions in WHERE can bypass indexes. Consider computed/indexed columns.' });
        if (/like\s+'%/.test(input)) issues.push({ severity: 'warning', text: 'Leading wildcard LIKE pattern (%term) usually prevents index usage.' });
        if (/\border\s+by\b/.test(input) && !/\blimit\b/.test(input)) issues.push({ severity: 'info', text: 'ORDER BY without LIMIT can be expensive on large tables.' });
        if (/\bjoin\b/.test(input) && !/\bon\b/.test(input)) issues.push({ severity: 'warning', text: 'JOIN without ON condition detected; verify join clause.' });
        if (issues.length === 0) issues.push({ severity: 'info', text: 'No obvious anti-pattern found by heuristic checks.' });
        return issues;
    }, [sql]);

    const formatted = useMemo(() => formatSql(sql), [sql]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <label className="text-sm">
                    <SectionLabel>SQL Query</SectionLabel>
                    <textarea value={sql} onChange={(e) => setSql(e.target.value)} className={`${textAreaClass} h-40`} />
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="mb-2 font-semibold">Optimization Notes</p>
                    <ul className="space-y-1 text-xs">
                        {analysis.map((item) => (
                            <li key={item.text} className={item.severity === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'}>
                                - {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-2">
                    <SectionLabel>Formatted SQL</SectionLabel>
                    <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{formatted}</pre>
                    <CopyButton value={formatted} className={compactButtonClass} />
                </div>
            </div>
        </ToolCard>
    );
}

export function CiCdPipelineGeneratorTool() {
    const [platform, setPlatform] = useState<'github' | 'gitlab' | 'circleci'>('github');
    const [nodeVersion, setNodeVersion] = useState('20');
    const [installCommand, setInstallCommand] = useState('npm ci');
    const [testCommand, setTestCommand] = useState('npm run lint && npm run build');
    const [deployCommand, setDeployCommand] = useState('npm run deploy');
    const [includeDeploy, setIncludeDeploy] = useState(false);

    const output = useMemo(() => {
        if (platform === 'github') {
            return `name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '${nodeVersion}'\n      - run: ${installCommand}\n      - run: ${testCommand}${includeDeploy ? `\n  deploy:\n    runs-on: ubuntu-latest\n    needs: build\n    if: github.ref == 'refs/heads/main'\n    steps:\n      - uses: actions/checkout@v4\n      - run: ${deployCommand}` : ''}`;
        }
        if (platform === 'gitlab') {
            return `stages:\n  - test${includeDeploy ? '\n  - deploy' : ''}\n\nimage: node:${nodeVersion}\n\ntest:\n  stage: test\n  script:\n    - ${installCommand}\n    - ${testCommand}${includeDeploy ? `\n\ndeploy:\n  stage: deploy\n  only:\n    - main\n  script:\n    - ${deployCommand}` : ''}`;
        }
        return `version: 2.1\njobs:\n  test:\n    docker:\n      - image: cimg/node:${nodeVersion}\n    steps:\n      - checkout\n      - run: ${installCommand}\n      - run: ${testCommand}${includeDeploy ? `\n  deploy:\n    docker:\n      - image: cimg/node:${nodeVersion}\n    steps:\n      - checkout\n      - run: ${deployCommand}` : ''}\nworkflows:\n  build:\n    jobs:\n      - test${includeDeploy ? '\n      - deploy:\n          requires:\n            - test' : ''}`;
    }, [deployCommand, includeDeploy, installCommand, nodeVersion, platform, testCommand]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {(['github', 'gitlab', 'circleci'] as const).map((item) => (
                        <Button key={item} size="sm" className={compactButtonClass} variant={platform === item ? 'default' : 'outline'} onClick={() => setPlatform(item)}>
                            <FileCode2 className="h-3.5 w-3.5" />
                            {item}
                        </Button>
                    ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Node Version</SectionLabel>
                        <input value={nodeVersion} onChange={(e) => setNodeVersion(e.target.value)} className={inputClass} placeholder="Node version" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Install Command</SectionLabel>
                        <input value={installCommand} onChange={(e) => setInstallCommand(e.target.value)} className={inputClass} placeholder="Install command" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Test Command</SectionLabel>
                        <input value={testCommand} onChange={(e) => setTestCommand(e.target.value)} className={inputClass} placeholder="Test command" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Deploy Command</SectionLabel>
                        <input value={deployCommand} onChange={(e) => setDeployCommand(e.target.value)} className={inputClass} placeholder="Deploy command" />
                    </label>
                </div>
                <label className="text-sm">
                    <input type="checkbox" checked={includeDeploy} onChange={(e) => setIncludeDeploy(e.target.checked)} className="mr-2" />
                    Include deploy stage
                </label>
                <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function DockerComposeGeneratorTool() {
    const [projectName, setProjectName] = useState('portfolio-app');
    const [image, setImage] = useState('node:20-alpine');
    const [appPort, setAppPort] = useState(3000);
    const [dbType, setDbType] = useState<'none' | 'postgres' | 'mysql'>('postgres');
    const [includeRedis, setIncludeRedis] = useState(true);

    const output = useMemo(() => {
        const dbService =
            dbType === 'postgres'
                ? `\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: app\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app\n    volumes:\n      - db_data:/var/lib/postgresql/data`
                : dbType === 'mysql'
                    ? `\n  db:\n    image: mysql:8\n    environment:\n      MYSQL_DATABASE: app\n      MYSQL_USER: app\n      MYSQL_PASSWORD: app\n      MYSQL_ROOT_PASSWORD: root\n    volumes:\n      - db_data:/var/lib/mysql`
                    : '';

        return `name: ${projectName}\nservices:\n  app:\n    image: ${image}\n    working_dir: /app\n    command: sh -c "npm ci && npm run dev"\n    volumes:\n      - ./:/app\n    ports:\n      - "${appPort}:${appPort}"${dbType !== 'none' ? '\n    depends_on:\n      - db' : ''}${includeRedis ? '\n      - redis' : ''}\n${dbService}${includeRedis ? `\n  redis:\n    image: redis:7-alpine` : ''}\nvolumes:${dbType !== 'none' ? '\n  db_data:' : '\n  {}'}`;
    }, [appPort, dbType, image, includeRedis, projectName]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Project Name</SectionLabel>
                        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} placeholder="Project name" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>App Image</SectionLabel>
                        <input value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="App image" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>App Port</SectionLabel>
                        <input type="number" value={appPort} onChange={(e) => setAppPort(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Database</SectionLabel>
                        <select value={dbType} onChange={(e) => setDbType(e.target.value as typeof dbType)} className={inputClass}>
                            <option value="none">No DB</option>
                            <option value="postgres">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                        </select>
                    </label>
                </div>
                <label className="text-sm">
                    <input type="checkbox" checked={includeRedis} onChange={(e) => setIncludeRedis(e.target.checked)} className="mr-2" />
                    Include Redis
                </label>
                <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function KubernetesYamlGeneratorTool() {
    const [name, setName] = useState('portfolio-api');
    const [image, setImage] = useState('ghcr.io/company/portfolio-api:latest');
    const [replicas, setReplicas] = useState(2);
    const [containerPort, setContainerPort] = useState(3000);
    const [servicePort, setServicePort] = useState(80);
    const [serviceType, setServiceType] = useState<'ClusterIP' | 'LoadBalancer' | 'NodePort'>('ClusterIP');
    const [envText, setEnvText] = useState('NODE_ENV=production\nAPP_NAME=portfolio-api');
    const [cpuRequest, setCpuRequest] = useState('250m');
    const [memoryRequest, setMemoryRequest] = useState('256Mi');
    const [cpuLimit, setCpuLimit] = useState('1000m');
    const [memoryLimit, setMemoryLimit] = useState('512Mi');
    const [livenessPath, setLivenessPath] = useState('/health');
    const [readinessPath, setReadinessPath] = useState('/ready');
    const [includeIngress, setIncludeIngress] = useState(true);
    const [ingressHost, setIngressHost] = useState('api.wayantisna.com');
    const [includeHpa, setIncludeHpa] = useState(false);
    const [hpaMin, setHpaMin] = useState(2);
    const [hpaMax, setHpaMax] = useState(6);
    const [hpaCpuTarget, setHpaCpuTarget] = useState(70);

    const output = useMemo(() => {
        const envRows = envText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const idx = line.indexOf('=');
                if (idx <= 0) return null;
                return { key: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
            })
            .filter((item): item is { key: string; value: string } => Boolean(item));

        const envYaml = envRows.length
            ? `\n          env:\n${envRows.map((env) => `            - name: ${env.key}\n              value: "${env.value.replaceAll('"', '\\"')}"`).join('\n')}`
            : '';
        const ingressYaml = includeIngress
            ? `\n---\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: ${name}\nspec:\n  rules:\n    - host: ${ingressHost}\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: ${name}\n                port:\n                  number: ${servicePort}`
            : '';
        const hpaYaml = includeHpa
            ? `\n---\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: ${name}\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: ${name}\n  minReplicas: ${hpaMin}\n  maxReplicas: ${hpaMax}\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: ${hpaCpuTarget}`
            : '';

        return `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\nspec:\n  replicas: ${replicas}\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n    metadata:\n      labels:\n        app: ${name}\n    spec:\n      containers:\n        - name: ${name}\n          image: ${image}\n          ports:\n            - containerPort: ${containerPort}${envYaml}\n          resources:\n            requests:\n              cpu: ${cpuRequest}\n              memory: ${memoryRequest}\n            limits:\n              cpu: ${cpuLimit}\n              memory: ${memoryLimit}\n          livenessProbe:\n            httpGet:\n              path: ${livenessPath}\n              port: ${containerPort}\n            initialDelaySeconds: 10\n            periodSeconds: 10\n          readinessProbe:\n            httpGet:\n              path: ${readinessPath}\n              port: ${containerPort}\n            initialDelaySeconds: 5\n            periodSeconds: 5\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}\nspec:\n  selector:\n    app: ${name}\n  type: ${serviceType}\n  ports:\n    - port: ${servicePort}\n      targetPort: ${containerPort}${ingressYaml}${hpaYaml}`;
    }, [containerPort, cpuLimit, cpuRequest, envText, hpaCpuTarget, hpaMax, hpaMin, image, includeHpa, includeIngress, ingressHost, livenessPath, memoryLimit, memoryRequest, name, readinessPath, replicas, servicePort, serviceType]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>App Name</SectionLabel>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="App name" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Container Image</SectionLabel>
                        <input value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="Container image" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Replicas</SectionLabel>
                        <input type="number" value={replicas} onChange={(e) => setReplicas(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Container Port</SectionLabel>
                        <input type="number" value={containerPort} onChange={(e) => setContainerPort(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Service Port</SectionLabel>
                        <input type="number" value={servicePort} onChange={(e) => setServicePort(Number(e.target.value))} className={inputClass} />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Service Type</SectionLabel>
                        <select value={serviceType} onChange={(e) => setServiceType(e.target.value as typeof serviceType)} className={inputClass}>
                            <option value="ClusterIP">ClusterIP</option>
                            <option value="LoadBalancer">LoadBalancer</option>
                            <option value="NodePort">NodePort</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>CPU Request</SectionLabel>
                        <input value={cpuRequest} onChange={(e) => setCpuRequest(e.target.value)} className={inputClass} placeholder="CPU request (e.g. 250m)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Memory Request</SectionLabel>
                        <input value={memoryRequest} onChange={(e) => setMemoryRequest(e.target.value)} className={inputClass} placeholder="Memory request (e.g. 256Mi)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>CPU Limit</SectionLabel>
                        <input value={cpuLimit} onChange={(e) => setCpuLimit(e.target.value)} className={inputClass} placeholder="CPU limit (e.g. 1000m)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Memory Limit</SectionLabel>
                        <input value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} className={inputClass} placeholder="Memory limit (e.g. 512Mi)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Liveness Path</SectionLabel>
                        <input value={livenessPath} onChange={(e) => setLivenessPath(e.target.value)} className={inputClass} placeholder="Liveness path" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Readiness Path</SectionLabel>
                        <input value={readinessPath} onChange={(e) => setReadinessPath(e.target.value)} className={inputClass} placeholder="Readiness path" />
                    </label>
                </div>
                <label className="text-sm">
                    <SectionLabel>Environment Variables</SectionLabel>
                    <textarea value={envText} onChange={(e) => setEnvText(e.target.value)} className={`${textAreaClass} h-24`} placeholder="Env vars, one per line (KEY=value)" />
                </label>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={includeIngress} onChange={(e) => setIncludeIngress(e.target.checked)} className="h-3.5 w-3.5" />
                        Include ingress
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={includeHpa} onChange={(e) => setIncludeHpa(e.target.checked)} className="h-3.5 w-3.5" />
                        Include HPA
                    </label>
                </div>
                {includeIngress ? (
                    <label className="text-sm">
                        <SectionLabel>Ingress Host</SectionLabel>
                        <input value={ingressHost} onChange={(e) => setIngressHost(e.target.value)} className={inputClass} placeholder="Ingress host" />
                    </label>
                ) : null}
                {includeHpa ? (
                    <div className="grid gap-3 md:grid-cols-3">
                        <label className="text-sm">
                            <SectionLabel>HPA Min</SectionLabel>
                            <input type="number" min={1} value={hpaMin} onChange={(e) => setHpaMin(Number(e.target.value))} className={inputClass} placeholder="HPA min" />
                        </label>
                        <label className="text-sm">
                            <SectionLabel>HPA Max</SectionLabel>
                            <input type="number" min={1} value={hpaMax} onChange={(e) => setHpaMax(Number(e.target.value))} className={inputClass} placeholder="HPA max" />
                        </label>
                        <label className="text-sm">
                            <SectionLabel>HPA CPU Target %</SectionLabel>
                            <input type="number" min={10} max={95} value={hpaCpuTarget} onChange={(e) => setHpaCpuTarget(Number(e.target.value))} className={inputClass} placeholder="CPU target %" />
                        </label>
                    </div>
                ) : null}
                <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function GraphqlQueryBuilderTool() {
    const [operation, setOperation] = useState<'query' | 'mutation'>('query');
    const [operationName, setOperationName] = useState('GetUser');
    const [variableDefs, setVariableDefs] = useState('$id: ID!');
    const [rootField, setRootField] = useState('user');
    const [argumentsText, setArgumentsText] = useState('id: $id');
    const [fields, setFields] = useState('id\nname\nemail');

    const query = useMemo(() => {
        const selection = fields
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `    ${line}`)
            .join('\n');
        return `${operation} ${operationName}${variableDefs.trim() ? `(${variableDefs.trim()})` : ''} {\n  ${rootField}${argumentsText.trim() ? `(${argumentsText.trim()})` : ''} {\n${selection || '    id'}\n  }\n}`;
    }, [argumentsText, fields, operation, operationName, rootField, variableDefs]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Operation Type</SectionLabel>
                        <select value={operation} onChange={(e) => setOperation(e.target.value as typeof operation)} className={inputClass}>
                            <option value="query">query</option>
                            <option value="mutation">mutation</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Operation Name</SectionLabel>
                        <input value={operationName} onChange={(e) => setOperationName(e.target.value)} className={inputClass} placeholder="Operation name" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Variable Definitions</SectionLabel>
                        <input value={variableDefs} onChange={(e) => setVariableDefs(e.target.value)} className={inputClass} placeholder="Variable defs" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Root Field</SectionLabel>
                        <input value={rootField} onChange={(e) => setRootField(e.target.value)} className={inputClass} placeholder="Root field" />
                    </label>
                </div>
                <label className="text-sm">
                    <SectionLabel>Arguments</SectionLabel>
                    <input value={argumentsText} onChange={(e) => setArgumentsText(e.target.value)} className={inputClass} placeholder="Arguments" />
                </label>
                <label className="text-sm">
                    <SectionLabel>Selection Fields</SectionLabel>
                    <textarea value={fields} onChange={(e) => setFields(e.target.value)} className={`${textAreaClass} h-32`} placeholder="Field selection, one per line" />
                </label>
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{query}</pre>
                <CopyButton value={query} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function WebhookTesterTool() {
    const [url, setUrl] = useState('https://httpbin.org/post');
    const [method, setMethod] = useState<'POST' | 'PUT' | 'PATCH'>('POST');
    const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
    const [bodyText, setBodyText] = useState('{\n  "event": "build.succeeded",\n  "id": "evt_123"\n}');
    const [retryCount, setRetryCount] = useState(0);
    const [retryDelayMs, setRetryDelayMs] = useState(150);
    const [signatureHeader, setSignatureHeader] = useState('x-signature-sha256');
    const [signatureSecret, setSignatureSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to test webhook',
        details: ['Supports retries, custom headers, and optional HMAC signature.'],
    });
    const [responsePreview, setResponsePreview] = useState('');
    const [attemptLogs, setAttemptLogs] = useState<string[]>([]);

    const onSend = async () => {
        setLoading(true);
        setAttemptLogs([]);
        try {
            const parsedHeaders = parseHeadersInput(headersText);
            if (signatureSecret.trim()) {
                const signature = await hmacSha256Hex(bodyText, signatureSecret.trim());
                parsedHeaders[signatureHeader] = signature;
            }

            const attempts = Math.max(1, Math.min(6, retryCount + 1));
            let finalData: Record<string, unknown> | null = null;
            let finalStatus = 0;
            let finalStatusText = '';
            const logs: string[] = [];
            for (let attempt = 1; attempt <= attempts; attempt += 1) {
                const response = await fetch('/api/tools/webhook-test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, method, headers: parsedHeaders, body: bodyText }),
                });
                const data = (await response.json()) as Record<string, unknown>;
                finalData = data;
                finalStatus = Number(data.status ?? response.status ?? 0);
                finalStatusText = String(data.statusText ?? response.statusText ?? '');
                logs.push(`Attempt ${attempt}: ${finalStatus} ${finalStatusText} in ${String(data.elapsedMs ?? '-')}ms`);
                if (response.ok && data.ok) {
                    break;
                }
                if (attempt < attempts && retryDelayMs > 0) {
                    await wait(retryDelayMs);
                }
            }

            setAttemptLogs(logs);
            if (!finalData) throw new Error('Webhook request failed without response.');
            setResponsePreview(String(finalData.responseBodyPreview ?? ''));
            setReport({
                level: finalStatus >= 200 && finalStatus < 300 ? 'valid' : finalStatus >= 500 ? 'error' : 'warning',
                title: `Webhook response: ${finalStatus} ${finalStatusText}`,
                details: [
                    `Attempts: ${logs.length}`,
                    `Elapsed (last): ${String(finalData.elapsedMs ?? '-')} ms`,
                    `Body bytes: ${String(finalData.responseBodyBytes ?? '-')}`,
                    signatureSecret.trim() ? `Signature header: ${signatureHeader}` : 'Signature: disabled',
                ],
            });
        } catch (error) {
            setResponsePreview('');
            setReport({
                level: 'error',
                title: 'Webhook test failed',
                details: [error instanceof Error ? error.message : 'Unknown error'],
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_130px]">
                    <label className="text-sm">
                        <SectionLabel>Webhook URL</SectionLabel>
                        <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://your-webhook-endpoint" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Method</SectionLabel>
                        <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className={inputClass}>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Headers JSON</SectionLabel>
                        <textarea value={headersText} onChange={(e) => setHeadersText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Headers JSON" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Body</SectionLabel>
                        <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Body" />
                    </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Retries</SectionLabel>
                        <input type="number" min={0} max={5} value={retryCount} onChange={(e) => setRetryCount(Number(e.target.value))} className={inputClass} placeholder="Retries" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Retry Delay (ms)</SectionLabel>
                        <input type="number" min={0} max={5000} value={retryDelayMs} onChange={(e) => setRetryDelayMs(Number(e.target.value))} className={inputClass} placeholder="Retry delay (ms)" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Signature Header</SectionLabel>
                        <input value={signatureHeader} onChange={(e) => setSignatureHeader(e.target.value)} className={inputClass} placeholder="Signature header name" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Signature Secret</SectionLabel>
                        <input value={signatureSecret} onChange={(e) => setSignatureSecret(e.target.value)} className={inputClass} placeholder="Signature secret (optional)" />
                    </label>
                </div>

                <Button size="sm" className={compactButtonClass} onClick={onSend} disabled={loading}>
                    <Webhook className="h-3.5 w-3.5" />
                    {loading ? 'Sending...' : 'Send Webhook'}
                </Button>
                <ReportBox report={report} />
                {attemptLogs.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <p className="mb-1 font-semibold">Attempt Logs</p>
                        <ul className="space-y-1">
                            {attemptLogs.map((item) => (
                                <li key={item}>- {item}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
                <div className="space-y-2">
                    <SectionLabel>Response Preview</SectionLabel>
                    <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{responsePreview || 'No response yet.'}</pre>
                </div>
            </div>
        </ToolCard>
    );
}

type OpenApiEndpoint = {
    method: string;
    path: string;
    summary: string;
    operationId: string;
    tags: string[];
    secured: boolean;
};

export function OpenApiSwaggerEditorTool() {
    const [source, setSource] = useState('{\n  "openapi": "3.0.0",\n  "info": { "title": "Demo API", "version": "1.0.0" },\n  "paths": {\n    "/users/{id}": {\n      "get": { "summary": "Get user" }\n    }\n  }\n}');
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to parse OpenAPI',
        details: ['Paste OpenAPI JSON, analyze endpoints, and lint for missing metadata.'],
    });
    const [endpoints, setEndpoints] = useState<OpenApiEndpoint[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [filterText, setFilterText] = useState('');
    const [curlSnippet, setCurlSnippet] = useState('');

    const onAnalyze = () => {
        try {
            const doc = JSON.parse(source) as {
                openapi?: string;
                info?: { title?: string; version?: string; description?: string };
                paths?: Record<string, Record<string, { summary?: string; operationId?: string; tags?: string[]; security?: unknown[] }>>;
                servers?: Array<{ url?: string }>;
            };

            const items: OpenApiEndpoint[] = [];
            const lintWarnings: string[] = [];
            Object.entries(doc.paths ?? {}).forEach(([path, methods]) => {
                Object.entries(methods ?? {}).forEach(([method, meta]) => {
                    const operationId = meta?.operationId ?? '';
                    const tags = Array.isArray(meta?.tags) ? meta.tags.filter(Boolean) : [];
                    const secured = Array.isArray(meta?.security) && meta.security.length > 0;
                    if (!meta?.summary) lintWarnings.push(`${method.toUpperCase()} ${path}: missing summary`);
                    if (!operationId) lintWarnings.push(`${method.toUpperCase()} ${path}: missing operationId`);
                    if (tags.length === 0) lintWarnings.push(`${method.toUpperCase()} ${path}: missing tags`);
                    items.push({
                        path,
                        method: method.toUpperCase(),
                        summary: meta?.summary ?? '',
                        operationId,
                        tags,
                        secured,
                    });
                });
            });

            setEndpoints(items);
            setWarnings(lintWarnings.slice(0, 25));
            if (items[0]) {
                const server = doc.servers?.[0]?.url ?? 'https://api.example.com';
                const first = items[0];
                const sampleCurl = `curl -X ${first.method} ${server}${first.path} -H "Authorization: Bearer <token>" -H "Content-Type: application/json"`;
                setSelectedEndpoint(`${first.method} ${first.path}`);
                setCurlSnippet(sampleCurl);
            } else {
                setSelectedEndpoint('');
                setCurlSnippet('');
            }

            setReport({
                level: lintWarnings.length > 0 ? 'warning' : 'valid',
                title: 'OpenAPI parsed successfully',
                details: [
                    `Spec version: ${doc.openapi ?? 'n/a'}`,
                    `Title: ${doc.info?.title ?? 'n/a'}`,
                    `Endpoints: ${items.length}`,
                    `Lint warnings: ${lintWarnings.length}`,
                ],
            });
        } catch (error) {
            setEndpoints([]);
            setWarnings([]);
            setCurlSnippet('');
            setReport({
                level: 'error',
                title: 'OpenAPI parse failed',
                details: [error instanceof Error ? error.message : 'Invalid JSON format'],
            });
        }
    };

    const filteredEndpoints = useMemo(() => {
        const q = filterText.trim().toLowerCase();
        if (!q) return endpoints;
        return endpoints.filter((endpoint) => `${endpoint.method} ${endpoint.path} ${endpoint.summary} ${endpoint.tags.join(' ')}`.toLowerCase().includes(q));
    }, [endpoints, filterText]);

    const onSelectEndpoint = (value: string) => {
        setSelectedEndpoint(value);
        const [method, ...pathParts] = value.split(' ');
        const path = pathParts.join(' ');
        if (!method || !path) return;
        setCurlSnippet(`curl -X ${method} https://api.example.com${path} -H "Authorization: Bearer <token>" -H "Content-Type: application/json"`);
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <label className="text-sm">
                    <SectionLabel>OpenAPI JSON Source</SectionLabel>
                    <textarea value={source} onChange={(e) => setSource(e.target.value)} className={`${textAreaClass} h-48`} />
                </label>
                <Button size="sm" className={compactButtonClass} onClick={onAnalyze}>
                    <Search className="h-3.5 w-3.5" />
                    Analyze OpenAPI
                </Button>
                <ReportBox report={report} />

                {endpoints.length > 0 ? (
                    <div className="space-y-2">
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
                            <label className="text-sm">
                                <SectionLabel>Endpoint Filter</SectionLabel>
                                <input value={filterText} onChange={(e) => setFilterText(e.target.value)} className={inputClass} placeholder="Filter endpoints by method/path/tag..." />
                            </label>
                            <label className="text-sm">
                                <SectionLabel>cURL Target Endpoint</SectionLabel>
                                <select value={selectedEndpoint} onChange={(e) => onSelectEndpoint(e.target.value)} className={inputClass}>
                                    {endpoints.map((item) => {
                                        const value = `${item.method} ${item.path}`;
                                        return (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                        </div>
                        <SectionLabel>Endpoints</SectionLabel>
                        <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-2 py-2">Method</th>
                                        <th className="px-2 py-2">Path</th>
                                        <th className="px-2 py-2">Summary</th>
                                        <th className="px-2 py-2">Tags</th>
                                        <th className="px-2 py-2">Secured</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEndpoints.map((item) => (
                                        <tr key={`${item.method}-${item.path}`} className="border-t border-slate-200 dark:border-slate-700">
                                            <td className="px-2 py-1.5">{item.method}</td>
                                            <td className="px-2 py-1.5">{item.path}</td>
                                            <td className="px-2 py-1.5">{item.summary || '-'}</td>
                                            <td className="px-2 py-1.5">{item.tags.length > 0 ? item.tags.join(', ') : '-'}</td>
                                            <td className="px-2 py-1.5">{item.secured ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}

                {warnings.length > 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-200">
                        <p className="mb-1 font-semibold">Lint Warnings</p>
                        <ul className="space-y-1">
                            {warnings.map((warning) => (
                                <li key={warning}>- {warning}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {curlSnippet ? (
                    <div className="space-y-2">
                        <SectionLabel>Sample cURL</SectionLabel>
                        <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{curlSnippet}</pre>
                        <CopyButton value={curlSnippet} className={compactButtonClass} />
                    </div>
                ) : null}
            </div>
        </ToolCard>
    );
}

export function HtaccessGeneratorTool() {
    const [forceHttps, setForceHttps] = useState(true);
    const [removeWww, setRemoveWww] = useState(false);
    const [gzip, setGzip] = useState(true);
    const [disableListing, setDisableListing] = useState(true);
    const [securityHeaders, setSecurityHeaders] = useState(true);
    const [cacheStaticAssets, setCacheStaticAssets] = useState(true);
    const [blockHotlinking, setBlockHotlinking] = useState(false);
    const [errorDocument404, setErrorDocument404] = useState('/404.html');

    const output = useMemo(() => {
        const lines: string[] = ['# Generated .htaccess'];
        if (forceHttps) {
            lines.push('RewriteEngine On', 'RewriteCond %{HTTPS} !=on', 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
        }
        if (removeWww) {
            lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]', 'RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]');
        }
        if (disableListing) lines.push('Options -Indexes');
        if (gzip) {
            lines.push('<IfModule mod_deflate.c>', '  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json', '</IfModule>');
        }
        if (securityHeaders) {
            lines.push(
                '<IfModule mod_headers.c>',
                '  Header always set X-Content-Type-Options "nosniff"',
                '  Header always set X-Frame-Options "SAMEORIGIN"',
                '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
                '  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
                '</IfModule>',
            );
        }
        if (cacheStaticAssets) {
            lines.push(
                '<IfModule mod_expires.c>',
                '  ExpiresActive On',
                '  ExpiresByType text/css "access plus 30 days"',
                '  ExpiresByType application/javascript "access plus 30 days"',
                '  ExpiresByType image/jpeg "access plus 180 days"',
                '  ExpiresByType image/png "access plus 180 days"',
                '  ExpiresByType image/webp "access plus 180 days"',
                '</IfModule>',
            );
        }
        if (blockHotlinking) {
            lines.push(
                'RewriteCond %{HTTP_REFERER} !^$ [NC]',
                'RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?your-domain\\.com [NC]',
                'RewriteRule \\.(jpg|jpeg|png|gif|webp)$ - [F,NC,L]',
            );
        }
        if (errorDocument404.trim()) {
            lines.push(`ErrorDocument 404 ${errorDocument404.trim()}`);
        }
        return lines.join('\n');
    }, [blockHotlinking, cacheStaticAssets, disableListing, errorDocument404, forceHttps, gzip, removeWww, securityHeaders]);

    const enabledRules = [
        forceHttps,
        removeWww,
        gzip,
        disableListing,
        securityHeaders,
        cacheStaticAssets,
        blockHotlinking,
        Boolean(errorDocument404.trim()),
    ].filter(Boolean).length;

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <label><input type="checkbox" checked={forceHttps} onChange={(e) => setForceHttps(e.target.checked)} className="mr-2" />Force HTTPS</label>
                    <label><input type="checkbox" checked={removeWww} onChange={(e) => setRemoveWww(e.target.checked)} className="mr-2" />Redirect www to apex</label>
                    <label><input type="checkbox" checked={gzip} onChange={(e) => setGzip(e.target.checked)} className="mr-2" />Enable gzip</label>
                    <label><input type="checkbox" checked={disableListing} onChange={(e) => setDisableListing(e.target.checked)} className="mr-2" />Disable directory listing</label>
                    <label><input type="checkbox" checked={securityHeaders} onChange={(e) => setSecurityHeaders(e.target.checked)} className="mr-2" />Security headers</label>
                    <label><input type="checkbox" checked={cacheStaticAssets} onChange={(e) => setCacheStaticAssets(e.target.checked)} className="mr-2" />Cache static assets</label>
                    <label><input type="checkbox" checked={blockHotlinking} onChange={(e) => setBlockHotlinking(e.target.checked)} className="mr-2" />Block image hotlinking</label>
                </div>
                <label className="text-sm">
                    <SectionLabel>Custom 404 Path</SectionLabel>
                    <input value={errorDocument404} onChange={(e) => setErrorDocument404(e.target.value)} className={inputClass} placeholder="/404.html" />
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                    <p>Enabled rules: {enabledRules}</p>
                    <p>Tip: replace <code>your-domain.com</code> in hotlinking rule before production use.</p>
                </div>
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function RobotsTxtGeneratorTool() {
    const [disallow, setDisallow] = useState('/admin\n/private');
    const [allow, setAllow] = useState('/');
    const [sitemap, setSitemap] = useState('https://wayantisna.com/sitemap.xml');
    const [crawlDelay, setCrawlDelay] = useState('5');

    const output = useMemo(() => {
        const disallowLines = disallow
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => `Disallow: ${item}`);
        const allowLines = allow
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => `Allow: ${item}`);
        return ['User-agent: *', ...allowLines, ...disallowLines, crawlDelay ? `Crawl-delay: ${crawlDelay}` : '', sitemap ? `Sitemap: ${sitemap}` : '']
            .filter(Boolean)
            .join('\n');
    }, [allow, crawlDelay, disallow, sitemap]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Allow Paths</SectionLabel>
                        <textarea value={allow} onChange={(e) => setAllow(e.target.value)} className={`${textAreaClass} h-24`} placeholder="Allow paths, one per line" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Disallow Paths</SectionLabel>
                        <textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} className={`${textAreaClass} h-24`} placeholder="Disallow paths, one per line" />
                    </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        <SectionLabel>Crawl Delay</SectionLabel>
                        <input value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)} className={inputClass} placeholder="Crawl delay" />
                    </label>
                    <label className="text-sm">
                        <SectionLabel>Sitemap URL</SectionLabel>
                        <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} className={inputClass} placeholder="Sitemap URL" />
                    </label>
                </div>
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}

export function GitignoreGeneratorTool() {
    const [node, setNode] = useState(true);
    const [next, setNext] = useState(true);
    const [laravel, setLaravel] = useState(false);
    const [python, setPython] = useState(false);
    const [docker, setDocker] = useState(true);

    const output = useMemo(() => {
        const rows = new Set<string>();
        if (node) gitignoreTemplates.node.forEach((item) => rows.add(item));
        if (next) gitignoreTemplates.next.forEach((item) => rows.add(item));
        if (laravel) gitignoreTemplates.laravel.forEach((item) => rows.add(item));
        if (python) gitignoreTemplates.python.forEach((item) => rows.add(item));
        if (docker) gitignoreTemplates.docker.forEach((item) => rows.add(item));
        return Array.from(rows).sort().join('\n');
    }, [docker, laravel, next, node, python]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <label><input type="checkbox" checked={node} onChange={(e) => setNode(e.target.checked)} className="mr-2" />Node.js</label>
                    <label><input type="checkbox" checked={next} onChange={(e) => setNext(e.target.checked)} className="mr-2" />Next.js</label>
                    <label><input type="checkbox" checked={laravel} onChange={(e) => setLaravel(e.target.checked)} className="mr-2" />Laravel</label>
                    <label><input type="checkbox" checked={python} onChange={(e) => setPython(e.target.checked)} className="mr-2" />Python</label>
                    <label><input type="checkbox" checked={docker} onChange={(e) => setDocker(e.target.checked)} className="mr-2" />Docker</label>
                </div>
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">{output}</pre>
                <CopyButton value={output} className={compactButtonClass} />
            </div>
        </ToolCard>
    );
}
