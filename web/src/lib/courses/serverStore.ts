import 'server-only';
import { query } from '@/lib/db/pg';
import { addVersion } from '@/lib/versions/store';
import type { AdminCourse } from './types';

/**
 * Server-side course persistence over PostgreSQL (see lib/db/pg.ts). The full
 * AdminCourse is stored as JSONB in `courses.data`; `id` (slug) and `published`
 * are mirrored to columns for keying/filtering. The browser reaches this only
 * through /api/courses.
 */
type Row = { data: AdminCourse };

/** Drop the doc-DB leftover `_id` if a caller still carries one. */
function clean(course: AdminCourse): AdminCourse {
  const { _id, ...rest } = course;
  void _id;
  return rest as AdminCourse;
}

export async function listAllCourses(): Promise<AdminCourse[]> {
  const rows = await query<Row>('SELECT data FROM courses ORDER BY updated_at DESC LIMIT 1000');
  return rows.map((r) => r.data);
}

export async function listPublishedCourses(): Promise<AdminCourse[]> {
  const rows = await query<Row>(
    'SELECT data FROM courses WHERE published = true ORDER BY updated_at DESC LIMIT 1000',
  );
  return rows.map((r) => r.data);
}

export async function getCourseById(id: string): Promise<AdminCourse | null> {
  const rows = await query<Row>('SELECT data FROM courses WHERE id = $1', [id]);
  return rows[0]?.data ?? null;
}

export async function upsertCourse(input: AdminCourse, updatedBy: string): Promise<AdminCourse> {
  const now = Date.now();
  const course: AdminCourse = {
    ...clean(input),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    updatedBy,
  };
  await query(
    `INSERT INTO courses (id, data, published, updated_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, published = EXCLUDED.published, updated_at = now()`,
    [course.id, JSON.stringify(course), Boolean(course.published)],
  );
  // Auto-backup a snapshot for version history (best-effort — never fail the save).
  try {
    await addVersion('course', course.id, course, updatedBy);
  } catch {
    /* versioning is non-critical */
  }
  return course;
}

export async function deleteCourseById(id: string): Promise<void> {
  await query('DELETE FROM courses WHERE id = $1', [id]);
}
