import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { IeltsMockTest } from '@/components/member/ielts/IeltsMockTest';
import { BankGate } from '@/components/member/BankGate';

export const metadata: Metadata = {
  title: 'IELTS on Computer · Test 1',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="en" />
      <BankGate bankId="ielts" locale="en">
        <IeltsMockTest />
      </BankGate>
    </>
  );
}
