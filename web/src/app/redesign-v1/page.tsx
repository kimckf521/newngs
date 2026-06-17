import type { Metadata } from 'next';
import { HomeV1 } from '@/components/redesign-v1/HomeV1';
import type { Locale } from '@/i18n/types';

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  title: { absolute: 'NextGen Scholars — International Education' },
  description:
    'NextGen Scholars connects ambitious students with mentors from the world’s leading universities and global industry leaders.',
};

/**
 * Preview route for the bold "v1" alternate homepage. Defaults to English;
 * append `?lang=zh` for Chinese. Sits alongside /redesign so both designs
 * can be compared.
 */
export default function RedesignV1Preview({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale: Locale = searchParams?.lang === 'zh' ? 'zh' : 'en';
  const langHref = locale === 'en' ? '/redesign-v1?lang=zh' : '/redesign-v1?lang=en';
  return <HomeV1 locale={locale} langHref={langHref} />;
}
