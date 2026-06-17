import Image from 'next/image';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';
import { Container, GlassCard, GradientText, Kicker } from './ui';

const content = {
  en: {
    eyebrow: 'The global community',
    sub: 'A living network of industry leaders, universities, and alumni that students learn, create, and grow alongside.',
  },
  zh: {
    eyebrow: '全球社区',
    sub: '一个由行业领袖、顶尖大学与全球校友构成的鲜活网络，陪伴学生学习、创造与成长。',
  },
} as const;

export function PillarsV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const { cards } = home[locale].inspires;

  return (
    <section className="relative overflow-hidden bg-night">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[460px] w-[460px] rounded-full bg-ngs-cyan/15 blur-[150px]"
      />

      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          NextGen <GradientText>Inspires</GradientText>
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/60">{t.sub}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {cards.map((card) => (
            <GlassCard key={card.title} hover className="flex flex-col overflow-hidden">
              <div className="relative h-44">
                <Image src={card.img} alt={card.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80" aria-hidden />
              </div>
              <div className="p-6">
                <h3 className="font-grotesk text-lg text-white">{card.title}</h3>
                <p className="mt-3 line-clamp-5 text-sm text-white/60">{card.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
