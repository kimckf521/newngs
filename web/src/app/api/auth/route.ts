import { NextResponse } from 'next/server';

/**
 * STUB AUTH ENDPOINT — no longer used by the UI.
 * ----------------------------------------------------------------------
 * Auth now goes through the CloudBase client SDK (see lib/auth.ts +
 * lib/cloudbase.ts), so the forms no longer call this route. It's kept only
 * as a placeholder in case a server-side auth path is needed later. It always
 * "succeeds" and performs NO real authentication.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: 'login' | 'register' | 'forgot';
    name?: string;
    email?: string;
  };

  const { action = 'login', name, email = '' } = body;

  // Simulate a little network latency so the loading states are visible.
  await new Promise((r) => setTimeout(r, 450));

  if (action === 'forgot') {
    return NextResponse.json({ ok: true });
  }

  const displayName = (name && name.trim()) || (email ? email.split('@')[0] : 'Member');
  return NextResponse.json({ ok: true, user: { name: displayName, email } });
}
