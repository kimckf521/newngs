import type { Metadata } from 'next';
import { RegisterPageV1 } from '@/components/auth/RegisterPageV1';

export const metadata: Metadata = { title: '创建账户 — NextGen Scholars' };

export default function Page() {
  return <RegisterPageV1 locale="zh" />;
}
