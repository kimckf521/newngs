import type { Metadata } from 'next';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { RegisterPageV1 } from '@/components/auth/RegisterPageV1';

export const metadata: Metadata = { title: '创建账户 — NextGen Scholars' };

export default function Page() {
  return (
    <>
      <HtmlLang lang="zh" />
      <RegisterPageV1 locale="zh" />
    </>
  );
}
