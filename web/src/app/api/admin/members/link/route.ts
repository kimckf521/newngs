import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { membersConfigured } from '@/lib/admin/membersStore';
import { linkAccounts, unlinkAccount } from '@/lib/admin/accountLinks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Merge / un-merge member accounts (non-destructive linking), gated by
 * ADMIN_API_KEY (x-admin-key). See lib/admin/accountLinks.
 *
 * - POST   { primaryUid, secondaryUids[] } → link the secondaries into the primary
 * - DELETE { uid }                         → un-merge that account
 */
export async function POST(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as { primaryUid?: unknown; secondaryUids?: unknown } | null;
  const primaryUid = String(body?.primaryUid ?? '').trim();
  const secondaryUids = Array.isArray(body?.secondaryUids) ? body!.secondaryUids.map((s) => String(s ?? '').trim()).filter(Boolean) : [];
  if (!primaryUid || secondaryUids.length === 0) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  if (secondaryUids.every((s) => s === primaryUid)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await linkAccounts(primaryUid, secondaryUids);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!membersConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as { uid?: unknown } | null;
  const uid = String(body?.uid ?? '').trim();
  if (!uid) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await unlinkAccount(uid);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
