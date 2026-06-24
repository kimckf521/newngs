import type { NextRequest } from 'next/server';
import { iseConfigured, scorePronunciation } from '@/lib/ielts/iflytekIse';
import { pcmFromWav } from '@/lib/ielts/tencentAsr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Body: { audioBase64: string (16k mono wav), text: string (reference transcript) }
export async function POST(req: NextRequest) {
  if (!iseConfigured()) return Response.json({ error: 'ise_not_configured' }, { status: 501 });
  let body: { audioBase64?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  if (!body.audioBase64 || !body.text) return Response.json({ error: 'missing_fields' }, { status: 400 });
  try {
    const pcm = pcmFromWav(Buffer.from(body.audioBase64, 'base64'));
    const score = await scorePronunciation(pcm, body.text);
    return Response.json({ score });
  } catch (e) {
    return Response.json({ error: 'ise_failed', detail: String(e).slice(0, 200) }, { status: 502 });
  }
}
