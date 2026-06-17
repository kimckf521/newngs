import { CollegeMentorshipPageV1 } from '@/components/redesign-v1/pages/CollegeMentorshipPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'collegeMentorship',
  locale: 'zh',
  title: '升学辅导：4 对 1 名校申请导师',
  description:
    'NGS 升学辅导课程提供 4 对 1 个性化导师团队，全程辅导学术规划、文书、面试与作品集，助你申请美英加澳港新顶尖大学，圆梦名校。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'collegeMentorship',
          locale: 'zh',
          name: '升学辅导：4 对 1 名校申请导师',
          description:
            'NGS 升学辅导课程提供 4 对 1 个性化导师团队，全程辅导学术规划、文书、面试与作品集，助你申请美英加澳港新顶尖大学，圆梦名校。',
          type: 'WebPage',
        })}
      />
      <CollegeMentorshipPageV1 locale="zh" />
    </>
  );
}
