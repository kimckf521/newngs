import { HighschoolMappingPageV1 } from '@/components/redesign-v1/pages/HighschoolMappingPageV1';

export const metadata = {
  title: 'High-School Mapping — NextGen Scholars',
  description:
    'The NGS High-School Mapping Program: school visits, school reports, entrance-exam prep and academic planning across A-Level, IB, AP and HKDSE, guided by K-12 school specialists.',
};

export default function Page() {
  return <HighschoolMappingPageV1 locale="en" />;
}
