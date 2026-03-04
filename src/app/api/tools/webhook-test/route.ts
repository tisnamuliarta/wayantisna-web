import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface WebhookTestBody {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
}

const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

function sanitizeHeaders(input: Record<string, string> | undefined) {
    const out: Record<string, string> = {};
    if (!input) return out;

    Object.entries(input).forEach(([key, value]) => {
        const trimmedKey = key.trim();
        if (!trimmedKey) return;
        out[trimmedKey] = String(value ?? '');
    });
    return out;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as WebhookTestBody;
        const urlRaw = body.url?.trim();
        if (!urlRaw) {
            return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
        }

        const parsed = new URL(urlRaw);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed.' }, { status: 400 });
        }

        const method = (body.method ?? 'POST').toUpperCase();
        if (!allowedMethods.has(method)) {
            return NextResponse.json({ error: `Method ${method} is not allowed.` }, { status: 400 });
        }

        const headers = sanitizeHeaders(body.headers);
        const timeoutMs = Math.min(Math.max(body.timeoutMs ?? 12000, 1500), 30000);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const started = Date.now();
        const response = await fetch(parsed.toString(), {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : body.body ?? '',
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);

        const elapsedMs = Date.now() - started;
        const responseBody = await response.text();
        const responseHeaders = Object.fromEntries(response.headers.entries());

        return NextResponse.json({
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            elapsedMs,
            responseHeaders,
            responseBodyPreview: responseBody.slice(0, 10000),
            responseBodyBytes: new TextEncoder().encode(responseBody).length,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook test failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

