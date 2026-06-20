'use client';

import { getCurrentUser, isRealAuth } from '@/lib/auth';
import { getCloudBaseApp } from '@/lib/cloudbase';

/**
 * Whether the current user may use the admin editor.
 *
 * ⚠️ ADMIN AUTH IS CURRENTLY OFF (trial mode) — `/admin` is open to anyone with
 * the URL, no login. This was requested to trial the page builder. The real
 * publish protection is still the CloudBase security rule on the `pages`
 * collection. RE-ENABLE before public launch by setting NEXT_PUBLIC_ADMIN_AUTH=1
 * in the build env (no code change needed) — that restores the gate below.
 */
export async function isAdmin(): Promise<boolean> {
  // Gate is OFF unless explicitly turned on. (NEXT_PUBLIC is inlined at build
  // time, so flipping this requires a rebuild — which is fine.)
  if (process.env.NEXT_PUBLIC_ADMIN_AUTH !== '1') return true;
  return checkAdmin();
}

/**
 * The real gate (used when NEXT_PUBLIC_ADMIN_AUTH=1):
 * - Demo mode (no CloudBase env) → true, so the editor is usable locally.
 * - Real mode → true only if the signed-in user's email is in the `admins`
 *   collection. NOTE: this is a UX gate only — the real security boundary is
 *   the CloudBase security rule on the `pages` collection (admins-only writes).
 *
 * Dev escape hatch: NEXT_PUBLIC_ADMIN_DEV_BYPASS=1 (dev builds only).
 */
async function checkAdmin(): Promise<boolean> {
  if (!isRealAuth()) return true;
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === '1') return true;
  const user = await getCurrentUser();
  if (!user?.email) return false;
  try {
    const app = await getCloudBaseApp();
    if (!app) return false;
    const res = await app.database().collection('admins').where({ email: user.email }).get();
    return Array.isArray(res?.data) && res.data.length > 0;
  } catch {
    return false;
  }
}
