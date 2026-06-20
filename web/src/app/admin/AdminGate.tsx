'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/puck/admins';

/**
 * Client guard for the /admin area (mirrors MemberPortal). UX gate only — the
 * real security boundary is the CloudBase security rule on `pages`.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void isAdmin().then((allowed) => {
      if (!active) return;
      if (!allowed) {
        router.replace('/login');
        return;
      }
      setOk(true);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready || !ok) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#fff', color: '#666', fontFamily: 'system-ui, sans-serif' }}>
        Checking access…
      </div>
    );
  }
  return <>{children}</>;
}
