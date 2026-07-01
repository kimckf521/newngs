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

/** Route Module 2 from Module-1 performance. Threshold ≈ 60% correct → "up".
 *  Tunable; CB's exact cut is unpublished. All Module-1 items count for routing
 *  (including the unscored pretest items, which the student can't distinguish). */
export const ROUTE_THRESHOLD = 0.6;

export function routeModule2(module1Correct: number, module1Total: number): 'upper' | 'lower' {
  if (module1Total <= 0) return 'lower';
  return module1Correct / module1Total >= ROUTE_THRESHOLD ? 'upper' : 'lower';
}

/* --------------------------------------------------------- raw → scaled */

/**
 * Official raw → scaled-section-score conversion, from College Board's published
 * SAT Practice Test scoring guide (digital). Each entry is the [LOWER, UPPER]
 * section score (200–800) for that raw score; LOWER ≈ routed to the easier
 * Module 2, UPPER ≈ routed to the harder Module 2 — which is exactly how the
 * adaptive design caps/unlocks the top of the range. These are factual
 * conversion data (source: satsuite.collegeboard.org SAT practice-test scoring).
 * NOTE: the live exam re-equates per form, so platform scores remain an estimate.
 */
const RW_CONV: [number, number][] = [
  [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 210],
  [200, 220], [210, 230], [230, 250], [240, 260], [250, 270], [260, 280], [280, 300], [290, 310],
  [320, 340], [340, 360], [350, 370], [360, 380], [370, 390], [370, 390], [380, 400], [390, 410],
  [400, 420], [410, 430], [420, 440], [420, 440], [430, 450], [440, 460], [450, 470], [460, 480],
  [460, 480], [470, 490], [480, 500], [490, 510], [490, 510], [500, 520], [510, 530], [520, 540],
  [530, 550], [540, 560], [540, 560], [550, 570], [560, 580], [570, 590], [580, 600], [590, 610],
  [590, 610], [600, 620], [610, 630], [620, 640], [630, 650], [630, 650], [640, 660], [650, 670],
  [660, 680], [670, 690], [680, 700], [690, 710], [700, 720], [710, 730], [720, 740], [730, 750],
  [750, 770], [770, 790], [790, 800],
]; // index = raw score, 0..66 (full linear RW range)

const MATH_CONV: [number, number][] = [
  [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 200], [200, 220],
  [200, 230], [220, 250], [250, 280], [280, 310], [290, 320], [300, 330], [310, 340], [320, 350],
  [330, 360], [330, 360], [340, 370], [350, 380], [360, 390], [370, 400], [370, 400], [380, 410],
  [390, 420], [400, 430], [420, 450], [430, 460], [440, 470], [460, 490], [470, 500], [480, 510],
  [500, 530], [510, 540], [520, 550], [530, 560], [550, 580], [560, 590], [570, 600], [580, 610],
  [590, 620], [600, 630], [620, 650], [630, 660], [650, 680], [670, 700], [690, 720], [710, 740],
  [730, 760], [740, 770], [750, 780], [760, 790], [770, 800], [780, 800], [790, 800],
]; // index = raw score, 0..54 (full linear Math range)

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
