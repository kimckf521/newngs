/**
 * Shared types for IELTS rich lesson content. A module's content is a list of
 * pages; each page is a list of typed blocks (the same shape produced by the
 * extraction tooling and stored in web/src/data/ielts_mod{n}_rich.json).
 *
 * These types are imported by BOTH the student-facing viewer and the admin
 * content editor, so they live here rather than inside either component.
 */

/** One cell in a fill-in table. `a` = the standard answer (an editable input
 *  cell for the student); `given` = a pre-filled read-only value (shown, never
 *  checked); `null`/`undefined` = a blank not-applicable cell (no input). */
export type TableFillCell = { a?: string; given?: string } | null;

/** One data row of a fill-in table. `indicator` is the fixed left-hand label;
 *  `group` is an optional sub-category (e.g. Men / Women); `indicatorZh` is an
 *  optional Chinese gloss surfaced as a hover tooltip. `cells` has one entry per
 *  column in the table's `cols`. */
export type TableFillRow = { indicator: string; indicatorZh?: string; group?: string; cells: TableFillCell[] };

type BlockBody =
  | { t: 'p' | 'h2' | 'h3'; v: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'img'; v: string; size?: 'full' | 'medium' | 'small' }
  | { t: 'vid'; v: string }
  | { t: 'yt'; v: string; label?: string }
  | { t: 'bili'; v: string; label?: string }
  | { t: 'video'; v: string }
  | { t: 'audio'; v: string; label?: string }
  | { t: 'link'; v: string; label?: string }
  | {
      t: 'tablefill';
      title?: string;
      indicatorLabel?: string;
      groupLabel?: string;
      cols: string[];
      rows: TableFillRow[];
    };

/** A content block. `hidden` keeps the block in the lesson (still editable) but
 *  excludes it from the student-facing reader. */
export type Block = BlockBody & { hidden?: boolean };

export type RichPage = { page: number; title?: string; blocks: Block[] };
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
export const BLOCK_TYPE_KEYS = ['p', 'h2', 'h3', 'ul', 'ol', 'img', 'vid', 'yt', 'bili', 'video', 'audio', 'link', 'tablefill'] as const;
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
    case 'bili':
      return { t, v: '', label: '' };
    case 'audio':
      return { t, v: '', label: '' };
    case 'link':
      return { t, v: '', label: '' };
    case 'tablefill':
      // Seed with the Cambridge "social & physical change 1953→2003" table so
      // the block is immediately usable; the teacher edits answers from here.
      return {
        t,
        title: 'Changes in social and physical data between 1953 and 2003',
        indicatorLabel: 'Indicator',
        groupLabel: 'Group',
        cols: ['1953', '2003'],
        rows: [
          { indicator: 'Life expectancy', indicatorZh: '预期寿命', group: 'Men', cells: [{ a: '66' }, { a: '75' }] },
          { indicator: 'Life expectancy', group: 'Women', cells: [{ a: '71' }, { a: '80' }] },
          { indicator: 'Number of people who live alone', indicatorZh: '独居人口', group: '', cells: [{ a: '1.5 Million' }, { a: '7 Million' }] },
          { indicator: 'Couples who cohabit before marriage', indicatorZh: '婚前同居的伴侣', group: '', cells: [{ a: '1/20' }, { a: '7/10' }] },
          { indicator: 'Number of children born to unmarried parents', indicatorZh: '非婚生子女', group: '', cells: [{ a: '1/20' }, { a: '2/5' }] },
          { indicator: 'Number of cars and vans', indicatorZh: '汽车和厢式货车数量', group: '', cells: [{ a: '3 Million' }, { a: '26 Million' }] },
          { indicator: 'Average waist size', indicatorZh: '平均腰围', group: 'Men', cells: [{ a: '78 cm' }, { a: '90 cm' }] },
          { indicator: 'Average waist size', group: 'Women', cells: [{ a: '67.5 cm' }, { a: '75 cm' }] },
        ],
      };
    default:
      return { t, v: '' };
  }
}

/** Renumber pages 1..N and rebuild the pageTypes map from a working list that
 *  carries the type alongside each page. Used by the editor on save. */
export function normaliseRichData(pages: { type: string | null; title?: string; blocks: Block[] }[]): RichData {
  const pageTypes: Record<string, string | null> = {};
  const out: RichPage[] = pages.map((p, i) => {
    const num = i + 1;
    pageTypes[String(num)] = p.type && p.type !== 'None' ? p.type : null;
    return { page: num, ...(p.title && p.title.trim() ? { title: p.title.trim() } : {}), blocks: p.blocks };
  });
  return { pageTypes, pages: out };
}
