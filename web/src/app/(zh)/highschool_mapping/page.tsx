import { HighschoolMappingPageV1 } from '@/components/redesign-v1/pages/HighschoolMappingPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'highschoolMapping', locale: 'zh', title: '国际高中规划：A-Level/IB/AP/HKDSE 择校与升学', description: 'NGS 国际高中规划提供探校、学校综合报告、入学考试准备与学术规划，覆盖 A-Level、IB、AP 与 HKDSE 课程，由 K-12 择校导师全程陪伴升学路径。' });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'highschoolMapping', locale: 'zh', name: '国际高中规划：A-Level/IB/AP/HKDSE 择校与升学', description: 'NGS 国际高中规划提供探校、学校综合报告、入学考试准备与学术规划，覆盖 A-Level、IB、AP 与 HKDSE 课程，由 K-12 择校导师全程陪伴升学路径。', type: 'WebPage' })} />
      <HighschoolMappingPageV1 locale="zh" />
    </>
  );
}
