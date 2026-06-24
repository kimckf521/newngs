import type { NextRequest } from 'next/server';
import { synthesizeSpeech, ttsConfigured } from '@/lib/ielts/iflytekTts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Synthesize an examiner line via iFlytek TTS → MP3 bytes. 501 when the iFlytek
// credentials aren't set so the client can fall back to browser speech.
export async function POST(req: NextRequest) {
  if (!ttsConfigured()) return Response.json({ error: 'not_configured' }, { status: 501 });
  let body: { text?: unknown; vcn?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text : '';
  if (!text.trim()) return Response.json({ error: 'no_text' }, { status: 400 });
  const vcn = typeof body.vcn === 'string' && body.vcn ? body.vcn : undefined;

  const r = await synthesizeSpeech(text, vcn);
  if (!r) return Response.json({ error: 'not_configured' }, { status: 501 });
  if ('error' in r) return Response.json({ error: r.error }, { status: 502 });
  return new Response(new Uint8Array(r.mp3), {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}
