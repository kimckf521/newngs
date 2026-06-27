import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * TEMP diagnostic — surfaces WHY a Postgres connection fails, without leaking
 * secrets (no host, no user, no password — only the kind of host and the kind
 * of error). Remove once the Vercel→Postgres connection is sorted.
 */
function hostKind(): string {
  const url = process.env.DATABASE_URL || '';
  try {
    const h = new URL(url).hostname;
    if (/^(172\.|10\.|192\.168\.|127\.)/.test(h)) return 'internal-ip (Vercel cannot reach this!)';
    return 'external';
  } catch {
    return url ? 'unparseable' : 'unset';
  }
}

function errorKind(e: unknown): string {
  const msg = (e as Error)?.message || '';
  const code = (e as { code?: string })?.code || '';
  const blob = `${msg} ${code}`;
  if (/SSL|encryption/i.test(blob)) return 'SSL — endpoint does not support TLS → set PGSSL=0';
  if (/ETIMEDOUT|timeout|ECONNREFUSED/i.test(blob)) return 'TIMEOUT/REFUSED — DB whitelist is blocking Vercel (allow 0.0.0.0/0) or wrong host';
  if (/ENOTFOUND|getaddrinfo/i.test(blob)) return 'DNS — host is wrong/unreachable';
  if (/password|authentication|does not exist/i.test(blob)) return 'AUTH — wrong user/password/db name';
  return `OTHER — code=${code || '?'}`;
}

export async function GET() {
  const base = {
    configured: Boolean(process.env.DATABASE_URL),
    pgssl: process.env.PGSSL ?? '(unset)',
    hostKind: hostKind(),
    nodeEnv: process.env.NODE_ENV,
  };
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, ...base });
  try {
    const { query } = await import('@/lib/db/pg');
    await query('SELECT 1');
    return NextResponse.json({ ok: true, ...base });
  } catch (e) {
    return NextResponse.json({ ok: false, ...base, cause: errorKind(e) });
  }
}
