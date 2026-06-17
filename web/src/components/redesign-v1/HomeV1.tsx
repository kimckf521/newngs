import type { Locale } from '@/i18n/types';
import { SiteHeaderV1 } from './SiteHeaderV1';
import { FooterV1 } from './FooterV1';
import { ContactFabV1 } from './ContactFabV1';
import { HomeContentV1 } from './HomeContentV1';

/**
 * Self-contained "v1" homepage for the /redesign-v1 PREVIEW route (it lives
 * outside the (zh)/(en) route groups, so it brings its own chrome). The live
 * home routes render <HomeContentV1> directly and get their chrome from the
 * site shell instead. Both share the same section content.
 */
export function HomeV1({ locale, langHref }: { locale: Locale; langHref: string }) {
  return (
    <div className="ngs-redesign bg-night font-inter text-white antialiased">
      <SiteHeaderV1 locale={locale} langHref={langHref} />
      <main>
        <HomeContentV1 locale={locale} />
      </main>
      <FooterV1 locale={locale} />
      <ContactFabV1 locale={locale} />
    </div>
  );
}
