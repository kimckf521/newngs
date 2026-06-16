import Image from 'next/image';
import Link from 'next/link';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Container, Display, Eyebrow } from './ui';

const headings = {
  en: {
    eyebrow: 'Where you fit in',
    heading: (
      <>
        Three ways to grow with <span className="font-display italic">NextGen Scholars</span>
      </>
    ),
    sub: 'Whether you lead a school, guide a student, or want to join our global community — there is a path built for you.',
    cta: 'Learn more',
  },
  zh: {
    eyebrow: '找到你的位置',
    heading: (
      <>
        与 <span className="font-display italic">NextGen Scholars</span> 同行的三种方式
      </>
    ),
    sub: '无论您是学校管理者、陪伴学生成长的家长，还是希望加入我们的全球社区 —— 这里都有为您而设的路径。',
    cta: '了解更多',
  },
} as const;

export function Programs({ locale }: { locale: Locale }) {
  const t = home[locale].ourPrograms;
  const h = headings[locale];

  return (
    <section className="bg-paper">
      <Container className="py-24 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>{h.eyebrow}</Eyebrow>
          <Display className="mt-6 text-[2rem] leading-tight sm:text-[2.6rem]">
            {h.heading}
          </Display>
          <p className="mt-5 text-lg leading-relaxed text-slate-body">{h.sub}</p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {t.cards.map((card, i) => (
            <Link
              key={card.key}
              href={card.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-edge bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/40 to-transparent" />
                <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 font-display text-sm text-slate-ink backdrop-blur">
                  0{i + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-xl text-slate-ink">{card.title}</h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-slate-body">
                  {card.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-ink">
                  {h.cta}
                  <ArrowRight className="text-ngs-violet transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
