import { IbHerosPageV1 } from '@/components/redesign-v1/pages/IbHerosPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'ibHeros',
  locale: 'en',
  title: "IB Heros: IB, A-Level, AP & HKDSE Tutoring Partner",
  description:
    "IB Heros, NextGen Scholars' Melbourne tutoring partner, delivers data-driven 1:1 and small-group support across IB, A-Level/IGCSE, AP and HKDSE worldwide.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'ibHeros',
          locale: 'en',
          name: "IB Heros: IB, A-Level, AP & HKDSE Tutoring Partner",
          description:
            "IB Heros, NextGen Scholars' Melbourne tutoring partner, delivers data-driven 1:1 and small-group support across IB, A-Level/IGCSE, AP and HKDSE worldwide.",
          type: 'AboutPage',
        })}
      />
      <IbHerosPageV1 locale="en" />
    </>
  );
}
