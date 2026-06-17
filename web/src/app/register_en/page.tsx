import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { RegisterPageV1 } from '@/components/auth/RegisterPageV1';

export const metadata: Metadata = { title: 'Create Account — NextGen Scholars' };

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <RegisterPageV1 locale="en" />
    </>
  );
}
