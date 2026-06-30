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

/** Scaled band reachable on each Module-2 route. Upper form reaches the top of
 *  the 200–800 range; the lower form is capped (you cannot earn a top score
 *  from the easier second module). */
const ROUTE_BAND: Record<'upper' | 'lower', { min: number; max: number }> = {
  upper: { min: 400, max: 800 },
  lower: { min: 200, max: 650 },
};

/** Map a section raw score (operational-correct across both modules) to a
 *  scaled 200–800, clamped into the route's reachable band, rounded to 10.
 *  `maxRaw` defaults to the real per-section operational total, but the runner
 *  passes the actual count for a given form (demo forms are shorter than a real
 *  test) so the curve scales to the questions the student actually answered. */
export function scaleSection(
  section: SatSection,
  operationalCorrect: number,
  route: 'upper' | 'lower',
  maxRaw: number = SECTION_OPERATIONAL_MAX[section],
): number {
  if (maxRaw <= 0) return ROUTE_BAND[route].min;
  const raw = Math.max(0, Math.min(operationalCorrect, maxRaw));
  const band = ROUTE_BAND[route];
  const linear = 200 + (raw / maxRaw) * 600; // 0→200, max→800
  const scaled = Math.max(band.min, Math.min(band.max, linear));
  return Math.round(scaled / 10) * 10; // SAT reports in 10-point steps
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
