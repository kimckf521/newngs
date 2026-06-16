import { TermsPageV1 } from '@/components/redesign-v1/pages/TermsPageV1';

export const metadata = {
  title: '服务协议 — NextGen Scholars',
  description: 'NextGen Scholars 线上教学服务协议：服务费用、退费政策、双方权利义务与违约责任。',
};

export default function Page() {
  return <TermsPageV1 locale="zh" />;
}
