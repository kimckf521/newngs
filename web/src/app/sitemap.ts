import type { MetadataRoute } from 'next';
import { siteLinks } from '@/lib/siteLinks';

/**
 * Generate the sitemap from the same `siteLinks` table that the navbar,
 * footer, and language switcher use. New routes added to `siteLinks` show
 * up here automatically — no risk of the sitemap drifting from real URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nextgenscholars.asia';

  // Exclude gated / non-public routes (auth, member area, OAuth callback) so the
  // sitemap only advertises indexable marketing pages.
  const EXCLUDE = new Set(['login', 'register', 'forgotPassword', 'member', 'oauthCallback']);
  const allPaths = (['zh', 'en'] as const).flatMap((locale) =>
    Object.entries(siteLinks[locale])
      .filter(([key]) => !EXCLUDE.has(key))
      .map(([, path]) => path),
  );

  const homePaths = new Set<string>([siteLinks.zh.home, siteLinks.en.home]);

  return allPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'monthly' as const,
    priority: homePaths.has(path) ? 1.0 : 0.7,
  }));
}
