import { CclrPageV1 } from '@/components/redesign-v1/pages/CclrPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'cclr',
  locale: 'zh',
  title: 'CCLR 升学探索课程：贯穿高中四年',
  description:
    'NGS 升学探索课程（CCLR）为学校与家庭打造高中四年完整框架，全面塑造大学、职业、人生胜任力与全球竞争力，助学生自信迈向升学与未来。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'cclr',
          locale: 'zh',
          name: 'CCLR 升学探索课程：贯穿高中四年',
          description:
            'NGS 升学探索课程（CCLR）为学校与家庭打造高中四年完整框架，全面塑造大学、职业、人生胜任力与全球竞争力，助学生自信迈向升学与未来。',
          type: 'Course',
        })}
      />
      <CclrPageV1 locale="zh" />
    </>
  );
}
