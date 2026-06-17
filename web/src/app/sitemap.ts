import type { MetadataRoute } from 'next';
import { siteLinks } from '@/lib/siteLinks';
import { SITE_URL } from '@/lib/seo';

/**
 * Generate the sitemap from the same `siteLinks` table that the navbar,
 * footer, and language switcher use. New routes added to `siteLinks` show
 * up here automatically — no risk of the sitemap drifting from real URLs.
 *
 * Every URL also advertises its EN/ZH counterpart via `alternates.languages`
 * so Google understands the two locales are translations of each other
 * (the hreflang annotations in the sitemap mirror the per-page <link> tags).
 */

// Bump when site content materially changes so crawlers re-fetch.
const LAST_MODIFIED = '2026-06-18';

export default function sitemap(): MetadataRoute.Sitemap {
  // Exclude gated / non-public / placeholder routes so the sitemap only
  // advertises indexable marketing pages.
  const EXCLUDE = new Set([
    'login',
    'register',
    'forgotPassword',
    'member',
    'oauthCallback',
    'inProgress',
  ]);

  const keys = (Object.keys(siteLinks.en) as Array<keyof typeof siteLinks.en>).filter(
    (key) => !EXCLUDE.has(key),
  );

  const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL;

  // One entry per locale URL; each carries the full hreflang set (incl. self).
  return keys.flatMap((key) => {
    const enUrl = abs(siteLinks.en[key]);
    const zhUrl = abs(siteLinks.zh[key]);
    const isHome = key === 'home';
    const languages = { en: enUrl, 'zh-CN': zhUrl, 'x-default': enUrl };

    return ([
      [zhUrl],
      [enUrl],
    ] as const).map(([url]) => ({
      url,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: isHome ? 1.0 : 0.7,
      alternates: { languages },
    }));
  });
}
