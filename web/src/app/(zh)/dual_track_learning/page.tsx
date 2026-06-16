import { DualTrackPageV1 } from '@/components/redesign-v1/pages/DualTrackPageV1';

export const metadata = {
  title: '未来教育双轨计划 — NextGen Scholars',
  description:
    '为本地学校学生量身定制的国际课程系统学习，在不打断普高学习的前提下衔接 IB、A-Level、AP、HKDSE，毕业达标可获普高与国际高中双文凭。',
};

export default function Page() {
  return <DualTrackPageV1 locale="zh" />;
}
