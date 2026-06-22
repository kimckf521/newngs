/**
 * Content for the engagement-focused member design (/member/design-v2).
 * A gamified "Learning Hub" built around behavioral-design principles:
 * goal-gradient (XP), streaks + loss aversion, Zeigarnik (next-step), small
 * wins (daily checklist), visualized journey (learning path), collection
 * (achievements) and social proof. Course/module data reused from memberContent.
 */
import type { Locale } from '@/i18n/types';

export type NodeState = 'done' | 'current' | 'todo' | 'locked';
export type CourseMeta = { from: string; to: string; completed: number; currentIndex: number; lockFrom: number };
export type Task = { label: string; meta: string; xp: number };
export type StreakDay = { label: string; done: boolean; today?: boolean };
export type Achievement = { emoji: string; name: string; earned: boolean };

export type Dv2Content = {
  sampleName: string;
  role: string;
  greetings: { morning: string; afternoon: string; evening: string };
  motivate: (streak: number) => string;

  // engagement bar
  streakWord: string;
  levelWord: string;
  xpWord: string;

  // next step
  pickUp: string;
  nextLabel: string;
  estMin: (n: number) => string;
  continueBtn: string;
  lessonWord: string;

  // path
  pathTitle: string;
  pathSub: string;
  moduleWord: string;
  switchCourse: string;
  stateLabels: Record<NodeState, string>;
  start: string;
  review: string;
  locked: string;
  lessonsIn: string;

  // daily goal
  goalTitle: string;
  goalDoneOf: (a: number, b: number) => string;
  goalComplete: string;
  goalSub: string;

  // streak card
  streakTitle: string;
  streakKeep: (n: number) => string;
  streakDone: string;

  // level / xp
  levelTitle: (n: number) => string;
  xpToNext: (n: number) => string;
  todayXp: (n: number) => string;

  // today's plan
  planTitle: string;
  planSub: string;
  tasks: Task[];

  // achievements
  achTitle: string;
  achEarnedOf: (a: number, b: number) => string;
  achievements: Achievement[];

  // community
  communityTitle: string;
  learningNow: (n: number) => string;
  rank: (n: number) => string;

  // data
  courseMeta: Record<string, CourseMeta>;
  streakCount: number;
  streakDays: StreakDay[];
  level: number;
  baseXp: number;
  xpPerLevel: number;
  learnersNow: number;
  leaderboardRank: number;
};

