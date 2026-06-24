import 'server-only';
import crypto, { randomUUID } from 'node:crypto';

/**
 * Mints a short-lived SIGNED WebSocket URL for Tencent real-time ASR (实时语音识别
 * v2), so the browser can stream 16k PCM directly to asr.cloud.tencent.com while
 * the user speaks — the SecretKey is only ever used here (server) to compute the
 * HMAC-SHA1 signature; it never reaches the client.
 *
 * Needs the account's numeric ASR AppId plus the Tencent SecretId/SecretKey pair.
 */

const APPID = process.env.TENCENTCLOUD_APPID;
const SECRET_ID = process.env.TENCENTCLOUD_SECRETID || process.env.CLOUDBASE_SECRET_ID;
const SECRET_KEY = process.env.TENCENTCLOUD_SECRETKEY || process.env.CLOUDBASE_SECRET_KEY;

export function realtimeAsrConfigured(): boolean {
  return Boolean(APPID && SECRET_ID && SECRET_KEY);
}

/** Build the signed wss URL + the per-connection voice_id. null if unconfigured. */
export function signedRealtimeUrl(engine = '16k_en'): { url: string; voiceId: string } | null {
  if (!realtimeAsrConfigured()) return null;
  const now = Math.round(Date.now() / 1000);
  const voiceId = randomUUID();
  // Every param EXCEPT `signature` is signed; `appid` lives in the path, not here.
  const params: Record<string, string> = {
    secretid: SECRET_ID!,
    engine_model_type: engine,
    timestamp: String(now),
    expired: String(now + 86400),
    nonce: String(Math.floor(Math.random() * 1e8) + 1),
    voice_id: voiceId,
    voice_format: '1', // raw 16-bit PCM
    needvad: '1',
  };
  const qs = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const strToSign = `asr.cloud.tencent.com/asr/v2/${APPID}?${qs}`;
  const sig = crypto.createHmac('sha1', SECRET_KEY!).update(strToSign).digest('base64');
  return { url: `wss://${strToSign}&signature=${encodeURIComponent(sig)}`, voiceId };
}
