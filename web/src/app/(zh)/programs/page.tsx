import { ProgramsPageV1 } from '@/components/redesign-v1/pages/ProgramsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'programs',
  locale: 'zh',
  title: 'IB/A-Level/AP/HKDSE 国际课程辅导',
  description: '覆盖 IB、A-Level/IGCSE、AP 与 HKDSE 的一对一与小班课程，由全球顶尖大学导师授课，紧贴考纲系统提分，并提供试听与家长旁听保障。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'programs',
          locale: 'zh',
          name: 'IB/A-Level/AP/HKDSE 国际课程辅导',
          description: '覆盖 IB、A-Level/IGCSE、AP 与 HKDSE 的一对一与小班课程，由全球顶尖大学导师授课，紧贴考纲系统提分，并提供试听与家长旁听保障。',
          type: 'CollectionPage',
        })}
      />
      <ProgramsPageV1 locale="zh" />
    </>
  );
}
