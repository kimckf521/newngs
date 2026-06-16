import { IbHerosPageV1 } from '@/components/redesign-v1/pages/IbHerosPageV1';

export const metadata = {
  title: 'IB Heros 学术辅导 — NextGen Scholars',
  description:
    'IB Heros 是 NextGen Scholars 的墨尔本辅导合作伙伴，以数据驱动的一对一与小班教学，覆盖 IB、A-Level/IGCSE、AP 与 HKDSE 等核心国际课程。',
};

export default function Page() {
  return <IbHerosPageV1 locale="zh" />;
}
