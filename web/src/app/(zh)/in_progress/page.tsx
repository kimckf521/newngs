import { InProgressPageV1 } from '@/components/redesign-v1/pages/InProgressPageV1';

export const metadata = {
  title: '此页面建设中 — NextGen Scholars',
  description: '本部分内容正在建设中，实时更新即将上线。欢迎返回首页或浏览我们的国际课程体系。',
};

export default function Page() {
  return <InProgressPageV1 locale="zh" />;
}
