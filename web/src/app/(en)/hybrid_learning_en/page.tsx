import { HybridPageV1 } from '@/components/redesign-v1/pages/HybridPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'hybrid', locale: 'en', title: "Hybrid A-Level, HKDSE & AP: Online + On-Campus", description: "NGS Hybrid Program blends on-campus classes with online A-Level, HKDSE and AP courses — flexible, personalized pathways for G9 graduates." });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'hybrid', locale: 'en', name: "Hybrid A-Level, HKDSE & AP: Online + On-Campus", description: "NGS Hybrid Program blends on-campus classes with online A-Level, HKDSE and AP courses — flexible, personalized pathways for G9 graduates.", type: 'Course' })} />
      <HybridPageV1 locale="en" />
    </>
  );
}
