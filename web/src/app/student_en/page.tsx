import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberPortal } from '@/components/member/MemberPortal';

export const metadata: Metadata = {
  title: 'Member Area',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <MemberPortal locale="en" />
    </>
  );
}
