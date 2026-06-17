import type { Locale } from '@/i18n/types';

/** Puck's serialised page data. Kept loose (`any` content) on purpose — the
 *  shape is owned by the Puck config, not this type. */
export type PuckData = {
  content: unknown[];
  root: { props?: Record<string, unknown> };
  zones?: Record<string, unknown[]>;
};

/** One document in the CloudBase `pages` collection (id = `${route}_${locale}`). */
export type PageDoc = {
  _id?: string;
  route: string;
  locale: Locale;
  draft: PuckData | null;
  published: PuckData | null;
  updatedBy?: string;
  updatedAt?: number;
  publishedAt?: number;
};

/** Document id for a page in a given locale. `route` is the siteLinks key
 *  (e.g. 'home'), NOT the URL path, to keep ids DB-safe and locale-stable. */
export function pageDocId(route: string, locale: Locale): string {
  return `${route}_${locale}`;
}
