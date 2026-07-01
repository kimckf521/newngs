'use client';

import type { SatQuestion, SatModuleResult, SatSection, SatDomain, SatSkill, SatDifficulty } from './types';
import { isMc, isSpr } from './types';
import { gradeSpr, scaleSection } from './scoring';
import { fetchProgress, pushProgress } from './client';

/**
 * Student learning progress — the shared store behind the 错题本 (mistake
 * notebook), skill-drill practice, the progress dashboard, predicted score,
 * spaced repetition, and the vocabulary book. Persisted in localStorage so it
 * works on the ungated /member/sat runner (no login required); a logged-in
 * cloud sync can layer on later. Single source of truth for "how am I doing".
 */

const KEY = 'ngs-sat-progress';
const LOG_CAP = 4000;
const MOCK_CAP = 200;

export type PracticeMode = 'mock' | 'practice';

export type MistakeEntry = {
  id: string;
  section: SatSection;
  domain: SatDomain;
  skill: SatSkill;
  difficulty: SatDifficulty;
  wrongCount: number;
  correctStreak: number; // consecutive correct sightings since last wrong
  mastered: boolean;
  lastAnswer: string; // the (most recent) wrong answer
  firstWrongAt: number;
  lastSeenAt: number;
  dueAt: number; // spaced-repetition next-review timestamp
};

export type AnswerEvent = {
  id: string;
  section: SatSection;
  skill: SatSkill;
  correct: boolean;
  at: number;
  mode: PracticeMode;
  ms?: number; // time spent on the question, if measured
};

/** AI-generated structured definition for a saved word — fills both language
 *  faces of the vocab card from one generation (English def + 中文 gloss +
 *  synonyms/antonyms + a bilingual example, and a 中文 rendering of the sentence
 *  the student saved it from). */
export type VocabDef = {
  glossEn: string;
  glossZh: string;
  synonyms: string[];
  antonyms: string[];
  example: string;
  exampleZh: string;
  sourceZh?: string;
};

export type VocabEntry = {
  word: string;
  context?: string;
  note?: string; // legacy / manual free-text meaning (rendered when no `def`)
  def?: VocabDef; // AI-generated structured definition (preferred)
  addedAt: number;
  questionId?: string;
};

/** A completed full-mock result — kept so the hub can show a personal best. */
export type MockScore = { at: number; rw: number; math: number; total: number };

type Store = {
  v: 1;
  mistakes: Record<string, MistakeEntry>;
  log: AnswerEvent[];
  vocab: VocabEntry[];
  mocks: MockScore[];
};

const EMPTY: Store = { v: 1, mistakes: {}, log: [], vocab: [], mocks: [] };

function read(): Store {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (!raw) return { ...EMPTY };
    const s = JSON.parse(raw) as Partial<Store>;
    return { v: 1, mistakes: s.mistakes || {}, log: s.log || [], vocab: s.vocab || [], mocks: s.mocks || [] };
  } catch {
    return { ...EMPTY };
  }
}
function write(s: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    // notify listeners in this tab (storage event only fires cross-tab)
    window.dispatchEvent(new Event('ngs-sat-progress'));
    schedulePush();
  } catch {
    /* ignore quota */
  }
}

/** The single grading authority, shared with the runner/results. */
export function gradeAnswer(q: SatQuestion, chosen?: string): boolean {
  if (chosen == null || chosen === '') return false;
  if (isMc(q)) return chosen === (q as { correct: string }).correct;
  if (isSpr(q)) return gradeSpr(chosen, q.answer);
  return false;
}

