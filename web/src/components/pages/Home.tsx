import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { PartnerIntro } from '@/components/sections/PartnerIntro';
import { OurPrograms } from '@/components/sections/OurPrograms';
import { FounderStory } from '@/components/sections/FounderStory';
import { PartnerWithUs } from '@/components/sections/PartnerWithUs';
import { IndexForm } from '@/components/sections/IndexForm';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Inspires } from '@/components/sections/Inspires';
import { Media } from '@/components/sections/Media';
import { PartnersLists } from '@/components/sections/PartnersLists';
import type { Locale } from '@/i18n/types';

/**
 * Locale-aware home page. Replaces HomeZh + HomeEn.
 */
export function Home({ locale }: { locale: Locale }) {
  const heroAlt =
    locale === 'zh' ? '毕业生们抛起学位帽庆祝' : 'Graduates throwing caps in celebration';
  const founderAlt = locale === 'zh' ? 'NGS 创始人 Brian' : 'Brian, NGS founder';

  return (
    <>
      <Navbar locale={locale} />
      <Hero src="/static/img/Graduation.jpg" alt={heroAlt} locale={locale} priority />
      <PartnerIntro locale={locale} />
      <OurPrograms locale={locale} />
      <FounderStory locale={locale} />
      <Hero src="/static/img/brian.jpg" alt={founderAlt} locale={locale} />
      <PartnerWithUs locale={locale} />
      <IndexForm locale={locale} />
      <GlobalCommunity locale={locale} />
      <Inspires locale={locale} />
      <Media locale={locale} />
      <PartnersLists locale={locale} />
      <CustomerServiceFab locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
