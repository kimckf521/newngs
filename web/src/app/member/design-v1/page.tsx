import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberDesignV1 } from '@/components/member/design-v1/MemberDesignV1';

export const metadata: Metadata = {
  title: '会员中心 · 新设计',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <MemberDesignV1 locale="zh" />
    </>
  );
}
