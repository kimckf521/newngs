import type { Metadata } from 'next';
import { ForgotPageV1 } from '@/components/auth/ForgotPageV1';

export const metadata: Metadata = { title: '重置密码 — NextGen Scholars' };

export default function Page() {
  return <ForgotPageV1 locale="zh" />;
}
