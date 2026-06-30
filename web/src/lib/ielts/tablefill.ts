/**
 * Answer-matching for the IELTS fill-in table block (TableFillCheck).
 *
 * The grading rules (from the component spec) are deliberately lenient on
 * presentation but strict on the number itself:
 *   - case-insensitive and space-insensitive  ("3million" === "3 Million")
 *   - the unit is optional                     ("78" === "78 cm", "7" === "7 Million")
 *   - the numeric / fraction value must match exactly ("7" ≠ "78", "1/20" ≠ "120")
 *   - Chinese input is rejected (handled at the input layer via hasCJK/stripCJK)
 *
 * These functions are pure and framework-free so they can be unit-tested and
 * shared between the student viewer and (potentially) server-side scoring.
 */

// Matches a CJK character: Ext-A + Unified Ideographs + Compatibility Ideographs.
const CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;
const CJK_RE_G = /[㐀-䶿一-鿿豈-﫿]/g;

/** True if the string contains a CJK (Chinese) character. */
export function hasCJK(s: string): boolean {
  return CJK_RE.test(s);
}

/** Remove any CJK (Chinese) characters — enforces the "no Chinese input" rule. */
export function stripCJK(s: string): string {
  return s.replace(CJK_RE_G, '');
}

/**
 * Reduce a raw value to its comparable "core": the leading number or fraction,
 * with case, whitespace and any trailing unit removed. Returns '' when there is
 * no leading numeric token (so two empty cores never count as a match).
 */
export function normCore(raw: string): string {
  const s = (raw ?? '').toLowerCase().replace(/\s+/g, '').replace(/,/g, '');
  if (!s) return '';
  const frac = s.match(/^[+-]?\d+\/\d+/); // 1/20, 7/10, 2/5
  if (frac) return frac[0];
  const num = s.match(/^[+-]?\d+(?:\.\d+)?/); // 1.5, 67.5, 26, 80
  if (num) return num[0];
  return ''; // no numeric token → only an exact (unit) match can succeed
}

/**
 * Is the student's `input` an acceptable answer for the standard `answer`?
 * Empty input is always incorrect.
 */
export function isCorrect(input: string, answer: string): boolean {
  if (!input || !input.trim()) return false;
  const ni = input.toLowerCase().replace(/\s+/g, '');
  const na = answer.toLowerCase().replace(/\s+/g, '');
  if (ni === na) return true; // exact match incl. unit (case/space tolerant)
  const ci = normCore(input);
  const ca = normCore(answer);
  return ci !== '' && ci === ca; // unit-optional: compare the numeric/fraction core
}

export type CellKey = string; // `${rowIdx}-${colIdx}`

export const cellKey = (rowIdx: number, colIdx: number): CellKey => `${rowIdx}-${colIdx}`;
