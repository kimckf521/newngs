import 'server-only';
import { query } from '@/lib/db/pg';

/**
 * Version history for editable content (PostgreSQL-backed). Every save of a
 * versioned entity appends a full snapshot here, giving Google-Docs-style
 * history + restore. Snapshots are keyed by (kind, ref_id):
 *   - kind 'course'        ref_id = course slug         data = AdminCourse
 *   - kind 'ielts_module'  ref_id = module id ('1'..)   data = RichData
 * Reached by the browser only via /api/versions; writes happen inside the
 * course / content upsert paths so backups are automatic.
 */

export type VersionKind = 'course' | 'ielts_module';
export type VersionMeta = { id: string; savedBy: string | null; savedAt: number; label: string | null };

/** Snapshots kept per entity (older ones are pruned on each new save). */
const KEEP = 50;

export async function addVersion(
  kind: VersionKind,
  refId: string,
  data: unknown,
  savedBy: string | null,
  label: string | null = null,
): Promise<void> {
  await query(
    `INSERT INTO content_versions (kind, ref_id, data, label, saved_by)
     VALUES ($1, $2, $3::jsonb, $4, $5)`,
    [kind, refId, JSON.stringify(data), label, savedBy],
  );
  // Keep only the most recent KEEP snapshots for this entity.
  await query(
    `DELETE FROM content_versions
       WHERE kind = $1 AND ref_id = $2
         AND id NOT IN (
           SELECT id FROM content_versions
            WHERE kind = $1 AND ref_id = $2
            ORDER BY id DESC LIMIT $3
         )`,
    [kind, refId, KEEP],
  );
}

export async function listVersions(kind: VersionKind, refId: string): Promise<VersionMeta[]> {
  const rows = await query<{ id: string; saved_by: string | null; label: string | null; saved_at: Date }>(
    `SELECT id, saved_by, label, saved_at
       FROM content_versions
      WHERE kind = $1 AND ref_id = $2
      ORDER BY id DESC LIMIT $3`,
    [kind, refId, KEEP],
  );
  return rows.map((r) => ({
    id: String(r.id),
    savedBy: r.saved_by,
    label: r.label,
    savedAt: new Date(r.saved_at).getTime(),
  }));
}

export async function getVersionData(id: string): Promise<unknown | null> {
  const rows = await query<{ data: unknown }>('SELECT data FROM content_versions WHERE id = $1', [id]);
  return rows[0]?.data ?? null;
}
