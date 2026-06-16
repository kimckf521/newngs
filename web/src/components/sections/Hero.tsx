import Image from 'next/image';
import type { Locale } from '@/i18n/types';

/**
 * Locale-aware hero image section. Replaces HeroZh + HeroEn.
 *
 * The class name only differs by font (legacy `section-font-style` vs
 * `_zh`) — that distinction goes away once everything migrates fully off
 * the legacy CSS, but for now we keep it.
 */
export function Hero({
  src,
  alt,
  locale,
  priority = false,
}: {
  src: string;
  alt: string;
  locale: Locale;
  priority?: boolean;
}) {
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';
  return (
    <section className={`hero ${fontClass}`}>
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={800}
        className="w-full h-auto block"
        priority={priority}
        sizes="100vw"
      />
    </section>
  );
}
