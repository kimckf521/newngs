'use client';

import { getCurrentUser } from '@/lib/auth';
import type { RichData } from './contentTypes';
import { BUILTIN_RICH } from './builtinContent';
import { pushLocalVersion } from '@/lib/versions/client';

/**
 * Browser CRUD for admin-edited IELTS lesson content. Talks to the
 * PostgreSQL-backed /api/ielts/content; when no database is configured it falls
 * back to a localStorage TRIAL store so editing works with zero backend (per
 * browser). Reads always resolve to effective content: an override if one
 * exists, otherwise the shipped default from BUILTIN_RICH.
 */
export type SaveMode = 'cloud' | 'local';

const LS_PREFIX = 'ielts:content:';
const KEY_LS = 'ngs-admin-key';

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

function readLocal(modId: string): RichData | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_PREFIX + modId) : null;
    return raw ? (JSON.parse(raw) as RichData) : null;
  } catch {
    return null;
  }
}

function writeLocal(modId: string, data: RichData): void {
  try {
    window.localStorage.setItem(LS_PREFIX + modId, JSON.stringify(data));
  } catch {
    /* ignore quota/availability */
  }
}

function clearLocal(modId: string): void {
  try {
    window.localStorage.removeItem(LS_PREFIX + modId);
  } catch {
    /* ignore */
  }
}

/** The effective content for a module: override (cloud or local) or default.
 *  Never throws; falls back to the shipped default. */
export async function loadModuleContent(modId: string): Promise<RichData> {
  const fallback = BUILTIN_RICH[modId];
  try {
    const res = await fetch(`/api/ielts/content?modId=${encodeURIComponent(modId)}`, {
      headers: adminKeyHeaders(),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; configured?: boolean; data?: RichData | null }
      | null;
    if (data?.ok && data.configured) {
      // Cloud mode is authoritative: override row or the default.
      return data.data ?? fallback;
    }
  } catch {
    /* fall through to local */
  }
  // Trial / offline mode.
  return readLocal(modId) ?? fallback;
}

/** Whether a module currently has an override (so the editor can show a
 *  "customised / reset" affordance). Checks cloud then local. */
export async function hasOverride(modId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ielts/content?modId=${encodeURIComponent(modId)}`, {
      headers: adminKeyHeaders(),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; configured?: boolean; data?: RichData | null }
      | null;
    if (data?.ok && data.configured) return Boolean(data.data);
  } catch {
    /* fall through */
  }
  return readLocal(modId) !== null;
}

export async function saveModuleContent(modId: string, data: RichData): Promise<SaveMode> {
  const user = await getCurrentUser();
  const savedBy = user?.email || user?.name || 'unknown';
  const saveTrial = (): SaveMode => {
    writeLocal(modId, data);
    pushLocalVersion('ielts_module', modId, data, savedBy, Date.now());
    return 'local';
  };
  let res: { ok?: boolean; error?: string } | null = null;
  try {
    const r = await fetch('/api/ielts/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
      body: JSON.stringify({ modId, data, savedBy }),
    });
    res = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    return saveTrial(); // offline → trial
  }
  if (res?.ok) return 'cloud';
  if (res?.error === 'not_configured') return saveTrial(); // genuine trial mode
  throw new Error(res?.error || 'content_save_failed');
}

export async function resetModuleContent(modId: string): Promise<SaveMode> {
  let res: { ok?: boolean; error?: string } | null = null;
  try {
    const r = await fetch(`/api/ielts/content?modId=${encodeURIComponent(modId)}`, {
      method: 'DELETE',
      headers: adminKeyHeaders(),
    });
    res = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    clearLocal(modId);
    return 'local';
  }
  if (res?.ok) {
    clearLocal(modId); // also clear any stale local copy
    return 'cloud';
  }
  if (res?.error === 'not_configured') {
    clearLocal(modId);
    return 'local';
  }
  throw new Error(res?.error || 'content_reset_failed');
}
