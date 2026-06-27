import 'server-only';
import { dbConfigured, query } from '@/lib/db/pg';
import { normalizeRole, type Role } from '@/lib/roles';

/**
 * Server-side member management over PostgreSQL (see lib/db/pg.ts).
 * Members live in `app_users` (one row per auth uid); the page-builder
 * allowlist lives in `admins`. When DATABASE_URL is unset, membersConfigured()
 * is false and the API returns a "setup needed" state (the console then shows a
 * demo/local view) — so nothing breaks without a backend.
 */
export function membersConfigured(): boolean {
  return dbConfigured();
}

export type MemberRow = { uid: string; email: string; name: string; role: Role };

export async function listMembers(): Promise<MemberRow[]> {
  const rows = await query<{ uid: string; email: string | null; name: string | null; role: string }>(
    'SELECT uid, email, name, role FROM app_users ORDER BY updated_at DESC LIMIT 500',
  );
  return rows.map((u) => ({
    uid: u.uid,
    email: u.email || '',
    name: u.name || '',
    role: normalizeRole(u.role),
  }));
}

/** Set a member's role, keeping the `admins` allowlist (email-keyed, the source
 *  of truth for admin status) in sync: promoting adds the email, demoting
 *  removes it — so a demote actually revokes admin/editor access. */
export async function setMemberRole(uid: string, role: Role): Promise<void> {
  await query('UPDATE app_users SET role = $1, updated_at = now() WHERE uid = $2', [role, uid]);
  if (role === 'admin') {
    // Copy the member's email into the allowlist in one statement (skips if the
    // user row has no email, and no-ops if the email is already listed).
    await query(
      `INSERT INTO admins (email)
       SELECT email FROM app_users WHERE uid = $1 AND email IS NOT NULL AND email <> ''
       ON CONFLICT (email) DO NOTHING`,
      [uid],
    );
  } else {
    await query('DELETE FROM admins WHERE email = (SELECT email FROM app_users WHERE uid = $1)', [uid]);
  }
}

/** Add an email directly to the `admins` allowlist — makes that account an admin
 *  by email, even before its first login (app_users is uid-keyed, but admin
 *  status is resolved from this allowlist). Idempotent. */
export async function addAdminEmail(email: string): Promise<void> {
  await query('INSERT INTO admins (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email.trim()]);
  // If the user has already signed in, reflect it on their row too (cosmetic).
  await query("UPDATE app_users SET role = 'admin', updated_at = now() WHERE email = $1", [email.trim()]);
}
