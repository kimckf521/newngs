import { OnlineDiplomaPageV1 } from '@/components/redesign-v1/pages/OnlineDiplomaPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'onlineDiploma',
  locale: 'en',
  title: "Online Diploma Program | Accredited High-School Diploma",
  description:
    "Earn an accredited high-school diploma with our Online Diploma Program (ODP): study A-Level, HKDSE or AP online at your own pace, then sit official exams on campus.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'onlineDiploma',
          locale: 'en',
          name: "Online Diploma Program | Accredited High-School Diploma",
          description:
            "Earn an accredited high-school diploma with our Online Diploma Program (ODP): study A-Level, HKDSE or AP online at your own pace, then sit official exams on campus.",
          type: 'Course',
        })}
      />
      <OnlineDiplomaPageV1 locale="en" />
    </>
  );
}
