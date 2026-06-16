import Image from 'next/image';
import { founderStory } from '@/content/founder';
import type { Locale } from '@/i18n/types';

const paragraphClassByIndex = [
  'section_paragraph index__style-6',
  'index__style-7',
  'index__style-7',
  'index__style-8',
];

/**
 * "Founder Story" / "创始人故事". Replaces FounderStoryZh + FounderStoryEn.
 */
export function FounderStory({ locale }: { locale: Locale }) {
  const t = founderStory[locale];
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';

  return (
    <section id={t.anchorId} className={`index__flex-col-c73a ${fontClass}`}>
      <h2 className="section_title index__text-center">{t.title}</h2>
      <div className="wrap index__grid-cols">
        <div className="index__grid-cols-c348">
          {t.founders.map((f) => (
            <div key={f.name} className="index__text-center-1307">
              <Image
                src={f.img}
                alt={f.name}
                width={180}
                height={180}
                className="index__circle"
              />
              <div className={`index__style-4 ${fontClass}`}>
                <p>{f.name}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="index__style-5">
          {t.paragraphs.map((p, i) => (
            <p key={i} className={paragraphClassByIndex[i]}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
