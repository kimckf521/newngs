import { PrivacyPageV1 } from '@/components/redesign-v1/pages/PrivacyPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'privacy',
  locale: 'zh',
  title: '隐私政策 | 个人信息收集与保护说明',
  description:
    'NextGen Scholars 隐私政策说明我们如何收集、使用、共享与保护您的个人信息，以及您享有的数据访问、更正与删除权利和联系方式。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'privacy',
          locale: 'zh',
          name: '隐私政策 | 个人信息收集与保护说明',
          description:
            'NextGen Scholars 隐私政策说明我们如何收集、使用、共享与保护您的个人信息，以及您享有的数据访问、更正与删除权利和联系方式。',
          type: 'WebPage',
        })}
      />
      <PrivacyPageV1 locale="zh" />
    </>
  );
}
