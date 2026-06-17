import { TermsPageV1 } from '@/components/redesign-v1/pages/TermsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'terms',
  locale: 'zh',
  title: '服务协议：费用、退费政策与双方权责',
  description: 'NextGen Scholars 线上教学服务协议，详解课程费用与付款方式、退费政策、更换导师规则及委托人与 NGS 的权利义务与违约责任。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'terms',
          locale: 'zh',
          name: '服务协议：费用、退费政策与双方权责',
          description: 'NextGen Scholars 线上教学服务协议，详解课程费用与付款方式、退费政策、更换导师规则及委托人与 NGS 的权利义务与违约责任。',
          type: 'WebPage',
        })}
      />
      <TermsPageV1 locale="zh" />
    </>
  );
}
