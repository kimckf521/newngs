import Image from 'next/image';
import Link from 'next/link';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';

const cardClassByIndex = ['our-programs__style-2', 'our-programs__style-4', 'our-programs__style-4'];
const titleClassByIndex = [
  'our-programs__text-center-fcad',
  'our-programs__text-center-8988',
  'our-programs__text-center-9eec',
];

/**
 * "Our Programs" / "未来教育联盟" — three program cards on the home page.
 * Replaces OurProgramsZh + OurProgramsEn.
 */
export function OurPrograms({ locale }: { locale: Locale }) {
  const t = home[locale].ourPrograms;
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';

  return (
    <section className={`programs our-programs__section ${fontClass}`}>
      <h2 className="section_title our-programs__text-center">{t.title}</h2>
      <div className="our-programs__grid-cols">
        {t.cards.map((card, i) => {
          const content = (
            <div className="our-programs__style-1">
              <div className={cardClassByIndex[i]}>
                <Image
                  alt={card.title}
                  src={card.img}
                  width={600}
                  height={400}
                  className="our-programs__full-size"
                />
              </div>
              <h3 className={`section_subtitle ${titleClassByIndex[i]}`}>{card.title}</h3>
              <p className="section_paragraph our-programs__style-3">{card.description}</p>
            </div>
          );
          return card.href.startsWith('#') ? (
            <a key={card.key} href={card.href} className="partner-with-us__style-1">
              {content}
            </a>
          ) : (
            <Link key={card.key} href={card.href} className="partner-with-us__style-1">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
