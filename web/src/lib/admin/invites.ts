import 'server-only';
import { query } from '@/lib/db/pg';
import { normalizeRole, type Role } from '@/lib/roles';

/**
 * Member invites (pre-authorization). CloudBase won't let an admin mint a login
 * (username signup is OTP-gated at the SDK level), so instead the admin
 * pre-authorizes an EMAIL + role. When that person signs up their own way and
 * their email matches, the role is applied on first login and the invite is
 * consumed (see applyInvite, called from /api/profile POST).
 *
 * Scope: student / parent only. Admin is granted via the role dropdown /
 * `admins` allowlist on an existing account — kept out of invites so an
 * unauthenticated signup can never self-escalate to admin.
 */
export type Invite = { email: string; name: string; role: Role; createdAt: string };

/** Invites only pre-assign non-admin roles. */
function inviteRole(role: Role): 'student' | 'parent' {
  return role === 'parent' ? 'parent' : 'student';
}

export async function listInvites(): Promise<Invite[]> {
  try {
    const rows = await query<{ email: string; name: string | null; role: string; created_at: string }>(
      `SELECT email, name, role, to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
       FROM member_invites ORDER BY created_at DESC LIMIT 200`,
    );
    return rows.map((r) => ({ email: r.email, name: r.name || '', role: normalizeRole(r.role), createdAt: r.created_at }));
  } catch {
    return [];
  }
}

export async function createInvite(email: string, name: string, role: Role): Promise<void> {
  const e = email.trim().toLowerCase();
  await query(
    `INSERT INTO member_invites (email, name, role) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, created_at = now()`,
    [e, name.trim() ? name.trim().slice(0, 200) : null, inviteRole(role)],
  );
}

export async function cancelInvite(email: string): Promise<void> {
  await query('DELETE FROM member_invites WHERE lower(email) = lower($1)', [email.trim()]);
}

/**
 * Apply a pending invite to a just-signed-in user, then consume it. Called from
 * the (unauthenticated) profile POST — so it ONLY upgrades a default `student`
 * to `parent` (never downgrades, never grants admin), and only when an invite
 * for this exact email exists. Best-effort.
 */
export async function applyInvite(uid: string, email: string): Promise<void> {
  const e = (email || '').trim();
  if (!uid || !e) return;
  try {
    await query(
      `UPDATE app_users SET role = 'parent', updated_at = now()
       WHERE uid = $1 AND role = 'student'
         AND EXISTS (SELECT 1 FROM member_invites WHERE lower(email) = lower($2) AND role = 'parent')`,
      [uid, e],
    );
    await query('DELETE FROM member_invites WHERE lower(email) = lower($1)', [e]);
  } catch {
    /* best-effort: a DB hiccup must never block sign-in */
  }
}
