'use client';

import type { Locale } from '@/i18n/types';
import { pageDocId, type PageDoc, type PuckData } from './types';

/**
 * Browser-side load/save of page data.
 *
 * Primary path: the PostgreSQL-backed /api/pages. TRIAL FALLBACK: when that
 * isn't configured (no DATABASE_URL) or a request fails, save/publish persist to
 * localStorage so the editor is fully usable without any backend — and the
 * public homepage renders that local publish via LocalPublishedView (which reads
 * the same `ngs-puck:` key). Per-browser only; not real cross-visitor publishing.
 */
export type SaveMode = 'cloud' | 'local';

const LS_PREFIX = 'ngs-puck:';
const KEY_LS = 'ngs-admin-key';
const lsKey = (route: string, locale: Locale) => LS_PREFIX + pageDocId(route, locale);

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
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
  let data: { ok?: boolean; error?: string; doc?: PageDoc | null } | null = null;
  try {
    const res = await fetch(`/api/pages?route=${encodeURIComponent(route)}&locale=${locale}`, {
      headers: adminKeyHeaders(),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; doc?: PageDoc | null } | null;
  } catch {
    return readLocal(route, locale); // no response at all (offline) → trial copy
  }
  if (data?.ok) return data.doc ?? null;
  if (data?.error === 'not_configured') return readLocal(route, locale); // genuine trial mode
  // Backend exists but the request FAILED (unauthorized / unavailable). Do NOT
  // seed from a stale local copy — surface it so the editor refuses to save and
  // can't later clobber the live row with stale content.
  throw new Error(data?.error || 'pages_load_failed');
}

async function writePage(route: string, locale: Locale, patch: Partial<PageDoc>): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
      body: JSON.stringify({ route, locale, draft: patch.draft, published: patch.published }),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    // No response at all (offline / dev server down) → local trial fallback.
    writeLocal(route, locale, patch);
    return 'local';
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') {
    writeLocal(route, locale, patch); // genuine trial mode (no DATABASE_URL)
    return 'local';
  }
  // Backend exists but REJECTED the write (unauthorized / unavailable / bad
  // request). Surfacing this — instead of silently writing localStorage and
  // claiming success — is what stops the misleading "Published — live now".
  throw new Error(data?.error || 'pages_save_failed');
}

export async function saveDraft(route: string, locale: Locale, data: PuckData): Promise<SaveMode> {
  return writePage(route, locale, { draft: data });
}

export async function publishPage(route: string, locale: Locale, data: PuckData): Promise<SaveMode> {
  const mode = await writePage(route, locale, { draft: data, published: data });
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
