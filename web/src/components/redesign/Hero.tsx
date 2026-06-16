import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { Button, Container, Em } from './ui';

const content = {
  en: {
    eyebrow: 'NextGen Scholars — International Education',
    title: (
      <>
        Lighting up the <Em>future</Em> of the next generation of global scholars.
      </>
    ),
    subtitle:
      "We connect ambitious students with mentors from the world's leading universities and global industry leaders — building the international education the next generation deserves.",
    primary: { label: 'Explore Programs', href: siteLinks.en.programs },
    secondary: { label: 'Partner With Us', href: siteLinks.en.cclr },
    stats: [
      { value: '5', label: 'Global hubs across 3 continents' },
      { value: '4', label: 'Core program pathways' },
      { value: '100%', label: 'Personalised mentorship' },
    ],
  },
  zh: {
    eyebrow: 'NextGen Scholars · 国际教育',
    title: (
      <>
        点亮下一代全球学者的<Em>未来</Em>。
      </>
    ),
    subtitle:
      '我们连接全球顶尖大学导师与各行业领袖，为有志学子打造下一代应得的国际教育。',
    primary: { label: '探索课程', href: siteLinks.zh.programs },
    secondary: { label: '成为 NGS 伙伴', href: siteLinks.zh.cclr },
    stats: [
      { value: '5', label: '横跨三大洲的全球枢纽' },
      { value: '4', label: '核心课程体系' },
      { value: '100%', label: '个性化导师辅导' },
    ],
  },
} as const;

export function Hero({ locale }: { locale: Locale }) {
  const t = content[locale];
  const alt =
    locale === 'zh' ? '毕业生抛起学位帽庆祝' : 'Graduates throwing their caps in celebration';

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-canvas">
      {/* Background photo */}
      <Image
        src="/static/img/Graduation.jpg"
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      {/* Legibility + brand tinting. Two layers guarantee contrast at every
          breakpoint: a left-dark wash for the wide layout, and a top/bottom
          wash so the headline stays legible on mobile where it sits over the
          brighter sky. */}
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/75 to-canvas/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/55 via-canvas/10 to-canvas/85" />
      <div className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full bg-ngs-violet/25 blur-[140px]" />
      <div className="absolute -bottom-32 right-1/4 h-[420px] w-[420px] rounded-full bg-ngs-cyan/20 blur-[150px]" />

      <Container className="relative z-10 pt-28 pb-20">
        <div className="max-w-3xl animate-fade-up">
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-eyebrow text-white/75">
            <span className="h-px w-7 bg-ngs-gradient" aria-hidden />
            {t.eyebrow}
          </p>

          <h1 className="mt-6 font-display text-[2.6rem] font-light leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl lg:text-[4.25rem]">
            {t.title}
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80">
            {t.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={t.primary.href} variant="gradient">
              {t.primary.label}
            </Button>
            <Button href={t.secondary.href} variant="light-ghost" withArrow={false}>
              {t.secondary.label}
            </Button>
          </div>

          {/* Credibility strip */}
          <dl className="mt-14 flex flex-wrap items-start gap-x-10 gap-y-6 border-t border-white/15 pt-8">
            {t.stats.map((s) => (
              <div key={s.label} className="max-w-[12rem]">
                <dt className="bg-ngs-gradient bg-clip-text font-display text-3xl font-normal text-transparent">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm leading-snug text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {/* thin brand line at the very bottom of the hero */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-ngs-gradient/60" />
    </section>
  );
}
