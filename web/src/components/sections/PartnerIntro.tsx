import { home } from '@/content/home';
import type { Locale } from '@/i18n/types';

/**
 * Hero blurb. Replaces PartnerIntroZh + PartnerIntroEn.
 */
export function PartnerIntro({ locale }: { locale: Locale }) {
  const t = home[locale].partnerIntro;
  return (
    <section className="index__flex-col">
      <div className="index__style-1">
        <h2 className="index__style-2">{t.title}</h2>
        <p className="index__style-3">{t.description}</p>
      </div>
    </section>
  );
}
