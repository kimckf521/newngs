'use client';

import type { QGroup, QType } from '@/components/member/ielts/types';
import { scoreGroup } from '@/components/member/ielts/scoring';
import { academicReadingBand, listeningBand } from '@/components/member/ielts/shared';

/**
 * Student learning progress for the IELTS Practice Center — the shared store
 * behind the 错题本 (mistake notebook), the progress dashboard, per-skill band
 * tracking, spaced repetition, and the vocabulary book. Persisted in
 * localStorage so it works without a login. Single source of truth for
 * "how am I doing" across the four skills.
 *
 * IELTS-native, NOT a copy of the SAT store: the score unit is a 0–9 band (not a
 * 200–800 scaled score), the "overall" is the real IELTS mean-of-four-skills
 * rounded to the nearest half-band, and the mistake/accuracy axis is the IELTS
 * question TYPE (Matching Headings, T/F/NG, …) — the thing IELTS learners target.
 */

const KEY = 'ngs-ielts-progress';
const EVENT = 'ngs-ielts-progress';
const LOG_CAP = 4000;
const ATTEMPT_CAP = 300;
const DAY = 24 * 60 * 60 * 1000;

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking';
export type PracticeMode = 'mock' | 'drill';

/** One auto-graded answerable item (a Reading/Listening question). */
export type AnswerEvent = {
  id: string; // `${book}|${test}|${skill}|${n}`
  skill: Skill;
  qtype: QType;
  correct: boolean;
  at: number;
  mode: PracticeMode;
  ms?: number;
};

export type MistakeEntry = {
  id: string;
  skill: Skill; // only 'listening' | 'reading' are per-question
  qtype: QType;
  book: string;
  test: number;
  n: number;
  prompt: string; // question text, for re-display
  your: string;
  key: string; // correct answer(s)
  wrongCount: number;
  correctStreak: number; // consecutive correct sightings since last wrong
  mastered: boolean;
  firstWrongAt: number;
  lastSeenAt: number;
  dueAt: number; // spaced-repetition next-review timestamp
};

export type VocabEntry = {
  word: string;
  context?: string;
  note?: string;
  addedAt: number;
  book?: string;
  test?: number;
};

/** A completed skill attempt — L/R carry a raw /40, W/S carry only the AI band. */
export type SkillAttempt = {
  at: number;
  skill: Skill;
  book?: string;
  test?: number;
  raw?: number; // correct out of `total`
  total?: number; // usually 40
  band: number; // 0–9, half-band
};

type Store = {
  v: 1;
  mistakes: Record<string, MistakeEntry>;
  log: AnswerEvent[];
  vocab: VocabEntry[];
  attempts: SkillAttempt[];
};

const EMPTY: Store = { v: 1, mistakes: {}, log: [], vocab: [], attempts: [] };

function read(): Store {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (!raw) return { ...EMPTY };
    const s = JSON.parse(raw) as Partial<Store>;
    return { v: 1, mistakes: s.mistakes || {}, log: s.log || [], vocab: s.vocab || [], attempts: s.attempts || [] };
  } catch {
    return { ...EMPTY };
  }
}
function write(s: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event(EVENT)); // storage event only fires cross-tab
  } catch {
    /* ignore quota */
  }
}

/* --------------------------------------------------------------- bands */

export const SKILL_LABELS: Record<Skill, { en: string; zh: string; icon: string }> = {
  listening: { en: 'Listening', zh: '听力', icon: '🎧' },
  reading: { en: 'Reading', zh: '阅读', icon: '📖' },
  writing: { en: 'Writing', zh: '写作', icon: '✍️' },
  speaking: { en: 'Speaking', zh: '口语', icon: '🎙️' },
};

/** Human labels for every IELTS question type — the mistake/accuracy axis. */
export const QTYPE_LABELS: Record<QType, { en: string; zh: string }> = {
  'note-completion': { en: 'Note completion', zh: '笔记填空' },
  'table-completion': { en: 'Table completion', zh: '表格填空' },
  'summary-completion': { en: 'Summary completion', zh: '摘要填空' },
  'sentence-completion': { en: 'Sentence completion', zh: '句子填空' },
  'short-answer': { en: 'Short answer', zh: '简答题' },
  'form-completion': { en: 'Form completion', zh: '表格填空' },
  'flow-chart-completion': { en: 'Flow-chart completion', zh: '流程图填空' },
  tfng: { en: 'True / False / Not Given', zh: '判断 (TFNG)' },
  ynng: { en: 'Yes / No / Not Given', zh: '判断 (YNNG)' },
  mcq: { en: 'Multiple choice', zh: '选择题' },
  matching: { en: 'Matching', zh: '配对题' },
  'matching-information': { en: 'Matching information', zh: '信息配对' },
  'matching-features': { en: 'Matching features', zh: '特征配对' },
  'matching-headings': { en: 'Matching headings', zh: '标题配对' },
  'map-labelling': { en: 'Map labelling', zh: '地图标注' },
  'plan-labelling': { en: 'Plan labelling', zh: '平面图标注' },
};

