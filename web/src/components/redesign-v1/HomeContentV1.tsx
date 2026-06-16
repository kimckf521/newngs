import type { Locale } from '@/i18n/types';
import { HeroV1 } from './HeroV1';
import { LogosV1 } from './LogosV1';
import { WhyTrustV1 } from './WhyTrustV1';
import { ProgramsV1 } from './ProgramsV1';
import { OfferV1 } from './OfferV1';
import { ProcessV1 } from './ProcessV1';
import { OutcomesV1 } from './OutcomesV1';
import { AboutV1 } from './AboutV1';
import { PillarsV1 } from './PillarsV1';
import { GlobalV1 } from './GlobalV1';
import { TestimonialsV1 } from './TestimonialsV1';
import { PartnersV1 } from './PartnersV1';
import { FaqV1 } from './FaqV1';
import { ContactV1 } from './ContactV1';

/**
 * The v1 homepage CONTENT (sections only — no header/footer). Rendered
 * directly by the live home routes, where the site shell supplies the
 * chrome, and re-used by the /redesign-v1 preview route inside its own
 * chrome. The section order tells a deliberate trust story for parents:
 * promise → accreditation → why-trust → what we offer → how it works →
 * outcomes → who we are → community → proof → partners → questions → contact.
 */
export function HomeContentV1({ locale }: { locale: Locale }) {
  return (
    <>
      <HeroV1 locale={locale} />
      <LogosV1 locale={locale} />
      <WhyTrustV1 locale={locale} />
      <ProgramsV1 locale={locale} />
      <OfferV1 locale={locale} />
      <ProcessV1 locale={locale} />
      <OutcomesV1 locale={locale} />
      <AboutV1 locale={locale} />
      <PillarsV1 locale={locale} />
      <GlobalV1 locale={locale} />
      <TestimonialsV1 locale={locale} />
      <PartnersV1 locale={locale} />
      <FaqV1 locale={locale} />
      <ContactV1 locale={locale} />
    </>
  );
}
