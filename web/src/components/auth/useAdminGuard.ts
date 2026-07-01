'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

/**
 * Bounce a signed-in admin to the /admin console.
 *
 * Admins have their own portal and must never sit in a student/parent portal —
 * even when they arrive by a stale link, bookmark, or persisted session (the
 * post-login redirect already routes admins to /admin; this covers every OTHER
 * way of landing on a non-admin portal). Call it near the top of any non-admin
 * portal component.
 *
 * It never blocks rendering: non-admins (and signed-out visitors) are a no-op,
 * so there is zero regression for them. An admin renders the portal for a beat
 * and is then replaced to /admin — fine, since they're leaving anyway. Portals
 * that already spinner-gate on their own auth check (e.g. MemberDesignV1) should
 * instead fold the `role === 'admin'` check into that gate to avoid the flash.
 */
export function useAdminGuard(): void {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void getCurrentUser().then((u) => {
      if (active && u?.role === 'admin') router.replace('/admin');
    });
    return () => {
      active = false;
    };
  }, [router]);
}
