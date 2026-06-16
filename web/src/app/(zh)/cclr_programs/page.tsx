import { CclrPageV1 } from '@/components/redesign-v1/pages/CclrPageV1';

export const metadata = {
  title: 'NGS 升学探索课程 — NextGen Scholars',
  description:
    'NGS 升学探索课程（CCLR）为学校和家庭提供高中四年完整、循序渐进的升学课程框架，全面塑造学生的大学、职业、人生胜任力与全球竞争力。',
};

export default function Page() {
  return <CclrPageV1 locale="zh" />;
}
