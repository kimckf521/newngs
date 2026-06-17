import { CollegeMentorshipPageV1 } from '@/components/redesign-v1/pages/CollegeMentorshipPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'collegeMentorship',
  locale: 'en',
  title: "College Admissions Mentorship: 4-on-1 Guidance",
  description:
    "Personalized 4-on-1 college mentorship for top universities in the US, UK, Canada, Australia, Hong Kong & Singapore — essays, interviews & portfolios.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'collegeMentorship',
          locale: 'en',
          name: "College Admissions Mentorship: 4-on-1 Guidance",
          description:
            "Personalized 4-on-1 college mentorship for top universities in the US, UK, Canada, Australia, Hong Kong & Singapore — essays, interviews & portfolios.",
          type: 'WebPage',
        })}
      />
      <CollegeMentorshipPageV1 locale="en" />
    </>
  );
}
