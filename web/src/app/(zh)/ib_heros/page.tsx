import { IbHerosPageV1 } from '@/components/redesign-v1/pages/IbHerosPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ibHeros',
  locale: 'zh',
  title: 'IB Heros 国际课程辅导 — IB/A-Level/AP/HKDSE',
  description:
    'IB Heros 是 NextGen Scholars 的墨尔本辅导伙伴，以数据驱动的一对一与小班教学，覆盖 IB、A-Level/IGCSE、AP 与 HKDSE，服务全球学生家庭。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ibHeros',
          locale: 'zh',
          name: 'IB Heros 国际课程辅导 — IB/A-Level/AP/HKDSE',
          description:
            'IB Heros 是 NextGen Scholars 的墨尔本辅导伙伴，以数据驱动的一对一与小班教学，覆盖 IB、A-Level/IGCSE、AP 与 HKDSE，服务全球学生家庭。',
          type: 'AboutPage',
        })}
      />
      <IbHerosPageV1 locale="zh" />
    </>
  );
}
