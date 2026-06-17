import type { Metadata } from 'next';
import { HomeV1 } from '@/components/redesign-v1/HomeV1';
import type { Locale } from '@/i18n/types';

export const metadata: Metadata = {
  title: 'NextGen Scholars — v1 (Light theme)',
  description:
    'A light-theme variant of the live NextGen Scholars homepage — the same bold design, re-themed onto a clean light palette.',
};

/**
 * Light-theme preview of the live "v1" design. It renders the exact same
 * <HomeV1> used by the dark design, wrapped in `.v1-light` — a scoped CSS
 * re-theme (see globals.css) flips the dark palette to light without
 * touching a single component or the live site. Defaults to English;
 * append `?lang=zh` for Chinese.
 */
export default function RedesignV1LightPreview({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale: Locale = searchParams?.lang === 'zh' ? 'zh' : 'en';
  const langHref = locale === 'en' ? '/redesign-v1-light?lang=zh' : '/redesign-v1-light?lang=en';
  return (
    <div className="v1-light">
      <HomeV1 locale={locale} langHref={langHref} />
    </div>
  );
}
