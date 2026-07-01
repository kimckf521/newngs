'use client';

import type { SatQuestion, SatForm, SatAttempt } from './types';
import originalBank from '@/components/member/sat/data/originalBank.json';

/**
 * Browser CRUD for the SAT bank. Talks to the PostgreSQL-backed /api/sat; when
 * that isn't configured (no DATABASE_URL) it falls back to a localStorage TRIAL
 * store so the admin can author with zero backend, and the student runner uses
 * the bundled sample form. Never throws on the trial path; throws only on a
 * genuine backend rejection (unauthorized / unavailable). Mirrors courses/client.ts.
 */

export type SaveMode = 'cloud' | 'local';

const LS_Q = 'ngs-sat-questions';
const LS_F = 'ngs-sat-forms';
const KEY_LS = 'ngs-admin-key';

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

function readLocal<T>(key: string): T[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeLocal<T>(key: string, list: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}
function upsertLocal<T extends { id: string }>(key: string, item: T): SaveMode {
  const list = readLocal<T>(key);
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  writeLocal(key, list);
  return 'local';
}

/* ----------------------------------------------------------- questions */

export async function listQuestions(): Promise<{ items: SatQuestion[]; mode: SaveMode }> {
  try {
    const res = await fetch('/api/sat?resource=questions', { headers: adminKeyHeaders() });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: SatQuestion[] } | null;
    if (data?.ok) return { items: data.items || [], mode: 'cloud' };
  } catch {
    /* fall through */
  }
  return { items: readLocal<SatQuestion>(LS_Q), mode: 'local' };
}

export async function saveQuestion(q: SatQuestion): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch('/api/sat?resource=questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
      body: JSON.stringify(q),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    return upsertLocal(LS_Q, q);
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') return upsertLocal(LS_Q, q);
  throw new Error(data?.error || 'sat_question_save_failed');
}

export async function deleteQuestion(id: string): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch(`/api/sat?resource=questions&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminKeyHeaders(),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    writeLocal(LS_Q, readLocal<SatQuestion>(LS_Q).filter((q) => q.id !== id));
    return 'local';
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') {
    writeLocal(LS_Q, readLocal<SatQuestion>(LS_Q).filter((q) => q.id !== id));
    return 'local';
  }
  throw new Error(data?.error || 'sat_question_delete_failed');
}

/* --------------------------------------------------------------- forms */

export async function listForms(): Promise<{ items: SatForm[]; mode: SaveMode }> {
  try {
    const res = await fetch('/api/sat?resource=forms', { headers: adminKeyHeaders() });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: SatForm[] } | null;
    if (data?.ok) return { items: data.items || [], mode: 'cloud' };
  } catch {
    /* fall through */
  }
  return { items: readLocal<SatForm>(LS_F), mode: 'local' };
}

export async function saveForm(form: SatForm): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch('/api/sat?resource=forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
      body: JSON.stringify(form),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    return upsertLocal(LS_F, form);
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') return upsertLocal(LS_F, form);
  throw new Error(data?.error || 'sat_form_save_failed');
}

export async function deleteForm(id: string): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch(`/api/sat?resource=forms&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminKeyHeaders(),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    writeLocal(LS_F, readLocal<SatForm>(LS_F).filter((f) => f.id !== id));
    return 'local';
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') {
    writeLocal(LS_F, readLocal<SatForm>(LS_F).filter((f) => f.id !== id));
    return 'local';
  }
  throw new Error(data?.error || 'sat_form_delete_failed');
}

/* --------------------------------------------------------------- runner */

/** The full published question pool for practice / notebook / dashboard. Falls
 *  back to the bundled original bank when the cloud has none. */
export async function fetchPublishedQuestions(): Promise<SatQuestion[]> {
  try {
    const res = await fetch('/api/sat?resource=questions&scope=published');
    const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: SatQuestion[] } | null;
    if (data?.ok && Array.isArray(data.items) && data.items.length) return data.items;
  } catch {
    /* fall back to the bundled bank */
  }
  return (originalBank as unknown as { questions: SatQuestion[] }).questions;
}

/** Load a form + its question pool for the player. Returns null when the cloud
 *  has no published bundle, so the caller falls back to the bundled sample. */
export async function loadRunnerForm(
  formId: string,
): Promise<{ form: SatForm; questions: SatQuestion[] } | null> {
  try {
    const res = await fetch(`/api/sat?resource=runner&form=${encodeURIComponent(formId)}`);
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; form?: SatForm | null; questions?: SatQuestion[] }
      | null;
    if (data?.ok && data.form) return { form: data.form, questions: data.questions || [] };
  } catch {
    /* fall back to bundled sample */
  }
  return null;
}

/* --------------------------------------------------------- progress sync */

/** Pull a student's cloud progress blob (null if none / unconfigured). */
export async function fetchProgress(uid: string): Promise<unknown | null> {
  try {
    const res = await fetch(`/api/sat?resource=progress&uid=${encodeURIComponent(uid)}`);
    const data = (await res.json().catch(() => null)) as { ok?: boolean; data?: unknown } | null;
    return data?.ok ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}

/** Push a student's progress blob to the cloud (best-effort). */
export async function pushProgress(uid: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/sat?resource=progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, data }),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return Boolean(j?.ok);
  } catch {
    return false;
  }
}

/** Persist a student's attempt (best-effort — never blocks the results screen). */
export async function saveAttempt(attempt: SatAttempt): Promise<void> {
  try {
    await fetch('/api/sat?resource=attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    });
  } catch {
    /* ignore — the results are already shown client-side */
  }
}
