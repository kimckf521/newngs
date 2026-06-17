import { CclrPageV1 } from '@/components/redesign-v1/pages/CclrPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'cclr',
  locale: 'en',
  title: "CCLR Program: College, Career & Life Readiness",
  description:
    "NGS CCLR is a four-year high-school framework building college, career, life readiness and global competency — partner with us to prepare students for a global future.",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'cclr',
          locale: 'en',
          name: "CCLR Program: College, Career & Life Readiness",
          description:
            "NGS CCLR is a four-year high-school framework building college, career, life readiness and global competency — partner with us to prepare students for a global future.",
          type: 'Course',
        })}
      />
      <CclrPageV1 locale="en" />
    </>
  );
}
