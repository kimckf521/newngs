import 'server-only';
import type { Locale } from '@/i18n/types';
import { pageDocId, type PuckData } from './types';

/**
 * Server-side reads of PUBLISHED page data for SSR, via @cloudbase/node-sdk.
 *
 * In CloudBase Run the container has a managed identity, so init needs no
 * secrets. Locally (and on any failure / missing creds) getPublishedData
 * returns null so the public page falls back to its hardcoded component tree.
 * This MUST never throw — a CloudBase hiccup must not 500 a marketing page.
 */
const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;

// Only touch the CloudBase SDK when a credential source actually exists.
// CloudBase Run / SCF inject the managed identity as TENCENTCLOUD_SECRETID +
// TENCENTCLOUD_SECRETKEY env vars; locally these are absent. Without them the
// node-sdk's prepareCredentials throws — and it leaks that as an UNHANDLED
// promise rejection that the surrounding try/catch can't see, which crashes
// `next dev`. So we must not call the SDK at all when creds are missing; the
// public page then falls back to its hardcoded component tree.
// Explicit server-only secret (NOT NEXT_PUBLIC) lets non-CloudBase hosts (e.g.
// Vercel) read published content too. On CloudBase Run these are unset and the
// injected TENCENTCLOUD_* managed identity is used instead.
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY;

const HAS_CLOUDBASE_CREDS = Boolean(
  (process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY) || (SECRET_ID && SECRET_KEY),
);

let appPromise: Promise<unknown | null> | null = null;

async function getServerApp(): Promise<unknown | null> {
  if (!ENV_ID || !HAS_CLOUDBASE_CREDS) return null;
  if (!appPromise) {
    appPromise = import('@cloudbase/node-sdk')
      .then((mod) => {
        const cloudbase: any = (mod as any).default ?? mod;
        // Explicit secret (Vercel etc.) if provided; otherwise the CloudBase Run
        // managed identity. With neither, queries fail → caught → fallback.
        return cloudbase.init(
          SECRET_ID && SECRET_KEY ? { env: ENV_ID, secretId: SECRET_ID, secretKey: SECRET_KEY } : { env: ENV_ID },
        );
      })
      .catch(() => {
        appPromise = null;
        return null;
      });
  }
  return appPromise;
}

export async function getPublishedData(route: string, locale: Locale): Promise<PuckData | null> {
  try {
    const app: any = await getServerApp();
    if (!app) return null;
    const query = app.database().collection('pages').doc(pageDocId(route, locale)).get();
    // Cap the read so a slow/credential-less call (e.g. local dev) can't stall
    // the page — fall back to the hardcoded tree instead.
    const res: any = await Promise.race([
      query,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ]);
    const doc = res?.data?.[0];
    const published = (doc?.published as PuckData) ?? null;
    return published ? await resolveCloudImages(app, published) : null;
  } catch {
    return null; // never break the public page
  }
}

/**
 * Published Puck data may store CloudBase storage handles (cloud://…) for
 * uploaded images. These must be resolved to a FRESH signed temp URL at render
 * time — persisting the temp URL itself would break once its signature expires.
 * Walks the data, batch-resolves every cloud:// handle, and substitutes the
 * fresh URL. Best-effort: any failure returns the data untouched.
 */
async function resolveCloudImages(app: any, data: PuckData): Promise<PuckData> {
  const ids = new Set<string>();
  const collect = (v: unknown): void => {
    if (typeof v === 'string') {
      if (v.startsWith('cloud://')) ids.add(v);
    } else if (Array.isArray(v)) {
      v.forEach(collect);
    } else if (v && typeof v === 'object') {
      Object.values(v).forEach(collect);
    }
  };
  collect(data);
  if (ids.size === 0) return data;

  const map: Record<string, string> = {};
  try {
    const res: any = await app.getTempFileURL({
      fileList: [...ids].map((fileID) => ({ fileID, maxAge: 86400 })),
    });
    for (const f of res?.fileList ?? []) {
      if (f?.fileID && f?.tempFileURL) map[f.fileID] = f.tempFileURL;
    }
  } catch {
    return data;
  }

  const swap = (v: unknown): unknown => {
    if (typeof v === 'string') return v.startsWith('cloud://') ? map[v] ?? v : v;
    if (Array.isArray(v)) return v.map(swap);
    if (v && typeof v === 'object') {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(v)) o[k] = swap((v as Record<string, unknown>)[k]);
      return o;
    }
    return v;
  };
  return swap(data) as PuckData;
}
