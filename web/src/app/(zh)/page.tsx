import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';

export const metadata = {
  title: 'NextGen Scholars 未来学者 — 值得家长信赖的国际教育',
  description:
    'NextGen Scholars（未来学者）连接全球顶尖大学导师与各行业领袖，为下一代打造没有边界的国际教育。',
};

export default function Page() {
  return <HomeContentV1 locale="zh" />;
}
