import { AdmissionsPageV1 } from '@/components/redesign-v1/pages/AdmissionsPageV1';

export const metadata = {
  title: '课程与招生 — NextGen Scholars',
  description: '单科辅导、升学择校与国际文凭课程 —— 由全球前 50 名校精英导师一对一授课。选择方案、预约试听，几天内即可开课。',
};

export default function Page() {
  return <AdmissionsPageV1 locale="zh" />;
}
