import { realtimeAsrConfigured, signedRealtimeUrl } from '@/lib/ielts/tencentRealtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns a short-lived signed wss URL the browser uses to stream PCM straight
// to Tencent real-time ASR. The SecretKey never leaves the server. 501 when not
// configured so the client falls back to one-shot ASR.
export async function POST() {
  if (!realtimeAsrConfigured()) return Response.json({ error: 'not_configured' }, { status: 501 });
  const signed = signedRealtimeUrl();
  if (!signed) return Response.json({ error: 'not_configured' }, { status: 501 });
  return Response.json(signed, { headers: { 'Cache-Control': 'no-store' } });
}
