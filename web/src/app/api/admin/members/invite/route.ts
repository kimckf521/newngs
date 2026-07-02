import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { membersConfigured } from '@/lib/admin/membersStore';
import { listInvites, createInvite, cancelInvite } from '@/lib/admin/invites';
import { isRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Member invites (pre-authorization), gated by ADMIN_API_KEY (x-admin-key).
 * See lib/admin/invites. CloudBase won't let us mint a login directly (username
 * signup is OTP-gated), so the admin pre-authorizes an email + role; the person
 * signs up their own way and inherits the role on first login.
 *
 * - GET    → { ok, invites }
 * - POST   { email, name?, role? } → create/update an invite
 * - DELETE { email }               → cancel an invite
 */
export async function GET(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  try {
    return NextResponse.json({ ok: true, invites: await listInvites() });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as { email?: unknown; name?: unknown; role?: unknown } | null;
  const email = String(body?.email ?? '').trim().toLowerCase();
  const name = body?.name ? String(body.name) : '';
  const role = isRole(body?.role) ? body!.role : 'student';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'bad_email' }, { status: 400 });
  }
  try {
    await createInvite(email, name, role);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = String(body?.email ?? '').trim();
  if (!email) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await cancelInvite(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
