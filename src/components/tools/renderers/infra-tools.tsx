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
                    <input value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} placeholder="example.com or https://example.com" />
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

    const calc = useMemo(() => {
        const computeCost = instances * hoursPerMonth * computeRate;
        const storageCost = storageGb * storageRate;
        const egressCost = egressGb * egressRate;
        const subtotal = computeCost + storageCost + egressCost;
        const discounted = subtotal * (1 - discount / 100);
        return { computeCost, storageCost, egressCost, subtotal, total: discounted };
    }, [computeRate, discount, egressGb, egressRate, hoursPerMonth, instances, storageGb, storageRate]);

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
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                    <p>Compute: ${calc.computeCost.toFixed(2)}</p>
                    <p>Storage: ${calc.storageCost.toFixed(2)}</p>
                    <p>Egress: ${calc.egressCost.toFixed(2)}</p>
                    <p className="mt-1 font-semibold">Estimated Monthly Total: ${calc.total.toFixed(2)}</p>
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
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to run load test',
        details: ['This tool sends requests via server-side proxy with timeout handling.'],
    });

    const onRun = async () => {
        setRunning(true);
        setProgress(0);
        try {
            const total = Math.max(1, Math.min(300, requests));
            const workers = Math.max(1, Math.min(20, concurrency));
            const parsedHeaders = parseHeadersInput(headersText);

            let cursor = 0;
            let done = 0;
            let success = 0;
            let failed = 0;
            const latencies: number[] = [];

            const runWorker = async () => {
                while (true) {
                    const index = cursor;
                    cursor += 1;
                    if (index >= total) break;
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
                        const data = (await response.json()) as { ok?: boolean };
                        if (response.ok && data.ok) success += 1;
                        else failed += 1;
                    } catch {
                        failed += 1;
                    } finally {
                        const elapsed = performance.now() - started;
                        latencies.push(elapsed);
                        done += 1;
                        setProgress(Math.round((done / total) * 100));
                    }
                }
            };

            await Promise.all(Array.from({ length: workers }, runWorker));
            const avg = latencies.length ? latencies.reduce((sum, v) => sum + v, 0) / latencies.length : 0;

            setReport({
                level: failed > 0 ? 'warning' : 'valid',
                title: 'Load test completed',
                details: [
                    `Total requests: ${total}`,
                    `Success: ${success}`,
                    `Failed: ${failed}`,
                    `Avg latency: ${avg.toFixed(1)} ms`,
                    `P50: ${percentile(latencies, 50).toFixed(1)} ms`,
                    `P95: ${percentile(latencies, 95).toFixed(1)} ms`,
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
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <textarea value={headersText} onChange={(e) => setHeadersText(e.target.value)} className={`${textAreaClass} h-28`} placeholder='Headers JSON' />
                    <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Request body (for POST)" />
                </div>

                <Button size="sm" className={compactButtonClass} onClick={onRun} disabled={running}>
                    <Rocket className="h-3.5 w-3.5" />
                    {running ? `Running ${progress}%` : 'Run Load Test'}
                </Button>

                <ReportBox report={report} />
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
                <textarea value={sql} onChange={(e) => setSql(e.target.value)} className={`${textAreaClass} h-40`} />
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
                    <input value={nodeVersion} onChange={(e) => setNodeVersion(e.target.value)} className={inputClass} placeholder="Node version" />
                    <input value={installCommand} onChange={(e) => setInstallCommand(e.target.value)} className={inputClass} placeholder="Install command" />
                    <input value={testCommand} onChange={(e) => setTestCommand(e.target.value)} className={inputClass} placeholder="Test command" />
                    <input value={deployCommand} onChange={(e) => setDeployCommand(e.target.value)} className={inputClass} placeholder="Deploy command" />
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
                    <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} placeholder="Project name" />
                    <input value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="App image" />
                    <input type="number" value={appPort} onChange={(e) => setAppPort(Number(e.target.value))} className={inputClass} />
                    <select value={dbType} onChange={(e) => setDbType(e.target.value as typeof dbType)} className={inputClass}>
                        <option value="none">No DB</option>
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                    </select>
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

    const output = useMemo(
        () => `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\nspec:\n  replicas: ${replicas}\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n    metadata:\n      labels:\n        app: ${name}\n    spec:\n      containers:\n        - name: ${name}\n          image: ${image}\n          ports:\n            - containerPort: ${containerPort}\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}\nspec:\n  selector:\n    app: ${name}\n  type: ${serviceType}\n  ports:\n    - port: ${servicePort}\n      targetPort: ${containerPort}`,
        [containerPort, image, name, replicas, servicePort, serviceType],
    );

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="App name" />
                    <input value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="Container image" />
                    <input type="number" value={replicas} onChange={(e) => setReplicas(Number(e.target.value))} className={inputClass} />
                    <input type="number" value={containerPort} onChange={(e) => setContainerPort(Number(e.target.value))} className={inputClass} />
                    <input type="number" value={servicePort} onChange={(e) => setServicePort(Number(e.target.value))} className={inputClass} />
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value as typeof serviceType)} className={inputClass}>
                        <option value="ClusterIP">ClusterIP</option>
                        <option value="LoadBalancer">LoadBalancer</option>
                        <option value="NodePort">NodePort</option>
                    </select>
                </div>
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
                    <select value={operation} onChange={(e) => setOperation(e.target.value as typeof operation)} className={inputClass}>
                        <option value="query">query</option>
                        <option value="mutation">mutation</option>
                    </select>
                    <input value={operationName} onChange={(e) => setOperationName(e.target.value)} className={inputClass} placeholder="Operation name" />
                    <input value={variableDefs} onChange={(e) => setVariableDefs(e.target.value)} className={inputClass} placeholder="Variable defs" />
                    <input value={rootField} onChange={(e) => setRootField(e.target.value)} className={inputClass} placeholder="Root field" />
                </div>
                <input value={argumentsText} onChange={(e) => setArgumentsText(e.target.value)} className={inputClass} placeholder="Arguments" />
                <textarea value={fields} onChange={(e) => setFields(e.target.value)} className={`${textAreaClass} h-32`} placeholder="Field selection, one per line" />
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
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to test webhook',
        details: ['Configure URL/method/body and send request via server proxy.'],
    });
    const [responsePreview, setResponsePreview] = useState('');

    const onSend = async () => {
        setLoading(true);
        try {
            const parsedHeaders = parseHeadersInput(headersText);
            const response = await fetch('/api/tools/webhook-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, method, headers: parsedHeaders, body: bodyText }),
            });
            const data = (await response.json()) as Record<string, unknown>;
            if (!response.ok) throw new Error(String(data.error ?? 'Webhook request failed.'));

            setResponsePreview(String(data.responseBodyPreview ?? ''));
            setReport({
                level: data.ok ? 'valid' : 'warning',
                title: `Webhook response: ${data.status ?? '-'} ${String(data.statusText ?? '')}`,
                details: [
                    `Elapsed: ${String(data.elapsedMs ?? '-')} ms`,
                    `Body bytes: ${String(data.responseBodyBytes ?? '-')}`,
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
                    <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://your-webhook-endpoint" />
                    <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className={inputClass}>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <textarea value={headersText} onChange={(e) => setHeadersText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Headers JSON" />
                    <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className={`${textAreaClass} h-28`} placeholder="Body" />
                </div>

                <Button size="sm" className={compactButtonClass} onClick={onSend} disabled={loading}>
                    <Webhook className="h-3.5 w-3.5" />
                    {loading ? 'Sending...' : 'Send Webhook'}
                </Button>
                <ReportBox report={report} />
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
};

export function OpenApiSwaggerEditorTool() {
    const [source, setSource] = useState('{\n  "openapi": "3.0.0",\n  "info": { "title": "Demo API", "version": "1.0.0" },\n  "paths": {\n    "/users/{id}": {\n      "get": { "summary": "Get user" }\n    }\n  }\n}');
    const [report, setReport] = useState<ReportState>({
        level: 'idle',
        title: 'Ready to parse OpenAPI',
        details: ['Paste OpenAPI JSON and click analyze.'],
    });
    const [endpoints, setEndpoints] = useState<OpenApiEndpoint[]>([]);
    const [curlSnippet, setCurlSnippet] = useState('');

    const onAnalyze = () => {
        try {
            const doc = JSON.parse(source) as {
                openapi?: string;
                info?: { title?: string; version?: string };
                paths?: Record<string, Record<string, { summary?: string }>>;
            };

            const items: OpenApiEndpoint[] = [];
            Object.entries(doc.paths ?? {}).forEach(([path, methods]) => {
                Object.entries(methods ?? {}).forEach(([method, meta]) => {
                    items.push({
                        path,
                        method: method.toUpperCase(),
                        summary: meta?.summary ?? '',
                    });
                });
            });

            setEndpoints(items);
            if (items[0]) {
                setCurlSnippet(`curl -X ${items[0].method} https://api.example.com${items[0].path} -H "Authorization: Bearer <token>"`);
            } else {
                setCurlSnippet('');
            }

            setReport({
                level: 'valid',
                title: 'OpenAPI parsed successfully',
                details: [
                    `Spec version: ${doc.openapi ?? 'n/a'}`,
                    `Title: ${doc.info?.title ?? 'n/a'}`,
                    `Endpoints: ${items.length}`,
                ],
            });
        } catch (error) {
            setEndpoints([]);
            setCurlSnippet('');
            setReport({
                level: 'error',
                title: 'OpenAPI parse failed',
                details: [error instanceof Error ? error.message : 'Invalid JSON format'],
            });
        }
    };

    return (
        <ToolCard>
            <div className="space-y-4">
                <textarea value={source} onChange={(e) => setSource(e.target.value)} className={`${textAreaClass} h-48`} />
                <Button size="sm" className={compactButtonClass} onClick={onAnalyze}>
                    <Search className="h-3.5 w-3.5" />
                    Analyze OpenAPI
                </Button>
                <ReportBox report={report} />

                {endpoints.length > 0 ? (
                    <div className="space-y-2">
                        <SectionLabel>Endpoints</SectionLabel>
                        <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-2 py-2">Method</th>
                                        <th className="px-2 py-2">Path</th>
                                        <th className="px-2 py-2">Summary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpoints.map((item) => (
                                        <tr key={`${item.method}-${item.path}`} className="border-t border-slate-200 dark:border-slate-700">
                                            <td className="px-2 py-1.5">{item.method}</td>
                                            <td className="px-2 py-1.5">{item.path}</td>
                                            <td className="px-2 py-1.5">{item.summary || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
        return lines.join('\n');
    }, [disableListing, forceHttps, gzip, removeWww]);

    return (
        <ToolCard>
            <div className="space-y-4">
                <div className="grid gap-2 text-sm">
                    <label><input type="checkbox" checked={forceHttps} onChange={(e) => setForceHttps(e.target.checked)} className="mr-2" />Force HTTPS</label>
                    <label><input type="checkbox" checked={removeWww} onChange={(e) => setRemoveWww(e.target.checked)} className="mr-2" />Redirect www to apex</label>
                    <label><input type="checkbox" checked={gzip} onChange={(e) => setGzip(e.target.checked)} className="mr-2" />Enable gzip</label>
                    <label><input type="checkbox" checked={disableListing} onChange={(e) => setDisableListing(e.target.checked)} className="mr-2" />Disable directory listing</label>
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
                    <textarea value={allow} onChange={(e) => setAllow(e.target.value)} className={`${textAreaClass} h-24`} placeholder="Allow paths, one per line" />
                    <textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} className={`${textAreaClass} h-24`} placeholder="Disallow paths, one per line" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <input value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)} className={inputClass} placeholder="Crawl delay" />
                    <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} className={inputClass} placeholder="Sitemap URL" />
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
