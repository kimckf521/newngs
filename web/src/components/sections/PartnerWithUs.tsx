import Link from 'next/link';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

interface Card {
  href: string;
  title: React.ReactNode;
  items: string[];
}

const partnerWithUs: Record<Locale, { title: string; cards: Card[] }> = {
  zh: {
    title: '成为NGS伙伴',
    cards: [
      {
        href: siteLinks.zh.cclr,
        title: '升学探索课程',
        items: ['职业准备', '大学准备', '生活准备', '全球胜任力'],
      },
      {
        href: siteLinks.zh.hybrid,
        title: '线上学校课程',
        items: ['未来全域学习计划', '未来教育双轨计划', '未来无界文凭课程'],
      },
      {
        href: siteLinks.zh.ngsInspires,
        title: (
          <>
            NextGen
            <br />
            Inspires
          </>
        ),
        items: ['全球产业领袖', '全球大学', 'SPARK LAB', '全球校友'],
      },
      {
        href: siteLinks.zh.ngsConnects,
        title: (
          <>
            NextGen
            <br />
            Connects
          </>
        ),
        items: ['校园参访', '学校报告', '成长规划', '学术诊所'],
      },
    ],
  },
  en: {
    title: 'Partner with Us',
    cards: [
      {
        href: siteLinks.en.cclr,
        title: 'Career College Life Readiness Programme',
        items: ['Career Readiness', 'College Readiness', 'Life Readiness', 'Global Competency'],
      },
      {
        href: siteLinks.en.hybrid,
        title: (
          <>
            Partnership
            <br />
            Programmes
          </>
        ),
        items: ['Hybrid Program', 'Dual-track Program', 'Online Diploma Program'],
      },
      {
        href: siteLinks.en.ngsInspires,
        title: (
          <>
            NextGen
            <br />
            Inspires
          </>
        ),
        items: ['Global Industry Leaders', 'Global Universities', 'SPARK LAB', 'Global Alumni'],
      },
      {
        href: siteLinks.en.ngsConnects,
        title: (
          <>
            NextGen
            <br />
            Connects
          </>
        ),
        items: ['School Visits', 'School Reports', 'Growth Mapping', 'Academic Clinics'],
      },
    ],
  },
};

/**
 * "Partner with Us" — 4 program cards. Replaces PartnerWithUsZh + PartnerWithUsEn.
 */
export function PartnerWithUs({ locale }: { locale: Locale }) {
  const t = partnerWithUs[locale];
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';
  const cardClass =
    locale === 'zh' ? 'partner-with-us-zh__flex-col' : 'partner-with-us__flex-col-5afc';

  return (
    <section className={`partner-with-us partner-with-us__flex-center ${fontClass}`}>
      <div className="wrap partner-with-us__flex-col">
        <h2 className="section_title partner-with-us__text-center">{t.title}</h2>
        <div className="partner-with-us__grid-cols">
          {t.cards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="partner-with-us__style-1"
            >
              <div className={i === 0 && locale === 'en' ? 'partner-with-us__flex-col-c672' : cardClass}>
                <h3 className="section_subtitle partner-with-us__style-2">{card.title}</h3>
                <div className="intro-hybrid__style-2"></div>
                <ul className="partner-with-us__style-3">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
