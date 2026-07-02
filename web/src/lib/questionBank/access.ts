import 'server-only';
import { query } from '@/lib/db/pg';
import { canonicalUid } from '@/lib/admin/accountLinks';

/**
 * Per-question-bank access control — which students may use a bank.
 * ----------------------------------------------------------------------
 * `all`       → every student (the default, backward-compatible).
 * `whitelist` → only the listed student uids.
 *
 * This is additive: it owns its OWN table (`question_bank_access`) rather than
 * touching the shared pg.ts schema, so it can't collide with the question-bank
 * authoring work. The default (no row) is `all`, so existing banks keep working.
 *
 * ENFORCEMENT: `studentCanAccess(bankId, uid)` is the gate. Wire it into the
 * student-facing entry for each bank (the /member SAT/IELTS flow) so a student
 * who isn't authorised is blocked; the admin UI + storage below already work.
 */
export type BankAccessMode = 'all' | 'whitelist';
export type BankAccess = { mode: BankAccessMode; students: string[] };

let ensured: Promise<void> | null = null;
function ensure(): Promise<void> {
  if (!ensured) {
    ensured = query(
      `CREATE TABLE IF NOT EXISTS question_bank_access (
         bank_id    text PRIMARY KEY,
         mode       text NOT NULL DEFAULT 'all',
         students   jsonb NOT NULL DEFAULT '[]'::jsonb,
         updated_at timestamptz NOT NULL DEFAULT now()
       )`,
    )
      .then(() => undefined)
      .catch((e) => {
        ensured = null;
        throw e;
      });
  }
  return ensured;
}

export async function getBankAccess(bankId: string): Promise<BankAccess> {
  await ensure();
  const rows = await query<{ mode: string; students: string[] | null }>(
    'SELECT mode, students FROM question_bank_access WHERE bank_id = $1',
    [bankId],
  );
  const r = rows[0];
  if (!r) return { mode: 'all', students: [] };
  return {
    mode: r.mode === 'whitelist' ? 'whitelist' : 'all',
    students: Array.isArray(r.students) ? r.students.map(String) : [],
  };
}

export async function setBankAccess(bankId: string, mode: BankAccessMode, students: string[]): Promise<void> {
  await ensure();
  const clean = mode === 'whitelist' ? [...new Set(students.map(String).filter(Boolean))] : [];
  await query(
    `INSERT INTO question_bank_access (bank_id, mode, students, updated_at)
     VALUES ($1, $2, $3::jsonb, now())
     ON CONFLICT (bank_id) DO UPDATE
       SET mode = EXCLUDED.mode, students = EXCLUDED.students, updated_at = now()`,
    [bankId, mode, JSON.stringify(clean)],
  );
}

/** The gate: is this student allowed to use this bank? Best-effort — on error
 *  (or when access is unconfigured) default to allowed, so a DB hiccup never
 *  locks students out of previously-open content. */
export async function studentCanAccess(bankId: string, uid: string): Promise<boolean> {
  try {
    const a = await getBankAccess(bankId);
    if (a.mode === 'all') return true;
    if (a.students.includes(uid)) return true;
    // Merged accounts: a student authorised under their primary uid should pass
    // when logging in via a linked (secondary) login too.
    const cuid = await canonicalUid(uid);
    return cuid !== uid && a.students.includes(cuid);
  } catch {
    return true;
  }
}

/** Filter a list of bank ids to those a student may access. */
export async function accessibleBankIds(bankIds: string[], uid: string): Promise<string[]> {
  const results = await Promise.all(bankIds.map(async (id) => ((await studentCanAccess(id, uid)) ? id : null)));
  return results.filter((x): x is string => x !== null);
}
