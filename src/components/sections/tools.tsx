'use client';

import { Button } from '@/components/ui/button';
import { Calculator, Cpu, Gauge, Server } from 'lucide-react';
import { useMemo, useState } from 'react';

type Precision = 'fp16' | 'int8' | 'int4';
type ModelKey = '7b' | '13b' | '34b' | '70b';

const modelMap: Record<ModelKey, { label: string; paramsInBillions: number }> = {
    '7b': { label: '7B', paramsInBillions: 7 },
    '13b': { label: '13B', paramsInBillions: 13 },
    '34b': { label: '34B', paramsInBillions: 34 },
    '70b': { label: '70B', paramsInBillions: 70 },
};

const precisionBytes: Record<Precision, number> = {
    fp16: 2,
    int8: 1,
    int4: 0.5,
};

export function ToolsSection() {
    const [model, setModel] = useState<ModelKey>('13b');
    const [precision, setPrecision] = useState<Precision>('int8');
    const [contextTokens, setContextTokens] = useState(8192);
    const [requestsPerMinute, setRequestsPerMinute] = useState(1200);
    const [avgLatencyMs, setAvgLatencyMs] = useState(350);
    const [workers, setWorkers] = useState(6);

    const llmResult = useMemo(() => {
        const params = modelMap[model].paramsInBillions * 1_000_000_000;
        const weightsGb = (params * precisionBytes[precision]) / (1024 ** 3);
        const kvCacheGb = (contextTokens / 2048) * 0.85;
        const runtimeOverheadGb = weightsGb * 0.2;
        const totalRequiredGb = weightsGb + kvCacheGb + runtimeOverheadGb;

        return {
            modelLabel: modelMap[model].label,
            weightsGb,
            kvCacheGb,
            totalRequiredGb,
            gpus40: Math.max(1, Math.ceil(totalRequiredGb / 40)),
            gpus80: Math.max(1, Math.ceil(totalRequiredGb / 80)),
        };
    }, [contextTokens, model, precision]);

    const apiResult = useMemo(() => {
        const requestsPerSecond = requestsPerMinute / 60;
        const theoreticalConcurrent = (requestsPerSecond * avgLatencyMs) / 1000;
        const safeConcurrent = Math.ceil(theoreticalConcurrent * 1.3);
        const workerCapacity = workers * 32;
        const utilization = Math.min(100, (safeConcurrent / workerCapacity) * 100);

        return {
            requestsPerSecond,
            safeConcurrent,
            workerCapacity,
            utilization,
        };
    }, [avgLatencyMs, requestsPerMinute, workers]);

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    Practical Engineering Tools
                </p>
                <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                    Interactive calculators for LLM infrastructure and API capacity planning
                </h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="rounded-xl bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
                            <Calculator className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">LLM Hardware Requirement Planner</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Estimate VRAM for model serving and deployment sizing.</p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                        {(Object.keys(modelMap) as ModelKey[]).map((key) => (
                            <Button
                                key={key}
                                onClick={() => setModel(key)}
                                variant={model === key ? 'default' : 'outline'}
                                className={model === key ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200' : ''}
                            >
                                {modelMap[key].label}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {(['fp16', 'int8', 'int4'] as Precision[]).map((item) => (
                            <Button
                                key={item}
                                onClick={() => setPrecision(item)}
                                variant={precision === item ? 'default' : 'outline'}
                                className={precision === item ? 'bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-400 dark:text-slate-900 dark:hover:bg-cyan-300' : ''}
                            >
                                {item.toUpperCase()}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-5">
                        <label htmlFor="context-tokens" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Context length: {contextTokens.toLocaleString()} tokens
                        </label>
                        <input
                            id="context-tokens"
                            type="range"
                            min={2048}
                            max={32768}
                            step={2048}
                            value={contextTokens}
                            onChange={(event) => setContextTokens(Number(event.target.value))}
                            className="w-full accent-cyan-700"
                        />
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Model and precision</span>
                            <strong className="text-slate-900 dark:text-slate-100">
                                {llmResult.modelLabel} / {precision.toUpperCase()}
                            </strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Weight memory</span>
                            <strong className="text-slate-900 dark:text-slate-100">{llmResult.weightsGb.toFixed(1)} GB</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">KV cache estimate</span>
                            <strong className="text-slate-900 dark:text-slate-100">{llmResult.kvCacheGb.toFixed(1)} GB</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Total required VRAM</span>
                            <strong className="text-cyan-700 dark:text-cyan-300">{llmResult.totalRequiredGb.toFixed(1)} GB</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">GPU recommendation</span>
                            <strong className="text-slate-900 dark:text-slate-100">
                                {llmResult.gpus40}x 40GB or {llmResult.gpus80}x 80GB
                            </strong>
                        </p>
                    </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="rounded-xl bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
                            <Server className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Capacity Estimator</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Plan worker count, concurrency, and safe utilization targets.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="rpm" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Requests per minute: {requestsPerMinute}
                            </label>
                            <input
                                id="rpm"
                                type="range"
                                min={60}
                                max={6000}
                                step={60}
                                value={requestsPerMinute}
                                onChange={(event) => setRequestsPerMinute(Number(event.target.value))}
                                className="w-full accent-amber-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="latency" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Average latency: {avgLatencyMs} ms
                            </label>
                            <input
                                id="latency"
                                type="range"
                                min={40}
                                max={1200}
                                step={10}
                                value={avgLatencyMs}
                                onChange={(event) => setAvgLatencyMs(Number(event.target.value))}
                                className="w-full accent-amber-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="workers" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Worker count: {workers}
                            </label>
                            <input
                                id="workers"
                                type="range"
                                min={2}
                                max={40}
                                step={1}
                                value={workers}
                                onChange={(event) => setWorkers(Number(event.target.value))}
                                className="w-full accent-amber-700"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Gauge className="h-4 w-4" />
                                Throughput
                            </span>
                            <strong className="text-slate-900 dark:text-slate-100">{apiResult.requestsPerSecond.toFixed(1)} req/s</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Cpu className="h-4 w-4" />
                                Safe concurrent load
                            </span>
                            <strong className="text-slate-900 dark:text-slate-100">{apiResult.safeConcurrent}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Estimated worker capacity</span>
                            <strong className="text-slate-900 dark:text-slate-100">{apiResult.workerCapacity}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Utilization target</span>
                            <strong className={apiResult.utilization > 80 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}>
                                {apiResult.utilization.toFixed(0)}%
                            </strong>
                        </p>
                    </div>
                </article>
            </div>
        </section>
    );
}
