import type { Locale } from '@/i18n/types';
import { Container, GlassCard, GradientText, Kicker } from './ui';

type Hub = {
  city: string;
  region: string;
};

type GlobalContent = {
  eyebrow: string;
  heading: React.ReactNode;
  sub: string;
  hubs: Hub[];
};

const content: Record<Locale, GlobalContent> = {
  en: {
    eyebrow: 'Global Network',
    heading: (
      <>
        Five hubs. <GradientText>One global community.</GradientText>
      </>
    ),
    sub: 'NextGen Scholars operates across key cities on three continents — connecting students, schools, and mentors worldwide.',
    hubs: [
      { city: 'San Francisco', region: 'United States' },
      { city: 'Melbourne', region: 'Australia' },
      { city: 'Hong Kong', region: 'China' },
      { city: 'Taiwan', region: 'China' },
      { city: 'Greater Bay Area', region: 'China' },
    ],
  },
  zh: {
    eyebrow: '全球网络',
    heading: (
      <>
        五大枢纽，<GradientText>一个全球社区。</GradientText>
      </>
    ),
    sub: '未来学者遍布三大洲的核心城市 —— 连接世界各地的学生、学校与导师。',
    hubs: [
      { city: '三藩市', region: '美国' },
      { city: '墨尔本', region: '澳大利亚' },
      { city: '香港', region: '中国' },
      { city: '台湾', region: '中国' },
      { city: '大湾区', region: '中国' },
    ],
  },
};

export function GlobalV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section className="relative overflow-hidden bg-night-800">
      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/60">{t.sub}</p>

        <div className="relative mt-12 lg:mt-14">
          {/* soft blurred gradient glow behind the panel for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-8 -inset-y-12 bg-ngs-gradient-soft opacity-60 blur-[120px]"
          />

          {/* the "stage" */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-night p-8 sm:p-12">
            {/* world map recoloured with the brand gradient via a mask */}
            <div
              aria-hidden
              className="absolute inset-0 bg-ngs-gradient opacity-25"
              style={{
                maskImage: 'url(/static/img/world-map.png)',
                WebkitMaskImage: 'url(/static/img/world-map.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />

            {/* constellation of glowing hub pills over the map */}
            <ul className="relative flex flex-wrap gap-3">
              {t.hubs.map((hub) => (
                <li key={`${hub.city}-${hub.region}`}>
                  <GlassCard className="flex items-center gap-3 px-4 py-3">
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-ngs-gradient" />
                    <span className="flex flex-col leading-tight">
                      <span className="font-grotesk font-semibold text-white">{hub.city}</span>
                      <span className="text-sm text-white/50">{hub.region}</span>
                    </span>
                  </GlassCard>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
