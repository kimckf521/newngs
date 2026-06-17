import { InProgressPageV1 } from '@/components/redesign-v1/pages/InProgressPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'inProgress', locale: 'zh', title: '页面建设中 — 内容即将上线', description: '此页面正在积极建设中，实时更新即将上线。在此期间，欢迎返回未来学者首页或浏览我们的国际课程体系，其他内容均已就绪。', noindex: true });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'inProgress', locale: 'zh', name: '页面建设中 — 内容即将上线', description: '此页面正在积极建设中，实时更新即将上线。在此期间，欢迎返回未来学者首页或浏览我们的国际课程体系，其他内容均已就绪。', type: 'WebPage' })} />
      <InProgressPageV1 locale="zh" />
    </>
  );
}
