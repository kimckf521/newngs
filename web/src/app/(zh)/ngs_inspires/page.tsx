import { InspiresPageV1 } from '@/components/redesign-v1/pages/InspiresPageV1';

export const metadata = {
  title: 'NextGen Inspires — 全球学习社区 — NextGen Scholars',
  description:
    'NextGen Inspires 是专为 NGS 合作学校打造的独家订阅服务，连接全球行业领袖、世界知名大学、SPARK LAB 以及全球校友网络。',
};

export default function Page() {
  return <InspiresPageV1 locale="zh" />;
}
