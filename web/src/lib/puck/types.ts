import type { Locale } from '@/i18n/types';

/** Puck's serialised page data. Kept loose (`any` content) on purpose — the
 *  shape is owned by the Puck config, not this type. */
export type PuckData = {
  content: unknown[];
  root: { props?: Record<string, unknown> };
  zones?: Record<string, unknown[]>;
};

/** One page row, keyed by (route, locale) in the Postgres `pages` table. The
 *  `draft`/`published` trees are stored as JSONB. (Some fields are only used by
 *  the localStorage trial copy.) */
export type PageDoc = {
  route: string;
  locale: Locale;
  draft: PuckData | null;
  published: PuckData | null;
  updatedBy?: string;
  updatedAt?: number;
  publishedAt?: number;
};

/** Stable key for a page in a given locale. `route` is the siteLinks key
 *  (e.g. 'home'), NOT the URL path. Used for the localStorage trial key. */
export function pageDocId(route: string, locale: Locale): string {
  return `${route}_${locale}`;
}
