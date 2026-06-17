import type { Metadata } from 'next';
import { LoginPageV1 } from '@/components/auth/LoginPageV1';

export const metadata: Metadata = { title: '会员登录 — NextGen Scholars' };

export default function Page() {
  return <LoginPageV1 locale="zh" />;
}
