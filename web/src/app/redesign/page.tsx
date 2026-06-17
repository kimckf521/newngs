import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { HomeRedesign } from '@/components/redesign/HomeRedesign';
import type { Locale } from '@/i18n/types';

// Editorial serif scoped to THIS preview route only (moved out of the root
// layout so the live site and all other routes no longer preload it).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NextGen Scholars — International Education',
  description:
    'NextGen Scholars connects ambitious students with mentors from the world’s leading universities and global industry leaders.',
};

/**
 * Preview route for the redesigned homepage. Defaults to English; append
 * `?lang=zh` for the Chinese version. The live pages are left untouched so
 * the new design can be reviewed side by side before promotion.
 */
export default function RedesignPreview({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale: Locale = searchParams?.lang === 'zh' ? 'zh' : 'en';
  const langHref = locale === 'en' ? '/redesign?lang=zh' : '/redesign?lang=en';
  return (
    <div className={fraunces.variable}>
      <HomeRedesign locale={locale} langHref={langHref} />
    </div>
  );
}
