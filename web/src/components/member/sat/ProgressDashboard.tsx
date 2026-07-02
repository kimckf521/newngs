'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SKILLS_BY_DOMAIN, type SatSkill, type SatSection, type SatDomain } from '@/lib/sat/types';
import { getStats, predictedScore, errorProfile, predictionBand, distractorProfile, studyPlan, listMocks, getGoal, setGoal, type ErrorKind } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, secLabel, domLabel, skillLabel } from './i18n';

/** 数据看板 — benchmarks the student against College Board 2025 global data
 *  across three dimensions: pace, accuracy, and performance tier. Reads the
 *  local progress store; benchmark numbers are fixed constants (labelled
 *  estimated). Fully bilingual (EN/中) + light/dark. */

/* ------------------------------------------------------------- benchmarks
 * Sources: College Board 2025 Total Group Annual Report + Digital SAT specs.
 * Raw→scaled is adaptive (not linear), so accuracy figures are ESTIMATES. */
const GLOBAL = { total: 1029, reading_writing: 521, math: 508 } as const;
const STD_PACE: Record<SatSection, number> = { reading_writing: 71, math: 95 }; // seconds / question
const OVERALL_PACE = 82;
const ACC_BAND: Record<SatSection, [number, number]> = { reading_writing: [57, 59], math: [45, 48] }; // % correct
const DOMAIN_WEIGHT: Record<SatDomain, number> = {
  information_and_ideas: 54, craft_and_structure: 20, expression_of_ideas: 14, standard_english_conventions: 12,
  algebra: 35, advanced_math: 30, problem_solving_and_data_analysis: 20, geometry_and_trigonometry: 15,
};
const TIERS = [
  { key: 'average', total: 1030, en: 'Average', zh: '平均', pctEn: 'P50', pctZh: '第 50 百分位' },
  { key: 'good', total: 1200, en: 'Good', zh: '良好', pctEn: 'Top 30%', pctZh: '前 30%' },
  { key: 'excellent', total: 1350, en: 'Excellent', zh: '优秀', pctEn: 'Top 10%', pctZh: '前 10%' },
  { key: 'top', total: 1500, en: 'Top-tier', zh: '顶尖', pctEn: 'Top 2%', pctZh: '前 2%' },
] as const;
const GOOD_ACC: Record<SatSection, number> = { reading_writing: 70, math: 65 }; // "Good" tier accuracy targets

const MATH_DOMAINS = new Set<SatDomain>(['algebra', 'advanced_math', 'problem_solving_and_data_analysis', 'geometry_and_trigonometry']);
const SKILL_DOMAIN: Partial<Record<SatSkill, SatDomain>> = {};
(Object.keys(SKILLS_BY_DOMAIN) as SatDomain[]).forEach((d) => SKILLS_BY_DOMAIN[d].forEach((sk) => { SKILL_DOMAIN[sk] = d; }));
const DOMAINS_BY_SECTION: Record<SatSection, SatDomain[]> = {
  reading_writing: (Object.keys(SKILLS_BY_DOMAIN) as SatDomain[]).filter((d) => !MATH_DOMAINS.has(d)),
  math: (Object.keys(SKILLS_BY_DOMAIN) as SatDomain[]).filter((d) => MATH_DOMAINS.has(d)),
};

type Tone = 'good' | 'accent' | 'warn' | 'bad' | 'muted';
const AMBER = '#f59e0b';
const toneColor = (t: Tone): string => (t === 'good' ? C.good : t === 'accent' ? C.blue : t === 'warn' ? AMBER : t === 'bad' ? C.flag : C.muted) as string;
const kindColor = (k: ErrorKind): string => (k === 'careless' ? AMBER : k === 'knowledge' ? C.flag : k === 'shaky' ? C.blue : C.good) as string;

/** ~top X% for a scaled total, interpolated across the official percentile anchors. */
function topPercent(total: number): number {
  const pts: Array<[number, number]> = [[400, 1], [1029, 50], [1200, 70], [1350, 90], [1500, 98], [1600, 99]];
  let p = 1;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]; const [x1, y1] = pts[i + 1];
    if (total <= x1) { p = y0 + (y1 - y0) * ((total - x0) / (x1 - x0)); break; }
    p = y1;
  }
  return Math.max(1, Math.round(100 - p));
}

