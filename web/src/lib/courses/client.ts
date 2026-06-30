'use client';

import { getCurrentUser } from '@/lib/auth';
import { type AdminCourse } from './types';
import { mergeBuiltins } from './builtin';
import { pushLocalVersion } from '@/lib/versions/client';

/**
 * Browser CRUD for courses. Talks to the PostgreSQL-backed /api/courses; when
 * that isn't configured (no DATABASE_URL) it transparently falls back to a
 * localStorage TRIAL store so the admin can author courses with zero backend.
 * Never throws; returns where it persisted ('cloud' | 'local').
 */
export type SaveMode = 'cloud' | 'local';

const LS_KEY = 'ngs-courses';
const KEY_LS = 'ngs-admin-key';

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

function readLocal(): AdminCourse[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
    return raw ? (JSON.parse(raw) as AdminCourse[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: AdminCourse[]): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota/availability */
  }
}

export async function listCourses(): Promise<{ courses: AdminCourse[]; mode: SaveMode }> {
  try {
    const res = await fetch('/api/courses', { headers: adminKeyHeaders() });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; courses?: AdminCourse[] } | null;
    if (data?.ok) return { courses: mergeBuiltins(data.courses || []), mode: 'cloud' };
  } catch {
    /* fall back to local */
  }
  return { courses: mergeBuiltins(readLocal()), mode: 'local' };
}

export async function getCourse(id: string): Promise<AdminCourse | null> {
  // Uses the already-merged list so built-in courses resolve in both modes.
  const { courses } = await listCourses();
  return courses.find((c) => c.id === id) || null;
}

/** localStorage trial save (merge by id). */
function saveLocal(course: AdminCourse): SaveMode {
  const now = Date.now();
  const list = readLocal();
  const idx = list.findIndex((c) => c.id === course.id);
  const merged: AdminCourse = {
    ...(idx >= 0 ? list[idx] : {}),
    ...course,
    createdAt: (idx >= 0 ? list[idx].createdAt : undefined) ?? course.createdAt ?? now,
    updatedAt: now,
  };
  if (idx >= 0) list[idx] = merged;
  else list.push(merged);
  writeLocal(list);
  return 'local';
}

export async function saveCourse(course: AdminCourse): Promise<SaveMode> {
  const user = await getCurrentUser();
  const savedBy = user?.email || user?.name || 'unknown';
  const payload: AdminCourse = { ...course, updatedBy: savedBy };
  // Trial-mode save also records a local version snapshot (the cloud path is
  // versioned server-side inside upsertCourse).
  const saveTrial = (): SaveMode => {
    saveLocal(course);
    pushLocalVersion('course', course.id, payload, savedBy, Date.now());
    return 'local';
  };
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
      body: JSON.stringify(payload),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    return saveTrial(); // no response (offline) → trial
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') return saveTrial(); // genuine trial mode
  // Backend rejected the write (unauthorized / unavailable) — surface it instead
  // of silently saving locally and claiming success.
  throw new Error(data?.error || 'course_save_failed');
}

export async function deleteCourse(id: string): Promise<SaveMode> {
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    const res = await fetch(`/api/courses?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminKeyHeaders(),
    });
    data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  } catch {
    writeLocal(readLocal().filter((c) => c.id !== id));
    return 'local';
  }
  if (data?.ok) return 'cloud';
  if (data?.error === 'not_configured') {
    writeLocal(readLocal().filter((c) => c.id !== id));
    return 'local';
  }
  throw new Error(data?.error || 'course_delete_failed');
}
