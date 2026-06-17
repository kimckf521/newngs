import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { ForgotPageV1 } from '@/components/auth/ForgotPageV1';

export const metadata: Metadata = {
  title: '重置密码',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <ForgotPageV1 locale="zh" />
    </>
  );
}
