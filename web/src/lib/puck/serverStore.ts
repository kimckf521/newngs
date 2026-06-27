import 'server-only';
import { query, queryOne } from '@/lib/db/pg';
import type { Locale } from '@/i18n/types';
import type { PageDoc, PuckData } from './types';

/**
 * Server-side page-builder persistence over PostgreSQL (see lib/db/pg.ts). One
 * row per (route, locale) in `pages`, with `draft` and `published` stored as
 * JSONB. The browser editor reaches this through /api/pages; SSR reads the
 * published column directly via getPublishedRaw.
 */
type Row = { route: string; locale: string; draft: PuckData | null; published: PuckData | null };

export async function getPageDoc(route: string, locale: Locale): Promise<PageDoc | null> {
  const row = await queryOne<Row>(
    'SELECT route, locale, draft, published FROM pages WHERE route = $1 AND locale = $2',
    [route, locale],
  );
  if (!row) return null;
  return { route: row.route, locale: row.locale as Locale, draft: row.draft, published: row.published };
}

/** Just the published tree for SSR (null when none). */
export async function getPublishedRaw(route: string, locale: Locale): Promise<PuckData | null> {
  const row = await queryOne<{ published: PuckData | null }>(
    'SELECT published FROM pages WHERE route = $1 AND locale = $2',
    [route, locale],
  );
  return row?.published ?? null;
}

/**
 * Upsert a page. Only the provided fields are written — saving a `draft`
 * preserves an existing `published` (and vice-versa) via COALESCE, so a draft
 * save never wipes the live page.
 */
export async function savePage(
  route: string,
  locale: Locale,
  patch: { draft?: PuckData | null; published?: PuckData | null },
): Promise<void> {
  // Map BOTH undefined and explicit null to SQL NULL (loose `!= null`). A literal
  // `null` would otherwise JSON.stringify to the string 'null' → `'null'::jsonb`
  // (JSON-null, NOT SQL NULL), which defeats the COALESCE and would WIPE the
  // other column. We never intentionally clear a column, so null === "leave it".
  const draft = patch.draft != null ? JSON.stringify(patch.draft) : null;
  const published = patch.published != null ? JSON.stringify(patch.published) : null;
  await query(
    `INSERT INTO pages (route, locale, draft, published, updated_at)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, now())
     ON CONFLICT (route, locale) DO UPDATE SET
       draft = COALESCE($3::jsonb, pages.draft),
       published = COALESCE($4::jsonb, pages.published),
       updated_at = now()`,
    [route, locale, draft, published],
  );
}
