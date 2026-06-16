import { OnlineDiplomaPageV1 } from '@/components/redesign-v1/pages/OnlineDiplomaPageV1';

export const metadata = {
  title: '未来无界文凭课程 — NextGen Scholars',
  description: '未来无界文凭课程（ODP）以线上学习为主，按自己的节奏在线学习，再到校园参加统一考试，达标后获得认证学校的高中文凭与完整成绩单。',
};

export default function Page() {
  return <OnlineDiplomaPageV1 locale="zh" />;
}
