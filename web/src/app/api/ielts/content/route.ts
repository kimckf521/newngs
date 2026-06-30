import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import {
  getModuleOverride,
  listOverriddenModules,
  upsertModuleOverride,
  deleteModuleOverride,
} from '@/lib/ielts/contentStore';
import { MODULE_IDS } from '@/lib/ielts/builtinContent';
import type { Block, RichData, RichPage } from '@/lib/ielts/contentTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin-edited IELTS lesson content (PostgreSQL-backed).
 *  - GET ?modId=N  → PUBLIC: the override for one module, or null (the viewer
 *    falls back to the shipped default). Reports whether a DB is configured so
 *    the client knows to consult its localStorage trial store instead.
 *  - GET (no modId) → admin list of overridden module ids (key-gated).
 *  - POST {modId,data} → upsert one module's content (key-gated).
 *  - DELETE ?modId=N  → drop the override / reset to default (key-gated).
 * Without DATABASE_URL the route reports not_configured and the editor falls
 * back to its localStorage trial store.
 */

const VALID = new Set<string>(MODULE_IDS);

/** Validate + normalise an untrusted RichData payload. */
function parseRichData(body: unknown): RichData | null {
  const d = body as Partial<RichData> | null;
  if (!d || typeof d !== 'object' || !Array.isArray(d.pages)) return null;
  const pages: RichPage[] = d.pages
    .filter((p): p is RichPage => Boolean(p) && Array.isArray((p as RichPage).blocks))
    .map((p, i) => ({
      page: typeof p.page === 'number' ? p.page : i + 1,
      blocks: (p.blocks as Block[]).filter((b) => Boolean(b) && typeof (b as Block).t === 'string'),
    }));
  const pageTypes: Record<string, string | null> =
    d.pageTypes && typeof d.pageTypes === 'object' ? (d.pageTypes as Record<string, string | null>) : {};
  return { pageTypes, pages };
}

export async function GET(req: NextRequest) {
  const modId = req.nextUrl.searchParams.get('modId');
  if (modId) {
    if (!VALID.has(modId)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    if (!dbConfigured()) return NextResponse.json({ ok: true, configured: false, data: null });
    try {
      return NextResponse.json({ ok: true, configured: true, data: await getModuleOverride(modId) });
    } catch {
      return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
    }
  }
  // No modId → admin overview of which modules are customised.
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, modules: await listOverriddenModules() });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { modId?: string; data?: unknown; savedBy?: string } | null;
  const modId = body?.modId;
  if (!modId || !VALID.has(modId)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  const data = parseRichData(body?.data);
  if (!data) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await upsertModuleOverride(modId, data, typeof body?.savedBy === 'string' ? body.savedBy : null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const modId = req.nextUrl.searchParams.get('modId') || '';
  if (!VALID.has(modId)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await deleteModuleOverride(modId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
