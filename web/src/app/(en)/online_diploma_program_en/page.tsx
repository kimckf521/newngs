import { OnlineDiplomaPageV1 } from '@/components/redesign-v1/pages/OnlineDiplomaPageV1';

export const metadata = {
  title: 'Online Diploma Program — NextGen Scholars',
  description:
    'The NGS Online Diploma Program (ODP) lets students learn online at their own pace, sit official exams on campus, and earn an accredited high-school diploma and transcript.',
};

export default function Page() {
  return <OnlineDiplomaPageV1 locale="en" />;
}