/* --------------------------------------------------------------- copy */
const T = {
  en: {
    back: 'Back', title: 'Progress Dashboard',
    empty: 'No practice data yet. Take a mock or drill a skill, and your progress shows up here.',
    estimated: 'Estimated. Benchmarks: College Board 2025 report & Digital SAT specs.',
    predicted: 'Predicted score', of: '/ 1600',
    unlock: 'Answer a few more questions to unlock your predicted score and benchmarks.',
    belowAvg: 'Below average', aroundAvg: 'Around average',
    approaching: (n: string) => `Approaching ${n}`,
    avg: 'avg', globalAvgShort: 'global avg',
    vsGlobal: (d: number) => `${d >= 0 ? '+' : ''}${d} vs global average (1029)`,
    pace: 'Pace', paceSub: 'time / question vs standard',
    onPace: 'on pace', faster: 'faster', slowerBy: (p: number) => `${p}% slower`, overall: 'Overall',
    standard: (s: number) => `standard ${s}s`,
    accuracy: 'Accuracy', accSub: 'vs global average band',
    aboveAvg: 'above avg', atAvg: 'at avg', belowAvgShort: 'below avg',
    globalBand: (lo: number, hi: number) => `global ${lo}–${hi}%`,
    tierTitle: 'Performance tier', youHere: 'you are here',
    toNext: (pts: number, n: string) => `${pts} points below ${n} — keep practicing to get there.`,
    atTop: 'You’re at the top tier — outstanding.',
    domainTitle: 'Domain breakdown', domainSub: 'accuracy · share of section',
    notPracticed: 'not practiced', priority: 'Priority', lowData: 'low data',
    insightTitle: 'What this means & what to do next',
    drill: (n: string) => `Drill ${n}`, keepGoing: 'Keep practicing to unlock your benchmark analysis.',
    timePerSection: 'Time per section', activity: 'Activity', last14: 'last 14 days',
    answered: 'Answered', accShort: 'Accuracy', streak: 'Day streak', toReview: 'To review',
    planTitle: 'Today’s plan', planSub: 'a focused ~20-minute set',
    planReview: (n: number) => `${n} due mistakes to review`,
    planSkill: (n: number, s: string) => `${n} questions on ${s} (weakest)`,
    planVocab: (n: number) => `${n} vocab to self-quiz`,
    planEmpty: 'Answer a few questions and your daily plan appears here.', start: 'Start',
    goalTitle: 'Goal', setGoalCta: 'Set a goal', goalToGo: (n: number) => `${n} to go`, goalReached: '🎉 Goal reached',
    goalPending: 'Answer a few more questions to unlock your progress toward it.',
    diagTitle: 'How you’re answering', diagSub: 'by time per question',
    careless: 'Careless', knowledge: 'Knowledge gap', shaky: 'Shaky', solid: 'Solid',
    ofWrong: (n: number) => `of ${n} wrong`, recentPace: 'Recent pace', diagNeed: 'Timed practice will populate this.',
    trapsTitle: 'Persistent traps', trapsBody: (n: number) => `${n} question${n === 1 ? '' : 's'} you’ve missed 2+ times — worth a focused redo.`, noTraps: 'No repeated misses. Nice.',
    trajTitle: 'Score trajectory', trajSub: 'completed mocks', trajNeed: 'Finish a full mock to start your trajectory.',
  },
  zh: {
    back: '返回', title: '数据看板',
    empty: '暂无练习数据。做模考或刷题后，这里会显示你的进度。',
    estimated: '估算值。基准：College Board 2025 报告与机考 SAT 规范。',
    predicted: '预测分数', of: '/ 1600',
    unlock: '再多做几题即可解锁预测分数与全球对标。',
    belowAvg: '低于平均', aroundAvg: '接近平均',
    approaching: (n: string) => `接近${n}`,
    avg: '平均', globalAvgShort: '全球平均',
    vsGlobal: (d: number) => `对比全球平均（1029） ${d >= 0 ? '+' : ''}${d}`,
    pace: '答题节奏', paceSub: '单题用时 vs 标准',
    onPace: '达标', faster: '快于标准', slowerBy: (p: number) => `慢 ${p}%`, overall: '全卷',
    standard: (s: number) => `标准 ${s} 秒`,
    accuracy: '正确率', accSub: '对比全球平均区间',
    aboveAvg: '高于平均', atAvg: '接近平均', belowAvgShort: '低于平均',
    globalBand: (lo: number, hi: number) => `全球 ${lo}–${hi}%`,
    tierTitle: '水平档位', youHere: '你在这里',
    toNext: (pts: number, n: string) => `距离${n}还差 ${pts} 分——继续练习即可达到。`,
    atTop: '你已达到顶尖档位——非常出色。',
    domainTitle: '各领域表现', domainSub: '正确率 · 领域占比',
    notPracticed: '未练习', priority: '重点', lowData: '样本少',
    insightTitle: '这意味着什么 · 下一步',
    drill: (n: string) => `训练：${n}`, keepGoing: '继续练习即可解锁全球对标分析。',
    timePerSection: '每部分用时', activity: '活跃度', last14: '近 14 天',
    answered: '已答', accShort: '正确率', streak: '连续天数', toReview: '待复习',
    planTitle: '今日计划', planSub: '约 20 分钟的重点练习',
    planReview: (n: number) => `${n} 道到期错题待复习`,
    planSkill: (n: number, s: string) => `${n} 题 ${s}（最弱项）`,
    planVocab: (n: number) => `${n} 个生词自测`,
    planEmpty: '再做几题，这里会生成你的每日计划。', start: '开始',
    goalTitle: '目标', setGoalCta: '设定目标', goalToGo: (n: number) => `还差 ${n} 分`, goalReached: '🎉 已达成目标',
    goalPending: '再做几题即可解锁目标进度。',
    diagTitle: '你的答题方式', diagSub: '按单题用时',
    careless: '粗心', knowledge: '知识盲点', shaky: '不熟练', solid: '扎实',
    ofWrong: (n: number) => `共 ${n} 道错题`, recentPace: '近期节奏', diagNeed: '限时练习后这里会有数据。',
    trapsTitle: '顽固易错', trapsBody: (n: number) => `有 ${n} 道题你已错 2 次以上——值得重做。`, noTraps: '没有重复错题，很棒。',
    trajTitle: '分数走势', trajSub: '已完成模考', trajNeed: '完成一次完整模考即可看到走势。',
  },
};

