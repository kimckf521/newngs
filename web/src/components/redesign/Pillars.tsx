import Image from 'next/image';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';
import { Container, Em } from './ui';

const headings = {
  en: {
    eyebrow: 'The global community',
    sub: 'A living network of industry leaders, universities, and alumni that students learn, create, and grow alongside.',
  },
  zh: {
    eyebrow: '全球社区',
    sub: '一个由行业领袖、顶尖大学与全球校友构成的鲜活网络，陪伴学生学习、创造与成长。',
  },
} as const;

export function Pillars({ locale }: { locale: Locale }) {
  const t = home[locale].inspires;
  const h = headings[locale];

  return (
    <section className="relative overflow-hidden bg-canvas text-white">
      <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-ngs-magenta/15 blur-[160px]" />
      <div className="absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-ngs-cyan/15 blur-[160px]" />
      <Container className="relative py-24 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-eyebrow text-white/70">
            <span className="h-px w-7 bg-ngs-gradient" aria-hidden />
            {h.eyebrow}
          </span>
          <h2 className="mt-6 font-display text-[2rem] font-light leading-tight tracking-[-0.01em] sm:text-[2.8rem]">
            NextGen <Em>Inspires</Em>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{h.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.cards.map((card) => (
            <article
              key={card.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/70 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg leading-snug text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65 line-clamp-5">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
