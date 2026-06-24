import type { NextRequest } from 'next/server';
import { asrConfigured, transcribeWav } from '@/lib/ielts/tencentAsr';
import { iatConfigured, transcribeWavIflytek } from '@/lib/ielts/iflytekAsr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Accepts a 16kHz mono WAV in the raw request body (Content-Type audio/wav).
// ?provider=iflytek uses iFlytek 语音听写 (IAT); default is Tencent.
export async function POST(req: NextRequest) {
  const provider = new URL(req.url).searchParams.get('provider') === 'iflytek' ? 'iflytek' : 'tencent';
  const configured = provider === 'iflytek' ? iatConfigured() : asrConfigured();
  if (!configured) {
    return Response.json({ error: 'asr_not_configured', provider }, { status: 501 });
  }
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length < 1000) {
    return Response.json({ transcript: '', provider });
  }
  try {
    if (provider === 'iflytek') {
      const r = await transcribeWavIflytek(buf);
      if (!r) return Response.json({ error: 'asr_not_configured', provider }, { status: 501 });
      if ('error' in r) return Response.json({ error: r.error, provider }, { status: 502 });
      return Response.json({ transcript: r.transcript, provider });
    }
    const transcript = await transcribeWav(buf);
    return Response.json({ transcript, provider });
  } catch (e) {
    return Response.json({ error: 'asr_failed', detail: String(e).slice(0, 200), provider }, { status: 502 });
  }
}
