import { ConnectsPageV1 } from '@/components/redesign-v1/pages/ConnectsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ngsConnects',
  locale: 'zh',
  title: 'NextGen Connects 深度访校 · 学校报告 · 成长规划',
  description:
    'NextGen Connects 助力家庭从容择校：深度访校、学校综合报告、成长地图与学术诊所，覆盖 A-Level、IB、AP、HKDSE，连接学校、家长与全球教育专家。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ngsConnects',
          locale: 'zh',
          name: 'NextGen Connects 深度访校 · 学校报告 · 成长规划',
          description:
            'NextGen Connects 助力家庭从容择校：深度访校、学校综合报告、成长地图与学术诊所，覆盖 A-Level、IB、AP、HKDSE，连接学校、家长与全球教育专家。',
          type: 'WebPage',
        })}
      />
      <ConnectsPageV1 locale="zh" />
    </>
  );
}
