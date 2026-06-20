/**
 * Puck page-builder config — ISOMORPHIC. Imported by both the client editor
 * (`<Puck>`) and the server renderer (`<Render>`), so it must stay server-safe:
 * NO 'use client', no hooks, no browser globals at module scope. Each block
 * delegates to an existing redesign-v1 component (we never rebuild visuals).
 *
 * Phase 1: 4 blocks are deeply editable (Hero, Programs, Testimonials, FAQ);
 * the other 10 are faithful pass-throughs (reorder/remove now; fields added in
 * Phase 2). The page's locale arrives via Puck `metadata.locale`.
 */
import type { Config } from '@measured/puck';
import type { Locale } from '@/i18n/types';
import { HeroV1 } from '@/components/redesign-v1/HeroV1';
import { LogosV1 } from '@/components/redesign-v1/LogosV1';
import { WhyTrustV1 } from '@/components/redesign-v1/WhyTrustV1';
import { ProgramsV1 } from '@/components/redesign-v1/ProgramsV1';
import { OfferV1 } from '@/components/redesign-v1/OfferV1';
import { ProcessV1 } from '@/components/redesign-v1/ProcessV1';
import { OutcomesV1 } from '@/components/redesign-v1/OutcomesV1';
import { AboutV1 } from '@/components/redesign-v1/AboutV1';
import { PillarsV1 } from '@/components/redesign-v1/PillarsV1';
import { GlobalV1 } from '@/components/redesign-v1/GlobalV1';
import { TestimonialsV1 } from '@/components/redesign-v1/TestimonialsV1';
import { PartnersV1 } from '@/components/redesign-v1/PartnersV1';
import { FaqV1 } from '@/components/redesign-v1/FaqV1';
import { ContactV1 } from '@/components/redesign-v1/ContactV1';
import { ImageUploadField } from './fields/ImageUploadField';

const localeOf = (puck: any): Locale => (puck?.metadata?.locale === 'en' ? 'en' : 'zh');

const imageField = {
  type: 'custom' as const,
  label: 'Image',
  render: ({ value, onChange }: any) => <ImageUploadField value={value} onChange={onChange} label="Image" />,
};

const buttonFields = { label: { type: 'text' as const }, href: { type: 'text' as const } };

export const puckConfig: Config = {
  root: { render: ({ children }: any) => <>{children}</> },
  categories: {
    editable: {
      title: 'Editable sections',
      components: ['Hero', 'Programs', 'Testimonials', 'Faq'],
    },
    sections: {
      title: 'Sections (reorder / remove)',
      components: ['Logos', 'WhyTrust', 'Offer', 'Process', 'Outcomes', 'About', 'Pillars', 'Global', 'Partners', 'Contact'],
    },
  },
  components: {
    // ---- Deeply editable blocks ----
    Hero: {
      label: 'Hero',
      fields: {
        // contentEditable: edit these directly in the preview (click the text).
        badge: { type: 'text', label: 'Badge', contentEditable: true },
        titleLine1: { type: 'text', label: 'Title — line 1', contentEditable: true },
        titleAccent: { type: 'text', label: 'Title — highlight', contentEditable: true },
        sub: { type: 'textarea', label: 'Subtitle', contentEditable: true },
        primary: { type: 'object', label: 'Primary button', objectFields: buttonFields },
        secondary: { type: 'object', label: 'Secondary button', objectFields: buttonFields },
        stats: {
          type: 'array',
          label: 'Stats',
          getItemSummary: (i: any) => i?.label || 'Stat',
          arrayFields: { value: { type: 'text' }, label: { type: 'text' } },
        },
      },
      render: ({ puck, id, ...data }: any) => <HeroV1 locale={localeOf(puck)} data={data} />,
    },
    Programs: {
      label: 'Programs (cards)',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow', contentEditable: true },
        headingLead: { type: 'text', label: 'Heading — before highlight', contentEditable: true },
        headingAccent: { type: 'text', label: 'Heading — highlight', contentEditable: true },
        headingTail: { type: 'text', label: 'Heading — after highlight', contentEditable: true },
        sub: { type: 'textarea', label: 'Subtitle', contentEditable: true },
        learnMore: { type: 'text', label: '“Learn more” label', contentEditable: true },
        cards: {
          type: 'array',
          label: 'Cards',
          getItemSummary: (i: any) => i?.title || 'Card',
          arrayFields: {
            title: { type: 'text' },
            description: { type: 'textarea' },
            href: { type: 'text', label: 'Link' },
            img: imageField,
          },
        },
      },
      render: ({ puck, id, ...data }: any) => <ProgramsV1 locale={localeOf(puck)} data={data} />,
    },
    Testimonials: {
      label: 'Testimonials',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow', contentEditable: true },
        title: { type: 'text', label: 'Title', contentEditable: true },
        sub: { type: 'textarea', label: 'Subtitle', contentEditable: true },
        note: { type: 'text', label: 'Placeholder note', contentEditable: true },
        quotes: {
          type: 'array',
          label: 'Quotes',
          getItemSummary: (i: any) => i?.name || 'Quote',
          arrayFields: { quote: { type: 'textarea' }, name: { type: 'text' }, role: { type: 'text' } },
        },
      },
      render: ({ puck, id, ...data }: any) => <TestimonialsV1 locale={localeOf(puck)} data={data} />,
    },
    Faq: {
      label: 'FAQ',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow', contentEditable: true },
        title: { type: 'text', label: 'Title', contentEditable: true },
        sub: { type: 'textarea', label: 'Subtitle', contentEditable: true },
        items: {
          type: 'array',
          label: 'Questions',
          getItemSummary: (i: any) => i?.q || 'Question',
          arrayFields: { q: { type: 'text', label: 'Question' }, a: { type: 'textarea', label: 'Answer' } },
        },
      },
      render: ({ puck, id, ...data }: any) => <FaqV1 locale={localeOf(puck)} data={data} />,
    },

    // ---- Faithful pass-through blocks (Phase 2 adds fields) ----
    Logos: { label: 'Logo row', render: ({ puck }: any) => <LogosV1 locale={localeOf(puck)} /> },
    WhyTrust: { label: 'Why trust us', render: ({ puck }: any) => <WhyTrustV1 locale={localeOf(puck)} /> },
    Offer: { label: 'What we offer', render: ({ puck }: any) => <OfferV1 locale={localeOf(puck)} /> },
    Process: { label: 'Process / steps', render: ({ puck }: any) => <ProcessV1 locale={localeOf(puck)} /> },
    Outcomes: { label: 'Outcomes / stats', render: ({ puck }: any) => <OutcomesV1 locale={localeOf(puck)} /> },
    About: { label: 'About / founders', render: ({ puck }: any) => <AboutV1 locale={localeOf(puck)} /> },
    Pillars: { label: 'Inspires pillars', render: ({ puck }: any) => <PillarsV1 locale={localeOf(puck)} /> },
    Global: { label: 'Global presence', render: ({ puck }: any) => <GlobalV1 locale={localeOf(puck)} /> },
    Partners: { label: 'Partners', render: ({ puck }: any) => <PartnersV1 locale={localeOf(puck)} /> },
    Contact: { label: 'Contact form', render: ({ puck }: any) => <ContactV1 locale={localeOf(puck)} /> },
  },
};
