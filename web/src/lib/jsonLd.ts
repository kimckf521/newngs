import { siteLinks, externalLinks, type Locale } from '@/lib/siteLinks';
import { SITE_URL, BRAND_EN, type PageKey } from '@/lib/seo';

/**
 * schema.org structured data (JSON-LD). The root layout emits the
 * `EducationalOrganization` + `WebSite` nodes once per page; individual pages
 * add a page-level node (WebPage / AboutPage / Course / …) plus a breadcrumb.
 *
 * Nodes reference each other by `@id` so Google merges them into one graph.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_URL = `${SITE_URL}/static/img/logo.png`;

/** The organisation behind the whole site. Emitted site-wide from the root layout. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': ORG_ID,
    name: BRAND_EN,
    alternateName: '未来学者',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 770, height: 300 },
    image: `${SITE_URL}/static/img/og-default.jpg`,
    description:
      'NextGen Scholars (未来学者) connects ambitious students with mentors from the world’s leading universities and global industry leaders — a trustworthy, world-class international education without borders.',
    sameAs: [externalLinks.linkedin, externalLinks.xiaohongshu].filter(Boolean),
  };
}

/** The website itself. Emitted site-wide from the root layout. */
export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BRAND_EN,
    alternateName: BRAND_EN + ' 未来学者',
    url: SITE_URL,
    inLanguage: ['zh-CN', 'en'],
    publisher: { '@id': ORG_ID },
  };
}

/** schema.org type used for the page-level node. */
export type PageLdType =
  | 'WebPage'
  | 'AboutPage'
  | 'ContactPage'
  | 'CollectionPage'
  | 'Course'
  | 'FAQPage';

interface PageLdInput {
  page: PageKey;
  locale: Locale;
  /** Human-facing page name (no brand). */
  name: string;
  description: string;
  type?: PageLdType;
  /** For Course pages, optional course metadata. */
  course?: { name?: string };
}

function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === '/' ? '' : it.path}` || SITE_URL,
    })),
  };
}

/**
 * Build the page-level JSON-LD graph: a WebPage-family node tied to the
 * WebSite + Organization, plus a Home → Page breadcrumb (skipped on home).
 * Returns an array ready to hand to <JsonLd>.
 */
export function pageJsonLd({
  page,
  locale,
  name,
  description,
  type = 'WebPage',
  course,
}: PageLdInput): object[] {
  const path = siteLinks[locale][page];
  const homePath = siteLinks[locale].home;
  const url = `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL;
  const inLanguage = locale === 'en' ? 'en' : 'zh-CN';

  const pageNode: Record<string, unknown> =
    type === 'Course'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course?.name ?? name,
          description,
          url,
          inLanguage,
          provider: { '@id': ORG_ID },
          isPartOf: { '@id': WEBSITE_ID },
        }
      : {
          '@context': 'https://schema.org',
          '@type': type,
          name,
          description,
          url,
          inLanguage,
          isPartOf: { '@id': WEBSITE_ID },
          about: { '@id': ORG_ID },
        };

  const graph: object[] = [pageNode];

  if (page !== 'home') {
    const homeName = locale === 'en' ? 'Home' : '首页';
    graph.push(breadcrumbLd([
      { name: homeName, path: homePath },
      { name, path },
    ]));
  }

  return graph;
}
