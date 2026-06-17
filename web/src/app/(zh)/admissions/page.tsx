import { AdmissionsPageV1 } from '@/components/redesign-v1/pages/AdmissionsPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'admissions', locale: 'zh', title: '课程与招生：一对一辅导、升学择校与国际文凭', description: '单科辅导、升学择校与在线国际文凭课程，由全球前50名校导师一对一授课，涵盖IB、A-Level、AP、HKDSE。预约试听，几天内即可开课。' });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'admissions', locale: 'zh', name: '课程与招生：一对一辅导、升学择校与国际文凭', description: '单科辅导、升学择校与在线国际文凭课程，由全球前50名校导师一对一授课，涵盖IB、A-Level、AP、HKDSE。预约试听，几天内即可开课。', type: 'CollectionPage' })} />
      <AdmissionsPageV1 locale="zh" />
    </>
  );
}
