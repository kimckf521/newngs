import { ConnectsPageV1 } from '@/components/redesign-v1/pages/ConnectsPageV1';

export const metadata = {
  title: 'NextGen Connects — 深度访校 · 学校报告 · 成长规划 — NextGen Scholars',
  description:
    'NextGen Connects 帮助家庭从容应对择校全流程：深度访校、学校综合报告、成长地图与学术诊所，连接学校、家长与全球教育专家。',
};

export default function Page() {
  return <ConnectsPageV1 locale="zh" />;
}
