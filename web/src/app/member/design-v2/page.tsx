import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberDesignV2 } from '@/components/member/design-v2/MemberDesignV2';

export const metadata: Metadata = {
  title: '会员中心 · 学习中心',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <MemberDesignV2 locale="zh" />
    </>
  );
}
