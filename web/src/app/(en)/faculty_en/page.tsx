import { FacultyPageV1 } from '@/components/redesign-v1/pages/FacultyPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'faculty', locale: 'en', title: "Faculty: Tutors from Top Global Universities", description: "Meet NGS tutors — IB 40+ scorers, Top-50 graduates and Olympiad medalists teaching IB, A-Level, AP and HKDSE one-to-one and in small groups." });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'faculty', locale: 'en', name: "Faculty: Tutors from Top Global Universities", description: "Meet NGS tutors — IB 40+ scorers, Top-50 graduates and Olympiad medalists teaching IB, A-Level, AP and HKDSE one-to-one and in small groups.", type: 'CollectionPage' })} />
      <FacultyPageV1 locale="en" />
    </>
  );
}
