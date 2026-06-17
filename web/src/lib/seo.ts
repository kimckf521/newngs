import type { Metadata } from 'next';
import { siteLinks, type Locale } from '@/lib/siteLinks';

/**
 * Single source of truth for per-page SEO metadata.
 *
 * Every public page calls `pageSeo()` so that canonical URLs, hreflang
 * alternates, Open Graph and Twitter cards stay consistent and never drift
 * from the real route table in `siteLinks`. The site is fully bilingual, so
 * each page advertises its EN + ZH counterparts via `alternates.languages`.
 *
 * URLs are passed as the relative paths from `siteLinks` — Next.js resolves
 * them against `metadataBase` (set in the root layout) into absolute URLs.
 */

export const SITE_URL = 'https://nextgenscholars.asia';
export const BRAND_EN = 'NextGen Scholars';
export const BRAND_ZH = 'NextGen Scholars 未来学者';
/** Default 1200×630 social share image (branded). */
export const DEFAULT_OG_IMAGE = '/static/img/og-default.jpg';

export type PageKey = keyof typeof siteLinks.en;

/** Join a path onto the canonical origin (used by JSON-LD, which needs absolute URLs). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path}`;
}

interface PageSeoInput {
  /** Route key shared by both locales (see `siteLinks`). */
  page: PageKey;
  locale: Locale;
  /** Page title WITHOUT the brand suffix — the brand is appended here. */
  title: string;
  description: string;
  /** Override the default OG image (path or absolute URL). */
  image?: string;
  /** Keep the page out of the index (utility / placeholder pages). */
  noindex?: boolean;
  /** When noindexed, whether crawlers may still follow links (default true). */
  follow?: boolean;
}

/**
 * Build a complete `Metadata` object for one page in one locale: title (with
 * brand), description, canonical, hreflang alternates, Open Graph and Twitter.
 */
export function pageSeo({
  page,
  locale,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  follow = true,
}: PageSeoInput): Metadata {
  const enPath = siteLinks.en[page];
  const zhPath = siteLinks.zh[page];
  const path = locale === 'en' ? enPath : zhPath;
  const brand = locale === 'en' ? BRAND_EN : BRAND_ZH;
  const fullTitle = `${title} — ${brand}`;
  const ogLocale = locale === 'en' ? 'en_US' : 'zh_CN';
  const altLocale = locale === 'en' ? 'zh_CN' : 'en_US';

  return {
    // `absolute` bypasses the root title.template so we never double the brand
    // and can use a locale-aware brand string.
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: path,
      languages: {
        en: enPath,
        'zh-CN': zhPath,
        'x-default': enPath,
      },
    },
    openGraph: {
      type: 'website',
      siteName: BRAND_EN,
      title: fullTitle,
      description,
      url: path,
      locale: ogLocale,
      alternateLocale: altLocale,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    ...(noindex
      ? {
          robots: {
            index: false,
            follow,
            googleBot: { index: false, follow },
          },
        }
      : {}),
  };
}

export type { Locale };
