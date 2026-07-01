import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured } from '@/lib/db/pg';
import { getBankAccess } from '@/lib/questionBank/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PUBLIC student-facing access check: "may THIS user use THIS bank?"
 *   GET ?id=<bankId>&uid=<uid> → { ok, mode, canAccess }
 *
 * Used by the member-side gate/listing. Best-effort OPEN: when the DB is
 * unconfigured or a lookup fails, canAccess=true so a hiccup never locks a
 * student out of previously-open content. A bank left at the default `all` is
 * open to everyone (incl. logged-out) — only a `whitelist` bank gates access.
 * Returns only a boolean + the mode (no roster), so it's fine to leave public.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  const uid = req.nextUrl.searchParams.get('uid') || '';
  if (!id) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  if (!dbConfigured()) return NextResponse.json({ ok: true, mode: 'all', canAccess: true });
  try {
    const a = await getBankAccess(id);
    const canAccess = a.mode === 'all' || (uid ? a.students.includes(uid) : false);
    return NextResponse.json({ ok: true, mode: a.mode, canAccess });
  } catch {
    return NextResponse.json({ ok: true, mode: 'all', canAccess: true });
  }
}
