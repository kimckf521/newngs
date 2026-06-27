import 'server-only';
import type { Locale } from '@/i18n/types';
import type { PuckData } from './types';
import { getPublishedRaw } from './serverStore';

/**
 * Server-side reads of PUBLISHED page data for SSR.
 *
 * The page TREE now lives in PostgreSQL (see serverStore / lib/db/pg). Uploaded
 * images, however, are still CloudBase storage handles (cloud://…) — those must
 * be resolved to a FRESH signed temp URL at render time (persisting the temp URL
 * would break once its signature expires). So we read the tree from Postgres and
 * then BEST-EFFORT resolve any cloud:// handles via @cloudbase/node-sdk when a
 * credential source exists (CloudBase Run managed identity, or CLOUDBASE_SECRET_*).
 *
 * This MUST never throw — a DB/CloudBase hiccup must not 500 a marketing page;
 * any failure returns null (or the unresolved tree) so the public page falls
 * back to its hardcoded component tree.
 */
const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY;
const HAS_CLOUDBASE_CREDS = Boolean(
  (process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY) || (SECRET_ID && SECRET_KEY),
);

let appPromise: Promise<unknown | null> | null = null;

// CloudBase node-sdk — now used ONLY to resolve cloud:// image handles. Guarded
// behind HAS_CLOUDBASE_CREDS: calling the SDK without creds throws an UNHANDLED
// rejection that crashes `next dev`, so we never touch it when creds are absent.
async function getStorageApp(): Promise<unknown | null> {
  if (!ENV_ID || !HAS_CLOUDBASE_CREDS) return null;
  if (!appPromise) {
    appPromise = import('@cloudbase/node-sdk')
      .then((mod) => {
        const cloudbase: any = (mod as any).default ?? mod;
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
    const published = await getPublishedRaw(route, locale); // PostgreSQL
    if (!published) return null;
    return await resolveCloudImages(published);
  } catch {
    return null; // never break the public page (e.g. DATABASE_URL unset → fallback tree)
  }
}

/**
 * Resolve any cloud://… image handles in the tree to fresh signed temp URLs.
 * Best-effort: if there are no handles, or no CloudBase creds, or the lookup
 * fails, the tree is returned unchanged.
 */
async function resolveCloudImages(data: PuckData): Promise<PuckData> {
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

  const app: any = await getStorageApp();
  if (!app) return data;

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
