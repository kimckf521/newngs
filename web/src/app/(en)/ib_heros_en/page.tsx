import { IbHerosPageV1 } from '@/components/redesign-v1/pages/IbHerosPageV1';

export const metadata = {
  title: 'IB Heros Tutoring — NextGen Scholars',
  description:
    'IB Heros is the Melbourne-based tutoring partner of NextGen Scholars, delivering data-driven one-to-one and small-group support across IB, A-Level/IGCSE, AP and HKDSE.',
};

export default function Page() {
  return <IbHerosPageV1 locale="en" />;
}
