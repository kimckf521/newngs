import Image from 'next/image';
import type { Locale } from '@/i18n/types';
import { Container } from './ui';

const content = {
  en: {
    label: 'Aligned with the world’s leading curricula & exam boards',
  },
  zh: {
    label: '对接全球权威课程体系与考试局',
  },
} as const;

const boards = [
  { src: '/static/img/ycs/ucas.png', alt: 'UCAS' },
  { src: '/static/img/ycs/edexcel.png', alt: 'Pearson Edexcel' },
  { src: '/static/img/ycs/aqa.png', alt: 'Oxford AQA' },
  { src: '/static/img/ycs/cie.jpg', alt: 'Cambridge International' },
  { src: '/static/img/ycs/college_board.jpg', alt: 'College Board' },
];

export function AccreditationBar({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <section className="border-b border-edge bg-paper">
      <Container className="py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-eyebrow text-slate-mute">
          {t.label}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
          {boards.map((b) => (
            <Image
              key={b.alt}
              src={b.src}
              alt={b.alt}
              width={150}
              height={44}
              className="h-9 w-auto object-contain opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
