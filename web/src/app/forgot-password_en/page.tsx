import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { ForgotPageV1 } from '@/components/auth/ForgotPageV1';

export const metadata: Metadata = { title: 'Reset Password — NextGen Scholars' };

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <ForgotPageV1 locale="en" />
    </>
  );
}
