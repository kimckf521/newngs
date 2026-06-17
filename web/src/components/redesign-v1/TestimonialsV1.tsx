import type { Locale } from '@/i18n/types';
import { Section, SectionHeading, Testimonials } from './ui';

/* ------------------------------------------------------------------ *
 * Social proof. The quotes here are POLISHED PLACEHOLDERS — written to
 * show the layout and tone — for the NGS team to replace with real,
 * attributed testimonials before launch.
 * ------------------------------------------------------------------ */

export type TestimonialsData = {
  eyebrow: string;
  title: string;
  sub: string;
  note: string;
  quotes: { quote: string; name: string; role: string }[];
};

const content: Record<Locale, TestimonialsData> = {
  en: {
    eyebrow: 'In their words',
    title: 'Trusted by families and schools',
    sub: 'What students, parents and partner schools say about working with NextGen Scholars.',
    note: 'Sample testimonials — replace with real, attributed quotes before launch.',
    quotes: [
      {
        quote:
          'The team understood our daughter as a person, not just a transcript. Her confidence — and her university options — grew far beyond what we hoped.',
        name: 'Parent',
        role: 'Hong Kong',
      },
      {
        quote:
          'My mentor helped me turn a vague ambition into a real plan. I always knew exactly what to work on next, and why it mattered.',
        name: 'Student',
        role: 'A-Level pathway',
      },
      {
        quote:
          'Partnering with NGS gave our school access to global mentors and a level of admissions expertise we simply couldn’t build alone.',
        name: 'Principal',
        role: 'Partner school',
      },
    ],
  },
  zh: {
    eyebrow: '他们这样说',
    title: '深受家庭与学校信赖',
    sub: '学生、家长与合作学校眼中的 NextGen Scholars。',
    note: '示例评价 —— 上线前请替换为真实、可署名的评价。',
    quotes: [
      {
        quote:
          '团队真正把我们的女儿当成一个完整的人来理解，而不只是一份成绩单。她的自信与大学选择，都远远超出了我们的期望。',
        name: '家长',
        role: '中国香港',
      },
      {
        quote:
          '导师帮我把模糊的理想，变成了一份切实可行的计划。我始终清楚下一步该做什么，以及为什么重要。',
        name: '学生',
        role: 'A-Level 路径',
      },
      {
        quote:
          '与 NGS 合作，让我们学校获得了全球导师资源，以及凭一己之力难以建立的升学专业度。',
        name: '校长',
        role: '合作学校',
      },
    ],
  },
};

export function TestimonialsV1({ locale, data }: { locale: Locale; data?: TestimonialsData }) {
  const t = { ...content[locale], ...(data ?? {}) };
  return (
    <Section tone="night" glow="violet" glowPosition="left">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
      <div className="mt-12 lg:mt-14">
        <Testimonials quotes={t.quotes ?? []} placeholder placeholderNote={t.note} />
      </div>
    </Section>
  );
}

/** Today's content, used to seed the page builder. */
export function testimonialsDefaults(locale: Locale): TestimonialsData {
  return content[locale];
}
