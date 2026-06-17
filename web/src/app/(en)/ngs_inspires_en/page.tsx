import { InspiresPageV1 } from '@/components/redesign-v1/pages/InspiresPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ngsInspires',
  locale: 'en',
  title: 'NextGen Inspires: Global Learning Community',
  description:
    "NextGen Inspires is an exclusive subscription for NGS partner schools, connecting students to global industry leaders, top universities, SPARK LAB and alumni.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ngsInspires',
          locale: 'en',
          name: 'NextGen Inspires: Global Learning Community',
          description:
            "NextGen Inspires is an exclusive subscription for NGS partner schools, connecting students to global industry leaders, top universities, SPARK LAB and alumni.",
          type: 'WebPage',
        })}
      />
      <InspiresPageV1 locale="en" />
    </>
  );
}
