import { HybridPageV1 } from '@/components/redesign-v1/pages/HybridPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'hybrid', locale: 'zh', title: '未来全域学习计划：线上+校园混合式国际课程', description: 'NGS 未来全域学习计划将线下校园教学与在线国际课程无缝结合，提供 A-Level、HKDSE、AP 灵活路径，面向中考毕业生定制专属学习节奏，融入全球导师社区。' });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'hybrid', locale: 'zh', name: '未来全域学习计划：线上+校园混合式国际课程', description: 'NGS 未来全域学习计划将线下校园教学与在线国际课程无缝结合，提供 A-Level、HKDSE、AP 灵活路径，面向中考毕业生定制专属学习节奏，融入全球导师社区。', type: 'Course' })} />
      <HybridPageV1 locale="zh" />
    </>
  );
}
