import 'server-only';
import { query } from '@/lib/db/pg';
import type { SatQuestion, SatForm, SatAttempt } from './types';

/**
 * Server-side SAT persistence over PostgreSQL (see lib/db/pg.ts). Each entity's
 * full object is stored as JSONB in `data`; `id` (slug) + `published` mirror to
 * columns for keying/filtering. The browser reaches this only via /api/sat.
 * Mirrors lib/courses/serverStore.ts.
 */

type QRow = { data: SatQuestion };
type FRow = { data: SatForm };
type ARow = { data: SatAttempt };

/* ----------------------------------------------------------- questions */

export async function listAllQuestions(): Promise<SatQuestion[]> {
  const rows = await query<QRow>('SELECT data FROM sat_questions ORDER BY updated_at DESC LIMIT 5000');
  return rows.map((r) => r.data);
}

export async function listPublishedQuestions(): Promise<SatQuestion[]> {
  const rows = await query<QRow>(
    'SELECT data FROM sat_questions WHERE published = true ORDER BY updated_at DESC LIMIT 5000',
  );
  return rows.map((r) => r.data);
}

export async function getQuestionById(id: string): Promise<SatQuestion | null> {
  const rows = await query<QRow>('SELECT data FROM sat_questions WHERE id = $1', [id]);
  return rows[0]?.data ?? null;
}

export async function upsertQuestion(input: SatQuestion, updatedBy: string): Promise<SatQuestion> {
  const now = Date.now();
  const q: SatQuestion = { ...input, createdAt: input.createdAt ?? now, updatedAt: now, updatedBy };
  await query(
    `INSERT INTO sat_questions (id, data, published, updated_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, published = EXCLUDED.published, updated_at = now()`,
    [q.id, JSON.stringify(q), Boolean(q.published)],
  );
  return q;
}

export async function deleteQuestionById(id: string): Promise<void> {
  await query('DELETE FROM sat_questions WHERE id = $1', [id]);
}

/* --------------------------------------------------------------- forms */

export async function listAllForms(): Promise<SatForm[]> {
  const rows = await query<FRow>('SELECT data FROM sat_forms ORDER BY updated_at DESC LIMIT 1000');
  return rows.map((r) => r.data);
}

export async function listPublishedForms(): Promise<SatForm[]> {
  const rows = await query<FRow>(
    'SELECT data FROM sat_forms WHERE published = true ORDER BY updated_at DESC LIMIT 1000',
  );
  return rows.map((r) => r.data);
}

export async function getFormById(id: string): Promise<SatForm | null> {
  const rows = await query<FRow>('SELECT data FROM sat_forms WHERE id = $1', [id]);
  return rows[0]?.data ?? null;
}

export async function upsertForm(input: SatForm, updatedBy: string): Promise<SatForm> {
  const now = Date.now();
  const form: SatForm = { ...input, createdAt: input.createdAt ?? now, updatedAt: now, updatedBy };
  await query(
    `INSERT INTO sat_forms (id, data, published, updated_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, published = EXCLUDED.published, updated_at = now()`,
    [form.id, JSON.stringify(form), Boolean(form.published)],
  );
  return form;
}

export async function deleteFormById(id: string): Promise<void> {
  await query('DELETE FROM sat_forms WHERE id = $1', [id]);
}

/* ------------------------------------------------------------ attempts */

export async function getAttemptById(id: string): Promise<SatAttempt | null> {
  const rows = await query<ARow>('SELECT data FROM sat_attempts WHERE id = $1', [id]);
  return rows[0]?.data ?? null;
}

export async function listAttemptsByUid(uid: string): Promise<SatAttempt[]> {
  const rows = await query<ARow>(
    `SELECT data FROM sat_attempts WHERE data->>'uid' = $1 ORDER BY updated_at DESC LIMIT 500`,
    [uid],
  );
  return rows.map((r) => r.data);
}

export async function upsertAttempt(input: SatAttempt): Promise<SatAttempt> {
  const now = Date.now();
  const attempt: SatAttempt = { ...input, createdAt: input.createdAt ?? now, updatedAt: now };
  await query(
    `INSERT INTO sat_attempts (id, data, published, updated_at)
     VALUES ($1, $2::jsonb, false, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = now()`,
    [attempt.id, JSON.stringify(attempt)],
  );
  return attempt;
}

/* ------------------------------------------------------------ progress
 * Per-student cross-device learning state (mistakes / log / vocab), keyed by
 * auth uid. The full blob is stored opaque in `data`. */

export async function getProgress(uid: string): Promise<unknown | null> {
  const rows = await query<{ data: unknown }>('SELECT data FROM sat_progress WHERE uid = $1', [uid]);
  return rows[0]?.data ?? null;
}

export async function upsertProgress(uid: string, data: unknown): Promise<void> {
  await query(
    `INSERT INTO sat_progress (uid, data, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (uid) DO UPDATE
       SET data = EXCLUDED.data, updated_at = now()`,
    [uid, JSON.stringify(data)],
  );
}
