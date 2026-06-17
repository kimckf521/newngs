import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GradientText,
  CTASection,
  IconSpark,
  IconRoute,
  IconChat,
} from '../ui';

/* ------------------------------------------------------------------ *
 * /in_progress — "Coming soon / under construction" placeholder.
 * Faithful port of the legacy ProgressZh / ProgressEn copy, re-expressed
 * in the bold dark v1 design. Minimal: centered hero + one reassurance
 * section + a CTA back to home and programs.
 * ------------------------------------------------------------------ */

type Point = { icon: React.ReactNode; title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string };
  status: { eyebrow: string; title: React.ReactNode; sub: string; points: Point[] };
  cta: { eyebrow: string; title: React.ReactNode; sub: string; primary: string; secondary: string };
}> = {
  en: {
    hero: {
      eyebrow: 'In progress',
      title: (
        <>
          We&apos;re <GradientText>working on</GradientText> this page
        </>
      ),
      lead:
        'Thanks for stopping by — this section is under active construction. We are polishing the content and wiring things up so it is genuinely useful for you.',
    },
    status: {
      eyebrow: 'What to expect',
      title: (
        <>
          Live updates <GradientText>deploying soon</GradientText>
        </>
      ),
      sub: 'In the meantime, everything else on the site is ready to explore.',
      points: [
        {
          icon: <IconSpark />,
          title: 'Being polished',
          body: 'We are refining the content here so it reads clearly and answers the questions you actually have.',
        },
        {
          icon: <IconRoute />,
          title: 'Wiring things up',
          body: 'The page is being connected to the rest of the NGS experience so navigation stays seamless.',
        },
        {
          icon: <IconChat />,
          title: 'Need it now?',
          body: 'Reach us at info@nextgenscholars.asia and our team will help you straight away.',
        },
      ],
    },
    cta: {
      eyebrow: 'Keep exploring',
      title: (
        <>
          Plenty more to <GradientText>discover</GradientText>
        </>
      ),
      sub: 'Head back home or browse our international curricula while this page comes together.',
      primary: 'Go to home',
      secondary: 'Explore programs',
    },
  },
  zh: {
    hero: {
      eyebrow: '建设中',
      title: (
        <>
          此页面<GradientText>正在建设中</GradientText>
        </>
      ),
      lead:
        '感谢您的访问 —— 本部分内容正在积极建设中。我们正在打磨内容、完善细节，让这个页面真正对您有所帮助。',
    },
    status: {
      eyebrow: '近期上线',
      title: (
        <>
          实时更新<GradientText>即将上线</GradientText>
        </>
      ),
      sub: '在此期间，网站的其他内容均已就绪，欢迎随时浏览。',
      points: [
        {
          icon: <IconSpark />,
          title: '内容打磨中',
          body: '我们正在精修此页内容，让它表达清晰，真正回答您关心的问题。',
        },
        {
          icon: <IconRoute />,
          title: '细节完善中',
          body: '此页面正在与 NGS 的其他模块对接，确保浏览体验顺畅连贯。',
        },
        {
          icon: <IconChat />,
          title: '现在就需要帮助？',
          body: '欢迎通过 info@nextgenscholars.asia 联系我们，团队将第一时间为您解答。',
        },
      ],
    },
    cta: {
      eyebrow: '继续探索',
      title: (
        <>
          还有<GradientText>更多内容</GradientText>等您发现
        </>
      ),
      sub: '在此页面完善期间，欢迎返回首页或浏览我们的国际课程体系。',
      primary: '返回首页',
      secondary: '浏览课程',
    },
  },
};

export function InProgressPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.cta.primary, href: links.home }}
        secondary={{ label: t.cta.secondary, href: links.programs }}
      />

      {/* Reassurance / status */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.status.eyebrow} title={t.status.title} sub={t.status.sub} />
            <div className="mt-10 grid gap-5">
              {t.status.points.map((p) => (
                <FeatureCard key={p.title} icon={p.icon} title={p.title} description={p.body} />
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/work_in_progress.jpg"
              alt={locale === 'en' ? 'Illustration of a page under construction' : '页面建设中的插画'}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
          </div>
        </div>
      </Section>

      <CTASection
        eyebrow={t.cta.eyebrow}
        title={t.cta.title}
        sub={t.cta.sub}
        primary={{ label: t.cta.primary, href: links.home }}
        secondary={{ label: t.cta.secondary, href: links.programs }}
      />
    </>
  );
}
