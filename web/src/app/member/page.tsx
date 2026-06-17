import type { Metadata } from 'next';
import { MemberPageV1 } from '@/components/auth/MemberPageV1';

export const metadata: Metadata = { title: '会员中心 — NextGen Scholars' };

export default function Page() {
  return <MemberPageV1 locale="zh" />;
}
