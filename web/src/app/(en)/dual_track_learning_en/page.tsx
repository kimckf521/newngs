import { DualTrackPageV1 } from '@/components/redesign-v1/pages/DualTrackPageV1';

export const metadata = {
  title: 'Dual-Track Program — NextGen Scholars',
  description:
    'A customised support system that helps local-school students transition into IB, A-Level, AP and HKDSE without disrupting their Gaokao studies — earning both a public-school and an international diploma.',
};

export default function Page() {
  return <DualTrackPageV1 locale="en" />;
}
