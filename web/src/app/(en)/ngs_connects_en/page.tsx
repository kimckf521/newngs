import { ConnectsPageV1 } from '@/components/redesign-v1/pages/ConnectsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ngsConnects',
  locale: 'en',
  title: "NextGen Connects: School Visits, Reports & Mapping",
  description:
    "Navigate international school selection with deep K12 school visits, in-depth school reports, growth mapping and academic clinics across A-Level, IB, AP & HKDSE.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ngsConnects',
          locale: 'en',
          name: "NextGen Connects: School Visits, Reports & Mapping",
          description:
            "Navigate international school selection with deep K12 school visits, in-depth school reports, growth mapping and academic clinics across A-Level, IB, AP & HKDSE.",
          type: 'WebPage',
        })}
      />
      <ConnectsPageV1 locale="en" />
    </>
  );
}
