import Image from 'next/image';
import { founderStory } from '@/content/founder';
import type { Locale } from '@/i18n/types';
import { Container, GlassCard, GradientText, Kicker } from './ui';

const content = {
  en: {
    eyebrow: 'Who we are',
    heading: (
      <>
        Built by educators, technologists &amp; <GradientText>global industry leaders.</GradientText>
      </>
    ),
    teamKicker: 'Founding Team',
    role: 'Co-Founder',
  },
  zh: {
    eyebrow: '关于我们',
    heading: (
      <>
        由教育者、科技领袖与<GradientText>行业专家</GradientText>共同创立。
      </>
    ),
    teamKicker: '创始团队',
    role: '联合创始人',
  },
} as const;

export function AboutV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const story = founderStory[locale];
  const [lead, ...rest] = story.paragraphs;

  return (
    <section id={story.anchorId} className="relative overflow-hidden bg-night-800">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[460px] w-[460px] rounded-full bg-ngs-violet/15 blur-[150px]"
      />

      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.heading}
        </h2>

        <div className="mt-10 max-w-3xl">
          <p className="text-xl leading-relaxed text-white/85">{lead}</p>
          <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-white/60">
            {rest.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Kicker>{t.teamKicker}</Kicker>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {story.founders.map((founder) => (
              <GlassCard key={founder.name} className="flex flex-col items-center p-5 text-center">
                <Image
                  src={founder.img}
                  alt={founder.name}
                  width={96}
                  height={96}
                  style={founder.pos ? { objectPosition: founder.pos } : undefined}
                  className="h-24 w-24 rounded-full object-cover ring-1 ring-white/15"
                />
                <p className="mt-4 font-grotesk text-white">{founder.name}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/45">
                  <span className="h-1 w-1 rounded-full bg-ngs-gradient" aria-hidden />
                  {t.role}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
