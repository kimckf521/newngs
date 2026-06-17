import { ProgramsPageV1 } from '@/components/redesign-v1/pages/ProgramsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'programs',
  locale: 'en',
  title: "IB, A-Level, AP & HKDSE Tutoring by Top Mentors",
  description: "One-to-one and small-group IB, A-Level/IGCSE, AP and HKDSE tutoring, taught by mentors from the world's leading universities and aligned to every exam syllabus.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'programs',
          locale: 'en',
          name: "IB, A-Level, AP & HKDSE Tutoring by Top Mentors",
          description: "One-to-one and small-group IB, A-Level/IGCSE, AP and HKDSE tutoring, taught by mentors from the world's leading universities and aligned to every exam syllabus.",
          type: 'CollectionPage',
        })}
      />
      <ProgramsPageV1 locale="en" />
    </>
  );
}
