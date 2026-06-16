import Image from 'next/image';
import Link from 'next/link';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Container, GradientText, GlassCard, Kicker } from './ui';

const copy = {
  en: {
    eyebrow: 'Where you fit in',
    heading: (
      <>
        Three ways to grow with <GradientText>NextGen Scholars</GradientText>
      </>
    ),
    sub: 'Whether you lead a school, guide a student, or want to join our global community — there is a path built for you.',
    learnMore: 'Learn more',
  },
  zh: {
    eyebrow: '找到你的位置',
    heading: (
      <>
        与 <GradientText>NextGen Scholars</GradientText> 同行的三种方式
      </>
    ),
    sub: '无论您是学校管理者、陪伴学生成长的家长，还是希望加入我们的全球社区 —— 这里都有为您而设的路径。',
    learnMore: '了解更多',
  },
} as const;

export function ProgramsV1({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const cards = home[locale].ourPrograms.cards;

  return (
    <section className="relative overflow-hidden bg-night-800">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[440px] w-[440px] rounded-full bg-ngs-violet/15 blur-[150px]"
      />

      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/60">{t.sub}</p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {cards.map((card, i) => {
            const featured = i === 0;
            return (
              <Link
                key={card.key}
                href={card.href}
                className={`group block ${featured ? 'md:col-span-2 lg:row-span-2' : ''}`}
              >
                <GlassCard
                  hover
                  className="flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5"
                >
                  <div
                    className={`relative w-full overflow-hidden ${
                      featured ? 'aspect-[16/10] lg:aspect-[4/5]' : 'aspect-[16/10]'
                    }`}
                  >
                    <Image
                      src={card.img}
                      alt={card.title}
                      fill
                      sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/20 bg-night/40 px-2.5 py-1 font-grotesk text-xs font-semibold text-white/85 backdrop-blur">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-grotesk text-xl font-bold tracking-tight text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{card.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                        {t.learnMore}
                      </span>
                      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
