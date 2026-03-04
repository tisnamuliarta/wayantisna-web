import { NextResponse } from 'next/server';
import tls from 'node:tls';

export const runtime = 'nodejs';

interface SslCheckBody {
    target?: string;
    port?: number;
    timeoutMs?: number;
}

function parseTarget(target: string, fallbackPort?: number) {
    const trimmed = target.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname;
    const port = fallbackPort ?? (parsed.port ? Number(parsed.port) : 443);

    if (!host) {
        throw new Error('Invalid host.');
    }
    if (!Number.isFinite(port) || port <= 0 || port > 65535) {
        throw new Error('Invalid port.');
    }

    return { host, port };
}

function fetchCertificate(host: string, port: number, timeoutMs: number) {
    return new Promise<tls.PeerCertificate>((resolve, reject) => {
        const socket = tls.connect(
            {
                host,
                port,
                servername: host,
                rejectUnauthorized: false,
            },
            () => {
                try {
                    const cert = socket.getPeerCertificate();
                    socket.end();
                    if (!cert || Object.keys(cert).length === 0) {
                        reject(new Error('No certificate received from peer.'));
                        return;
                    }
                    resolve(cert);
                } catch (error) {
                    reject(error);
                }
            },
        );

        socket.setTimeout(timeoutMs, () => {
            socket.destroy(new Error('TLS connection timeout.'));
        });

        socket.once('error', (error) => {
            reject(error);
        });
    });
}

function toIsoIfDate(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SslCheckBody;
        const target = body.target?.trim();
        if (!target) {
            return NextResponse.json({ error: 'Target host is required.' }, { status: 400 });
        }

        const timeoutMs = Math.min(Math.max(body.timeoutMs ?? 8000, 1500), 20000);
        const { host, port } = parseTarget(target, body.port);
        const cert = await fetchCertificate(host, port, timeoutMs);

        const validFrom = toIsoIfDate(cert.valid_from);
        const validTo = toIsoIfDate(cert.valid_to);
        const expiryMs = validTo ? new Date(validTo).getTime() : null;
        const nowMs = Date.now();
        const daysUntilExpiry = expiryMs ? Math.ceil((expiryMs - nowMs) / (24 * 60 * 60 * 1000)) : null;

        return NextResponse.json({
            host,
            port,
            validFrom,
            validTo,
            daysUntilExpiry,
            isExpired: typeof daysUntilExpiry === 'number' ? daysUntilExpiry < 0 : null,
            subject: cert.subject ?? null,
            issuer: cert.issuer ?? null,
            serialNumber: cert.serialNumber ?? null,
            fingerprint256: cert.fingerprint256 ?? null,
            subjectAltName: cert.subjectaltname ?? null,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'SSL check failed.' },
            { status: 500 },
        );
    }
}
