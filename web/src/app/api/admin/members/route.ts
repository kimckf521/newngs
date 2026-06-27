import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { membersConfigured, listMembers, setMemberRole } from '@/lib/admin/membersStore';
import { isRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin member management, gated by ADMIN_API_KEY (sent as `x-admin-key`) — see
 * lib/admin/apiAuth. Members are read from / written to the `app_users`
 * PostgreSQL table via membersStore.
 */

/** List all members (from `app_users`). */
export async function GET(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  try {
    return NextResponse.json({ ok: true, members: await listMembers() });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

/** Change a member's role (incl. promote/demote admin). */
export async function PATCH(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as { uid?: unknown; role?: unknown } | null;
  const uid = String(body?.uid ?? '');
  const role = body?.role;
  if (!uid || !isRole(role)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await setMemberRole(uid, role);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
