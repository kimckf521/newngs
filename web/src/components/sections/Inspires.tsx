import Image from 'next/image';
import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';

/**
 * "NextGen Inspires" — 4 cards introducing the four pillars of the
 * inspires community. Replaces InspiresZh + InspiresEn.
 */
export function Inspires({ locale }: { locale: Locale }) {
  const t = home[locale].inspires;
  const gridClass = locale === 'zh' ? 'inspires-zh__grid-cols' : 'inspires__grid-cols';
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';

  return (
    <section className={`inspires inspires__flex ${fontClass}`}>
      <div className="wrap inspires__flex-col">
        <h2 className="section_title inspires__text-center">{t.title}</h2>
        <div className={gridClass}>
          {t.cards.map((card) => (
            <div key={card.title} className="index__text-center-1307">
              <Image
                alt={card.title}
                src={card.img}
                width={300}
                height={300}
                className="inspires__circle"
              />
              <h3 className="section_subtitle inspires__style-1">{card.title}</h3>
              <p className="section_paragraph inspires__style-2">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
