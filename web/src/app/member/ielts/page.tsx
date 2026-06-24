import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { IeltsMockTest } from '@/components/member/ielts/IeltsMockTest';

export const metadata: Metadata = {
  title: 'IELTS 机考模拟 · Test 1',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <IeltsMockTest />
    </>
  );
}
