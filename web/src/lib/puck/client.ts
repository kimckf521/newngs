'use client';

import { getCloudBaseApp } from '@/lib/cloudbase';
import { getCurrentUser } from '@/lib/auth';
import type { Locale } from '@/i18n/types';
import { pageDocId, type PageDoc, type PuckData } from './types';

/**
 * Browser-side load/save of page data via the web SDK (@cloudbase/js-sdk).
 * Writes are gated by CloudBase security rules (only users in the `admins`
 * collection may write `pages`). In demo mode (no env) getCloudBaseApp() is
 * null and these no-op / throw, which the editor surfaces.
 */

export async function loadPageDoc(route: string, locale: Locale): Promise<PageDoc | null> {
  const app = await getCloudBaseApp();
  if (!app) return null;
  const res = await app.database().collection('pages').doc(pageDocId(route, locale)).get();
  return ((res?.data?.[0] as PageDoc) ?? null) || null;
}

async function writePage(route: string, locale: Locale, patch: Partial<PageDoc>): Promise<void> {
  const app = await getCloudBaseApp();
  if (!app) throw new Error('cloudbase_unavailable');
  const user = await getCurrentUser();
  const id = pageDocId(route, locale);
  // Read-merge-set so writing `draft` doesn't wipe `published` (and upserts).
  const existing = ((await app.database().collection('pages').doc(id).get())?.data?.[0] as PageDoc) || null;
  // CRITICAL: strip `_id` — the web SDK's set()/update() REJECT any payload
  // containing `_id` (resolving with { code } rather than throwing), which
  // would silently no-op every write after the doc first exists.
  const { _id, ...rest } = (existing || {}) as PageDoc;
  void _id;
  const res = (await app.database().collection('pages').doc(id).set({
    ...rest,
    route,
    locale,
    ...patch,
    updatedBy: user?.email || user?.name || 'unknown',
    updatedAt: Date.now(),
  })) as { code?: string; message?: string } | undefined;
  // The SDK resolves (does not throw) with a `code` on rejection — surface it.
  if (res?.code) throw new Error(res.message || res.code);
}

export async function saveDraft(route: string, locale: Locale, data: PuckData): Promise<void> {
  await writePage(route, locale, { draft: data });
}

export async function publishPage(route: string, locale: Locale, data: PuckData): Promise<void> {
  await writePage(route, locale, { draft: data, published: data, publishedAt: Date.now() });
  // Invalidate the ISR cache so the publish goes live immediately instead of
  // waiting for the homepages' revalidate window. Non-fatal if it fails.
  try {
    await fetch('/api/revalidate', { method: 'POST' });
  } catch {
    /* content still appears within the revalidate window */
  }
}
