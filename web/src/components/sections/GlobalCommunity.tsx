import Image from 'next/image';
import type { Locale } from '@/i18n/types';

const globalCommunity = {
  zh: {
    title: '未来学者全球社区',
    locations: (
      <>
        美国三藩市 - 澳大利亚墨尔本
        <br />
        中国香港 - 中国台湾 - 中国大湾区
      </>
    ),
  },
  en: {
    title: 'NextGen Global Community',
    locations: (
      <>
        San Francisco · Melbourne
        <br />
        Hong Kong · Taiwan · Greater Bay Area China
      </>
    ),
  },
} as const;

/**
 * "Global Community" section. Replaces GlobalCommunityZh + GlobalCommunityEn.
 */
export function GlobalCommunity({ locale }: { locale: Locale }) {
  const t = globalCommunity[locale];
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';

  return (
    <section className={`global-community__flex ${fontClass}`}>
      <div className="global-community__grid-cols">
        <div className="global-community__grid">
          <h2 className="section_title global-community__text-center">{t.title}</h2>
          <div className="global-community__flex-0260">
            <Image
              alt="World Map"
              src="/static/img/world-map.png"
              width={600}
              height={300}
              className="global-community__style-1"
            />
          </div>
          <p className="section_paragraph global-community__text-center-9d48">{t.locations}</p>
        </div>
        <div className="global-community__flex-center">
          <Image
            alt="NGS Global Community"
            src="/static/img/harvard.png"
            width={600}
            height={400}
            className="global-community__rounded"
          />
        </div>
      </div>
    </section>
  );
}
