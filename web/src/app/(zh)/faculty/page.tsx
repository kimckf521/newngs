import { FacultyPageV1 } from '@/components/redesign-v1/pages/FacultyPageV1';

export const metadata = {
  title: '教学团队 — NextGen Scholars',
  description: '认识 NGS 教学团队：来自全球顶尖大学的精英导师，覆盖 IB、A-Level、AP 与 HKDSE 的数学、科学、英文、历史、艺术与升学指导。',
};

export default function Page() {
  return <FacultyPageV1 locale="zh" />;
}
