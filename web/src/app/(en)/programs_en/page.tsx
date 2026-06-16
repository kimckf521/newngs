import { ProgramsPageV1 } from '@/components/redesign-v1/pages/ProgramsPageV1';

export const metadata = {
  title: 'Programs — NextGen Scholars',
  description: 'One-to-one and small-group tuition across IB, A-Level / IGCSE, AP and HKDSE, taught by mentors from the world’s leading universities.',
};

export default function Page() {
  return <ProgramsPageV1 locale="en" />;
}
