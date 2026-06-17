import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { LoginPageV1 } from '@/components/auth/LoginPageV1';

export const metadata: Metadata = {
  title: '会员登录',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <LoginPageV1 locale="zh" />
    </>
  );
}
