import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminGate } from './AdminGate';

export const metadata: Metadata = {
  title: 'Site editor — NextGen Scholars',
  robots: { index: false, follow: false },
};

/** Admin area lives OUTSIDE the (zh)/(en) groups, so it gets no site chrome
 *  (header/footer/FAB). Neutral light surface for the Puck editor UI. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <AdminGate>{children}</AdminGate>
    </div>
  );
}
