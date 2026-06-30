/**
 * Shared types for IELTS rich lesson content. A module's content is a list of
 * pages; each page is a list of typed blocks (the same shape produced by the
 * extraction tooling and stored in web/src/data/ielts_mod{n}_rich.json).
 *
 * These types are imported by BOTH the student-facing viewer and the admin
 * content editor, so they live here rather than inside either component.
 */

export type Block =
  | { t: 'p' | 'h2' | 'h3'; v: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'img'; v: string; size?: 'full' | 'medium' | 'small' }
  | { t: 'vid'; v: string }
  | { t: 'yt'; v: string; label?: string }
  | { t: 'audio'; v: string; label?: string }
  | { t: 'link'; v: string; label?: string };

export type RichPage = { page: number; blocks: Block[] };
export type RichData = { pageTypes: Record<string, string | null>; pages: RichPage[] };

/** Page-type labels used by the pedagogy badge (in display order). */
export const PAGE_TYPE_KEYS = [
  'Show Me',
  'Show Me More',
  'Tell Me',
  'Involve Me',
  'Test Me',
  'Remind Me',
  'Summary',
] as const;

/** Block kinds the editor can create. */
export const BLOCK_TYPE_KEYS = ['p', 'h2', 'h3', 'ul', 'ol', 'img', 'vid', 'yt', 'audio', 'link'] as const;
export type BlockType = (typeof BLOCK_TYPE_KEYS)[number];

/** A fresh, empty block of the given type. */
export function emptyBlock(t: BlockType): Block {
  switch (t) {
    case 'ul':
    case 'ol':
      return { t, items: [''] };
    case 'img':
      return { t, v: '' };
    case 'vid':
      return { t, v: '' };
    case 'yt':
      return { t, v: '', label: '' };
    case 'audio':
      return { t, v: '', label: '' };
    case 'link':
      return { t, v: '', label: '' };
    default:
      return { t, v: '' };
  }
}

/** Renumber pages 1..N and rebuild the pageTypes map from a working list that
 *  carries the type alongside each page. Used by the editor on save. */
export function normaliseRichData(pages: { type: string | null; blocks: Block[] }[]): RichData {
  const pageTypes: Record<string, string | null> = {};
  const out: RichPage[] = pages.map((p, i) => {
    const num = i + 1;
    pageTypes[String(num)] = p.type && p.type !== 'None' ? p.type : null;
    return { page: num, blocks: p.blocks };
  });
  return { pageTypes, pages: out };
}