export function ProgressDashboard({ onBack, onPracticeSkill, onOpenNotebook, onOpenVocab }: { onBack: () => void; onPracticeSkill?: (skill: SatSkill) => void; onOpenNotebook?: () => void; onOpenVocab?: () => void }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const t = T[lang];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((v) => v + 1);
    window.addEventListener('ngs-sat-progress', on);
    return () => window.removeEventListener('ngs-sat-progress', on);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pred = useMemo(() => predictedScore(), [tick]);
  const acc = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const [goal, setGoalState] = useState<number | null>(getGoal());
  const saveGoal = (v: number | null) => { setGoal(v); setGoalState(v); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ep = useMemo(() => errorProfile(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const traps = useMemo(() => distractorProfile(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo(() => studyPlan(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mocks = useMemo(() => listMocks(), [tick]);
  const band = pred ? predictionBand(pred.samples) : 0;

  // per-section accuracy + pace
  const sectionStat = (sec: SatSection) => {
    const s = stats.bySection.find((x) => x.section === sec);
    return { attempted: s?.attempted ?? 0, correct: s?.correct ?? 0, pct: s && s.attempted ? Math.round((s.correct / s.attempted) * 100) : null, sec: s?.avgMs ? s.avgMs / 1000 : null };
  };
  const rw = sectionStat('reading_writing');
  const math = sectionStat('math');
  const overallSec = (() => {
    // weight each section's avg by its number of TIMED questions (msN), not by
    // total attempted — otherwise a section with many untimed answers skews it.
    const withMs = stats.bySection.filter((s) => s.avgMs > 0 && s.msN > 0);
    if (!withMs.length) return null;
    const totMs = withMs.reduce((a, s) => a + s.avgMs * s.msN, 0);
    const totN = withMs.reduce((a, s) => a + s.msN, 0);
    return totN ? totMs / totN / 1000 : null;
  })();

  // domains (all 8, grouped by section; data where practiced)
  const byDomain = new Map<SatDomain, { attempted: number; correct: number }>();
  for (const s of stats.bySkill) {
    const d = SKILL_DOMAIN[s.skill]; if (!d) continue;
    const cur = byDomain.get(d) || { attempted: 0, correct: 0 };
    cur.attempted += s.attempted; cur.correct += s.correct; byDomain.set(d, cur);
  }
  const domainRow = (d: SatDomain) => {
    const v = byDomain.get(d);
    const pct = v && v.attempted ? Math.round((v.correct / v.attempted) * 100) : null;
    return { domain: d, weight: DOMAIN_WEIGHT[d], attempted: v?.attempted ?? 0, pct, low: (v?.attempted ?? 0) > 0 && (v?.attempted ?? 0) < 5 };
  };
  // priority domain = highest impact × gap (weight × miss-rate), among practiced ≥3
  const priorityDomain = (Object.keys(DOMAIN_WEIGHT) as SatDomain[])
    .map(domainRow).filter((r) => r.attempted >= 3 && r.pct != null)
    .sort((a, b) => b.weight * (1 - (b.pct as number) / 100) - a.weight * (1 - (a.pct as number) / 100))[0];

  // level + tier
  let tierIdx = -1;
  for (let i = TIERS.length - 1; i >= 0; i--) { if (pred && pred.total >= TIERS[i].total) { tierIdx = i; break; } }
  const level = (() => {
    if (!pred) return null;
    const nextIdx = tierIdx + 1;
    // "Approaching" only applies to the real tiers ABOVE Average (Good/Excellent/Top).
    // You don't "approach Average" — below it you're simply below/around average.
    if (nextIdx >= 1 && nextIdx <= 3 && TIERS[nextIdx].total - pred.total > 0 && TIERS[nextIdx].total - pred.total <= 60) {
      return { label: t.approaching(lang === 'zh' ? TIERS[nextIdx].zh : TIERS[nextIdx].en), tone: 'good' as Tone };
    }
    if (tierIdx === -1) return { label: pred.total >= 970 ? t.aroundAvg : t.belowAvg, tone: (pred.total >= 970 ? 'accent' : 'bad') as Tone };
    return { label: lang === 'zh' ? TIERS[tierIdx].zh : TIERS[tierIdx].en, tone: (tierIdx >= 2 ? 'good' : 'accent') as Tone };
  })();

  const days = stats.byDay.slice(-14);
  const maxDay = Math.max(1, ...days.map((d) => d.attempted));

  return (
    <div className={`sat-app ${dark ? 'sat-dark' : ''} fixed inset-0 z-[60] flex flex-col overflow-y-auto`} style={{ background: C.soft, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {t.back}</button>
        <div className="text-[15px] font-bold">{t.title}</div>
        <div className="ml-auto"><ThemeLangToggle /></div>
      </header>

      <div className="mx-auto w-[min(920px,94vw)] py-7">
        {stats.totalAnswered === 0 ? (
          <div className="rounded-xl border p-10 text-center text-[14px]" style={{ background: C.panel, borderColor: C.border, color: C.muted }}>{t.empty}</div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="text-right text-[11px] italic" style={{ color: C.muted }}>{t.estimated}</div>

            {/* ── hero: score + level ── */}
            <div className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.border }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: C.muted }}>{t.predicted}</div>
                  {pred ? (
                    <>
                      <div className="mt-1 flex items-baseline gap-2.5">
                        <span className="text-[40px] font-extrabold leading-none" style={{ color: C.blueDeep }}>{pred.total}</span>
                        <span className="text-[13px] font-semibold" style={{ color: C.muted }}>± {band}</span>
                        <span className="text-[14px]" style={{ color: C.muted }}>{t.of}</span>
                        {level ? <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ color: toneColor(level.tone), background: level.tone === 'good' ? C.goodBg : C.tint }}>{level.label}</span> : null}
                      </div>
                      <div className="mt-1.5 text-[12.5px]" style={{ color: C.muted }}>
                        {lang === 'zh' ? `约前 ${topPercent(pred.total)}%` : `Top ~${topPercent(pred.total)}%`} · <span style={{ color: pred.total >= GLOBAL.total ? C.good : C.flag, fontWeight: 600 }}>{t.vsGlobal(pred.total - GLOBAL.total)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 max-w-md text-[13px]" style={{ color: C.muted }}>{t.unlock}</p>
                  )}
                </div>
                {pred ? (
                  <div className="flex gap-2.5">
                    {(['reading_writing', 'math'] as SatSection[]).map((sec) => {
                      const v = pred[sec === 'reading_writing' ? 'rw' : 'math'];
                      const d = (v || 0) - GLOBAL[sec];
                      return (
                        <div key={sec} className="rounded-lg px-3 py-2" style={{ background: C.soft, minWidth: 108 }}>
                          <div className="text-[11px]" style={{ color: C.muted }}>{secLabel(sec, lang)}</div>
                          <div className="text-[18px] font-bold" style={{ color: C.ink }}>{v || '—'} {v ? <span className="text-[11px]" style={{ color: d >= 0 ? C.good : C.flag }}>{d >= 0 ? '+' : ''}{d}</span> : null}</div>
                          <div className="text-[11px]" style={{ color: C.muted }}>{t.avg} {GLOBAL[sec]}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              {pred ? (
                <div className="mt-4">
                  <div className="relative h-2 rounded-full" style={{ background: C.track }}>
                    <div className="absolute -top-1 bottom-[-4px] w-[2px]" style={{ left: `${((GLOBAL.total - 400) / 1200) * 100}%`, background: C.muted }} />
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ((pred.total - 400) / 1200) * 100))}%`, background: C.blue }} />
                    <div className="absolute -top-[3px] h-3.5 w-3.5 rounded-full" style={{ left: `calc(${Math.min(100, Math.max(0, ((pred.total - 400) / 1200) * 100))}% - 7px)`, background: C.blueDeep, border: `2px solid ${C.panel}` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[10.5px]" style={{ color: C.muted }}><span>400</span><span>{t.globalAvgShort} 1029</span><span>1600</span></div>
                </div>
              ) : null}
            </div>

            {/* ── stat tiles ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile label={t.answered} value={stats.totalAnswered} />
              <Tile label={t.accShort} value={`${acc}%`} tone={acc >= 70 ? 'good' : acc >= 40 ? 'accent' : 'bad'} />
              <Tile label={t.streak} value={stats.streakDays} />
              <Tile label={t.toReview} value={stats.mistakeCount} tone={stats.mistakeCount ? 'bad' : 'good'} />
            </div>

            {/* ── today's plan (①) + goal (⑧) ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title={t.planTitle} sub={t.planSub}>
                {plan.length ? (
                  <div className="flex flex-col gap-2">
                    {plan.map((it, i) => {
                      const label = it.type === 'review' ? t.planReview(it.count) : it.type === 'skill' ? t.planSkill(it.count, it.skill ? skillLabel(it.skill, lang) : '') : t.planVocab(it.count);
                      const go = it.type === 'review' ? onOpenNotebook : it.type === 'vocab' ? onOpenVocab : (it.skill && onPracticeSkill ? () => onPracticeSkill(it.skill as SatSkill) : undefined);
                      const dot = it.type === 'review' ? C.flag : it.type === 'skill' ? C.blue : '#b02fc9';
                      return (
                        <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: C.soft }}>
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                          <span className="min-w-0 flex-1 text-[13px]" style={{ color: C.ink }}>{label}</span>
                          {go ? <button type="button" onClick={go} className="shrink-0 rounded-full px-3 py-1 text-[12px] font-bold text-white" style={{ background: C.blue }}>{t.start}</button> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-[13px]" style={{ color: C.muted }}>{t.planEmpty}</p>}
              </Card>

              <Card title={t.goalTitle}>
                {goal ? (() => {
                  // Only chart progress once the score is actually predicted (≥8 answers).
                  // Before that `pred` is null — anchoring the bar/gap to a fictitious 0
                  // would tell the student they must gain the whole score from scratch.
                  const cur = pred?.total ?? null;
                  const reached = cur != null && cur >= goal;
                  const pctToGoal = cur != null && goal > 400 ? Math.min(100, Math.max(0, Math.round(((cur - 400) / (goal - 400)) * 100))) : 0;
                  return (
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[22px] font-extrabold" style={{ color: C.blueDeep }}>{goal}</span>
                        {cur != null ? (
                          <span className="text-[12px] font-semibold" style={{ color: reached ? C.good : C.muted }}>{reached ? t.goalReached : t.goalToGo(goal - cur)}</span>
                        ) : null}
                      </div>
                      {cur != null ? (
                        <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: C.track }}>
                          <div className="h-full rounded-full" style={{ width: `${pctToGoal}%`, background: reached ? C.good : C.blue }} />
                        </div>
                      ) : (
                        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.muted }}>{t.goalPending}</p>
                      )}
                      <button type="button" onClick={() => saveGoal(null)} className="mt-2 text-[11px]" style={{ color: C.muted }}>{lang === 'zh' ? '清除目标' : 'Clear goal'}</button>
                    </div>
                  );
                })() : (
                  <div>
                    <p className="mb-2 text-[13px]" style={{ color: C.muted }}>{t.setGoalCta}</p>
                    <div className="flex gap-2">
                      {[1200, 1350, 1500].map((v) => (
                        <button key={v} type="button" onClick={() => saveGoal(v)} className="rounded-full border px-3.5 py-1.5 text-[12px] font-bold" style={{ borderColor: C.border, color: C.blue }}>{v}+</button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* ── pace + accuracy ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title={t.pace} sub={t.paceSub}>
                {([['reading_writing', rw.sec], ['math', math.sec]] as Array<[SatSection, number | null]>).map(([sec, secv]) => {
                  const std = STD_PACE[sec];
                  const st = paceStatus(secv, std, t);
                  return <Bullet key={sec} label={secLabel(sec, lang)} valueText={secv != null ? `${secv.toFixed(0)}s` : '—'} status={st}
                    fillPct={secv != null ? Math.min(100, (secv / (std * 1.7)) * 100) : 0} markPct={(std / (std * 1.7)) * 100} sub={t.standard(std)} />;
                })}
                <Bullet label={t.overall} valueText={overallSec != null ? `${overallSec.toFixed(0)}s` : '—'} status={paceStatus(overallSec, OVERALL_PACE, t)}
                  fillPct={overallSec != null ? Math.min(100, (overallSec / (OVERALL_PACE * 1.7)) * 100) : 0} markPct={(OVERALL_PACE / (OVERALL_PACE * 1.7)) * 100} sub={t.standard(OVERALL_PACE)} />
              </Card>

              <Card title={t.accuracy} sub={t.accSub}>
                {(['reading_writing', 'math'] as SatSection[]).map((sec) => {
                  const pct = (sec === 'reading_writing' ? rw : math).pct;
                  const band = ACC_BAND[sec];
                  const st = accStatus(pct, band, t);
                  return <Bullet key={sec} label={secLabel(sec, lang)} valueText={pct != null ? `${pct}%` : '—'} status={st}
                    fillPct={pct ?? 0} markPct={null} band={band} sub={t.globalBand(band[0], band[1])} />;
                })}
              </Card>
            </div>

            {/* ── answer diagnosis: careless vs knowledge (②) + recent pace (③) + traps (④) ── */}
            <Card title={t.diagTitle} sub={t.diagSub}>
              {ep.timed ? (
                <>
                  {ep.wrong ? (
                    <div className="mb-3">
                      <div className="mb-1.5 flex h-2.5 overflow-hidden rounded-full" style={{ background: C.track }}>
                        <div style={{ width: `${ep.carelessPct}%`, background: AMBER }} />
                        <div style={{ width: `${ep.knowledgePct}%`, background: C.flag }} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                        <span style={{ color: AMBER }}>● {t.careless} {ep.careless} <span style={{ color: C.muted }}>({ep.carelessPct}%)</span></span>
                        <span style={{ color: C.flag }}>● {t.knowledge} {ep.knowledge} <span style={{ color: C.muted }}>({ep.knowledgePct}%)</span></span>
                        <span className="ml-auto" style={{ color: C.muted }}>{t.ofWrong(ep.wrong)}</span>
                      </div>
                    </div>
                  ) : null}
                  <div className="mb-1 text-[11px]" style={{ color: C.muted }}>{t.recentPace}</div>
                  <div className="flex flex-wrap gap-1">
                    {ep.recent.map((r, i) => (
                      <span key={i} title={`${r.sec}s · ${r.correct ? '✓' : '✗'}`} className="h-3.5 w-3.5 rounded-sm" style={{ background: kindColor(r.kind) }} />
                    ))}
                  </div>
                  {traps.repeatMisses.length ? (
                    <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.ink }}><span className="font-semibold">{t.trapsTitle}：</span>{t.trapsBody(traps.repeatMisses.length)}</p>
                  ) : null}
                </>
              ) : <p className="text-[13px]" style={{ color: C.muted }}>{t.diagNeed}</p>}
            </Card>

            {/* ── tier ladder ── */}
            {pred ? (
              <Card title={t.tierTitle} sub={t.youHere}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TIERS.map((tier, i) => {
                    const here = i === tierIdx || (tierIdx === -1 && i === 0); // below the first tier → mark Average as the floor rung
                    return (
                      <div key={tier.key} className="rounded-lg p-2.5 text-center" style={here ? { border: `2px solid ${C.good}`, background: C.goodBg } : { border: `0.5px solid ${C.border}` }}>
                        <div className="text-[12.5px] font-semibold" style={{ color: here ? C.good : C.ink }}>{lang === 'zh' ? tier.zh : tier.en}</div>
                        <div className="text-[11px]" style={{ color: here ? C.good : C.muted }}>~{tier.total} · {lang === 'zh' ? tier.pctZh : tier.pctEn}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px]" style={{ color: C.ink }}>
                  {tierIdx >= 3 ? t.atTop : (() => { const n = TIERS[Math.min(3, tierIdx + 1)]; return t.toNext(n.total - pred.total, lang === 'zh' ? n.zh : n.en); })()}
                </p>
              </Card>
            ) : null}

            {/* ── domain breakdown ── */}
            <Card title={t.domainTitle} sub={t.domainSub}>
              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {(['reading_writing', 'math'] as SatSection[]).flatMap((sec) => DOMAINS_BY_SECTION[sec].map(domainRow)).map((r) => {
                  const isPriority = priorityDomain && priorityDomain.domain === r.domain;
                  const barTone: Tone = r.pct == null ? 'muted' : r.pct >= 70 ? 'good' : r.pct >= 50 ? 'accent' : r.pct >= 40 ? 'warn' : 'bad';
                  return (
                    <button key={r.domain} type="button" disabled={!onPracticeSkill}
                      onClick={() => { const first = SKILLS_BY_DOMAIN[r.domain][0]; if (onPracticeSkill && first) onPracticeSkill(first); }}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors sat-hover disabled:cursor-default">
                      <span className="flex-1 truncate text-[12.5px]" title={domLabel(r.domain, lang)} style={{ color: r.pct == null ? C.muted : C.ink }}>
                        {domLabel(r.domain, lang)}
                        {isPriority ? <span className="ml-1.5 rounded px-1 py-0.5 text-[10px] font-bold" style={{ color: C.flag, background: C.badBg }}>⚑ {t.priority}</span> : null}
                      </span>
                      <span className="w-9 shrink-0 text-right text-[11px]" style={{ color: C.muted }}>{r.weight}%</span>
                      <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full" style={{ background: C.track }}>
                        <span className="block h-full rounded-full" style={{ width: `${r.pct ?? 0}%`, background: toneColor(barTone) }} />
                      </span>
                      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums" style={{ color: r.pct == null ? C.muted : C.ink }}>
                        {r.pct == null ? t.notPracticed : `${r.pct}%`}{r.low ? ` · ${t.lowData}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* ── insight ── */}
            <div className="rounded-xl border p-4" style={{ borderColor: C.blue, background: C.aiBg }}>
              <div className="mb-1.5 text-[13px] font-bold" style={{ color: C.blue }}>{t.insightTitle}</div>
              <p className="text-[13px] leading-relaxed" style={{ color: C.ink }}>
                {pred ? buildInsight({ lang, pred, rw, math, priorityDomain, tierIdx }) : t.keepGoing}
              </p>
              {pred && priorityDomain && onPracticeSkill ? (
                <button type="button" onClick={() => { const f = SKILLS_BY_DOMAIN[priorityDomain.domain][0]; if (f) onPracticeSkill(f); }}
                  className="mt-3 rounded-full px-4 py-1.5 text-[12px] font-bold text-white" style={{ background: C.blue }}>
                  {t.drill(domLabel(priorityDomain.domain, lang))} →
                </button>
              ) : null}
            </div>

            {/* ── score trajectory (⑤) ── */}
            <Card title={t.trajTitle} sub={t.trajSub}>
              {mocks.length >= 2 ? <Trajectory mocks={mocks} /> : <p className="text-[13px]" style={{ color: C.muted }}>{t.trajNeed}</p>}
            </Card>

            {/* ── time per section + activity ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title={t.timePerSection}>
                {stats.bySection.filter((s) => s.avgMs > 0).length ? stats.bySection.map((s) => (
                  <div key={s.section} className="flex items-center justify-between py-1.5 text-[13px]">
                    <span style={{ color: C.muted }}>{secLabel(s.section, lang)}</span>
                    <span className="font-semibold tabular-nums" style={{ color: C.ink }}>{s.avgMs ? `${(s.avgMs / 1000).toFixed(1)}s` : '—'}</span>
                  </div>
                )) : <p className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? '在考点练习中会记录用时。' : 'Timing is recorded during skill practice.'}</p>}
              </Card>
              <Card title={t.activity} sub={t.last14}>
                <div className="flex h-24 items-end gap-1">
                  {days.length ? days.map((d) => {
                    const dpct = d.attempted ? Math.round((d.correct / d.attempted) * 100) : 0;
                    return (
                      <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.correct}/${d.attempted} (${dpct}%)`}>
                        <div className="w-full rounded-t" style={{ height: `${Math.max(6, (d.attempted / maxDay) * 80)}px`, background: dpct >= 70 ? C.good : dpct >= 40 ? C.blue : C.flag }} />
                        <span className="text-[9px]" style={{ color: C.muted }}>{d.day.slice(5)}</span>
                      </div>
                    );
                  }) : <p className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? '暂无活跃记录。' : 'No activity yet.'}</p>}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces */

function paceStatus(sec: number | null, std: number, t: (typeof T)['en']): { tone: Tone; label: string } {
  if (sec == null) return { tone: 'muted', label: '—' };
  const r = sec / std;
  if (r <= 0.9) return { tone: 'good', label: t.faster };
  if (r <= 1.1) return { tone: 'accent', label: t.onPace };
  return { tone: 'warn', label: t.slowerBy(Math.round((r - 1) * 100)) };
}
function accStatus(pct: number | null, band: [number, number], t: (typeof T)['en']): { tone: Tone; label: string } {
  if (pct == null) return { tone: 'muted', label: '—' };
  if (pct > band[1]) return { tone: 'good', label: t.aboveAvg };
  if (pct >= band[0]) return { tone: 'accent', label: t.atAvg };
  return { tone: 'warn', label: t.belowAvgShort };
}

function buildInsight({ lang, pred, rw, math, priorityDomain, tierIdx }: {
  lang: 'en' | 'zh'; pred: NonNullable<ReturnType<typeof predictedScore>>;
  rw: { pct: number | null; sec: number | null }; math: { pct: number | null; sec: number | null };
  priorityDomain?: { domain: SatDomain }; tierIdx: number;
}): string {
  const delta = pred.total - GLOBAL.total;
  const above = delta >= 0;
  // Bottleneck = the PRACTICED section with the bigger gap to its "Good" target.
  // An unpracticed section (pct null) must never win, so it scores -Infinity.
  const gap = (s: SatSection, pct: number | null) => (pct == null ? -Infinity : GOOD_ACC[s] - pct);
  const gRw = gap('reading_writing', rw.pct); const gMath = gap('math', math.pct);
  const weakSec: SatSection = gMath >= gRw ? 'math' : 'reading_writing';
  const weak = weakSec === 'math' ? math : rw;
  const strongSec: SatSection = weakSec === 'math' ? 'reading_writing' : 'math';
  const strongPct = strongSec === 'math' ? math.pct : rw.pct; // only claim a "strength" if that section has data
  const slow = weak.sec != null && weak.sec > STD_PACE[weakSec] * 1.1;
  const lowAcc = weak.pct != null && weak.pct < GOOD_ACC[weakSec];
  const nextTier = TIERS[Math.min(3, Math.max(0, tierIdx + 1))];
  const pts = Math.abs(delta);
  if (lang === 'zh') {
    const sec = (s: SatSection) => (s === 'math' ? '数学' : '阅读与写作');
    const strengthClause = strongPct != null ? `${sec(strongSec)}是你的强项；` : '';
    const reason = slow && lowAcc ? '正确率与速度都要加强' : lowAcc ? '重点在夯实基础' : slow ? '重点在提速' : '继续保持';
    const tail = priorityDomain ? `优先攻克「${domLabel(priorityDomain.domain, 'zh')}」，向「${nextTier.zh}」（${nextTier.total}+）迈进。` : `继续练习，向「${nextTier.zh}」（${nextTier.total}+）迈进。`;
    return `你比全球平均${above ? '高' : '低'} ${pts} 分。${strengthClause}${sec(weakSec)}是重点——${reason}。${tail}`;
  }
  const sec = (s: SatSection) => (s === 'math' ? 'Math' : 'Reading & Writing');
  const strengthClause = strongPct != null ? `${sec(strongSec)} is your strength; ` : '';
  const reason = slow && lowAcc ? 'both accuracy and speed need work' : lowAcc ? 'the priority is strengthening fundamentals' : slow ? 'the priority is pace' : 'keep it up';
  const tail = priorityDomain
    ? `Focus on ${domLabel(priorityDomain.domain, 'en')} first to move toward ${nextTier.en} (${nextTier.total}+).`
    : `Keep practicing to move toward ${nextTier.en} (${nextTier.total}+).`;
  return `You're ${pts} ${pts === 1 ? 'point' : 'points'} ${above ? 'above' : 'below'} the global average. ${strengthClause}${sec(weakSec)} is the priority — ${reason}. ${tail}`;
}

/** Score-trajectory sparkline: mock totals over time on a 400–1600 scale, with
 *  the four tier lines for reference and the latest score labelled. */
function Trajectory({ mocks }: { mocks: Array<{ at: number; total: number }> }) {
  const W = 640, H = 150, padL = 6, padR = 42, padT = 12, padB = 8;
  const xs = (i: number) => padL + (i / Math.max(1, mocks.length - 1)) * (W - padL - padR);
  const ys = (v: number) => padT + (1 - (Math.max(400, Math.min(1600, v)) - 400) / 1200) * (H - padT - padB);
  const pts = mocks.map((m, i) => `${xs(i)},${ys(m.total)}`).join(' ');
  const last = mocks[mocks.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }}>
      {[1030, 1200, 1350, 1500].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={ys(v)} y2={ys(v)} stroke={C.hairline as string} strokeWidth="1" strokeDasharray="3 4" />
          <text x={W - padR + 4} y={ys(v) + 3} fontSize="9" fill={C.muted as string}>{v}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={C.blue as string} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {mocks.map((m, i) => <circle key={i} cx={xs(i)} cy={ys(m.total)} r={i === mocks.length - 1 ? 4 : 2.5} fill={C.blueDeep as string} />)}
      {last ? <text x={xs(mocks.length - 1) - 6} y={ys(last.total) - 7} fontSize="12" fontWeight="700" fill={C.blueDeep as string} textAnchor="end">{last.total}</text> : null}
    </svg>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
      <div className="mb-3 text-[13px] font-bold" style={{ color: C.ink }}>{title}{sub ? <span className="ml-1.5 font-normal text-[11px]" style={{ color: C.muted }}>{sub}</span> : null}</div>
      {children}
    </div>
  );
}

function Bullet({ label, valueText, status, fillPct, markPct, band, sub }: {
  label: string; valueText: string; status: { tone: Tone; label: string };
  fillPct: number; markPct: number | null; band?: [number, number]; sub: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span style={{ color: C.muted }}>{label}</span>
        <span className="font-semibold" style={{ color: toneColor(status.tone) }}>{valueText} · {status.label}</span>
      </div>
      <div className="relative h-1.5 overflow-visible rounded-full" style={{ background: C.track }}>
        {band ? <div className="absolute inset-y-0" style={{ left: `${band[0]}%`, width: `${Math.max(2, band[1] - band[0])}%`, background: C.muted, opacity: 0.45 }} /> : null}
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, fillPct)}%`, background: toneColor(status.tone) }} />
        {markPct != null ? <div className="absolute -top-1 bottom-[-4px] w-[2px]" style={{ left: `${markPct}%`, background: C.muted }} /> : null}
      </div>
      <div className="mt-1 text-[10.5px]" style={{ color: C.muted }}>{sub}</div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string | number; tone?: Tone }) {
  const color = tone ? toneColor(tone) : C.ink;
  return (
    <div className="rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
      <div className="text-[24px] font-extrabold leading-none" style={{ color }}>{value}</div>
      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}
