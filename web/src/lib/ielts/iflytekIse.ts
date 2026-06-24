import 'server-only';
import crypto from 'node:crypto';

/**
 * iFlytek Intelligent Speech Evaluation (语音评测 流式版) — English pronunciation
 * scoring over a WebSocket. Open speech is scored against the ASR transcript as
 * the reference text (category read_chapter, ent en_vip). Scores are 0–100.
 * Uses the Node global WebSocket (Node 21+). Credentials: IFLYTEK_APPID / _API_KEY / _API_SECRET.
 */

const HOST = 'ise-api.xfyun.cn';
const PATH = '/v2/open-ise';

export type IseScore = {
  total: number;
  accuracy: number;
  fluency: number;
  integrity: number;
  rejected: boolean;
  except?: string;
};

export function iseConfigured(): boolean {
  return Boolean(process.env.IFLYTEK_APPID && process.env.IFLYTEK_API_KEY && process.env.IFLYTEK_API_SECRET);
}

function signedUrl(): string {
  const date = new Date().toUTCString(); // RFC1123 GMT
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

const num = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`${name}="([\\d.]+)"`));
  return m ? parseFloat(m[1]) : NaN;
};

function parseIse(xml: string): IseScore {
  const ex = xml.match(/except_info="([^"]+)"/);
  return {
    total: num(xml, 'total_score'),
    accuracy: num(xml, 'accuracy_score'),
    fluency: num(xml, 'fluency_score'),
    integrity: num(xml, 'integrity_score'),
    rejected: /is_rejected="?true"?/i.test(xml),
    except: ex ? ex[1] : undefined,
  };
}

/** Score 16k mono PCM against a reference text. Resolves null on any failure. */
export async function scorePronunciation(pcm: Buffer, referenceText: string): Promise<IseScore | null> {
  if (!iseConfigured() || pcm.length < 3200) return null;
  const ref = referenceText.trim().slice(0, 1800);
  if (!ref) return null;
  const appId = process.env.IFLYTEK_APPID!;
  const WS = (globalThis as unknown as { WebSocket?: new (url: string) => unknown }).WebSocket;
  if (!WS) return null;

  return new Promise<IseScore | null>((resolve) => {
    let settled = false;
    const ws: any = new (WS as any)(signedUrl());
    const finish = (v: IseScore | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch { /* noop */ }
      resolve(v);
    };
    const timer = setTimeout(() => finish(null), 20000);

    ws.onerror = (ev: { message?: string }) => { console.error('[ise] ws error', ev?.message ?? ev); finish(null); };
    ws.onclose = (ev: { code?: number; reason?: string }) => { if (!settled) console.error('[ise] ws closed early', ev?.code, ev?.reason); finish(null); };
    ws.onopen = async () => {
      try {
        ws.send(JSON.stringify({
          common: { app_id: appId },
          business: {
            category: 'read_chapter', rstcd: 'utf8', sub: 'ise', group: 'adult', ent: 'en_vip',
            tte: 'utf-8', cmd: 'ssb', auf: 'audio/L16;rate=16000', aue: 'raw',
            text: `﻿[content]\n${ref}`, ttp_skip: true, extra_ability: 'multi_dimension',
          },
          data: { status: 0, data: '', data_type: 1, encoding: 'raw' },
        }));
        const FRAME = 1280;
        let first = true;
        for (let off = 0; off < pcm.length; off += FRAME) {
          const chunk = pcm.subarray(off, Math.min(off + FRAME, pcm.length));
          ws.send(JSON.stringify({
            business: { cmd: 'auw', aus: first ? 1 : 2 },
            data: { status: 1, data: Buffer.from(chunk).toString('base64'), data_type: 1, encoding: 'raw' },
          }));
          first = false;
          await new Promise((r) => setTimeout(r, 5));
        }
        ws.send(JSON.stringify({ business: { cmd: 'auw', aus: 4 }, data: { status: 2, data: '', data_type: 1, encoding: 'raw' } }));
      } catch {
        finish(null);
      }
    };
    ws.onmessage = (ev: { data: string | Buffer }) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        if (typeof msg.code === 'number' && msg.code !== 0) return finish(null);
        const d = msg.data;
        if (d && d.status === 2 && d.data) {
          finish(parseIse(Buffer.from(d.data, 'base64').toString('utf8')));
        }
      } catch { /* partial / keepalive */ }
    };
  });
}
