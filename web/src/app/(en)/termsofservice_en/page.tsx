import { TermsPageV1 } from '@/components/redesign-v1/pages/TermsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'terms',
  locale: 'en',
  title: "Terms of Service: Fees, Refund & Course Policy",
  description: "Read NextGen Scholars' online teaching terms of service: course fees and payment, refund policy, tutor changes, and the rights and obligations of both parties.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'terms',
          locale: 'en',
          name: "Terms of Service: Fees, Refund & Course Policy",
          description: "Read NextGen Scholars' online teaching terms of service: course fees and payment, refund policy, tutor changes, and the rights and obligations of both parties.",
          type: 'WebPage',
        })}
      />
      <TermsPageV1 locale="en" />
    </>
  );
}
