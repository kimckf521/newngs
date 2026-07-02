import { type NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured, query } from '@/lib/db/pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/ielts/audio/status
 *
 * Admin-gated. Reports which tests already have listening audio, so the upload
 * panel can show the current state and offer per-test delete.
 * Response: { ok: true, books: { "15": { "1": 4, "2": 4 }, ... } }
 * where the value is the number of stored parts (whole = 1).
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 501 });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const rows = await query<{ books: Record<string, { audio?: Record<string, Record<string, string>> }> | null }>(
    `SELECT data->'books' AS books FROM question_bank WHERE id = 'ielts'`,
  );
  const books = rows[0]?.books || {};
  const out: Record<string, Record<string, number>> = {};
  for (const [book, entry] of Object.entries(books)) {
    const audio = entry?.audio;
    if (!audio) continue;
    const tests: Record<string, number> = {};
    for (const [test, parts] of Object.entries(audio)) {
      const n = parts && typeof parts === 'object' ? Object.keys(parts).length : 0;
      if (n > 0) tests[test] = n;
    }
    if (Object.keys(tests).length) out[book] = tests;
  }
  return NextResponse.json({ ok: true, books: out });
}
