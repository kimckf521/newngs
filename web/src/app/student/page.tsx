import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberPortal } from '@/components/member/MemberPortal';

export const metadata: Metadata = {
  title: '会员中心',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <MemberPortal locale="zh" />
    </>
  );
}
