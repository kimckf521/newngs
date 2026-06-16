import type { Locale } from '@/i18n/types';
import {
  Section,
  SectionHeading,
  FeatureCard,
  IconShield,
  IconCap,
  IconGlobe,
  IconRoute,
  IconChat,
  IconUsers,
} from './ui';

/* ------------------------------------------------------------------ *
 * "Why families choose NGS" — the core trust section for parents.
 * Six honest value propositions drawn from what NGS actually offers
 * (accredited curricula, global faculty, personalised pathways, a
 * worldwide network, transparent communication, and duty of care).
 * ------------------------------------------------------------------ */

const content = {
  en: {
    eyebrow: 'Why families choose us',
    title: (
      <>
        An education parents can <span className="bg-ngs-gradient bg-clip-text text-transparent">trust</span>
      </>
    ),
    sub: 'Every part of NextGen Scholars is built around one question: does this genuinely move a young person closer to a confident, global future?',
    cards: [
      {
        icon: <IconShield />,
        title: 'Accredited, recognised curricula',
        description:
          'We align with the world’s leading exam boards and curricula — A-Level, HKDSE and more — so credentials are recognised by universities worldwide.',
      },
      {
        icon: <IconCap />,
        title: 'Mentors from top universities',
        description:
          'Students learn alongside graduates of, and faculty connected to, the world’s leading universities and global industry leaders.',
      },
      {
        icon: <IconRoute />,
        title: 'A pathway built for your child',
        description:
          'Not a one-size-fits-all programme. We map each student’s strengths and ambitions into a personalised plan from classroom to campus.',
      },
      {
        icon: <IconGlobe />,
        title: 'A genuinely global network',
        description:
          'Five hubs across three continents connect students, schools and mentors — opening doors that reach far beyond any single city.',
      },
      {
        icon: <IconChat />,
        title: 'Clear, transparent communication',
        description:
          'Regular reporting and an open line to our team means parents always know how their child is progressing — and what comes next.',
      },
      {
        icon: <IconUsers />,
        title: 'A supportive community',
        description:
          'Beyond academics, students join a living community of peers, alumni and industry leaders who guide, challenge and inspire them.',
      },
    ],
  },
  zh: {
    eyebrow: '家长为何信赖我们',
    title: (
      <>
        值得家长<span className="bg-ngs-gradient bg-clip-text text-transparent">信赖</span>的国际教育
      </>
    ),
    sub: 'NextGen Scholars 的每一处设计，都围绕同一个问题展开：这是否真正让孩子更接近一个自信而广阔的未来？',
    cards: [
      {
        icon: <IconShield />,
        title: '权威认证课程体系',
        description:
          '对接全球权威考试局与课程体系 —— A-Level、HKDSE 等 —— 学历获世界各地大学认可。',
      },
      {
        icon: <IconCap />,
        title: '顶尖大学导师团队',
        description:
          '学生与来自世界顶尖大学的毕业生、师资以及各行业领袖共同学习、成长。',
      },
      {
        icon: <IconRoute />,
        title: '为孩子量身定制的路径',
        description:
          '拒绝千篇一律。我们梳理每位学生的特长与志向，从课堂到校园，规划专属成长方案。',
      },
      {
        icon: <IconGlobe />,
        title: '真正的全球网络',
        description:
          '横跨三大洲的五大枢纽，连接学生、学校与导师，让机会远超任何一座城市的边界。',
      },
      {
        icon: <IconChat />,
        title: '清晰透明的沟通',
        description:
          '定期报告与畅通的沟通渠道，让家长随时了解孩子的进展，以及下一步的方向。',
      },
      {
        icon: <IconUsers />,
        title: '温暖有力的社区',
        description:
          '在学术之外，学生加入一个由同伴、校友与行业领袖组成的鲜活社区，彼此引导、激励与启发。',
      },
    ],
  },
} as const;

export function WhyTrustV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <Section tone="night-800" glow="cyan" glowPosition="left">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {t.cards.map((card) => (
          <FeatureCard key={card.title} icon={card.icon} title={card.title} description={card.description} />
        ))}
      </div>
    </Section>
  );
}
