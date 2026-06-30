import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { SatMock } from '@/components/member/sat/SatMock';

export const metadata: Metadata = {
  title: 'Digital SAT 机考模拟 · Practice Test',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page({ searchParams }: { searchParams?: { form?: string } }) {
  return (
    <>
      <HtmlLang lang="en" />
      <SatMock formId={searchParams?.form} />
    </>
  );
}
