import { ProgramsPageV1 } from '@/components/redesign-v1/pages/ProgramsPageV1';

export const metadata = {
  title: '国际课程 — NextGen Scholars 未来学者',
  description: 'IB、A-Level / IGCSE、AP 与 HKDSE 一对一与小班教学，由全球顶尖大学导师授课，课程与考纲紧密结合。',
};

export default function Page() {
  return <ProgramsPageV1 locale="zh" />;
}
