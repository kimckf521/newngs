import type { Metadata } from 'next';
import { ParentPortal } from '@/components/parent/ParentPortal';

export const metadata: Metadata = {
  title: 'Parent Hub — NextGen Scholars',
  robots: { index: false, follow: false },
};

/** Parent portal ("家长中心") — a parent monitors their linked children's study
 *  progress. Scaffold w/ sample data; real linking + live progress is next phase. */
export default function ParentPage() {
  return <ParentPortal locale="zh" />;
}
