import { PrivacyPageV1 } from '@/components/redesign-v1/pages/PrivacyPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'privacy',
  locale: 'en',
  title: "Privacy Policy | Your Data Protection & Rights",
  description:
    "Read the NextGen Scholars Privacy Policy: how we collect, use, share, and protect your personal data, plus your rights and how to contact us about privacy.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'privacy',
          locale: 'en',
          name: "Privacy Policy | Your Data Protection & Rights",
          description:
            "Read the NextGen Scholars Privacy Policy: how we collect, use, share, and protect your personal data, plus your rights and how to contact us about privacy.",
          type: 'WebPage',
        })}
      />
      <PrivacyPageV1 locale="en" />
    </>
  );
}
