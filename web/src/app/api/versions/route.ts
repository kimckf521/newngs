import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import { listVersions, getVersionData, type VersionKind } from '@/lib/versions/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Version history (PostgreSQL-backed), admin-gated.
 *  - GET ?kind=&refId=  → list of snapshots (metadata only) for an entity.
 *  - GET ?id=           → one snapshot's full data (for restore/preview).
 * Reports `configured:false` when no DATABASE_URL so the client uses its
 * localStorage trial history instead.
 */

const KINDS = new Set<VersionKind>(['course', 'ielts_module']);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (!dbConfigured()) return NextResponse.json({ ok: true, configured: false, versions: [], data: null });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const id = sp.get('id');
  if (id) {
    try {
      return NextResponse.json({ ok: true, configured: true, data: await getVersionData(id) });
    } catch {
      return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
    }
  }

  const kind = sp.get('kind') as VersionKind | null;
  const refId = sp.get('refId');
  if (!kind || !KINDS.has(kind) || !refId) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  try {
    return NextResponse.json({ ok: true, configured: true, versions: await listVersions(kind, refId) });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