/** Parse a band-table string ("7.0", "<3.0") into a number. */
function parseBand(s: string): number {
  if (s.startsWith('<')) return Math.max(0, parseFloat(s.slice(1)) - 0.5);
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
}

/** Round to the nearest half-band — the official IELTS overall rounding
 *  (x.25 → x.5, x.75 → next whole) is exactly Math.round(x*2)/2. */
export function roundHalfBand(x: number): number {
  return Math.round(x * 2) / 2;
}

const bandForSkill = (skill: Skill, raw: number): number =>
  parseBand(skill === 'reading' ? academicReadingBand(raw) : listeningBand(raw));

/* ------------------------------------------------------- spaced repetition */

function nextInterval(correctStreak: number): number {
  const steps = [1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  return steps[Math.min(correctStreak, steps.length - 1)];
}

/** Record one auto-graded question into the log + the mistakes map. */
function recordOne(
  s: Store,
  item: { id: string; skill: Skill; qtype: QType; book: string; test: number; n: number; prompt: string; your: string; key: string; correct: boolean },
  mode: PracticeMode,
  now: number,
): void {
  s.log.push({ id: item.id, skill: item.skill, qtype: item.qtype, correct: item.correct, at: now, mode });

  const prev = s.mistakes[item.id];
  if (!item.correct) {
    s.mistakes[item.id] = {
      id: item.id, skill: item.skill, qtype: item.qtype, book: item.book, test: item.test, n: item.n,
      prompt: item.prompt, your: item.your, key: item.key,
      wrongCount: (prev?.wrongCount || 0) + 1,
      correctStreak: 0,
      mastered: false,
      firstWrongAt: prev?.firstWrongAt || now,
      lastSeenAt: now,
      dueAt: now + nextInterval(0),
    };
  } else if (prev) {
    const streak = prev.correctStreak + 1;
    s.mistakes[item.id] = {
      ...prev,
      correctStreak: streak,
      mastered: streak >= 2, // two clean sightings → mastered
      lastSeenAt: now,
      dueAt: now + nextInterval(streak),
    };
  }
}

/**
 * Record a completed auto-graded section (Reading or Listening): grades every
 * group, logs each question keyed by type, updates the mistake notebook, and
 * stores the attempt's raw /40 and band. Returns the raw score + band.
 */
export function recordAutoGradedAttempt(params: {
  skill: Extract<Skill, 'listening' | 'reading'>;
  book: string;
  test: number;
  groups: QGroup[];
  answers: Record<number, string>;
  mode?: PracticeMode;
}): { raw: number; total: number; band: number } {
  const { skill, book, test, groups, answers, mode = 'mock' } = params;
  const now = Date.now();
  const s = read();

  const qtypeOfN = new Map<number, QType>();
  const promptOfN = new Map<number, string>();
  for (const g of groups) for (const q of g.questions) { qtypeOfN.set(q.n, g.type); promptOfN.set(q.n, q.text); }

  let raw = 0;
  let total = 0;
  for (const g of groups) {
    for (const v of scoreGroup(g, answers)) {
      total += 1;
      if (v.correct) raw += 1;
      recordOne(
        s,
        {
          id: `${book}|${test}|${skill}|${v.n}`,
          skill, qtype: qtypeOfN.get(v.n) || g.type, book, test, n: v.n,
          prompt: promptOfN.get(v.n) || '', your: v.your, key: v.key, correct: v.correct,
        },
        mode,
        now,
      );
    }
  }
  if (s.log.length > LOG_CAP) s.log = s.log.slice(-LOG_CAP);

  const band = bandForSkill(skill, raw);
  s.attempts.push({ at: now, skill, book, test, raw, total, band });
  if (s.attempts.length > ATTEMPT_CAP) s.attempts = s.attempts.slice(-ATTEMPT_CAP);

  write(s);
  return { raw, total, band };
}

/** Record an AI-graded attempt (Writing or Speaking) — band only, no per-question log. */
export function recordAiAttempt(params: { skill: Extract<Skill, 'writing' | 'speaking'>; band: number; book?: string; test?: number }): void {
  const { skill, band, book, test } = params;
  if (!Number.isFinite(band) || band <= 0) return;
  const s = read();
  s.attempts.push({ at: Date.now(), skill, book, test, band: roundHalfBand(band) });
  if (s.attempts.length > ATTEMPT_CAP) s.attempts = s.attempts.slice(-ATTEMPT_CAP);
  write(s);
}

/* --------------------------------------------------------------- mistakes */

export type MistakeFilter = { skill?: Skill; qtype?: QType; includeMastered?: boolean };

export function listMistakes(filter: MistakeFilter = {}): MistakeEntry[] {
  const s = read();
  return Object.values(s.mistakes)
    .filter((m) => (filter.includeMastered ? true : !m.mastered))
    .filter((m) => (filter.skill ? m.skill === filter.skill : true))
    .filter((m) => (filter.qtype ? m.qtype === filter.qtype : true))
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

/** Mistakes whose spaced-repetition review is due now (unmastered + past dueAt). */
export function listDue(now = Date.now()): MistakeEntry[] {
  return listMistakes({ includeMastered: false }).filter((m) => m.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}

export function setMastered(id: string, mastered: boolean): void {
  const s = read();
  if (s.mistakes[id]) { s.mistakes[id].mastered = mastered; write(s); }
}
export function removeMistake(id: string): void {
  const s = read();
  if (s.mistakes[id]) { delete s.mistakes[id]; write(s); }
}
export function clearMistakes(): void {
  const s = read();
  s.mistakes = {};
  write(s);
}

/* ----------------------------------------------------------------- vocab */

export function addVocab(entry: Omit<VocabEntry, 'addedAt'>): void {
  const s = read();
  const word = entry.word.trim();
  if (!word) return;
  if (!s.vocab.some((v) => v.word.toLowerCase() === word.toLowerCase())) {
    s.vocab.unshift({ ...entry, word, addedAt: Date.now() });
    write(s);
  }
}
export function listVocab(): VocabEntry[] {
  return read().vocab;
}
export function removeVocab(word: string): void {
  const s = read();
  s.vocab = s.vocab.filter((v) => v.word.toLowerCase() !== word.toLowerCase());
  write(s);
}

/* --------------------------------------------------------------- stats */

export type TypeStat = { qtype: QType; attempted: number; correct: number };
export type DayStat = { day: string; attempted: number; correct: number };

export type ProgressStats = {
  totalAnswered: number;
  totalCorrect: number;
  mistakeCount: number;
  masteredCount: number;
  vocabCount: number;
  byType: TypeStat[];
  byDay: DayStat[];
  streakDays: number;
};

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  for (;;) {
    const k = dayKey(d.getTime());
    if (set.has(k)) { streak += 1; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

export function getStats(): ProgressStats {
  const s = read();
  const byTypeMap = new Map<QType, TypeStat>();
  const byDayMap = new Map<string, DayStat>();

  for (const e of s.log) {
    const t = byTypeMap.get(e.qtype) || { qtype: e.qtype, attempted: 0, correct: 0 };
    t.attempted += 1; if (e.correct) t.correct += 1;
    byTypeMap.set(e.qtype, t);

    const dk = dayKey(e.at);
    const dd = byDayMap.get(dk) || { day: dk, attempted: 0, correct: 0 };
    dd.attempted += 1; if (e.correct) dd.correct += 1;
    byDayMap.set(dk, dd);
  }

  const mistakes = Object.values(s.mistakes);
  const byDay = Array.from(byDayMap.values()).sort((a, b) => a.day.localeCompare(b.day));

  return {
    totalAnswered: s.log.length,
    totalCorrect: s.log.filter((e) => e.correct).length,
    mistakeCount: mistakes.filter((m) => !m.mastered).length,
    masteredCount: mistakes.filter((m) => m.mastered).length,
    vocabCount: s.vocab.length,
    // weakest type first (lowest accuracy), needs a few attempts to be meaningful
    byType: Array.from(byTypeMap.values()).sort((a, b) => a.correct / a.attempted - b.correct / b.attempted),
    byDay,
    streakDays: computeStreak(byDay.map((d) => d.day)),
  };
}

/** Live counts for hub badges. */
export function quickCounts(): { mistakes: number; due: number; vocab: number } {
  const s = read();
  const now = Date.now();
  const active = Object.values(s.mistakes).filter((m) => !m.mastered);
  return { mistakes: active.length, due: active.filter((m) => m.dueAt <= now).length, vocab: s.vocab.length };
}

/* ---------------------------------------------------------------- bands */

/** The most recent band achieved in each skill (only skills with an attempt). */
export function latestBands(): Partial<Record<Skill, number>> {
  const s = read();
  const out: Partial<Record<Skill, number>> = {};
  for (const a of s.attempts) out[a.skill] = a.band; // attempts are in chronological order
  return out;
}

/** The highest single band across all attempts, or null. */
export function bestBand(): number | null {
  const s = read();
  if (!s.attempts.length) return null;
  return s.attempts.reduce((best, a) => Math.max(best, a.band), 0);
}

/**
 * Predicted overall band — the mean of the latest per-skill bands, rounded the
 * official IELTS way. Returns null until at least two skills have an attempt
 * (so the number carries some signal). Clearly an estimate.
 */
export function predictedOverall(): { overall: number; bands: Partial<Record<Skill, number>>; skillsCount: number } | null {
  const bands = latestBands();
  const vals = Object.values(bands).filter((v): v is number => typeof v === 'number');
  if (vals.length < 2) return null;
  const overall = roundHalfBand(vals.reduce((a, b) => a + b, 0) / vals.length);
  return { overall, bands, skillsCount: vals.length };
}
