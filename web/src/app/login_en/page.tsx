import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { LoginPageV1 } from '@/components/auth/LoginPageV1';

export const metadata: Metadata = { title: 'Member Sign In — NextGen Scholars' };

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <LoginPageV1 locale="en" />
    </>
  );
}
