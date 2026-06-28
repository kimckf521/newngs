import 'server-only';
import { query } from '@/lib/db/pg';

/**
 * Server-side read access to the `question_bank` table (see lib/db/pg.ts).
 * A bank row's full payload lives in `data` (JSONB): { name, books: { "<n>":
 * { title, markdown } }, missing: [...] }. These helpers extract only what's
 * needed server-side (a light book LIST, or one book's markdown) so the browser
 * never has to download the whole ~1.3 MB row to render the panel.
 *
 * The browser reaches this only through /api/question-bank (admin-gated).
 */

export type BankBookMeta = { book: string; title: string; chars: number };
export type BankSummary = {
  id: string; name: string; bookCount: number; missing: number[]; books: BankBookMeta[];
  published: boolean; cover: string | null; description: string | null; modules: { title: string }[]; updatedAt: string | null;
};
export type BankBook = { book: string; title: string; markdown: string };
export type BankListItem = { id: string; name: string; bookCount: number; published: boolean; cover: string | null; updatedAt: string | null };

/** All banks (light) for the admin list — id, name, #books, published, updated. */
export async function listQuestionBanks(): Promise<BankListItem[]> {
  const rows = await query<{ id: string; name: string | null; book_count: number; published: boolean; cover: string | null; updated_at: string | null }>(
    `SELECT id,
            data->>'name' AS name,
            data->>'coverImage' AS cover,
            COALESCE((SELECT count(*) FROM jsonb_object_keys(data->'books')), 0) AS book_count,
            published,
            to_char(updated_at, 'YYYY-MM-DD HH24:MI') AS updated_at
     FROM question_bank
     ORDER BY updated_at DESC NULLS LAST
     LIMIT 500`,
  );
  return rows.map((r) => ({ id: r.id, name: r.name || r.id, bookCount: Number(r.book_count), published: r.published, cover: r.cover, updatedAt: r.updated_at }));
}

/** Light summary: bank name + the ordered book list (no markdown). null if no row. */
export async function getQuestionBankSummary(id: string): Promise<BankSummary | null> {
  const rows = await query<{
    name: string | null; published: boolean; cover: string | null; description: string | null;
    modules: { title: string }[] | null; updated_at: string | null; missing: number[] | null; books: BankBookMeta[] | null;
  }>(
    `SELECT data->>'name' AS name,
            published,
            data->>'coverImage' AS cover,
            data->>'description' AS description,
            COALESCE(data->'modules', '[]'::jsonb) AS modules,
            to_char(updated_at, 'YYYY-MM-DD HH24:MI') AS updated_at,
            COALESCE(data->'missing', '[]'::jsonb) AS missing,
            COALESCE((
              SELECT jsonb_agg(
                       jsonb_build_object(
                         'book', k,
                         'title', data->'books'->k->>'title',
                         'chars', length(data->'books'->k->>'markdown')
                       )
                       ORDER BY (k)::int
                     )
              FROM jsonb_object_keys(data->'books') AS k
            ), '[]'::jsonb) AS books
     FROM question_bank
     WHERE id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  const books = r.books ?? [];
  return {
    id,
    name: r.name || id,
    bookCount: books.length,
    missing: Array.isArray(r.missing) ? r.missing : [],
    books,
    published: r.published,
    cover: r.cover,
    description: r.description,
    modules: Array.isArray(r.modules) ? r.modules : [],
    updatedAt: r.updated_at,
  };
}

// The four test skills → the `### <heading>` used in the extracted Cambridge markdown.
const SKILL_HEADINGS: Record<string, string> = { listening: 'Listening', speaking: 'Speaking', reading: 'Reading', writing: 'Writing' };

/** Extract the full ## Tapescripts section appended to each book's markdown. */
function extractTapescripts(markdown: string): string {
  const idx = markdown.indexOf('\n## Tapescripts');
  if (idx < 0) return '';
  return markdown.slice(idx).trim();
}

/** Pull one skill's content out of a book's markdown, INTERLEAVED per test:
 *  for each `## Test N`, the skill's `### <Skill>` questions immediately followed
 *  by that test's `**<Skill>:**` answer-key line. Returns '' when the book has no
 *  such section (e.g. Writing has no answer line; Speaking is usually absent). */
function extractSkill(markdown: string, heading: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let cap = false;       // inside this test's `### <Skill>` questions
  let inAnswer = false;  // inside this test's `### Answer Key` block
  let currentTest = '';
  let emittedTest = false; // this test's skill section started (so its answer key belongs)
  const skillRe = new RegExp(`^###\\s+${heading}\\b`, 'i');
  const ansRe = new RegExp(`^\\*\\*${heading}:`, 'i');
  for (const line of lines) {
    if (/^##\s/.test(line)) { currentTest = line; cap = false; inAnswer = false; emittedTest = false; continue; }
    if (/^###\s/.test(line)) {
      cap = false;
      inAnswer = /^###\s+Answer\s*Key/i.test(line);
      if (skillRe.test(line)) {
        if (!emittedTest && currentTest) { out.push(currentTest, ''); emittedTest = true; }
        cap = true;
        out.push(line);
      }
      continue;
    }
    if (cap) out.push(line);
    else if (inAnswer && emittedTest && ansRe.test(line.trim())) out.push('', '### Answer Key', line.trim());
  }
  return out.join('\n').trim();
}

/** One book's markdown (fetched on demand). When `skill` is given, only that
 *  skill's content is returned (may be '' if the book lacks it). null if the
 *  bank/book doesn't exist. */
export async function getQuestionBankBook(id: string, book: string, skill?: string): Promise<BankBook | null> {
  const rows = await query<{ title: string | null; markdown: string | null }>(
    `SELECT data->'books'->$2->>'title'    AS title,
            data->'books'->$2->>'markdown' AS markdown
     FROM question_bank
     WHERE id = $1`,
    [id, book],
  );
  const r = rows[0];
  if (!r || r.markdown == null) return null;
  const markdown =
    skill === 'tapescript' ? extractTapescripts(r.markdown ?? '')
    : skill && SKILL_HEADINGS[skill] ? extractSkill(r.markdown, SKILL_HEADINGS[skill])
    : r.markdown;
  return { book, title: r.title || `Book ${book}`, markdown };
}
