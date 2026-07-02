import 'server-only';
import { query, queryOne, withTransaction } from '@/lib/db/pg';

/**
 * Non-destructive account linking. One person may sign up via WeChat, phone AND
 * email — three `auth.users` rows for the same human. Rather than delete the
 * duplicates (auth.users is managed by CloudBase, so deleting is risky), we map
 * each SECONDARY uid to a PRIMARY (canonical) uid in `account_links`. Everything
 * that keys on uid — role resolution, the members list, bank access — resolves
 * to the primary, so the app treats all the person's logins as one identity.
 *
 * Invariants: a primary uid never has its own link row (no chains, no self-links).
 * Linking is only reachable through the ADMIN-key-gated members route.
 */

/** Resolve a uid to its canonical (primary) uid — itself if not linked.
 *  Best-effort: if the links table is unavailable, returns the uid unchanged. */
export async function canonicalUid(uid: string): Promise<string> {
  if (!uid) return uid;
  try {
    const row = await queryOne<{ primary_uid: string }>(
      'SELECT primary_uid FROM account_links WHERE uid = $1',
      [uid],
    );
    return row?.primary_uid || uid;
  } catch {
    return uid;
  }
}

/** All links as a { secondaryUid: primaryUid } map. Best-effort ({} on error). */
export async function getLinkMap(): Promise<Record<string, string>> {
  try {
    const rows = await query<{ uid: string; primary_uid: string }>(
      'SELECT uid, primary_uid FROM account_links',
    );
    const m: Record<string, string> = {};
    for (const r of rows) m[r.uid] = r.primary_uid;
    return m;
  } catch {
    return {};
  }
}

/**
 * Merge `secondaryUids` into `primaryUid` (all become aliases of the primary).
 * Atomic. Flattens any pre-existing chains: if the chosen primary was itself a
 * secondary, its root is used; if a secondary was itself a primary of others,
 * those others are re-pointed to the (new) root too. Idempotent.
 */
export async function linkAccounts(primaryUid: string, secondaryUids: string[]): Promise<void> {
  const primary = (primaryUid || '').trim();
  const secondaries = Array.from(
    new Set((secondaryUids || []).map((s) => (s || '').trim()).filter(Boolean)),
  );
  if (!primary) throw new Error('no_primary');
  if (secondaries.length === 0) return;

  await withTransaction(async (c) => {
    // Resolve the chosen primary to its own root so picking an already-linked
    // account as the primary can't create a chain.
    const rootRow = await c.query<{ primary_uid: string }>(
      'SELECT primary_uid FROM account_links WHERE uid = $1',
      [primary],
    );
    const root = rootRow.rows[0]?.primary_uid || primary;
    // A root must not carry its own link row.
    await c.query('DELETE FROM account_links WHERE uid = $1', [root]);

    for (const sec of secondaries) {
      if (sec === root) continue; // never link a uid to itself
      // If `sec` was a primary for other accounts, move those under the root.
      await c.query('UPDATE account_links SET primary_uid = $1 WHERE primary_uid = $2', [root, sec]);
      // Point `sec` -> root.
      await c.query(
        `INSERT INTO account_links (uid, primary_uid) VALUES ($1, $2)
         ON CONFLICT (uid) DO UPDATE SET primary_uid = EXCLUDED.primary_uid`,
        [sec, root],
      );
    }
    // Belt-and-braces: a self-link must never survive.
    await c.query('DELETE FROM account_links WHERE uid = primary_uid');
  });
}

/** Un-merge a single account: it becomes its own identity again. Idempotent. */
export async function unlinkAccount(uid: string): Promise<void> {
  const u = (uid || '').trim();
  if (!u) return;
  await query('DELETE FROM account_links WHERE uid = $1', [u]);
}
