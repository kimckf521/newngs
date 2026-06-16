import { HighschoolMappingPageV1 } from '@/components/redesign-v1/pages/HighschoolMappingPageV1';

export const metadata = {
  title: 'K12 国际高中规划 — NextGen Scholars',
  description:
    'NGS 国际高中规划：覆盖 A-Level、IB、AP 与 HKDSE 的探校、学校报告、入学考试准备与学术规划，由 K-12 择校导师全程陪伴。',
};

export default function Page() {
  return <HighschoolMappingPageV1 locale="zh" />;
}
