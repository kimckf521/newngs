'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SatSection, SatDomain, SatSkill, SatDifficulty } from '@/lib/sat/types';
import { SECTION_LABEL, DOMAIN_LABEL, SKILL_LABEL, DIFFICULTY_LABEL } from '@/lib/sat/types';

/**
 * Theme + language for the student SAT surface. Both persist in localStorage
 * and broadcast a window event so the currently-mounted full-screen root
 * updates instantly (only one SAT root is mounted at a time). Guests and
 * signed-in students alike get their choice remembered per browser.
 */

export type Lang = 'en' | 'zh';

const DARK_KEY = 'sat:dark';
const LANG_KEY = 'sat:lang';
const THEME_EVT = 'sat:theme-change';
const LANG_EVT = 'sat:lang-change';

function readDark(): boolean {
  try { return typeof window !== 'undefined' && window.localStorage.getItem(DARK_KEY) === '1'; } catch { return false; }
}
function readLang(): Lang {
  try { const v = typeof window !== 'undefined' ? window.localStorage.getItem(LANG_KEY) : null; return v === 'zh' ? 'zh' : 'en'; } catch { return 'en'; }
}

/** Dark-mode flag + toggle. Default light (faithful Bluebook white). */
export function useSatTheme(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(readDark());
    const on = () => setDark(readDark());
    window.addEventListener(THEME_EVT, on);
    return () => window.removeEventListener(THEME_EVT, on);
  }, []);
  const toggle = useCallback(() => {
    const next = !readDark();
    try { window.localStorage.setItem(DARK_KEY, next ? '1' : '0'); } catch { /* noop */ }
    window.dispatchEvent(new Event(THEME_EVT));
  }, []);
  return { dark, toggle };
}

/** UI language + setter. Default English (the mock is a faithful English exam). */
export function useSatLang(): { lang: Lang; setLang: (l: Lang) => void } {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    setLangState(readLang());
    const on = () => setLangState(readLang());
    window.addEventListener(LANG_EVT, on);
    return () => window.removeEventListener(LANG_EVT, on);
  }, []);
  const setLang = useCallback((l: Lang) => {
    try { window.localStorage.setItem(LANG_KEY, l); } catch { /* noop */ }
    window.dispatchEvent(new Event(LANG_EVT));
  }, []);
  return { lang, setLang };
}

/** Convenience: theme + lang + the shared common-string dict for the current lang. */
export function useSatUi() {
  const { dark, toggle } = useSatTheme();
  const { lang, setLang } = useSatLang();
  return { dark, toggleTheme: toggle, lang, setLang, t: COMMON[lang], pick: <T,>(en: T, zh: T) => (lang === 'zh' ? zh : en) };
}

/* ---------------------------------------------------------------- taxonomy */

const SECTION_ZH: Record<SatSection, string> = { reading_writing: '阅读与写作', math: '数学' };
const DIFF_ZH: Record<SatDifficulty, string> = { easy: '简单', medium: '中等', hard: '困难' };
const DOMAIN_ZH: Record<SatDomain, string> = {
  information_and_ideas: '信息与观点',
  craft_and_structure: '结构与技巧',
  expression_of_ideas: '表达技巧',
  standard_english_conventions: '标准英语规范',
  algebra: '代数',
  advanced_math: '高阶数学',
  problem_solving_and_data_analysis: '问题求解与数据分析',
  geometry_and_trigonometry: '几何与三角',
};
const SKILL_ZH: Record<SatSkill, string> = {
  central_ideas_and_details: '中心思想与细节',
  command_of_evidence_textual: '文本论据',
  command_of_evidence_quantitative: '定量论据',
  inferences: '推断',
  words_in_context: '语境词义',
  text_structure_and_purpose: '文本结构与目的',
  cross_text_connections: '跨文本关联',
  rhetorical_synthesis: '修辞综合',
  transitions: '过渡衔接',
  boundaries: '句子边界',
  form_structure_and_sense: '形式、结构与语义',
  linear_equations_in_one_variable: '一元一次方程',
  linear_equations_in_two_variables: '二元一次方程',
  linear_functions: '一次函数',
  systems_of_two_linear_equations_in_two_variables: '二元一次方程组',
  linear_inequalities_in_one_or_two_variables: '一元/二元一次不等式',
  equivalent_expressions: '等价表达式',
  nonlinear_equations_and_systems: '非线性方程与方程组',
  nonlinear_functions: '非线性函数',
  ratios_rates_proportional_relationships_and_units: '比、率、比例关系与单位',
  percentages: '百分比',
  one_variable_data_distributions_and_measures: '单变量数据分布与集中/离散度',
  two_variable_data_models_and_scatterplots: '双变量数据模型与散点图',
  probability_and_conditional_probability: '概率与条件概率',
  inference_from_sample_statistics_and_margin_of_error: '样本统计推断与误差范围',
  evaluating_statistical_claims: '评估统计结论',
  area_and_volume: '面积与体积',
  lines_angles_and_triangles: '直线、角与三角形',
  right_triangles_and_trigonometry: '直角三角形与三角学',
  circles: '圆',
};

export const secLabel = (k: SatSection, lang: Lang) => (lang === 'zh' ? SECTION_ZH[k] : SECTION_LABEL[k]);
export const domLabel = (k: SatDomain, lang: Lang) => (lang === 'zh' ? DOMAIN_ZH[k] : DOMAIN_LABEL[k]);
export const skillLabel = (k: SatSkill, lang: Lang) => (lang === 'zh' ? SKILL_ZH[k] : SKILL_LABEL[k]);
export const diffLabel = (k: SatDifficulty, lang: Lang) => (lang === 'zh' ? DIFF_ZH[k] : DIFFICULTY_LABEL[k]);

/* ------------------------------------------------ shared common UI strings */

export const COMMON = {
  en: {
    back: 'Back', exit: 'Exit', next: 'Next', nextQuestion: 'Next question', finish: 'Finish', done: 'Done',
    check: 'Check answer', correct: 'Correct', incorrect: 'Incorrect', cancel: 'Cancel', close: 'Close', remove: 'Remove',
    practice: 'Practice', reviewCenter: 'Practice Center', section: 'Section', module: 'Module',
    markForReview: 'Mark for Review', directions: 'Directions', more: 'More', help: 'Help',
    questionOf: (a: number, b: number) => `Question ${a} of ${b}`,
    explanation: 'Explanation', enterAnswer: 'Enter your answer', accepted: 'accepted',
    reading_writing: 'Reading and Writing', math: 'Math',
  },
  zh: {
    back: '返回', exit: '退出', next: '下一题', nextQuestion: '下一题', finish: '完成', done: '完成',
    check: '检查答案', correct: '正确', incorrect: '错误', cancel: '取消', close: '关闭', remove: '移除',
    practice: '练习', reviewCenter: '练习中心', section: '部分', module: '模块',
    markForReview: '标记复查', directions: '说明', more: '更多', help: '帮助',
    questionOf: (a: number, b: number) => `第 ${a} / ${b} 题`,
    explanation: '解析', enterAnswer: '输入你的答案', accepted: '可接受',
    reading_writing: '阅读与写作', math: '数学',
  },
} as const;
