import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { SatApp } from '@/components/member/sat/SatApp';

export const metadata: Metadata = {
  title: 'Digital SAT · Practice Center',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page({ searchParams }: { searchParams?: { form?: string } }) {
  return (
    <>
      <HtmlLang lang="en" />
      <SatApp formId={searchParams?.form} />
    </>
  );
}
