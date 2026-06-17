'use client';

/**
 * User profile store — the CloudBase `users` collection.
 * ----------------------------------------------------------------------
 * One document per user, keyed by the auth uid (`_id == uid`), holding the
 * user's role (and a basic profile echo). Access is via the browser SDK, so
 * CloudBase SECURITY RULES are the real boundary — a user must only be able to
 * read/write their OWN `users` doc, and `role: 'admin'` must NOT be settable
 * from the client. The client here only ever writes self-selected roles.
 *
 * ONE-TIME CONSOLE SETUP (can't be done from app code):
 *   CloudBase 控制台 → 数据库 → create collection `users`, then a security rule
 *   such as:  { "read": "auth.uid == doc._id", "write": "auth.uid == doc._id" }
 *   Until the collection exists, reads/writes fail SOFTLY (logged) and roles
 *   fall back to DEFAULT_ROLE — auth keeps working either way.
 */
import { getCloudBaseApp } from './cloudbase';
import { getDemoUser, setDemoUser } from './demoAuth';
import { DEFAULT_ROLE, normalizeRole, type Role } from './roles';

const COLLECTION = 'users';

export interface UserProfile {
  uid: string;
  email?: string;
  name?: string;
  role: Role;
}

/**
 * Create/replace the current user's profile doc with their role. Best-effort:
 * NEVER throws — a failed write (collection or rules missing) is logged so
 * account creation isn't blocked. `role` must be a self-selected role
 * (student/parent); admin is assigned out-of-band.
 */
export async function setUserRole(
  uid: string,
  role: Role,
  profile: { email?: string; name?: string } = {},
): Promise<void> {
  const app = await getCloudBaseApp();
  if (!app) {
    // Demo mode (no CloudBase): persist the role on the local demo user.
    const u = getDemoUser();
    if (u) setDemoUser({ ...u, role });
    return;
  }
  try {
    await app
      .database()
      .collection(COLLECTION)
      .doc(uid)
      .set({ uid, email: profile.email, name: profile.name, role });
  } catch (e) {
    console.warn('[userProfile] setUserRole failed — is the `users` collection created + writable?', e);
  }
}

/**
 * Read the user's role from the `users` collection. Best-effort: any failure
 * (no doc, missing collection, denied by rules) resolves to DEFAULT_ROLE.
 */
export async function getUserRole(uid: string): Promise<Role> {
  const app = await getCloudBaseApp();
  if (!app) {
    return normalizeRole(getDemoUser()?.role);
  }
  try {
    const res = await app.database().collection(COLLECTION).doc(uid).get();
    const doc = Array.isArray(res?.data) ? (res.data[0] as { role?: unknown } | undefined) : undefined;
    return normalizeRole(doc?.role);
  } catch {
    return DEFAULT_ROLE;
  }
}
