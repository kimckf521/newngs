import Link from 'next/link';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Container, GradientText, GlassCard, Kicker } from './ui';

type OfferCard = {
  title: string;
  href: string;
  items: string[];
};

type OfferContent = {
  eyebrow: string;
  heading: React.ReactNode;
  sub: string;
  explore: string;
  cards: OfferCard[];
};

const content: Record<Locale, OfferContent> = {
  en: {
    eyebrow: 'What we offer',
    heading: (
      <>
        A complete framework for <GradientText>international education</GradientText>
      </>
    ),
    sub: 'From classroom to campus to career — four connected pathways that prepare students for a global future.',
    explore: 'Explore',
    cards: [
      {
        title: 'Career · College · Life Readiness',
        href: siteLinks.en.cclr,
        items: ['Career Readiness', 'College Readiness', 'Life Readiness', 'Global Competency'],
      },
      {
        title: 'Partnership Programmes',
        href: siteLinks.en.hybrid,
        items: ['Hybrid Program', 'Dual-track Program', 'Online Diploma Program'],
      },
      {
        title: 'NextGen Inspires',
        href: siteLinks.en.ngsInspires,
        items: ['Global Industry Leaders', 'Global Universities', 'SPARK LAB', 'Global Alumni'],
      },
      {
        title: 'NextGen Connects',
        href: siteLinks.en.ngsConnects,
        items: ['School Visits', 'School Reports', 'Growth Mapping', 'Academic Clinics'],
      },
    ],
  },
  zh: {
    eyebrow: '我们的课程',
    heading: (
      <>
        完整的<GradientText>国际教育</GradientText>体系
      </>
    ),
    sub: '从课堂到校园再到职业 —— 四条相互衔接的路径，助力学生迈向全球未来。',
    explore: '查看详情',
    cards: [
      {
        title: '升学探索课程',
        href: siteLinks.zh.cclr,
        items: ['职业准备', '大学准备', '生活准备', '全球胜任力'],
      },
      {
        title: '线上学校课程',
        href: siteLinks.zh.hybrid,
        items: ['未来全域学习计划', '未来教育双轨计划', '未来无界文凭课程'],
      },
      {
        title: 'NextGen Inspires',
        href: siteLinks.zh.ngsInspires,
        items: ['全球产业领袖', '全球大学', 'SPARK LAB', '全球校友'],
      },
      {
        title: 'NextGen Connects',
        href: siteLinks.zh.ngsConnects,
        items: ['校园参访', '学校报告', '成长规划', '学术诊所'],
      },
    ],
  },
};

export function OfferV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section id="our-programs" className="relative scroll-mt-24 overflow-hidden bg-night">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[460px] w-[460px] rounded-full bg-ngs-cyan/15 blur-[160px]"
      />

      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/60">{t.sub}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {t.cards.map((card, i) => (
            <Link key={card.title} href={card.href} className="group block">
              <GlassCard hover className="flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1.5">
                <GradientText className="font-grotesk text-2xl font-bold">
                  {String(i + 1).padStart(2, '0')}
                </GradientText>
                <span aria-hidden className="mt-4 block h-px w-8 bg-ngs-gradient" />
                <h3 className="mt-4 font-grotesk text-lg font-bold tracking-tight text-white">{card.title}</h3>

                <ul className="mt-5 space-y-2.5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
                      {item}
                    </li>
                  ))}
                </ul>

                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-white">
                  <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                    {t.explore}
                  </span>
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
