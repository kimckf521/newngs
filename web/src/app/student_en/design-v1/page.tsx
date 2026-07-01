import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberDesignV1 } from '@/components/member/design-v1/MemberDesignV1';

export const metadata: Metadata = {
  title: 'Member Area · New Design',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <MemberDesignV1 locale="en" />
    </>
  );
}
