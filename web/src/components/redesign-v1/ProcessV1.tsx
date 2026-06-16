import type { Locale } from '@/i18n/types';
import { Section, SectionHeading, Steps } from './ui';

/* ------------------------------------------------------------------ *
 * "How it works" — a clear four-step journey. Gives parents a simple,
 * confident mental model of how a student moves through NGS.
 * ------------------------------------------------------------------ */

const content = {
  en: {
    eyebrow: 'How it works',
    title: 'A clear path, from first conversation to campus',
    sub: 'We keep the journey simple and transparent — so families always know where they are and what comes next.',
    steps: [
      {
        title: 'Discover',
        description:
          'We start with a conversation to understand your child’s strengths, goals and the universities they aspire to.',
      },
      {
        title: 'Plan',
        description:
          'Our advisors design a personalised academic and admissions roadmap, matched to the right curriculum and pathway.',
      },
      {
        title: 'Mentor',
        description:
          'Students learn with expert mentors and tutors, supported by progress reports and global enrichment along the way.',
      },
      {
        title: 'Thrive',
        description:
          'With applications and credentials in hand, students step confidently onto campus — and into a global community.',
      },
    ],
  },
  zh: {
    eyebrow: '如何开始',
    title: '从第一次沟通，到走进理想校园',
    sub: '我们让整个过程清晰透明 —— 让家庭始终清楚孩子身处何处，以及下一步将走向何方。',
    steps: [
      {
        title: '了解',
        description: '从一次深入的沟通开始，了解孩子的特长、目标，以及向往的大学。',
      },
      {
        title: '规划',
        description: '顾问团队为孩子量身定制学术与升学路线图，匹配最适合的课程与路径。',
      },
      {
        title: '辅导',
        description: '学生在资深导师与教师的陪伴下学习，并获得定期进展报告与全球拓展机会。',
      },
      {
        title: '绽放',
        description: '当申请与学历水到渠成，孩子将自信地走进校园，融入全球社区。',
      },
    ],
  },
} as const;

export function ProcessV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <Section tone="night" glow="violet" glowPosition="right">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
      <div className="mt-12 lg:mt-14">
        <Steps steps={t.steps} />
      </div>
    </Section>
  );
}
