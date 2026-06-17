import { AdmissionsPageV1 } from '@/components/redesign-v1/pages/AdmissionsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'admissions', locale: 'en', title: "Admissions & Programs: 1-on-1 Tutoring & College Coaching", description: "Subject tutoring, college admissions coaching and online international diploma programs taught 1-on-1 by top-50 university tutors. Book a trial and enrol in days." });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'admissions', locale: 'en', name: "Admissions & Programs: 1-on-1 Tutoring & College Coaching", description: "Subject tutoring, college admissions coaching and online international diploma programs taught 1-on-1 by top-50 university tutors. Book a trial and enrol in days.", type: 'CollectionPage' })} />
      <AdmissionsPageV1 locale="en" />
    </>
  );
}
