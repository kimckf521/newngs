import { NextResponse } from 'next/server';

// Lightweight liveness probe for Nginx / PM2 / uptime monitors. Returns 200
// with a tiny payload as long as the Node process is responsive. Does not
// touch SMTP, the filesystem, or any external service — that's a separate
// concern (a /readyz endpoint would be the place to add SMTP verify, etc).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
