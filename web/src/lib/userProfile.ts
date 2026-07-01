'use client';

/**
 * User profile store — the app's role for the signed-in user.
 * ----------------------------------------------------------------------
 * Roles live in the PostgreSQL `app_users` table (keyed by auth uid), reached
 * through the server route /api/profile (see app/api/profile/route.ts). The
 * browser never touches the DB directly: writes are limited to the self-
 * selectable roles server-side, and admin can only be granted via the secret-
 * gated members route — so the client can't escalate itself.
 *
 * Best-effort everywhere: if the backend isn't configured (no DATABASE_URL) or
 * a request fails, we fall back to the local demo user and DEFAULT_ROLE, so
 * auth keeps working with zero backend.
 */
import { isCloudBaseConfigured } from './cloudbase';
import { getDemoUser, setDemoUser } from './demoAuth';
import { DEFAULT_ROLE, normalizeRole, type Role } from './roles';

/**
 * Create/refresh the current user's profile row with their role. Best-effort —
 * NEVER throws. `role` must be a self-selected role (student/parent); admin is
 * assigned out-of-band via the members route.
 */
export async function setUserRole(
  uid: string,
  role: Role,
  profile: { email?: string; name?: string } = {},
  /** When true, a failed write THROWS instead of being swallowed — used at
   *  registration so the user isn't optimistically routed as a role that never
   *  persisted (a DB hiccup would otherwise silently demote them on next load).
   *  Best-effort backfills (login/getCurrentUser) leave it false. The server
   *  only CREATES the role if absent — it never overwrites an existing role. */
  required = false,
): Promise<void> {
  if (!isCloudBaseConfigured()) {
    // Demo mode (no real auth): persist the role on the local demo user.
    const u = getDemoUser();
    if (u) setDemoUser({ ...u, role });
    return;
  }
  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: profile.email, name: profile.name, role }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !data?.ok) {
      if (required) throw new Error('role_write_failed');
      console.warn('[userProfile] setUserRole write not ok', res.status);
    }
  } catch (e) {
    if (required) throw e;
    console.warn('[userProfile] setUserRole failed — is DATABASE_URL set + reachable?', e);
  }
}

/**
 * Read the user's role from /api/profile. Passing the email lets the server
 * honour the `admins` allowlist (email-keyed) — so adding an email to `admins`
 * makes that account an admin even before its first login. Best-effort: any
 * failure (not configured, network, no row) resolves to DEFAULT_ROLE.
 */
export async function getUserRole(uid: string, email?: string): Promise<Role> {
  if (!isCloudBaseConfigured()) {
    return normalizeRole(getDemoUser()?.role);
  }
  try {
    const qs = new URLSearchParams();
    if (uid) qs.set('uid', uid);
    if (email) qs.set('email', email);
    const res = await fetch(`/api/profile?${qs.toString()}`);
    const data = (await res.json().catch(() => null)) as { ok?: boolean; role?: unknown } | null;
    if (data?.ok) return normalizeRole(data.role);
  } catch {
    /* fall through */
  }
  return DEFAULT_ROLE;
}