export const dv2: Record<Locale, Dv2Content> = {
  en: {
    sampleName: 'Jamie Lin',
    role: 'Student',
    greetings: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    motivate: (s) => (s > 0 ? `You're on a ${s}-day streak — let's keep it going! 🔥` : `Let's start a streak today! 🔥`),

    streakWord: 'day streak',
    levelWord: 'Level',
    xpWord: 'XP',

    pickUp: 'Pick up where you left off',
    nextLabel: 'Up next',
    estMin: (n) => `${n} min`,
    continueBtn: 'Continue learning',
    lessonWord: 'Lesson',

    pathTitle: 'Your learning path',
    pathSub: 'Tap a stop to see what’s inside. One small step at a time.',
    moduleWord: 'Module',
    switchCourse: 'Switch course',
    stateLabels: { done: 'Completed', current: 'In progress', todo: 'Up next', locked: 'Locked' },
    start: 'Start',
    review: 'Review',
    locked: 'Complete earlier modules to unlock',
    lessonsIn: 'lessons',

    goalTitle: 'Daily goal',
    goalDoneOf: (a, b) => `${a} of ${b} done`,
    goalComplete: 'Daily goal complete! 🎉',
    goalSub: 'Check off your plan to fill the ring.',

    streakTitle: 'Streak',
    streakKeep: (n) => `Study today to keep your ${n}-day streak alive.`,
    streakDone: 'Nice — today is in the bag! ✅',

    levelTitle: (n) => `Level ${n}`,
    xpToNext: (n) => `${n} XP to next level`,
    todayXp: (n) => `+${n} XP today`,

    planTitle: 'Today’s plan',
    planSub: 'Three small wins. Tap to complete.',
    tasks: [
      { label: 'Finish Lesson 2 — Speaking', meta: 'IELTS · 15 min', xp: 20 },
      { label: 'Take the Module 1 quiz', meta: 'IELTS · 10 min', xp: 25 },
      { label: 'Reply in Lesson Discussions', meta: 'Forum · 5 min', xp: 10 },
    ],

    achTitle: 'Achievements',
    achEarnedOf: (a, b) => `${a} of ${b} earned`,
    achievements: [
      { emoji: '👟', name: 'First steps', earned: true },
      { emoji: '⭐', name: 'Module master', earned: true },
      { emoji: '📅', name: 'Consistent', earned: true },
      { emoji: '🎯', name: 'Goal getter', earned: false },
      { emoji: '🦉', name: 'Night owl', earned: false },
      { emoji: '🚀', name: 'Fast learner', earned: false },
      { emoji: '🏆', name: 'Top of class', earned: false },
      { emoji: '🎓', name: 'Graduate', earned: false },
    ],

    communityTitle: 'Community',
    learningNow: (n) => `${n} students learning now`,
    rank: (n) => `You’re #${n} this week`,

    courseMeta: {
      ielts: { from: '#ec1c8b', to: '#8b2fd6', completed: 1, currentIndex: 1, lockFrom: 6 },
      'othm-l4-bm': { from: '#8b2fd6', to: '#16c8e6', completed: 0, currentIndex: 0, lockFrom: 3 },
    },
    streakCount: 5,
    streakDays: [
      { label: 'M', done: true },
      { label: 'T', done: true },
      { label: 'W', done: true },
      { label: 'T', done: true },
      { label: 'F', done: true, today: true },
      { label: 'S', done: false },
      { label: 'S', done: false },
    ],
    level: 3,
    baseXp: 320,
    xpPerLevel: 500,
    learnersNow: 128,
    leaderboardRank: 12,
  },

  zh: {
    sampleName: '林佳',
    role: '学生',
    greetings: { morning: '早上好', afternoon: '下午好', evening: '晚上好' },
    motivate: (s) => (s > 0 ? `您已连续学习 ${s} 天 —— 继续保持！🔥` : `今天开启您的学习连胜吧！🔥`),

    streakWord: '天连续学习',
    levelWord: '等级',
    xpWord: '经验',

    pickUp: '继续上次的学习',
    nextLabel: '接下来',
    estMin: (n) => `${n} 分钟`,
    continueBtn: '继续学习',
    lessonWord: '课时',

    pathTitle: '您的学习路径',
    pathSub: '点击任意节点查看内容。每次一小步，稳步前进。',
    moduleWord: '模块',
    switchCourse: '切换课程',
    stateLabels: { done: '已完成', current: '进行中', todo: '待学习', locked: '未解锁' },
    start: '开始',
    review: '复习',
    locked: '完成前面的模块即可解锁',
    lessonsIn: '个课时',

    goalTitle: '每日目标',
    goalDoneOf: (a, b) => `已完成 ${a} / ${b}`,
    goalComplete: '今日目标已达成！🎉',
    goalSub: '勾选计划，填满目标环。',

    streakTitle: '连续学习',
    streakKeep: (n) => `今天学一会儿，守住您的 ${n} 天连胜。`,
    streakDone: '太棒了 —— 今天已打卡！✅',

    levelTitle: (n) => `${n} 级`,
    xpToNext: (n) => `距下一级还差 ${n} 经验`,
    todayXp: (n) => `今日 +${n} 经验`,

    planTitle: '今日计划',
    planSub: '三个小目标，点击即可完成。',
    tasks: [
      { label: '完成课时二 —— 口语', meta: '雅思 · 15 分钟', xp: 20 },
      { label: '完成模块一测验', meta: '雅思 · 10 分钟', xp: 25 },
      { label: '在课程讨论区回复', meta: '论坛 · 5 分钟', xp: 10 },
    ],

    achTitle: '成就',
    achEarnedOf: (a, b) => `已获得 ${a} / ${b}`,
    achievements: [
      { emoji: '👟', name: '迈出第一步', earned: true },
      { emoji: '⭐', name: '模块达人', earned: true },
      { emoji: '📅', name: '坚持不懈', earned: true },
      { emoji: '🎯', name: '目标达成者', earned: false },
      { emoji: '🦉', name: '夜猫子', earned: false },
      { emoji: '🚀', name: '学习飞人', earned: false },
      { emoji: '🏆', name: '名列前茅', earned: false },
      { emoji: '🎓', name: '顺利毕业', earned: false },
    ],

    communityTitle: '社区',
    learningNow: (n) => `${n} 位同学正在学习`,
    rank: (n) => `本周您排名第 ${n}`,

    courseMeta: {
      ielts: { from: '#ec1c8b', to: '#8b2fd6', completed: 1, currentIndex: 1, lockFrom: 6 },
      'othm-l4-bm': { from: '#8b2fd6', to: '#16c8e6', completed: 0, currentIndex: 0, lockFrom: 3 },
    },
    streakCount: 5,
    streakDays: [
      { label: '一', done: true },
      { label: '二', done: true },
      { label: '三', done: true },
      { label: '四', done: true },
      { label: '五', done: true, today: true },
      { label: '六', done: false },
      { label: '日', done: false },
    ],
    level: 3,
    baseXp: 320,
    xpPerLevel: 500,
    learnersNow: 128,
    leaderboardRank: 12,
  },
};
