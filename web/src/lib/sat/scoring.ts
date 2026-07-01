/**
 * SAT scoring — multistage-adaptive routing + raw→scaled conversion + SPR grading.
 * ----------------------------------------------------------------------------
 * College Board does not publish its per-form equating tables, so this is a
 * TRANSPARENT model: a piecewise-linear raw→scaled map, clamped into a band
 * that depends on which Module-2 form the student was routed into. The upper
 * (harder) form can reach 800; the lower form is capped below it — which is the
 * real, defining consequence of the adaptive design. Results MUST be labelled
 * "estimated" in the UI. When real equating tables are obtained later, replace
 * `scaleSection`'s internals with a per-form (formId, raw) lookup — the
 * signatures here stay stable.
 */

import type { SatSection, SatRoute, SatSprAnswer } from './types';
import { SECTION_OPERATIONAL_MAX } from './types';

/* ---------------------------------------------------------------- routing */

/** Route Module 2 from Module-1 performance → the harder ("upper") or easier
 *  ("lower") second module. The real cut is IRT-weighted by item difficulty and
 *  unpublished; the well-corroborated practitioner heuristic is ~two-thirds
 *  correct on Module 1 → harder Module 2 (≈15–17/27 RW, ≈12–14/22 Math). We use
 *  a per-section fraction near two-thirds. Routing counts ALL Module-1 items the
 *  student saw (pretest included — they're indistinguishable), which is why it
 *  reads `correctCount`, not `operationalCorrect`. */
export const ROUTE_THRESHOLD: Record<SatSection, number> = {
  reading_writing: 0.63,
  math: 0.62,
};

export function routeModule2(section: SatSection, module1Correct: number, module1Total: number): 'upper' | 'lower' {
  if (module1Total <= 0) return 'lower';
  return module1Correct / module1Total >= ROUTE_THRESHOLD[section] ? 'upper' : 'lower';
}

/* --------------------------------------------------------- raw → scaled */

/**
 * Raw → scaled section-score conversion (200–800), keyed to the DIGITAL raw
 * ranges: RW 0–54, Math 0–44. Each entry is [LOWER, UPPER]:
 *   - UPPER = routed to the HARDER Module 2 → the full range, up to 800.
 *   - LOWER = routed to the EASIER Module 2 → HARD-CAPPED at ~650, because the
 *     easier item pool can't demonstrate top ability under IRT scaling.
 * That cap is the defining consequence of the adaptive design (Module-1
 * performance sets your section ceiling). The curve SHAPE follows College
 * Board's published practice-test conversion; the easier-route cap (~590–650,
 * exact value unpublished → 650) is modelled by compressing the range. The live
 * exam re-equates per form, so platform scores remain an ESTIMATE.
 */
