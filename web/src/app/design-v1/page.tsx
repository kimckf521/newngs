import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import { HeritageHome } from '@/components/design-v1/HeritageHome';
import type { Locale } from '@/i18n/types';

// High-contrast display serif scoped to THIS preview route only (moved out of
// the root layout so the live site and all other routes no longer preload it).
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NextGen Scholars — Heritage Prestige (design-v1)',
  description:
    'An alternate “Heritage Prestige” homepage concept for NextGen Scholars — ivory paper, deep navy ink, antique-gold accents and a high-contrast serif.',
};

/**
 * Preview route for the third design direction — "Heritage Prestige".
 * A completely separate look from the live site and the other previews.
 * Defaults to English; append `?lang=zh` for Chinese. Self-contained:
 * it brings its own header/footer (it sits outside the (zh)/(en) groups).
 */
export default function DesignV1Preview({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale: Locale = searchParams?.lang === 'zh' ? 'zh' : 'en';
  const langHref = locale === 'en' ? '/design-v1?lang=zh' : '/design-v1?lang=en';
  return (
    <div className={playfair.variable}>
      <HeritageHome locale={locale} langHref={langHref} />
    </div>
  );
}
