/**
 * Answer-matching for the IELTS fill-in table block (TableFillCheck).
 *
 * The grading rules (from the component spec) are lenient on presentation but
 * strict on the value:
 *   - case-insensitive and space-insensitive  ("3million" === "3 Million")
 *   - a redundant leading "+" is ignored        ("+5" === "5")
 *   - the unit may be OMITTED                    ("78" === "78 cm", "7" === "7 Million")
 *   - but if a unit IS supplied it must match    ("78 km" ≠ "78 cm")
 *   - the numeric / fraction value must match exactly ("7" ≠ "78", "1/20" ≠ "120")
 *   - trailing junk is rejected                  ("7 elephants" ≠ "7 Million", "80!!!" ≠ "80")
 *   - Chinese input is rejected (handled at the input layer via hasCJK/stripCJK)
 *
 * These functions are pure and framework-free so they can be unit-tested and
 * shared between the student viewer and (potentially) server-side scoring.
 */

// Matches a CJK character: Ext-A + Unified Ideographs + Compatibility Ideographs.
const CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;
const CJK_RE_G = /[㐀-䶿一-鿿豈-﫿]/g;

/** True if the string contains a CJK (Chinese) character. */
export function hasCJK(s: string): boolean {
  return CJK_RE.test(s);
}

/** Remove any CJK (Chinese) characters — enforces the "no Chinese input" rule. */
export function stripCJK(s: string): string {
  return s.replace(CJK_RE_G, '');
}

/** Lowercase, drop all whitespace + thousands commas, and strip a redundant
 *  leading "+" so "+5" and "5" normalise alike (a real "-" is kept). */
function normFull(s: string): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, '').replace(/,/g, '').replace(/^\+/, '');
}

/** Split a value into its numeric/fraction core and the remaining unit token.
 *  Returns null when there is no leading number (e.g. pure text). The whole
 *  string after the number is treated as the unit (so junk like "xyz" becomes a
 *  unit that simply won't match an answer with no / a different unit). */
function parseVal(raw: string): { num: string; unit: string } | null {
  const s = normFull(raw);
  if (!s) return null;
  const m = s.match(/^(-?\d+\/\d+|-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  return { num: m[1], unit: m[2] };
}

/**
 * The comparable numeric "core" of a value (leading number or fraction), or ''
 * when there is no leading number. Kept for callers/tests that want just the
 * number; grading itself uses {@link isCorrect}.
 */
export function normCore(raw: string): string {
  return parseVal(raw)?.num ?? '';
}

/**
 * Is the student's `input` an acceptable answer for the standard `answer`?
 * Empty input is always incorrect.
 */
export function isCorrect(input: string, answer: string): boolean {
  if (!input || !input.trim()) return false;
  const ni = normFull(input);
  const na = normFull(answer);
  if (ni === na) return true; // exact match incl. a matching unit (case/space/+ tolerant)
  const pi = parseVal(input);
  const pa = parseVal(answer);
  if (!pi || !pa) return false; // non-numeric value → only an exact match (above) could pass
  if (pi.num !== pa.num) return false; // the number must match exactly
  // The unit may be omitted; but if the student supplies one it must match.
  return pi.unit === '' || pi.unit === pa.unit;
}

export type CellKey = string; // `${rowIdx}-${colIdx}`

export const cellKey = (rowIdx: number, colIdx: number): CellKey => `${rowIdx}-${colIdx}`;