const RW_CONV: [number, number][] = [
  [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [210, 210], [220, 230],
  [240, 250], [240, 260], [250, 270], [270, 290], [280, 310], [300, 340], [320, 360], [330, 370],
  [340, 390], [340, 390], [350, 400], [360, 410], [360, 420], [380, 440], [380, 440], [390, 450],
  [400, 460], [410, 480], [410, 480], [420, 490], [420, 500], [430, 510], [440, 520], [450, 530],
  [460, 540], [460, 550], [470, 560], [480, 570], [480, 580], [490, 590], [500, 600], [510, 610],
  [520, 620], [520, 630], [530, 640], [540, 650], [540, 660], [550, 670], [560, 680], [570, 690],
  [580, 710], [590, 720], [600, 730], [600, 740], [620, 760], [640, 790], [650, 800],
]; // index = raw score 0..54 (digital RW); [lower(easier M2, capped ~650), upper(harder M2, →800)]

const MATH_CONV: [number, number][] = [
  [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [220, 220], [220, 230], [240, 260],
  [250, 270], [270, 290], [280, 310], [310, 350], [330, 370], [340, 380], [340, 390], [350, 400],
  [360, 420], [380, 440], [380, 440], [400, 460], [400, 470], [410, 480], [420, 490], [420, 500],
  [430, 510], [440, 520], [460, 540], [470, 560], [470, 560], [480, 580], [490, 590], [500, 600],
  [510, 610], [520, 620], [530, 640], [540, 650], [540, 660], [560, 680], [570, 690], [580, 700],
  [590, 720], [600, 740], [610, 750], [640, 780], [650, 800],
]; // index = raw score 0..44 (digital Math); [lower(easier M2, capped ~650), upper(harder M2, →800)]

/** Map a section raw score (operational-correct across both modules) → scaled
 *  200–800 via the official conversion table, picking the LOWER or UPPER column
 *  by the Module-2 route. `maxRaw` defaults to the real per-section operational
 *  total; the runner passes the actual count for a given form (demo forms are
 *  shorter), so the student's raw is normalised onto the official curve and a
 *  perfect section maps to the top of the table (800 on the upper route). */
export function scaleSection(
  section: SatSection,
  operationalCorrect: number,
  route: 'upper' | 'lower',
  maxRaw: number = SECTION_OPERATIONAL_MAX[section],
): number {
  const table = section === 'reading_writing' ? RW_CONV : MATH_CONV;
  if (maxRaw <= 0) return table[0][route === 'upper' ? 1 : 0];
  const frac = Math.max(0, Math.min(operationalCorrect / maxRaw, 1));
  const idx = Math.round(frac * (table.length - 1)); // normalise onto the official curve
  return table[idx][route === 'upper' ? 1 : 0];
}

export function scaleTotal(rwScaled: number, mathScaled: number): number {
  return rwScaled + mathScaled; // 400–1600
}

/* --------------------------------------------------------------- SPR grading
 * Student-produced responses are graded by NUMERIC equivalence, not string
 * match, per the Bluebook entry rules (fractions, decimals, signs; no %, $,
 * commas, spaces, or mixed numbers). */

/** Parse a typed SPR string into a number. Returns null if it violates the
 *  allowed-character rules or can't be interpreted. */
export function parseSpr(raw: string): number | null {
  const s = (raw ?? '').trim();
  if (!s) return null;
  // Allowed: digits, one leading '-', a single '.', a single '/'. Reject the rest.
  if (!/^-?(?:\d+(?:\.\d+)?|\.\d+|\d+\/\d+)$/.test(s)) return null;
  if (s.includes('/')) {
    const neg = s.startsWith('-');
    const body = neg ? s.slice(1) : s;
    const [n, d] = body.split('/').map(Number);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return (neg ? -1 : 1) * (n / d);
  }
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Validate an in-progress SPR entry (used to block disallowed keystrokes /
 *  show a soft warning). Length limits: ≤5 chars positive, ≤6 incl. sign. */
export function isValidSprEntry(raw: string): boolean {
  const s = raw ?? '';
  if (s === '' || s === '-' || s === '.' || s === '-.') return true; // mid-typing
  if (/[^0-9./-]/.test(s)) return false;
  const max = s.startsWith('-') ? 6 : 5;
  if (s.length > max) return false;
  return /^-?(?:\d+(?:\.\d+)?|\.\d+|\d+\/\d+|\d+\/|\d+\.)$/.test(s);
}

/** Grade an SPR answer against its accepted set. Matches if the typed value
 *  equals any accepted form exactly (string), OR is numerically equivalent to
 *  any accepted form within `tolerance` (default: a tight epsilon, widened for
 *  repeating-decimal answers via the question's `tolerance`). */
export function gradeSpr(raw: string, spec: SatSprAnswer): boolean {
  const typed = (raw ?? '').trim();
  if (!typed) return false;
  if (spec.accepted.some((a) => a.trim() === typed)) return true; // exact written form
  const val = parseSpr(typed);
  if (val === null) return false;
  if (spec.negativeAllowed === false && val < 0) return false;
  const tol = spec.tolerance ?? 1e-6;
  return spec.accepted.some((a) => {
    const av = parseSpr(a);
    return av !== null && Math.abs(av - val) <= tol;
  });
}

/* ------------------------------------------------------------- diagnostics
 * A model raw→scaled table for the results UI ("if you'd taken the harder
 * second module, this raw maps to ~X"). Model values, NOT official equating. */
export function sampleConversionRow(section: SatSection, route: 'upper' | 'lower'): Array<[number, number]> {
  const max = SECTION_OPERATIONAL_MAX[section];
  const rows: Array<[number, number]> = [];
  for (let raw = max; raw >= 0; raw -= 5) rows.push([raw, scaleSection(section, raw, route)]);
  return rows;
}

export const ROUTE_LABEL: Record<SatRoute, string> = {
  fixed: 'Module 1',
  upper: 'Harder second module',
  lower: 'Easier second module',
};
