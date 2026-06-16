import { PrivacyPageV1 } from '@/components/redesign-v1/pages/PrivacyPageV1';

export const metadata = {
  title: '隐私政策 — NextGen Scholars',
  description: 'NextGen Scholars 隐私政策：我们如何收集、使用并保护您与我们分享的个人信息。',
};

export default function Page() {
  return <PrivacyPageV1 locale="zh" />;
}
