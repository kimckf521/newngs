import { PrivacyPageV1 } from '@/components/redesign-v1/pages/PrivacyPageV1';

export const metadata = {
  title: 'Privacy Policy — NextGen Scholars',
  description:
    'NextGen Scholars Privacy Policy: how we collect, use, and protect the personal information you share with us.',
};

export default function Page() {
  return <PrivacyPageV1 locale="en" />;
}
