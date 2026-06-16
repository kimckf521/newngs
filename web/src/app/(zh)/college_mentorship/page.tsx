import { CollegeMentorshipPageV1 } from '@/components/redesign-v1/pages/CollegeMentorshipPageV1';

export const metadata = {
  title: '升学辅导课程 — NextGen Scholars',
  description:
    'NGS 升学辅导课程：4 对 1 个性化导师团队，全程辅导学术规划、文书、面试与作品集，助力学生申请美国、英国、加拿大、澳大利亚、香港与新加坡的顶尖大学。',
};

export default function Page() {
  return <CollegeMentorshipPageV1 locale="zh" />;
}
