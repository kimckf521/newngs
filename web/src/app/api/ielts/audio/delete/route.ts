import { type NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured, query } from '@/lib/db/pg';
import { cosConfigured, cosClient, cosDeleteObject, keyFromFileId } from '@/lib/ielts/cos';
import { withAudioLock } from '@/lib/ielts/audioLock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ielts/audio/delete  { book, test }
 *
 * Admin-gated. Removes every stored part (whole or 1–4) for one test from COS,
 * then drops the test entry from data->books->N->audio.
 */
export async function POST(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!dbConfigured() || !cosConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 501 });

  const body = (await req.json().catch(() => null)) as { book?: string | number; test?: string | number } | null;
  const book = String(body?.book ?? '').trim();
  const test = String(body?.test ?? '').trim();
  if (!book || !test) return NextResponse.json({ ok: false, error: 'bad_params' }, { status: 400 });

  // Same lock key/scope as /upload — see that route's comment. Ensures a
  // delete and an upload for the same test never interleave: whichever
  // request was RECEIVED first fully completes (COS + DB) before the other starts.
  await withAudioLock(`${book}|${test}`, async () => {
    // Read the fileIDs for this test so we can delete the COS objects.
    const rows = await query<{ parts: Record<string, string> | null }>(
      `SELECT data #> ARRAY['books', $1::text, 'audio', $2::text] AS parts FROM question_bank WHERE id = 'ielts'`,
      [book, test],
    );
    const parts = rows[0]?.parts;
    if (parts && Object.keys(parts).length) {
      try {
        const cos = await cosClient();
        await Promise.all(Object.values(parts).map((fileID) => cosDeleteObject(cos, keyFromFileId(fileID)).catch(() => {})));
      } catch (e) {
        // Object deletion is best-effort; still drop the DB reference so the UI is consistent.
        console.error('[ielts/audio/delete] cos delete failed', String(e).slice(0, 200));
      }
    }

    await query(
      `UPDATE question_bank
         SET data = data #- ARRAY['books', $1::text, 'audio', $2::text], updated_at = NOW()
       WHERE id = 'ielts'`,
      [book, test],
    );
  });

  return NextResponse.json({ ok: true, book, test });
}
