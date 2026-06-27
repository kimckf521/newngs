'use client';

import { getCurrentUser, isRealAuth } from '@/lib/auth';

/**
 * Whether the current user may use the /admin area.
 *
 * ✅ ADMIN AUTH IS ON. /admin requires the signed-in user to resolve to the
 * `admin` role — their email must be in the `admins` allowlist (see
 * /api/profile) — wherever real auth is configured (local + production).
 *
 * The gate lives in CODE, not in a NEXT_PUBLIC_* flag. That matters for deploy:
 * NEXT_PUBLIC_* vars are inlined at BUILD time, so a runtime-only env var would
 * silently NOT take effect. With the gate in code it "just works" in any build —
 * nothing to remember to set on CloudBase Run / Vercel.
 *
 * Notes:
 * - This is a UX gate (a client redirect). The real data boundary is the
 *   server-side ADMIN_API_KEY on the admin write APIs (members / courses / pages).
 * - Demo mode (no CloudBase env) stays open so the UI is usable with zero backend.
 * - Local dev MAY opt out with NEXT_PUBLIC_ADMIN_DEV_BYPASS=1 — this is IGNORED in
 *   production builds, so it can never open a deployed site.
 */
export async function isAdmin(): Promise<boolean> {
  if (!isRealAuth()) return true; // demo mode (no CloudBase) → open locally
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === '1') return true;
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
