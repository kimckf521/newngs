import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Generated /robots.txt. Allows crawling of all marketing pages, blocks
 * non-content surfaces (API, admin/editor), and points crawlers at the
 * sitemap. Private/utility/preview pages additionally carry a `noindex`
 * robots meta tag (see their metadata) so they are crawl-allowed but kept
 * out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/admin/', '/login', '/register', '/member', '/forgot-password', '/auth'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
