import type { MetadataRoute } from 'next';
import { siteLinks } from '@/lib/siteLinks';

/**
 * Generate the sitemap from the same `siteLinks` table that the navbar,
 * footer, and language switcher use. New routes added to `siteLinks` show
 * up here automatically — no risk of the sitemap drifting from real URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nextgenscholars.asia';
  const now = new Date();

  const allPaths = [
    ...Object.values(siteLinks.zh),
    ...Object.values(siteLinks.en),
  ];

  const homePaths = new Set<string>([siteLinks.zh.home, siteLinks.en.home]);

  return allPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: homePaths.has(path) ? 1.0 : 0.7,
  }));
}
