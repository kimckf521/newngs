import 'server-only';
import crypto from 'node:crypto';

/**
 * Tencent Cloud ASR — SentenceRecognition (一句话识别) for English (16k_en),
 * hand-signed with TC3-HMAC-SHA256 (no SDK). The interface caps at 60s, so a
 * long Part-2 answer is split into ≤55s 16k-mono-PCM chunks and the transcripts
 * are concatenated. Credentials come from the same TENCENTCLOUD_* env the
 * CloudBase integration uses.
 */

const HOST = 'asr.tencentcloudapi.com';
const SERVICE = 'asr';
const ACTION = 'SentenceRecognition';
const VERSION = '2019-06-14';
const SAMPLE_RATE = 16000;
const CHUNK_BYTES = 55 * SAMPLE_RATE * 2; // 55s of 16-bit mono PCM, under the 60s/3MB cap

export function asrConfigured(): boolean {
  return Boolean(process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY);
}

const sha256hex = (s: crypto.BinaryLike) => crypto.createHash('sha256').update(s).digest('hex');
const hmac = (key: crypto.BinaryLike | crypto.KeyObject, s: string) =>
  crypto.createHmac('sha256', key as crypto.BinaryLike).update(s).digest();

function authHeaders(payload: string, region: string) {
  const secretId = process.env.TENCENTCLOUD_SECRETID!;
  const secretKey = process.env.TENCENTCLOUD_SECRETKEY!;
  const ts = Math.floor(Date.now() / 1000);
  const date = new Date(ts * 1000).toISOString().slice(0, 10); // UTC YYYY-MM-DD
  const ct = 'application/json; charset=utf-8';
  const canonicalHeaders = `content-type:${ct}\nhost:${HOST}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${sha256hex(payload)}`;
  const scope = `${date}/${SERVICE}/tc3_request`;
  const stringToSign = `TC3-HMAC-SHA256\n${ts}\n${scope}\n${sha256hex(canonicalRequest)}`;
  const kSigning = hmac(hmac(hmac('TC3' + secretKey, date), SERVICE), 'tc3_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  return {
    Authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'Content-Type': ct,
    Host: HOST,
    'X-TC-Action': ACTION,
    'X-TC-Version': VERSION,
    'X-TC-Timestamp': String(ts),
    'X-TC-Region': region,
  };
}

async function recognizeChunk(pcm: Buffer, region: string): Promise<string> {
  const payload = JSON.stringify({
    EngSerViceType: '16k_en',
    SubServiceType: 2,
    SourceType: 1,
    VoiceFormat: 'pcm',
    Data: pcm.toString('base64'),
    DataLen: pcm.length,
    FilterDirty: 0,
    FilterModal: 0,
    FilterPunc: 0,
    ConvertNumMode: 1,
  });
  const res = await fetch(`https://${HOST}`, { method: 'POST', headers: authHeaders(payload, region), body: payload });
  const json = (await res.json()) as { Response?: { Result?: string; Error?: { Code: string; Message: string } } };
  if (json.Response?.Error) {
    throw new Error(`${json.Response.Error.Code}: ${json.Response.Error.Message}`);
  }
  return json.Response?.Result ?? '';
}

/** Extract the PCM payload from a WAV buffer (falls back to a 44-byte header). */
export function pcmFromWav(buf: Buffer): Buffer {
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF') {
    let i = 12;
    while (i + 8 <= buf.length) {
      const id = buf.toString('ascii', i, i + 4);
      const size = buf.readUInt32LE(i + 4);
      if (id === 'data') return buf.subarray(i + 8, Math.min(i + 8 + size, buf.length));
      i += 8 + size + (size % 2);
    }
  }
  return buf.subarray(44);
}

/** Transcribe a 16kHz mono WAV buffer (chunked to stay under the 60s limit). */
export async function transcribeWav(wav: Buffer): Promise<string> {
  const region = process.env.TENCENT_ASR_REGION || 'ap-guangzhou';
  const pcm = pcmFromWav(wav);
  const parts: string[] = [];
  for (let off = 0; off < pcm.length; off += CHUNK_BYTES) {
    const chunk = pcm.subarray(off, Math.min(off + CHUNK_BYTES, pcm.length));
    if (chunk.length < SAMPLE_RATE * 0.2 * 2) break; // skip <0.2s tail
    parts.push(await recognizeChunk(Buffer.from(chunk), region));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
