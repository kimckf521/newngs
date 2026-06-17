import { DualTrackPageV1 } from '@/components/redesign-v1/pages/DualTrackPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'dualTrack',
  locale: 'en',
  title: 'Dual-Track Program: Earn Two High School Diplomas',
  description:
    "Transition into IB, A-Level, AP & HKDSE without disrupting Gaokao studies. NGS Dual-Track students earn both public-school and international diplomas.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'dualTrack',
          locale: 'en',
          name: 'Dual-Track Program: Earn Two High School Diplomas',
          description:
            "Transition into IB, A-Level, AP & HKDSE without disrupting Gaokao studies. NGS Dual-Track students earn both public-school and international diplomas.",
          type: 'Course',
        })}
      />
      <DualTrackPageV1 locale="en" />
    </>
  );
}
