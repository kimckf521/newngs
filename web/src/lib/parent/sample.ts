import type { Locale } from '@/i18n/types';

/**
 * Parent portal — SCAFFOLD sample data.
 * ----------------------------------------------------------------------
 * A parent (role: 'parent') monitors their linked children's study progress.
 * This is sample data ONLY — the real feature (a parent↔student link via invite
 * code + admin, and aggregating each child's real course progress / test scores
 * / activity) is the next phase. `IS_SAMPLE` lets the UI badge itself.
 */
export const IS_SAMPLE = true;

export type ChildCourse = {
  name: string;
  track: string;
  progress: number; // 0-100
  modulesDone: number;
  modulesTotal: number;
};

export type ChildScore = {
  test: string;
  kind: 'SAT' | 'IELTS' | 'Other';
  date: string;
  score: string;
  delta?: string;
};

export type Child = {
  id: string;
  name: string;
  grade: string;
  initial: string;
  streakDays: number;
  lastActive: string;
  weekMinutes: number;
  overallProgress: number; // 0-100
  week: number[]; // last 7 days study minutes (Mon..Sun)
  courses: ChildCourse[];
  scores: ChildScore[]; // most recent first
};

export type ParentData = { parentName: string; children: Child[] };

const ZH: ParentData = {
  parentName: '陈女士',
  children: [
    {
      id: 'k1',
      name: '陈晓明',
      grade: '高二',
      initial: '明',
      streakDays: 12,
      lastActive: '今天 20:15',
      weekMinutes: 320,
      overallProgress: 68,
      week: [45, 60, 30, 50, 40, 55, 40],
      courses: [
        { name: '雅思全程', track: 'IELTS', progress: 72, modulesDone: 4, modulesTotal: 6 },
        { name: '学术写作', track: 'IELTS', progress: 55, modulesDone: 2, modulesTotal: 4 },
      ],
      scores: [
        { test: '雅思全真模考 3', kind: 'IELTS', date: '2026-06-28', score: '6.5', delta: '+0.5' },
        { test: '雅思全真模考 2', kind: 'IELTS', date: '2026-06-14', score: '6.0', delta: '+0.5' },
        { test: '雅思全真模考 1', kind: 'IELTS', date: '2026-05-30', score: '5.5' },
      ],
    },
    {
      id: 'k2',
      name: '陈晓红',
      grade: '高一',
      initial: '红',
      streakDays: 5,
      lastActive: '昨天 21:40',
      weekMinutes: 210,
      overallProgress: 44,
      week: [30, 20, 40, 25, 35, 30, 30],
      courses: [
        { name: 'SAT 阅读写作', track: 'SAT', progress: 48, modulesDone: 3, modulesTotal: 8 },
        { name: 'SAT 数学', track: 'SAT', progress: 40, modulesDone: 2, modulesTotal: 6 },
      ],
      scores: [
        { test: 'SAT 全真模考 2', kind: 'SAT', date: '2026-06-25', score: '1280', delta: '+60' },
        { test: 'SAT 全真模考 1', kind: 'SAT', date: '2026-06-05', score: '1220' },
      ],
    },
  ],
};

const EN: ParentData = {
  parentName: 'Ms. Chen',
  children: [
    {
      id: 'k1',
      name: 'Ethan Chen',
      grade: 'Grade 11',
      initial: 'E',
      streakDays: 12,
      lastActive: 'Today 20:15',
      weekMinutes: 320,
      overallProgress: 68,
      week: [45, 60, 30, 50, 40, 55, 40],
      courses: [
        { name: 'IELTS Full', track: 'IELTS', progress: 72, modulesDone: 4, modulesTotal: 6 },
        { name: 'Academic Writing', track: 'IELTS', progress: 55, modulesDone: 2, modulesTotal: 4 },
      ],
      scores: [
        { test: 'IELTS Mock 3', kind: 'IELTS', date: '2026-06-28', score: '6.5', delta: '+0.5' },
        { test: 'IELTS Mock 2', kind: 'IELTS', date: '2026-06-14', score: '6.0', delta: '+0.5' },
        { test: 'IELTS Mock 1', kind: 'IELTS', date: '2026-05-30', score: '5.5' },
      ],
    },
    {
      id: 'k2',
      name: 'Sophia Chen',
      grade: 'Grade 10',
      initial: 'S',
      streakDays: 5,
      lastActive: 'Yesterday 21:40',
      weekMinutes: 210,
      overallProgress: 44,
      week: [30, 20, 40, 25, 35, 30, 30],
      courses: [
        { name: 'SAT Reading & Writing', track: 'SAT', progress: 48, modulesDone: 3, modulesTotal: 8 },
        { name: 'SAT Math', track: 'SAT', progress: 40, modulesDone: 2, modulesTotal: 6 },
      ],
      scores: [
        { test: 'SAT Practice 2', kind: 'SAT', date: '2026-06-25', score: '1280', delta: '+60' },
        { test: 'SAT Practice 1', kind: 'SAT', date: '2026-06-05', score: '1220' },
      ],
    },
  ],
};

export function parentData(locale: Locale): ParentData {
  return locale === 'en' ? EN : ZH;
}
