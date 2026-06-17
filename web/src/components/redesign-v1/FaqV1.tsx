import type { Locale } from '@/i18n/types';
import { Section, SectionHeading, FAQ } from './ui';

/* ------------------------------------------------------------------ *
 * Parent-focused FAQ. Honest, reassuring answers to the questions
 * families most often ask. Uses the no-JS <details> accordion.
 * ------------------------------------------------------------------ */

export type FaqData = {
  eyebrow: string;
  title: string;
  sub: string;
  items: { q: string; a: string }[];
};

const content: Record<Locale, FaqData> = {
  en: {
    eyebrow: 'Questions parents ask',
    title: 'Everything you need to feel confident',
    sub: 'Can’t find your question? Our team is one message away.',
    items: [
      {
        q: 'Who is NextGen Scholars for?',
        a: 'Ambitious students from K-12 through to university — and the schools and families who support them. We work with individual students seeking mentorship and admissions guidance, as well as schools looking to partner on international programmes.',
      },
      {
        q: 'Which curricula and qualifications do you support?',
        a: 'We align with the world’s leading curricula and exam boards, including A-Level and HKDSE, and partner with institutions accredited by Edexcel, Oxford AQA and Cambridge (CIE). Credentials earned are recognised by universities worldwide.',
      },
      {
        q: 'How are programmes personalised to my child?',
        a: 'Every journey begins by understanding your child’s strengths, goals and aspirations. From there our advisors build a tailored academic and admissions roadmap, matched to the right pathway — not a one-size-fits-all template.',
      },
      {
        q: 'How do you keep parents informed?',
        a: 'Families receive regular progress updates and have a direct line to our team. You’ll always know how your child is doing and what the next step is.',
      },
      {
        q: 'Where is NextGen Scholars based?',
        a: 'We operate across five hubs on three continents — San Francisco, Melbourne, Hong Kong, Taiwan and the Greater Bay Area — connecting students, schools and mentors worldwide.',
      },
      {
        q: 'How do we get started?',
        a: 'Reach out through the contact form below or message our team on WeChat. We’ll arrange an introductory conversation to understand your goals and recommend the best next step.',
      },
    ],
  },
  zh: {
    eyebrow: '家长常见问题',
    title: '让您安心的每一个答案',
    sub: '没有找到您的问题？我们的团队随时为您解答。',
    items: [
      {
        q: 'NextGen Scholars 适合哪些人？',
        a: '从 K-12 到大学阶段、有志向的学生，以及支持他们的学校与家庭。我们既服务于寻求辅导与升学指导的个人学生，也与希望合作开展国际课程的学校携手。',
      },
      {
        q: '你们支持哪些课程体系与学历？',
        a: '我们对接全球权威课程体系与考试局，包括 A-Level 与 HKDSE，并与获 Edexcel、牛津 AQA、剑桥（CIE）认证的机构合作。所获学历获世界各地大学认可。',
      },
      {
        q: '课程如何为我的孩子量身定制？',
        a: '每段旅程都始于了解孩子的特长、目标与志向。在此基础上，顾问团队为孩子定制专属的学术与升学路线图，匹配最合适的路径，而非千篇一律的模板。',
      },
      {
        q: '你们如何让家长及时了解情况？',
        a: '家庭将获得定期的进展更新，并可直接与我们的团队沟通。您将始终清楚孩子的状态，以及下一步的方向。',
      },
      {
        q: 'NextGen Scholars 位于哪里？',
        a: '我们的五大枢纽横跨三大洲 —— 旧金山、墨尔本、中国香港、台湾与大湾区 —— 连接世界各地的学生、学校与导师。',
      },
      {
        q: '我们该如何开始？',
        a: '欢迎通过下方的联系表单，或在微信上与我们的团队联系。我们将安排一次初步沟通，了解您的目标，并为您推荐最合适的下一步。',
      },
    ],
  },
};

export function FaqV1({ locale, data }: { locale: Locale; data?: FaqData }) {
  const t = data ?? content[locale];
  return (
    <Section tone="night-800" glow="cyan" glowPosition="right">
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
        </div>
        <div className="lg:col-span-7">
          <FAQ items={t.items} />
        </div>
      </div>
    </Section>
  );
}

/** Today's content, used to seed the page builder. */
export function faqDefaults(locale: Locale): FaqData {
  return content[locale];
}
