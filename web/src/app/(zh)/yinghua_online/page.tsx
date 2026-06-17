import { YinghuaPageV1 } from '@/components/redesign-v1/pages/YinghuaPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'yinghuaOnline',
  locale: 'zh',
  title: '珠海英华国际教育中心 YCS — 剑桥 A-Level 在线国际高中',
  description:
    '珠海英华国际教育中心（YCS）获 Edexcel、AQA、CIE 授权及 UCAS 认证的剑桥国际高中，融合 A-Level 课程与 NGS 在线教育，提供全域、双轨、无界三大学习路径，助力学生迈向世界名校。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'yinghuaOnline',
          locale: 'zh',
          name: '珠海英华国际教育中心 YCS — 剑桥 A-Level 在线国际高中',
          description:
            '珠海英华国际教育中心（YCS）获 Edexcel、AQA、CIE 授权及 UCAS 认证的剑桥国际高中，融合 A-Level 课程与 NGS 在线教育，提供全域、双轨、无界三大学习路径，助力学生迈向世界名校。',
          type: 'WebPage',
        })}
      />
      <YinghuaPageV1 locale="zh" />
    </>
  );
}
