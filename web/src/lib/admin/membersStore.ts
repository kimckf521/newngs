import 'server-only';
import { dbConfigured, query } from '@/lib/db/pg';
import { canonicalUid, getLinkMap } from '@/lib/admin/accountLinks';
import { normalizeRole, type Role } from '@/lib/roles';

/**
 * Server-side member management over PostgreSQL (see lib/db/pg.ts).
 *
 * The members list is the AUTH DIRECTORY itself — CloudBase's new-gen auth is a
 * Supabase-style stack in the SAME database, so the source of truth is the
 * `auth.users` table (every signed-up user, incl. WeChat logins that have no
 * email/phone). We LEFT JOIN our own role data: `app_users.role` (per uid) and
 * the `admins` email allowlist. This way the admin Members tab matches the
 * CloudBase 身份认证 console exactly, instead of only showing users who happened
 * to trigger a login-sync into `app_users`.
 *
 * If the `auth` schema isn't readable (a different DB account / env), we fall
 * back to listing `app_users` only.
 */
export function membersConfigured(): boolean {
  return dbConfigured();
}

export type LoginVia = 'wechat' | 'email' | 'phone' | 'account' | 'other';
/** A secondary account merged into this member (see account_links). */
export type LinkedAccount = { uid: string; email: string; phone: string; loginVia: LoginVia };
export type MemberRow = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  loginVia: LoginVia;
  lastLogin: string;
  /** Other login accounts merged into this one (WeChat/phone/email of the same
   *  person). Present only on the primary row; the secondaries are folded in. */
  linked?: LinkedAccount[];
};

/** CloudBase stores a placeholder like "+86 -" for non-phone accounts. */
function realPhone(p: string | null): string {
  const t = (p || '').trim();
  return /\d{4,}/.test(t) ? t : '';
}

type AuthRow = {
  uid: string;
  name: string | null;
  stored_name: string | null;
  email: string | null;
  phone: string | null;
  providers: Array<{ id?: string }> | null;
  stored_role: string | null;
  in_allowlist: boolean;
  last_login: string | null;
};

function deriveLoginVia(u: AuthRow): LoginVia {
  const ids = (Array.isArray(u.providers) ? u.providers : []).map((p) => String(p?.id || ''));
  if (ids.some((id) => id.startsWith('wx'))) return 'wechat'; // wx:<openid>
  if (u.email) return 'email';
  if (realPhone(u.phone)) return 'phone';
  if (ids.some((id) => id.startsWith('weda'))) return 'account'; // built-in console account
  return 'other';
}

async function listFromAppUsers(): Promise<MemberRow[]> {
  const rows = await query<{ uid: string; email: string | null; name: string | null; role: string }>(
    'SELECT uid, email, name, role FROM app_users ORDER BY updated_at DESC LIMIT 500',
  );
  return rows.map((u) => ({
    uid: u.uid,
    email: u.email || '',
    name: u.name || '',
    phone: '',
    role: normalizeRole(u.role),
    loginVia: u.email ? 'email' : 'other',
    lastLogin: '',
  }));
}

export async function listMembers(): Promise<MemberRow[]> {
  let rows: AuthRow[];
  try {
    rows = await query<AuthRow>(
      `SELECT u.id::text AS uid, u.name, au.name AS stored_name, u.email, u.phone_number AS phone, u.providers,
              au.role AS stored_role,
              (a.email IS NOT NULL) AS in_allowlist,
              to_char(u.last_login, 'YYYY-MM-DD HH24:MI') AS last_login
       FROM auth.users u
       LEFT JOIN app_users au ON au.uid = u.id::text
       LEFT JOIN admins a ON a.email IS NOT NULL AND lower(a.email) = lower(u.email)
       ORDER BY u.last_login DESC NULLS LAST
       LIMIT 500`,
    );
  } catch {
    return listFromAppUsers(); // auth schema unavailable → our table only
  }
  const all: MemberRow[] = rows.map((u) => ({
    uid: u.uid,
    email: u.email || '',
    name: u.name || u.stored_name || '',
    phone: realPhone(u.phone),
    // The email allowlist wins; otherwise the per-uid stored role (default student).
    role: u.in_allowlist ? 'admin' : normalizeRole(u.stored_role),
    loginVia: deriveLoginVia(u),
    lastLogin: u.last_login || '',
  }));

  // Merged accounts: fold every secondary into its primary's `linked` array so
  // one person shows as ONE row with all their login methods. Best-effort — if
  // there are no links (or the table is unavailable) the list is returned as-is.
  const linkMap = await getLinkMap();
  if (Object.keys(linkMap).length === 0) return all;
  const byUid = new Map(all.map((m) => [m.uid, m]));
  const result: MemberRow[] = [];
  for (const m of all) {
    const primaryUid = linkMap[m.uid];
    const primary = primaryUid ? byUid.get(primaryUid) : undefined;
    if (primary) {
      (primary.linked ??= []).push({ uid: m.uid, email: m.email, phone: m.phone, loginVia: m.loginVia });
    } else {
      result.push(m); // a primary, or an orphan link (keep visible)
    }
  }
  return result;
}

/**
 * Set a member's role. Upserts `app_users` (creating the row from `auth.users`
 * if the user was never login-synced — e.g. a WeChat user), so the role sticks
 * for ANY user in the directory. Keeps the `admins` email allowlist in sync for
 * users that have an email (WeChat users have none — their admin status lives on
 * `app_users.role`, which the gate also honours).
 */
export async function setMemberRole(rawUid: string, role: Role): Promise<void> {
  // Write the role to the PRIMARY (canonical) account, so a merged person's role
  // is consistent across all their logins. No-op for un-linked accounts.
  const uid = await canonicalUid(rawUid);
  try {
    await query(
      `INSERT INTO app_users (uid, email, name, role)
       SELECT u.id::text, u.email, u.name, $2 FROM auth.users u WHERE u.id::text = $1
       ON CONFLICT (uid) DO UPDATE SET role = EXCLUDED.role, updated_at = now()`,
      [uid, role],
    );
  } catch {
    await query(
      `INSERT INTO app_users (uid, role) VALUES ($1, $2)
       ON CONFLICT (uid) DO UPDATE SET role = EXCLUDED.role, updated_at = now()`,
      [uid, role],
    );
  }
  if (role === 'admin') {
    await query(
      `INSERT INTO admins (email)
       SELECT lower(email) FROM app_users WHERE uid = $1 AND email IS NOT NULL AND email <> ''
       ON CONFLICT (email) DO NOTHING`,
      [uid],
    );
  } else {
    await query(
      `DELETE FROM admins WHERE lower(email) = (SELECT lower(email) FROM app_users WHERE uid = $1 AND email IS NOT NULL AND email <> '')`,
      [uid],
    );
  }
}

/** Add an email directly to the `admins` allowlist — makes that account an admin
 *  by email, even before its first login. Idempotent. */
export async function addAdminEmail(email: string): Promise<void> {
  const norm = email.trim().toLowerCase();
  await query('INSERT INTO admins (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [norm]);
  await query("UPDATE app_users SET role = 'admin', updated_at = now() WHERE lower(email) = $1", [norm]);
}
