import type { Locale } from '@/i18n/types';
import { SiteHeader } from './SiteHeader';
import { Hero } from './Hero';
import { AccreditationBar } from './AccreditationBar';
import { WhoWeAre } from './WhoWeAre';
import { Programs } from './Programs';
import { PartnerPrograms } from './PartnerPrograms';
import { Pillars } from './Pillars';
import { GlobalNetwork } from './GlobalNetwork';
import { Partners } from './Partners';
import { ContactCTA } from './ContactCTA';
import { SiteFooter } from './SiteFooter';

/**
 * Redesigned NextGen Scholars homepage — premium-editorial direction.
 * Locale-aware (en / zh). Self-contained: every section sets its own
 * background, so it renders correctly regardless of the global body styles.
 */
export function HomeRedesign({ locale, langHref }: { locale: Locale; langHref: string }) {
  return (
    <div className="ngs-redesign bg-paper font-sans antialiased">
      <SiteHeader locale={locale} langHref={langHref} />
      <main>
        <Hero locale={locale} />
        <AccreditationBar locale={locale} />
        <WhoWeAre locale={locale} />
        <Programs locale={locale} />
        <PartnerPrograms locale={locale} />
        <Pillars locale={locale} />
        <GlobalNetwork locale={locale} />
        <Partners locale={locale} />
        <ContactCTA locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
