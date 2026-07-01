import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { SatApp } from '@/components/member/sat/SatApp';
import { BankGate } from '@/components/member/BankGate';

export const metadata: Metadata = {
  title: 'Digital SAT · Practice Center',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page({ searchParams }: { searchParams?: { form?: string } }) {
  return (
    <>
      <HtmlLang lang="en" />
      {/* Open when the SAT bank is `all`; gated when an admin sets a whitelist. */}
      <BankGate bankId="sat" locale="zh">
        <SatApp formId={searchParams?.form} />
      </BankGate>
    </>
  );
}
