import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { Aurora, Badge, Button, Container, GradientText } from './ui';

/** Editable content for the hero. The title is split into a plain first line
 *  + a gradient-highlighted second line so it stays editable as text. */
export type HeroData = {
  badge: string;
  titleLine1: string;
  titleAccent: string;
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  stats: { value: string; label: string }[];
};

const content: Record<Locale, HeroData> = {
  en: {
    badge: 'International education · K-12 to university',
    titleLine1: 'Where ambitious students become',
    titleAccent: 'global scholars',
    sub: 'We connect the next generation with mentors from the world’s leading universities and global industry leaders — building an international education without borders.',
    primary: { label: 'Explore Programs', href: siteLinks.en.programs },
    secondary: { label: 'Partner With Us', href: siteLinks.en.cclr },
    stats: [
      { value: '5', label: 'Global hubs' },
      { value: '4', label: 'Program pathways' },
      { value: '100%', label: 'Personalised mentorship' },
    ],
  },
  zh: {
    badge: '国际教育 · 从 K-12 到大学',
    titleLine1: '让有志学子成为',
    titleAccent: '全球学者',
    sub: '我们连接全球顶尖大学导师与各行业领袖，为下一代打造没有边界的国际教育。',
    primary: { label: '探索课程', href: siteLinks.zh.programs },
    secondary: { label: '成为 NGS 伙伴', href: siteLinks.zh.cclr },
    stats: [
      { value: '5', label: '全球枢纽' },
      { value: '4', label: '核心课程' },
      { value: '100%', label: '个性化辅导' },
    ],
  },
};

export function HeroV1({ locale, data }: { locale: Locale; data?: HeroData }) {
  const t = data ?? content[locale];
  return (
    <section className="relative isolate overflow-hidden bg-night">
      <Aurora />
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 35%, #000 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 35%, #000 0%, transparent 75%)',
        }}
      />

      <Container className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center pt-28 pb-20 text-center">
        <div className="animate-fade-up">
          <Badge>{t.badge}</Badge>
        </div>
        <h1 className="mt-7 max-w-6xl font-grotesk text-[2.25rem] font-bold leading-[1.08] tracking-[-0.02em] text-white animate-fade-up sm:text-[2.9rem] lg:text-[3.375rem] xl:text-[4.25rem]">
          <span className="block text-balance">{t.titleLine1}</span>
          <GradientText className="block">{t.titleAccent}</GradientText>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/70 animate-fade-up">{t.sub}</p>

        <div className="mt-10 flex flex-col gap-3 animate-fade-up sm:flex-row">
          <Button href={t.primary.href} variant="gradient">{t.primary.label}</Button>
          <Button href={t.secondary.href} variant="glass" withArrow={false}>{t.secondary.label}</Button>
        </div>

        <dl className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8 animate-fade-up">
          {t.stats.map((s) => (
            <div key={s.label}>
              <dt className="font-grotesk text-3xl font-bold sm:text-4xl">
                <GradientText>{s.value}</GradientText>
              </dt>
              <dd className="mt-1.5 text-sm leading-snug text-white/55">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/** Today's content, used to seed the page builder. */
export function heroDefaults(locale: Locale): HeroData {
  return content[locale];
}
