import { HighschoolMappingPageV1 } from '@/components/redesign-v1/pages/HighschoolMappingPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'highschoolMapping', locale: 'en', title: "High-School Mapping: A-Level, IB, AP & HKDSE Planning", description: 'NGS High-School Mapping guides students through school visits, school reports, entrance-exam prep and academic planning across A-Level, IB, AP and HKDSE.' });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'highschoolMapping', locale: 'en', name: "High-School Mapping: A-Level, IB, AP & HKDSE Planning", description: 'NGS High-School Mapping guides students through school visits, school reports, entrance-exam prep and academic planning across A-Level, IB, AP and HKDSE.', type: 'WebPage' })} />
      <HighschoolMappingPageV1 locale="en" />
    </>
  );
}
