import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { MemberPageV1 } from '@/components/auth/MemberPageV1';

export const metadata: Metadata = { title: 'Member Area — NextGen Scholars' };

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <MemberPageV1 locale="en" />
    </>
  );
}
