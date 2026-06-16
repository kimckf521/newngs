import type { Locale } from '@/i18n/types';
import { SiteHeaderV1 } from './SiteHeaderV1';
import { HeroV1 } from './HeroV1';
import { LogosV1 } from './LogosV1';
import { ProgramsV1 } from './ProgramsV1';
import { OfferV1 } from './OfferV1';
import { AboutV1 } from './AboutV1';
import { PillarsV1 } from './PillarsV1';
import { GlobalV1 } from './GlobalV1';
import { PartnersV1 } from './PartnersV1';
import { ContactV1 } from './ContactV1';
import { FooterV1 } from './FooterV1';

/**
 * "v1" alternate homepage — bold, dark, vibrant (aurora + brand gradient +
 * Space Grotesk). A completely different direction from the editorial
 * /redesign. The `ngs-redesign` class re-applies the heading scope guard so
 * gradient-text spans inside headings inherit size/weight from the legacy CSS.
 */
export function HomeV1({ locale, langHref }: { locale: Locale; langHref: string }) {
  return (
    <div className="ngs-redesign bg-night font-sans text-white antialiased">
      <SiteHeaderV1 locale={locale} langHref={langHref} />
      <main>
        <HeroV1 locale={locale} />
        <LogosV1 locale={locale} />
        <ProgramsV1 locale={locale} />
        <OfferV1 locale={locale} />
        <AboutV1 locale={locale} />
        <PillarsV1 locale={locale} />
        <GlobalV1 locale={locale} />
        <PartnersV1 locale={locale} />
        <ContactV1 locale={locale} />
      </main>
      <FooterV1 locale={locale} />
    </div>
  );
}
