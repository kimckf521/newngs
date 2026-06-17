'use client';

import { getCurrentUser, isRealAuth } from '@/lib/auth';
import { getCloudBaseApp } from '@/lib/cloudbase';

/**
 * Whether the current user may use the admin editor.
 *
 * - Demo mode (no CloudBase env): always true, so the editor is usable locally
 *   without a backend.
 * - Real mode: true only if the signed-in user's email is in the `admins`
 *   collection. NOTE: this is a UX gate only — the real security boundary is
 *   the CloudBase security rule on the `pages` collection (admins-only writes).
 *
 * Dev escape hatch: set NEXT_PUBLIC_ADMIN_DEV_BYPASS=1 to force-allow (local
 * testing of the editor against a real env before the `admins` allowlist /
 * console setup is finished).
 */
export async function isAdmin(): Promise<boolean> {
  if (!isRealAuth()) return true;
  // Dev-only escape hatch — guarded by NODE_ENV so it's dead-code-eliminated
  // from production builds (can never open the editor to visitors in prod).
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
