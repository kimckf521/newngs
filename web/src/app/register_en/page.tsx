import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { RegisterPageV1 } from '@/components/auth/RegisterPageV1';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <RegisterPageV1 locale="en" />
    </>
  );
}
