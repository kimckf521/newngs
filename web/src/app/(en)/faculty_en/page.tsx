import { FacultyPageV1 } from '@/components/redesign-v1/pages/FacultyPageV1';

export const metadata = {
  title: 'Faculty — NextGen Scholars',
  description: 'Meet the NGS teaching team — mentors from the world’s leading universities across IB, A-Level, AP and HKDSE math, science, English, history, arts and college guidance.',
};

export default function Page() {
  return <FacultyPageV1 locale="en" />;
}
