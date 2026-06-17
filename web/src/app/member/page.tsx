import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberPageV1 } from '@/components/auth/MemberPageV1';

export const metadata: Metadata = {
  title: '会员中心',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <MemberPageV1 locale="zh" />
    </>
  );
}
