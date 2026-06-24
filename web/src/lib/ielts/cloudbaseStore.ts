import 'server-only';
import { randomUUID } from 'node:crypto';

/**
 * Best-effort persistence of a speaking session (transcript + band report) to
 * CloudBase. Mirrors the init pattern in lib/chat/provider.ts but always passes
 * EXPLICIT credentials (CLOUDBASE_* or the TENCENTCLOUD_* pair) so it works off
 * the CloudBase Run platform too (the bare {env} form relies on the Run managed
 * identity and stalls locally). Never throws to the caller; failures are logged.
 *
 * Optionally uploads the student's answer recordings (16k mono WAVs) to cloud
 * storage and references them on the doc as `audioFileIds` (cloud://… ids — use
 * app.getTempFileURL to fetch playable URLs later). Uploads are best-effort and
 * capped: a storage failure (or none configured) leaves the grade unaffected.
 */

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID || process.env.TENCENTCLOUD_SECRETID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY;
const COLLECTION = 'ielts_speaking_sessions';
// Bound the work + payload: even a long session rarely has this many answers,
// and each WAV can be ~MBs once base64-decoded.
const MAX_AUDIO_CLIPS = 16;

export type AudioClip = { wavB64: string; text?: string };

export function storeConfigured(): boolean {
  return Boolean(ENV_ID && SECRET_ID && SECRET_KEY);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

/**
 * Upload each answer recording to cloud storage at
 * `ielts-speaking/<yyyy>/<sessionId>/<n>.wav`, returning the cloud file ids that
 * succeeded. Per-clip failures are swallowed (logged) so one bad upload never
 * sinks the rest — and the caller treats the whole step as best-effort anyway.
 */
// NOTE: bare `any` (no disable comment) — this repo's eslint config
// (next/core-web-vitals) doesn't register @typescript-eslint, so `any` isn't
// flagged, while a disable directive for that rule would itself error.
async function uploadAudioClips(
  app: any,
  audio: AudioClip[] | undefined,
  sessionId: string,
): Promise<string[]> {
  const clips = (audio ?? [])
    .filter((a) => a && typeof a.wavB64 === 'string' && a.wavB64.length > 0)
    .slice(0, MAX_AUDIO_CLIPS);
  if (!clips.length) return [];
  const year = new Date().getFullYear();
  const ids = await Promise.all(
    clips.map(async (clip, i) => {
      try {
        const fileContent = Buffer.from(clip.wavB64, 'base64');
        const res = await withTimeout<any>(
          app.uploadFile({ cloudPath: `ielts-speaking/${year}/${sessionId}/${i + 1}.wav`, fileContent }),
          8000,
        );
        return (res?.fileID as string) || null;
      } catch (e) {
        console.error('[ielts] audio upload failed', String(e).slice(0, 120));
        return null;
      }
    }),
  );
  return ids.filter((x): x is string => Boolean(x));
}

export async function saveSession(
  doc: Record<string, unknown>,
  audio?: AudioClip[],
): Promise<{ ok: boolean; id?: string; error?: string; audioFileIds?: string[] }> {
  if (!storeConfigured()) return { ok: false, error: 'not_configured' };
  try {
    const mod: any = await import('@cloudbase/node-sdk');
    const cloudbase: any = mod.default ?? mod;
    const app = cloudbase.init({ env: ENV_ID, secretId: SECRET_ID, secretKey: SECRET_KEY });

    // Upload recordings first so we can reference them on the doc. The id also
    // namespaces the storage path (the doc's own _id isn't known until add()).
    const audioSessionId = randomUUID();
    const audioFileIds = await uploadAudioClips(app, audio, audioSessionId);

    const db = app.database();
    const res = await withTimeout<any>(
      db.collection(COLLECTION).add({ ...doc, audioSessionId, audioFileIds, createdAt: new Date() }),
      10000,
    );
    return { ok: true, id: res?.id ?? res?.ids?.[0], audioFileIds };
  } catch (e) {
    console.error('[ielts] saveSession failed', String(e).slice(0, 200));
    return { ok: false, error: String(e).slice(0, 200) };
  }
}
