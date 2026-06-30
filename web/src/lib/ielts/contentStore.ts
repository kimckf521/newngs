import 'server-only';
import { query } from '@/lib/db/pg';
import { addVersion } from '@/lib/versions/store';
import type { RichData } from './contentTypes';

/**
 * Server-side persistence for admin-edited IELTS lesson content over PostgreSQL.
 * Each row is one module's full RichData stored as JSONB in `ielts_content.data`,
 * keyed by `mod_id` ('1'..'10'). A row exists only when an admin has customised
 * that module; otherwise the viewer falls back to the shipped default
 * (lib/ielts/builtinContent). The browser reaches this only via /api/ielts/content.
 */
type Row = { mod_id: string; data: RichData };

export async function getModuleOverride(modId: string): Promise<RichData | null> {
  const rows = await query<Row>('SELECT data FROM ielts_content WHERE mod_id = $1', [modId]);
  return rows[0]?.data ?? null;
}

/** List the module ids that currently have an override (admin overview). */
export async function listOverriddenModules(): Promise<string[]> {
  const rows = await query<{ mod_id: string }>('SELECT mod_id FROM ielts_content ORDER BY mod_id');
  return rows.map((r) => r.mod_id);
}

export async function upsertModuleOverride(
  modId: string,
  data: RichData,
  savedBy: string | null = null,
): Promise<void> {
  await query(
    `INSERT INTO ielts_content (mod_id, data, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (mod_id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = now()`,
    [modId, JSON.stringify(data)],
  );
  // Auto-backup a snapshot for version history (best-effort).
  try {
    await addVersion('ielts_module', modId, data, savedBy);
  } catch {
    /* versioning is non-critical */
  }
}

export async function deleteModuleOverride(modId: string): Promise<void> {
  await query('DELETE FROM ielts_content WHERE mod_id = $1', [modId]);
}
