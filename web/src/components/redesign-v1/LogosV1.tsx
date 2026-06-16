import Image from 'next/image';
import type { Locale } from '@/i18n/types';
import { Container } from './ui';

/* ------------------------------------------------------------------ *
 * Thin trust band for the BOLD "v1" homepage. Dark base with a faint
 * top/bottom border. The source logos are a mix of transparent PNGs and
 * opaque white-background JPEGs, so instead of recolouring them we sit
 * each on a small white chip — every logo renders in its real form and
 * the row reads as a clean "trusted by" wall on the dark section.
 * ------------------------------------------------------------------ */

const content = {
  en: {
    label: 'Aligned with the world’s leading curricula & exam boards',
  },
  zh: {
    label: '对接全球权威课程体系与考试局',
  },
} as const;

const logos = [
  { src: '/static/img/ycs/ucas.png', alt: 'UCAS' },
  { src: '/static/img/ycs/edexcel.png', alt: 'Pearson Edexcel' },
  { src: '/static/img/ycs/aqa.png', alt: 'Oxford AQA' },
  { src: '/static/img/ycs/cie.jpg', alt: 'Cambridge International' },
  { src: '/static/img/ycs/college_board.jpg', alt: 'College Board' },
];

export function LogosV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <section className="bg-night border-y border-white/10">
      <Container className="py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          {t.label}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="flex h-14 w-32 items-center justify-center rounded-xl bg-white px-4 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                className="max-h-7 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
