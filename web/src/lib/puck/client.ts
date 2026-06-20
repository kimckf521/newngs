'use client';

import { getCloudBaseApp } from '@/lib/cloudbase';
import { getCurrentUser } from '@/lib/auth';
import type { Locale } from '@/i18n/types';
import { pageDocId, type PageDoc, type PuckData } from './types';

/**
 * Browser-side load/save of page data.
 *
 * Primary path: CloudBase (@cloudbase/js-sdk), gated by the `pages` security
 * rules. TRIAL FALLBACK: when CloudBase isn't usable (no env, no session, no
 * `pages` collection, or a denying rule), save/publish persist to localStorage
 * so the editor is fully usable without any backend setup — and the public
 * homepage renders that local publish via LocalPublishedView. Per-browser only;
 * not real cross-visitor publishing.
 */

export type SaveMode = 'cloud' | 'local';

const LS_PREFIX = 'ngs-puck:';
const lsKey = (route: string, locale: Locale) => LS_PREFIX + pageDocId(route, locale);

/** Cap CloudBase calls so a credential-less / hanging request falls back to the
 *  local trial path quickly instead of stalling the editor. */
function withTimeout<T>(p: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function readLocal(route: string, locale: Locale): PageDoc | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(lsKey(route, locale)) : null;
    return raw ? (JSON.parse(raw) as PageDoc) : null;
  } catch {
    return null;
  }
}

function writeLocal(route: string, locale: Locale, patch: Partial<PageDoc>): void {
  try {
    const existing = readLocal(route, locale) || { route, locale, draft: null, published: null };
    window.localStorage.setItem(
      lsKey(route, locale),
      JSON.stringify({ ...existing, route, locale, ...patch, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore quota / availability errors */
  }
}

export async function loadPageDoc(route: string, locale: Locale): Promise<PageDoc | null> {
  const app = await getCloudBaseApp();
  if (app) {
    try {
      const res = await withTimeout(app.database().collection('pages').doc(pageDocId(route, locale)).get());
      const doc = (res?.data?.[0] as PageDoc) || null;
      if (doc) return doc;
    } catch {
      /* fall back to the local trial copy */
    }
  }
  return readLocal(route, locale);
}

async function writePage(route: string, locale: Locale, patch: Partial<PageDoc>): Promise<SaveMode> {
  const app = await getCloudBaseApp();
  if (app) {
    try {
      const user = await getCurrentUser();
      const id = pageDocId(route, locale);
      // Read-merge-set so writing `draft` doesn't wipe `published` (and upserts).
      const existing = ((await withTimeout(app.database().collection('pages').doc(id).get()))?.data?.[0] as PageDoc) || null;
      // Strip `_id` — the web SDK REJECTS set()/update() payloads containing it
      // (resolving with { code } rather than throwing).
      const { _id, ...rest } = (existing || {}) as PageDoc;
      void _id;
      const res = (await withTimeout(app.database().collection('pages').doc(id).set({
        ...rest,
        route,
        locale,
        ...patch,
        updatedBy: user?.email || user?.name || 'unknown',
        updatedAt: Date.now(),
      }))) as { code?: string } | undefined;
      if (res?.code) throw new Error(res.code);
      return 'cloud';
    } catch {
      /* CloudBase not ready (no session / collection / rule) → local trial */
    }
  }
  writeLocal(route, locale, patch);
  return 'local';
}

export async function saveDraft(route: string, locale: Locale, data: PuckData): Promise<SaveMode> {
  return writePage(route, locale, { draft: data });
}

export async function publishPage(route: string, locale: Locale, data: PuckData): Promise<SaveMode> {
  const mode = await writePage(route, locale, { draft: data, published: data, publishedAt: Date.now() });
  if (mode === 'cloud') {
    // Invalidate the ISR cache so a real publish goes live immediately.
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch {
      /* content still appears within the revalidate window */
    }
  }
  return mode;
}
