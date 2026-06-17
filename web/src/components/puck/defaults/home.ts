import type { Locale } from '@/i18n/types';
import type { PuckData } from '@/lib/puck/types';
import { heroDefaults } from '@/components/redesign-v1/HeroV1';
import { programsDefaults } from '@/components/redesign-v1/ProgramsV1';
import { testimonialsDefaults } from '@/components/redesign-v1/TestimonialsV1';
import { faqDefaults } from '@/components/redesign-v1/FaqV1';

/**
 * The homepage seeded into a fresh editor session — the exact 14 sections (in
 * order) the live homepage renders today, so "new page == current site". The
 * 4 editable blocks get their current content as props; the 10 pass-throughs
 * render their own current content.
 */
export function defaultHomeData(locale: Locale): PuckData {
  return {
    root: { props: {} },
    content: [
      { type: 'Hero', props: { id: 'Hero-1', ...heroDefaults(locale) } },
      { type: 'Logos', props: { id: 'Logos-1' } },
      { type: 'WhyTrust', props: { id: 'WhyTrust-1' } },
      { type: 'Programs', props: { id: 'Programs-1', ...programsDefaults(locale) } },
      { type: 'Offer', props: { id: 'Offer-1' } },
      { type: 'Process', props: { id: 'Process-1' } },
      { type: 'Outcomes', props: { id: 'Outcomes-1' } },
      { type: 'About', props: { id: 'About-1' } },
      { type: 'Pillars', props: { id: 'Pillars-1' } },
      { type: 'Global', props: { id: 'Global-1' } },
      { type: 'Testimonials', props: { id: 'Testimonials-1', ...testimonialsDefaults(locale) } },
      { type: 'Partners', props: { id: 'Partners-1' } },
      { type: 'Faq', props: { id: 'Faq-1', ...faqDefaults(locale) } },
      { type: 'Contact', props: { id: 'Contact-1' } },
    ],
  };
}