/** Spaced-repetition interval (ms) from how many times in a row it's been right. */
const DAY = 24 * 60 * 60 * 1000;
function nextInterval(correctStreak: number): number {
  const steps = [1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  return steps[Math.min(correctStreak, steps.length - 1)];
}

/** Record one answered question. `chosen` is the student's raw answer. */
export function recordAnswer(q: SatQuestion, chosen: string, mode: PracticeMode, ms?: number): boolean {
  const correct = gradeAnswer(q, chosen);
  const now = Date.now();
  const s = read();
  s.log.push({ id: q.id, section: q.section, skill: q.skill, correct, at: now, mode, ...(ms ? { ms } : {}) });
  if (s.log.length > LOG_CAP) s.log = s.log.slice(-LOG_CAP);

  const prev = s.mistakes[q.id];
  if (!correct) {
    s.mistakes[q.id] = {
      id: q.id, section: q.section, domain: q.domain, skill: q.skill, difficulty: q.difficulty,
      wrongCount: (prev?.wrongCount || 0) + 1,
      correctStreak: 0,
      mastered: false,
      lastAnswer: chosen,
      firstWrongAt: prev?.firstWrongAt || now,
      lastSeenAt: now,
      dueAt: now + nextInterval(0),
    };
  } else if (prev) {
    const streak = prev.correctStreak + 1;
    s.mistakes[q.id] = {
      ...prev,
      correctStreak: streak,
      mastered: streak >= 2, // two clean sightings → mastered
      lastSeenAt: now,
      dueAt: now + nextInterval(streak),
    };
  }
  write(s);
  return correct;
}

/** Record a completed mock: grade every answered question through the store. */
export function recordMock(results: SatModuleResult[], byId: Map<string, SatQuestion>): void {
  for (const r of results) {
    for (const [qid, ans] of Object.entries(r.answers)) {
      const q = byId.get(qid);
      if (q && ans) recordAnswer(q, ans, 'mock');
    }
  }
}

/** Persist a completed mock's scaled score so the hub can track a personal best. */
export function recordMockScore(score: { rw: number; math: number; total: number }): void {
  const s = read();
  s.mocks.push({ at: Date.now(), rw: score.rw, math: score.math, total: score.total });
  if (s.mocks.length > MOCK_CAP) s.mocks = s.mocks.slice(-MOCK_CAP);
  write(s);
}

/** The student's highest completed-mock result (out of 1600), or null if none yet. */
export function bestMockScore(): MockScore | null {
  const mocks = read().mocks;
  if (!mocks.length) return null;
  return mocks.reduce((best, m) => (m.total > best.total ? m : best));
}

/* --------------------------------------------------------------- mistakes */

export type MistakeFilter = { section?: SatSection; domain?: SatDomain; skill?: SatSkill; difficulty?: SatDifficulty; includeMastered?: boolean };

export function listMistakes(filter: MistakeFilter = {}): MistakeEntry[] {
  const s = read();
  return Object.values(s.mistakes)
    .filter((m) => (filter.includeMastered ? true : !m.mastered))
    .filter((m) => (filter.section ? m.section === filter.section : true))
    .filter((m) => (filter.domain ? m.domain === filter.domain : true))
    .filter((m) => (filter.skill ? m.skill === filter.skill : true))
    .filter((m) => (filter.difficulty ? m.difficulty === filter.difficulty : true))
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

/** Update a saved word's meaning/note (used by inline edit + AI 释义). No-op if
 *  the word isn't in the book. */
export function updateVocabNote(word: string, note: string): void {
  const s = read();
  const entry = s.vocab.find((v) => v.word.toLowerCase() === word.toLowerCase());
  if (!entry) return;
  entry.note = note.trim() || undefined;
  write(s);
}

/** Store the AI-generated structured definition for a saved word. No-op if the
 *  word isn't in the book (e.g. it was removed while the call was in flight). */
export function setVocabDef(word: string, def: VocabDef): void {
  const s = read();
  const entry = s.vocab.find((v) => v.word.toLowerCase() === word.toLowerCase());
  if (!entry) return;
  entry.def = def;
  entry.note = undefined; // structured def supersedes any legacy note
  write(s);
}

/* --------------------------------------------------------------- stats */

export type SkillStat = { skill: SatSkill; section: SatSection; attempted: number; correct: number };
export type SectionStat = { section: SatSection; attempted: number; correct: number; avgMs: number };
export type DayStat = { day: string; attempted: number; correct: number };

export type ProgressStats = {
  totalAnswered: number;
  totalCorrect: number;
  mistakeCount: number;
  masteredCount: number;
  vocabCount: number;
  bySection: SectionStat[];
  bySkill: SkillStat[];
  byDay: DayStat[];
  streakDays: number;
};

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getStats(): ProgressStats {
  const s = read();
  const bySectionMap = new Map<SatSection, { attempted: number; correct: number; ms: number; msN: number }>();
  const bySkillMap = new Map<string, SkillStat>();
  const byDayMap = new Map<string, DayStat>();

  for (const e of s.log) {
    const sec = bySectionMap.get(e.section) || { attempted: 0, correct: 0, ms: 0, msN: 0 };
    sec.attempted += 1; if (e.correct) sec.correct += 1;
    if (e.ms) { sec.ms += e.ms; sec.msN += 1; }
    bySectionMap.set(e.section, sec);

    const sk = bySkillMap.get(e.skill) || { skill: e.skill, section: e.section, attempted: 0, correct: 0 };
    sk.attempted += 1; if (e.correct) sk.correct += 1;
    bySkillMap.set(e.skill, sk);

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
    bySection: Array.from(bySectionMap.entries()).map(([section, v]) => ({
      section, attempted: v.attempted, correct: v.correct, avgMs: v.msN ? Math.round(v.ms / v.msN) : 0,
    })),
    bySkill: Array.from(bySkillMap.values()).sort((a, b) => a.attempted - b.attempted),
    byDay,
    streakDays: computeStreak(byDay.map((d) => d.day)),
  };
}

function computeStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  // count back from today while each day has activity
  for (;;) {
    const k = dayKey(d.getTime());
    if (set.has(k)) { streak += 1; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

/** Predicted 400–1600 score from accumulated accuracy per section. Returns null
 *  until there's enough signal. Uses the official conversion via scaleSection:
 *  a section's accuracy is treated as its raw fraction, and ≥60% routes to the
 *  harder Module-2 band (same rule as the live mock). Clearly an estimate. */
export function predictedScore(): { rw: number; math: number; total: number; rwSamples: number; mathSamples: number; samples: number } | null {
  const s = read();
  const acc = { reading_writing: { a: 0, c: 0 }, math: { a: 0, c: 0 } };
  for (const e of s.log) { acc[e.section].a += 1; if (e.correct) acc[e.section].c += 1; }
  const samples = s.log.length;
  if (samples < 8) return null;
  const est = (sec: SatSection): number => {
    const { a, c } = acc[sec];
    if (a < 3) return 0; // not enough per-section signal
    const r = c / a;
    return scaleSection(sec, Math.round(r * 100), r >= 0.6 ? 'upper' : 'lower', 100);
  };
  const rw = est('reading_writing');
  const math = est('math');
  return { rw, math, total: (rw || 200) + (math || 200), rwSamples: acc.reading_writing.a, mathSamples: acc.math.a, samples };
}

/** Live counts for hub badges (mistakes due / total). */
export function quickCounts(): { mistakes: number; due: number; vocab: number } {
  const s = read();
  const now = Date.now();
  const active = Object.values(s.mistakes).filter((m) => !m.mastered);
  return { mistakes: active.length, due: active.filter((m) => m.dueAt <= now).length, vocab: s.vocab.length };
}

/* ------------------------------------------------------- cross-device sync
 * When a student is signed in we mirror the store to the cloud (sat_progress,
 * keyed by uid). On sign-in we PULL + MERGE (so a new device inherits history,
 * and existing local practice isn't lost), then PUSH the merged result;
 * thereafter every local write debounce-pushes. "Last write wins" per question,
 * which is fine for a practice tool (the common case is sequential devices, not
 * simultaneous editing). */

let syncUid: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
export type SyncState = 'off' | 'syncing' | 'synced' | 'error';
let syncState: SyncState = 'off';

export function getSyncState(): SyncState {
  return syncState;
}

/** Merge two stores. Per-question mistake state: the more recently seen wins.
 *  Log: union deduped by (id, timestamp), capped. Vocab: union by word. */
function mergeStores(a: Store, b: Store): Store {
  const mistakes: Record<string, MistakeEntry> = { ...a.mistakes };
  for (const [id, m] of Object.entries(b.mistakes)) {
    const cur = mistakes[id];
    if (!cur || m.lastSeenAt >= cur.lastSeenAt) mistakes[id] = m;
  }
  const seen = new Set<string>();
  const log: AnswerEvent[] = [];
  for (const e of [...a.log, ...b.log].sort((x, y) => x.at - y.at)) {
    const k = `${e.id}|${e.at}`;
    if (seen.has(k)) continue;
    seen.add(k);
    log.push(e);
  }
  const vocabByWord = new Map<string, VocabEntry>();
  for (const v of [...a.vocab, ...b.vocab]) {
    const key = v.word.toLowerCase();
    const cur = vocabByWord.get(key);
    if (!cur) { vocabByWord.set(key, v); continue; }
    // Keep the earliest entry for stable identity/order, but never drop an
    // enrichment (def / note / context) that only the other side generated —
    // otherwise a definition made on one device is lost on merge.
    const base = v.addedAt < cur.addedAt ? v : cur;
    const other = base === v ? cur : v;
    vocabByWord.set(key, {
      ...base,
      def: base.def ?? other.def,
      note: base.note ?? other.note,
      context: base.context ?? other.context,
    });
  }
  const mockSeen = new Set<string>();
  const mocks: MockScore[] = [];
  for (const m of [...a.mocks, ...b.mocks].sort((x, y) => x.at - y.at)) {
    const k = String(m.at);
    if (mockSeen.has(k)) continue; // union deduped by completion timestamp
    mockSeen.add(k);
    mocks.push(m);
  }
  return {
    v: 1,
    mistakes,
    log: log.slice(-LOG_CAP),
    vocab: Array.from(vocabByWord.values()).sort((x, y) => y.addedAt - x.addedAt),
    mocks: mocks.slice(-MOCK_CAP),
  };
}

function schedulePush(): void {
  if (!syncUid) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void flushPush(); }, 1500);
}

async function flushPush(): Promise<void> {
  if (!syncUid) return;
  const ok = await pushProgress(syncUid, read());
  syncState = ok ? 'synced' : 'error';
  try { window.dispatchEvent(new Event('ngs-sat-sync')); } catch { /* noop */ }
}

/** Enable cloud sync for a signed-in student: pull remote, merge with local,
 *  persist + push the merged result. Idempotent; safe to call once on mount. */
export async function configureSync(uid: string): Promise<void> {
  if (!uid) return;
  syncUid = uid;
  syncState = 'syncing';
  try { window.dispatchEvent(new Event('ngs-sat-sync')); } catch { /* noop */ }
  try {
    const remote = (await fetchProgress(uid)) as Partial<Store> | null;
    if (remote && (remote.mistakes || remote.log || remote.vocab || remote.mocks)) {
      const merged = mergeStores(read(), { v: 1, mistakes: remote.mistakes || {}, log: remote.log || [], vocab: remote.vocab || [], mocks: remote.mocks || [] });
      write(merged); // persists locally, notifies UI, and schedules a push
    }
    await flushPush(); // ensure remote has the merged/seeded state
  } catch {
    syncState = 'error';
    try { window.dispatchEvent(new Event('ngs-sat-sync')); } catch { /* noop */ }
  }
}

/** Stop syncing (e.g. on sign-out) so a guest session stays local-only. */
export function stopSync(): void {
  syncUid = null;
  syncState = 'off';
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
}
