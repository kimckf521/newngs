import { InspiresPageV1 } from '@/components/redesign-v1/pages/InspiresPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ngsInspires',
  locale: 'zh',
  title: 'NextGen Inspires 全球学习社区订阅服务',
  description:
    'NextGen Inspires 是面向 NGS 合作学校的独家订阅服务，连接全球行业领袖、世界名校、SPARK LAB 与全球校友网络，为学生开启成长机遇。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ngsInspires',
          locale: 'zh',
          name: 'NextGen Inspires 全球学习社区订阅服务',
          description:
            'NextGen Inspires 是面向 NGS 合作学校的独家订阅服务，连接全球行业领袖、世界名校、SPARK LAB 与全球校友网络，为学生开启成长机遇。',
          type: 'WebPage',
        })}
      />
      <InspiresPageV1 locale="zh" />
    </>
  );
}
