import 'server-only';
import crypto from 'node:crypto';

/**
 * iFlytek TTS → MP3, with two engines behind one entry point:
 *   • classic 在线语音合成  wss://tts-api.xfyun.cn/v2/tts          (Laura/Catherine …)
 *   • 超拟人 (large-model)  wss://cbm01.cn-huabei-1.xf-yun.com/...  (x5_* voices, e.g. Grant/Lila)
 * Voices whose id starts with "x5" route to the 超拟人 endpoint; everything else
 * uses the classic endpoint. Both share the SAME HMAC-SHA256 handshake as the
 * ISE client (iflytekIse.ts) — only host/path differ — and the same
 * IFLYTEK_APPID/_API_KEY/_API_SECRET. The 超拟人 resource id (the last path
 * segment) is account-specific; override via IFLYTEK_TTS_X5_RESID if needed.
 */

const CLASSIC_HOST = 'tts-api.xfyun.cn';
const CLASSIC_PATH = '/v2/tts';
const X5_HOST = 'cbm01.cn-huabei-1.xf-yun.com';
const X5_PATH = `/v1/private/${process.env.IFLYTEK_TTS_X5_RESID || 'mcd9m97e6'}`;
const DEFAULT_VCN = process.env.IFLYTEK_TTS_VCN || 'x4_EnUs_Laura_education';

export function ttsConfigured(): boolean {
  return Boolean(process.env.IFLYTEK_APPID && process.env.IFLYTEK_API_KEY && process.env.IFLYTEK_API_SECRET);
}

function signedUrl(host: string, path: string): string {
  const date = new Date().toUTCString(); // RFC1123 GMT
  const origin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const sig = crypto.createHmac('sha256', process.env.IFLYTEK_API_SECRET!).update(origin).digest('base64');
  const authOrigin = `api_key="${process.env.IFLYTEK_API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${sig}"`;
  const authorization = Buffer.from(authOrigin).toString('base64');
  const u = new URL(`wss://${host}${path}`);
  u.searchParams.set('authorization', authorization);
  u.searchParams.set('date', date);
  u.searchParams.set('host', host);
  return u.toString();
}

export type TtsResult = { mp3: Buffer } | { error: string };

const openWs = (url: string): any => {
  const WS = (globalThis as unknown as { WebSocket?: new (url: string) => unknown }).WebSocket;
  return WS ? new (WS as any)(url) : null;
};

/** classic 在线语音合成 — single request, aue=lame → MP3 */
function synthClassic(appId: string, text: string, vcn: string): Promise<TtsResult> {
  return new Promise((resolve) => {
    let settled = false;
    const ws = openWs(signedUrl(CLASSIC_HOST, CLASSIC_PATH));
    if (!ws) return resolve({ error: 'no_websocket' });
    const parts: Buffer[] = [];
    const finish = (v: TtsResult) => { if (settled) return; settled = true; clearTimeout(timer); try { ws.close(); } catch { /* noop */ } resolve(v); };
    const timer = setTimeout(() => finish({ error: 'timeout' }), 20000);
    ws.onerror = (ev: { message?: string }) => finish({ error: `ws_error:${ev?.message ?? ''}`.slice(0, 80) });
    ws.onclose = () => { if (!settled) finish({ error: 'closed_early' }); };
    ws.onopen = () => ws.send(JSON.stringify({
      common: { app_id: appId },
      business: { aue: 'lame', sfl: 1, auf: 'audio/L16;rate=16000', vcn, tte: 'UTF8', speed: 62, volume: 50, pitch: 50 },
      data: { status: 2, text: Buffer.from(text, 'utf8').toString('base64') },
    }));
    ws.onmessage = (ev: { data: string | Buffer }) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        if (typeof msg.code === 'number' && msg.code !== 0) return finish({ error: `iflytek_${msg.code}:${(msg.message || '').toString().slice(0, 60)}` });
        if (msg.data?.audio) parts.push(Buffer.from(msg.data.audio, 'base64'));
        if (msg.data?.status === 2) finish(parts.length ? { mp3: Buffer.concat(parts) } : { error: 'no_audio' });
      } catch { /* partial */ }
    };
  });
}

/** 超拟人 (large-model) — header/parameter/payload frame, encoding=lame → MP3 */
function synthX5(appId: string, text: string, vcn: string): Promise<TtsResult> {
  return new Promise((resolve) => {
    let settled = false;
    const ws = openWs(signedUrl(X5_HOST, X5_PATH));
    if (!ws) return resolve({ error: 'no_websocket' });
    const parts: Buffer[] = [];
    const finish = (v: TtsResult) => { if (settled) return; settled = true; clearTimeout(timer); try { ws.close(); } catch { /* noop */ } resolve(v); };
    const timer = setTimeout(() => finish({ error: 'timeout' }), 20000);
    ws.onerror = (ev: { message?: string }) => finish({ error: `ws_error:${ev?.message ?? ''}`.slice(0, 80) });
    ws.onclose = () => { if (!settled) finish({ error: 'closed_early' }); };
    ws.onopen = () => ws.send(JSON.stringify({
      header: { app_id: appId, status: 2 },
      parameter: {
        tts: {
          vcn, speed: 62, volume: 50, pitch: 50,
          audio: { encoding: 'lame', sample_rate: 16000, channels: 1, bit_depth: 16, frame_size: 0 },
        },
      },
      payload: {
        text: { encoding: 'utf8', compress: 'raw', format: 'plain', status: 2, seq: 0, text: Buffer.from(text, 'utf8').toString('base64') },
      },
    }));
    ws.onmessage = (ev: { data: string | Buffer }) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        const code = msg.header?.code;
        if (typeof code === 'number' && code !== 0) return finish({ error: `iflytek_${code}:${(msg.header?.message || '').toString().slice(0, 60)}` });
        const audio = msg.payload?.audio?.audio;
        if (audio) parts.push(Buffer.from(audio, 'base64'));
        if (msg.header?.status === 2 || msg.payload?.audio?.status === 2) finish(parts.length ? { mp3: Buffer.concat(parts) } : { error: 'no_audio' });
      } catch { /* partial */ }
    };
  });
}

/** Synthesize text → MP3. x5_* voices use 超拟人; others use classic. null when unconfigured. */
export async function synthesizeSpeech(text: string, vcn = DEFAULT_VCN): Promise<TtsResult | null> {
  if (!ttsConfigured()) return null;
  const t = text.trim().slice(0, 4000);
  if (!t) return { error: 'empty_text' };
  const appId = process.env.IFLYTEK_APPID!;
  return vcn.startsWith('x5') ? synthX5(appId, t, vcn) : synthClassic(appId, t, vcn);
}
