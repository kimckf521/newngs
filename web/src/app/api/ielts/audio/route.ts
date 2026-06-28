import { type NextRequest, NextResponse } from 'next/server';
import { dbConfigured, query } from '@/lib/db/pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENV_ID    = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID || process.env.TENCENTCLOUD_SECRETID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY;
// Signed URL TTL: 3 hours — enough to cover a full test + review session.
const URL_TTL_SECS = 3 * 60 * 60;

function cloudbaseConfigured() {
  return Boolean(ENV_ID && SECRET_ID && SECRET_KEY);
}

/**
 * GET /api/ielts/audio?book=N&test=T
 *
 * Returns signed CloudBase HTTPS URLs for the listening audio of one
 * IELTS test session.  The caller should pre-fetch at test start; URLs
 * are valid for 3 hours (long past the 40-minute listening section).
 *
 * Response for books 4-19 (per-part audio):
 *   { ok: true, parts: { "1": "https://...", "2": "...", "3": "...", "4": "..." } }
 *
 * Response for books 1-3 (single whole-test file):
 *   { ok: true, parts: { "whole": "https://..." } }
 *
 * 204 when audio is not yet uploaded (books without DB audio entries).
 * 501 when CloudBase or DB is not configured.
 * 503 when the signed-URL call fails.
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured() || !cloudbaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 501 });
  }

  const book = req.nextUrl.searchParams.get('book') || '';
  const test = req.nextUrl.searchParams.get('test') || '';
  if (!book || !test) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
  }

  // Fetch stored fileIDs from question_bank
  const rows = await query<{ audio: Record<string, Record<string, string>> | null }>(
    `SELECT data->'books'->$2->'audio' AS audio FROM question_bank WHERE id = $1`,
    ['ielts', book],
  );
  const audioMap = rows[0]?.audio;
  if (!audioMap) {
    return NextResponse.json({ ok: false, error: 'no_audio' }, { status: 404 });
  }

  const testParts = audioMap[test];
  if (!testParts || Object.keys(testParts).length === 0) {
    return NextResponse.json({ ok: false, error: 'test_not_found' }, { status: 404 });
  }

  // Convert cloud:// fileIDs → signed HTTPS URLs
  const fileIDs = Object.values(testParts);
  try {
    const mod: any = await import('@cloudbase/node-sdk');
    const cloudbase = mod.default ?? mod;
    const app = cloudbase.init({ env: ENV_ID, secretId: SECRET_ID, secretKey: SECRET_KEY });

    const result = await app.getTempFileURL({ fileList: fileIDs, maxAge: URL_TTL_SECS }) as { fileList?: { fileID: string; tempFileURL: string }[] };
    const urlByID: Record<string, string> = {};
    for (const item of result.fileList ?? []) {
      if (item.fileID && item.tempFileURL) urlByID[item.fileID] = item.tempFileURL;
    }

    // Rebuild the part map with URLs in place of fileIDs
    const parts: Record<string, string> = {};
    for (const [part, fileID] of Object.entries(testParts)) {
      parts[part] = urlByID[fileID] ?? '';
    }

    return NextResponse.json({ ok: true, parts });
  } catch (e) {
    console.error('[ielts/audio] getTempFileURL failed', String(e).slice(0, 200));
    return NextResponse.json({ ok: false, error: 'cloudbase_error' }, { status: 503 });
  }
}
