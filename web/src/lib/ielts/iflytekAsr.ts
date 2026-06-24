import 'server-only';
import crypto from 'node:crypto';
import { pcmFromWav } from './tencentAsr';

/**
 * iFlytek 语音听写 (IAT) English transcription — an alternative ASR backend to
 * Tencent SentenceRecognition, for A/B-testing accuracy on Chinese-accented
 * English. Reuses the EXACT HMAC-SHA256 WebSocket handshake as ISE/TTS (only
 * HOST/PATH differ) and the SAME IFLYTEK_APPID/_API_KEY/_API_SECRET — no new
 * credential. The 语音听写 service must be enabled on the app in the console;
 * English (en_us) is included by default.
 *
 * Takes a 16k mono WAV, streams its PCM in 1280-byte frames, assembles the
 * append-only en_us word segments (no wpgs/dynamic-correction for English).
 * Sessions cap at 60s, so long answers are split into ≤55s chunks.
 */

const HOST = 'iat-api.xfyun.cn';
const PATH = '/v2/iat';
const FRAME = 1280; // 40ms of 16k/16-bit mono PCM
const MAX_CHUNK = 16000 * 2 * 55; // ~55s per session (IAT hard limit is 60s)

export type IatResult = { transcript: string } | { error: string };

export function iatConfigured(): boolean {
  return Boolean(process.env.IFLYTEK_APPID && process.env.IFLYTEK_API_KEY && process.env.IFLYTEK_API_SECRET);
}

function signedUrl(): string {
  const date = new Date().toUTCString();
  const origin = `host: ${HOST}\ndate: ${date}\nGET ${PATH} HTTP/1.1`;
  const sig = crypto.createHmac('sha256', process.env.IFLYTEK_API_SECRET!).update(origin).digest('base64');
  const authOrigin = `api_key="${process.env.IFLYTEK_API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${sig}"`;
  const authorization = Buffer.from(authOrigin).toString('base64');
  const u = new URL(`wss://${HOST}${PATH}`);
  u.searchParams.set('authorization', authorization);
  u.searchParams.set('date', date);
  u.searchParams.set('host', HOST);
  return u.toString();
}

function transcribeChunk(appId: string, pcm: Buffer): Promise<IatResult> {
  return new Promise((resolve) => {
    const WS = (globalThis as unknown as { WebSocket?: new (url: string) => unknown }).WebSocket;
    if (!WS) return resolve({ error: 'no_websocket' });
    let settled = false;
    const ws: any = new (WS as any)(signedUrl());
    let text = '';
    const finish = (v: IatResult) => { if (settled) return; settled = true; clearTimeout(timer); try { ws.close(); } catch { /* noop */ } resolve(v); };
    const timer = setTimeout(() => finish({ transcript: text.trim() }), 30000);
    ws.onerror = (ev: { message?: string }) => finish(text ? { transcript: text.trim() } : { error: `ws_error:${ev?.message ?? ''}`.slice(0, 80) });
    ws.onclose = () => { if (!settled) finish(text ? { transcript: text.trim() } : { error: 'closed_early' }); };
    ws.onopen = async () => {
      try {
        let first = true;
        for (let off = 0; off < pcm.length; off += FRAME) {
          const chunk = pcm.subarray(off, Math.min(off + FRAME, pcm.length));
          const audio = Buffer.from(chunk).toString('base64');
          if (first) {
            ws.send(JSON.stringify({
              common: { app_id: appId },
              business: { language: 'en_us', domain: 'iat', accent: 'mandarin', vad_eos: 10000, ptt: 1, nunum: 1, vinfo: 0 },
              data: { status: 0, format: 'audio/L16;rate=16000', encoding: 'raw', audio },
            }));
            first = false;
          } else {
            ws.send(JSON.stringify({ data: { status: 1, format: 'audio/L16;rate=16000', encoding: 'raw', audio } }));
          }
          await new Promise((r) => setTimeout(r, 5));
        }
        ws.send(JSON.stringify({ data: { status: 2, format: 'audio/L16;rate=16000', encoding: 'raw', audio: '' } }));
      } catch {
        finish(text ? { transcript: text.trim() } : { error: 'send_failed' });
      }
    };
    ws.onmessage = (ev: { data: string | Buffer }) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        if (typeof msg.code === 'number' && msg.code !== 0) {
          return finish({ error: `iflytek_${msg.code}:${(msg.message || '').toString().slice(0, 60)}` });
        }
        const segs = msg.data?.result?.ws;
        if (Array.isArray(segs)) for (const seg of segs) for (const c of seg.cw || []) text += c.w || '';
        if (msg.data?.status === 2) finish({ transcript: text.trim() });
      } catch { /* partial */ }
    };
  });
}

/** Transcribe a 16k mono WAV via iFlytek IAT. Resolves null when unconfigured. */
export async function transcribeWavIflytek(wav: Buffer): Promise<IatResult | null> {
  if (!iatConfigured()) return null;
  const pcm = pcmFromWav(wav);
  if (!pcm || pcm.length < 3200) return { transcript: '' };
  const appId = process.env.IFLYTEK_APPID!;
  const parts: string[] = [];
  for (let off = 0; off < pcm.length; off += MAX_CHUNK) {
    const seg = Buffer.from(pcm.subarray(off, Math.min(off + MAX_CHUNK, pcm.length)));
    const r = await transcribeChunk(appId, seg);
    if ('error' in r) return parts.length ? { transcript: parts.join(' ').trim() } : r;
    if (r.transcript) parts.push(r.transcript);
  }
  return { transcript: parts.join(' ').trim() };
}
