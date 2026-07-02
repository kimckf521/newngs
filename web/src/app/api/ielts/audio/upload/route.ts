import { type NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured, query } from '@/lib/db/pg';
import { cosConfigured, cosClient, cosUploadFile, fileIdForKey, normalizeExt, wholeTestKey } from '@/lib/ielts/cos';
import { withAudioLock } from '@/lib/ielts/audioLock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // slow ap-shanghai link — allow long uploads

/**
 * POST /api/ielts/audio/upload?book=N&test=T&ext=mp3
 *
 * Body: the raw audio file bytes (Content-Type audio/*). Admin-gated.
 * Streams the body to a temp file, uploads it to COS as the WHOLE-test
 * listening file, and records the fileID at data->books->N->audio->T->whole.
 * The browser tracks progress via XHR upload events (this leg is the bottleneck
 * on the production server, which sits next to the COS region).
 */
export async function POST(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!dbConfigured() || !cosConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 501 });

  const sp = req.nextUrl.searchParams;
  const book = (sp.get('book') || '').trim();
  const test = (sp.get('test') || '').trim();
  const ext = normalizeExt(sp.get('ext'));

  const bookN = Number(book);
  const testN = Number(test);
  if (!Number.isInteger(bookN) || bookN < 1 || bookN > 99 || !Number.isInteger(testN) || testN < 1 || testN > 4) {
    return NextResponse.json({ ok: false, error: 'bad_params' }, { status: 400 });
  }
  if (!req.body) return NextResponse.json({ ok: false, error: 'no_body' }, { status: 400 });

  const tmp = path.join(os.tmpdir(), `ielts-audio-${book}-${test}-${process.hrtime.bigint()}.${ext}`);
  try {
    // Stream the upload to disk (no full-file buffering in memory).
    await pipeline(Readable.fromWeb(req.body as unknown as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(tmp));

    const key = wholeTestKey(book, test, ext);
    const fileID = fileIdForKey(key);

    // Lock the (book,test) slot for the COS upload + DB write. Both this route
    // and /delete do a slow COS round-trip before their DB write — without this,
    // a delete-then-reupload (or vice versa) on the same test can complete out
    // of order and the LAST DB write silently wins, undoing the other operation.
    await withAudioLock(`${book}|${test}`, async () => {
      const cos = await cosClient();
      await cosUploadFile(cos, key, tmp);

      // Merge into the JSONB. One statement on one row → concurrency-safe under
      // READ COMMITTED (a blocked concurrent write re-evaluates against the
      // committed row, preserving sibling tests). The inner jsonb_set guarantees
      // the `audio` object exists before we set the test key.
      await query(
        `UPDATE question_bank
           SET data = jsonb_set(
                 jsonb_set(
                   data,
                   ARRAY['books', $1::text, 'audio'],
                   COALESCE(data #> ARRAY['books', $1::text, 'audio'], '{}'::jsonb),
                   true
                 ),
                 ARRAY['books', $1::text, 'audio', $2::text],
                 $3::jsonb,
                 true
               ),
               updated_at = NOW()
         WHERE id = 'ielts'`,
        [book, test, JSON.stringify({ whole: fileID })],
      );
    });

    return NextResponse.json({ ok: true, book, test, fileID });
  } catch (e) {
    console.error('[ielts/audio/upload] failed', String(e).slice(0, 300));
    return NextResponse.json({ ok: false, error: 'upload_failed' }, { status: 502 });
  } finally {
    void unlink(tmp).catch(() => {});
  }
}
