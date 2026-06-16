import Link from 'next/link';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Container, Display, Eyebrow } from './ui';

interface ProgramCard {
  title: string;
  href: string;
  items: string[];
}

const content: Record<
  Locale,
  { eyebrow: string; heading: React.ReactNode; sub: string; cta: string; cards: ProgramCard[] }
> = {
  en: {
    eyebrow: 'What we offer',
    heading: (
      <>
        A complete framework for <span className="font-display italic">international education</span>
      </>
    ),
    sub: 'From classroom to campus to career — four connected pathways that prepare students for a global future.',
    cta: 'Explore',
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
        完整的<span className="font-display italic">国际教育</span>体系
      </>
    ),
    sub: '从课堂到校园再到职业 —— 四条相互衔接的路径，助力学生迈向全球未来。',
    cta: '查看详情',
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

export function PartnerPrograms({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <section id="our-programs" className="scroll-mt-24 bg-white">
      <Container className="py-24 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Display className="mt-6 text-[2rem] leading-tight sm:text-[2.6rem]">{t.heading}</Display>
          <p className="mt-5 text-lg leading-relaxed text-slate-body">{t.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.cards.map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-edge bg-paper p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:bg-white hover:shadow-lift"
            >
              <span className="bg-ngs-gradient bg-clip-text font-display text-2xl text-transparent">
                0{i + 1}
              </span>
              <span className="mt-4 block h-px w-8 bg-ngs-gradient" />
              <h3 className="mt-4 font-display text-lg leading-snug text-slate-ink">{card.title}</h3>
              <ul className="mt-5 flex-1 space-y-2.5">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-body">
                    <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-ngs-gradient" />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-ink">
                {t.cta}
                <ArrowRight className="text-ngs-violet transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
