import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import { getPageDoc, savePage } from '@/lib/puck/serverStore';
import type { PuckData } from '@/lib/puck/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Page-builder (Puck) persistence API, backed by PostgreSQL.
 *  - GET ?route=&locale=  → load the page doc (draft + published) for the editor.
 *  - POST {route, locale, draft?, published?} → upsert (draft save / publish).
 * Both are key-gated (admin). Without DATABASE_URL it reports not_configured and
 * the editor falls back to its localStorage trial store.
 */
function localeOf(v: string | null | undefined): 'zh' | 'en' {
  return v === 'en' ? 'en' : 'zh';
}

export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const route = req.nextUrl.searchParams.get('route') || '';
  const locale = localeOf(req.nextUrl.searchParams.get('locale'));
  if (!route) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, doc: await getPageDoc(route, locale) });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { route?: unknown; locale?: unknown; draft?: PuckData; published?: PuckData }
    | null;
  const route = String(body?.route ?? '');
  const locale = localeOf(typeof body?.locale === 'string' ? body.locale : undefined);
  if (!route) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  // `!= null` keeps both omitted AND explicit-null out of the patch, so savePage
  // only ever writes real trees and COALESCE preserves the untouched column.
  const patch: { draft?: PuckData; published?: PuckData } = {};
  if (body?.draft != null) patch.draft = body.draft;
  if (body?.published != null) patch.published = body.published;
  if (patch.draft === undefined && patch.published === undefined) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  try {
    await savePage(route, locale, patch);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
