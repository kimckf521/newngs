import { InProgressPageV1 } from '@/components/redesign-v1/pages/InProgressPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'inProgress', locale: 'en', title: 'Page Under Construction — Coming Soon', description: "This NextGen Scholars page is under active construction with live updates deploying soon. Head back home or explore our international curricula in the meantime.", noindex: true });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'inProgress', locale: 'en', name: 'Page Under Construction — Coming Soon', description: "This NextGen Scholars page is under active construction with live updates deploying soon. Head back home or explore our international curricula in the meantime.", type: 'WebPage' })} />
      <InProgressPageV1 locale="en" />
    </>
  );
}
