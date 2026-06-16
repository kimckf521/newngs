import type { Locale } from '@/i18n/types';
import { Section, SectionHeading, StatBand } from './ui';

/* ------------------------------------------------------------------ *
 * Results / outcomes band. The figures here are POLISHED PLACEHOLDERS —
 * styled to look complete, clearly marked as sample data — for the NGS
 * team to replace with their own verified numbers before launch.
 * ------------------------------------------------------------------ */

const content = {
  en: {
    eyebrow: 'Outcomes',
    title: 'Results that reassure families',
    sub: 'A snapshot of the difference an NGS pathway makes. Replace these with your own verified figures.',
    note: 'Sample figures — replace with NGS’s verified outcome data before launch.',
    stats: [
      { value: '500+', label: 'Students mentored' },
      { value: '92%', label: 'Offers from top-choice universities' },
      { value: '50+', label: 'Partner universities & institutions' },
      { value: '4.9/5', label: 'Average parent satisfaction' },
    ],
  },
  zh: {
    eyebrow: '成果',
    title: '让家长安心的成果',
    sub: 'NGS 升学路径所带来改变的缩影。请替换为贵机构核实后的真实数据。',
    note: '示例数据 —— 上线前请替换为 NGS 核实后的真实成果数据。',
    stats: [
      { value: '500+', label: '获得辅导的学生' },
      { value: '92%', label: '首选大学录取率' },
      { value: '50+', label: '合作大学与机构' },
      { value: '4.9/5', label: '家长满意度' },
    ],
  },
} as const;

export function OutcomesV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <Section tone="night-800" glow="magenta" glowPosition="center">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
      <div className="mt-12 lg:mt-14">
        <StatBand stats={t.stats} placeholder placeholderNote={t.note} />
      </div>
    </Section>
  );
}
