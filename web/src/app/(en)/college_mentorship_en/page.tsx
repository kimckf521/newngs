import { CollegeMentorshipPageV1 } from '@/components/redesign-v1/pages/CollegeMentorshipPageV1';

export const metadata = {
  title: 'College Mentorship — NextGen Scholars',
  description:
    'The NGS College Mentorship Program pairs every student with a Four-on-one mentor team for personalized college admissions guidance — academic planning, essays, interviews and portfolios for top universities across the US, UK, Canada, Australia, Hong Kong and Singapore.',
};

export default function Page() {
  return <CollegeMentorshipPageV1 locale="en" />;
}
