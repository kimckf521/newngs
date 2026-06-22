import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberDesignV2 } from '@/components/member/design-v2/MemberDesignV2';

export const metadata: Metadata = {
  title: 'Member Area · Learning Hub',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <MemberDesignV2 locale="en" />
    </>
  );
}
