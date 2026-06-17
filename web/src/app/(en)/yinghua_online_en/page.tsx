import { YinghuaPageV1 } from '@/components/redesign-v1/pages/YinghuaPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'yinghuaOnline',
  locale: 'en',
  title: "Yinghua Cambridge School (YCS) + Online A-Level",
  description:
    "Zhuhai Yinghua Cambridge School (YCS): an Edexcel/AQA/CIE-authorised, UCAS-accredited A-Level school blending campus and NGS online learning for top universities.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'yinghuaOnline',
          locale: 'en',
          name: "Yinghua Cambridge School (YCS) + Online A-Level",
          description:
            "Zhuhai Yinghua Cambridge School (YCS): an Edexcel/AQA/CIE-authorised, UCAS-accredited A-Level school blending campus and NGS online learning for top universities.",
          type: 'WebPage',
        })}
      />
      <YinghuaPageV1 locale="en" />
    </>
  );
}
