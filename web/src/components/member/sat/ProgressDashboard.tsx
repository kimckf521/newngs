'use client';

import { useEffect, useMemo, useState } from 'react';
import { type SatSkill } from '@/lib/sat/types';
import { getStats, predictedScore } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, secLabel, skillLabel } from './i18n';

/** 数据看板 — reads the accumulated progress store into a real learning view:
 *  predicted score, accuracy by skill (weakest first), time per question,
 *  activity over time, and the notebook/mastery/vocab counts. */
export function ProgressDashboard({ onBack, onPracticeSkill }: { onBack: () => void; onPracticeSkill?: (skill: SatSkill) => void }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener('ngs-sat-progress', on);
    return () => window.removeEventListener('ngs-sat-progress', on);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pred = useMemo(() => predictedScore(), [tick]);
  const acc = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  // weakest skills: lowest accuracy among skills with ≥3 attempts
  const skills = [...stats.bySkill]
    .filter((s) => s.attempted >= 1)
    .map((s) => ({ ...s, pct: Math.round((s.correct / s.attempted) * 100) }))
    .sort((a, b) => a.pct - b.pct || b.attempted - a.attempted);

  const days = stats.byDay.slice(-14);
  const maxDay = Math.max(1, ...days.map((d) => d.attempted));

  return (
    <div className={`sat-app ${dark ? 'sat-dark' : ''} fixed inset-0 z-[60] flex flex-col overflow-y-auto`} style={{ background: C.soft, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {lang === 'zh' ? '返回' : 'Back'}</button>
        <div className="text-[15px] font-bold">{lang === 'zh' ? '数据看板' : 'Progress Dashboard'}</div>
        <div className="ml-auto"><ThemeLangToggle /></div>
      </header>

      <div className="mx-auto w-[min(900px,94vw)] py-8">
        {stats.totalAnswered === 0 ? (
          <div className="rounded-xl border p-10 text-center text-[14px]" style={{ background: C.panel, borderColor: C.border, color: C.muted }}>
            {lang === 'zh'
              ? '暂无练习数据。做模考或刷题后,这里会显示你的进度。'
              : 'No practice data yet. Take a mock or drill a skill, and your progress shows up here.'}
          </div>
        ) : (
          <>
            {/* predicted score */}
            <div className="rounded-2xl border p-6 text-center" style={{ background: C.panel, borderColor: C.border }}>
              <div className="text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>{lang === 'zh' ? '预测分数' : 'Predicted Score'}</div>
              {pred ? (
                <>
                  <div className="mt-1 text-[56px] font-extrabold leading-none" style={{ color: C.blueDeep }}>{pred.total}</div>
                  <div className="mt-2 flex justify-center gap-8 text-[14px]">
                    <span style={{ color: C.muted }}>R&amp;W <b style={{ color: C.blue }}>{pred.rw || '—'}</b> <span className="text-[11px]">({pred.rwSamples})</span></span>
                    <span style={{ color: C.muted }}>Math <b style={{ color: C.blue }}>{pred.math || '—'}</b> <span className="text-[11px]">({pred.mathSamples})</span></span>
                  </div>
                  <p className="mt-2 text-[11px]" style={{ color: C.muted }}>{lang === 'zh' ? `基于你已作答 ${pred.samples} 题的正确率估算` : `Estimated from your accuracy on ${pred.samples} answered questions`}</p>
                </>
              ) : (
                <p className="mt-3 text-[14px]" style={{ color: C.muted }}>{lang === 'zh' ? '再多做几题即可解锁预测分数。' : 'Answer a few more questions to unlock a predicted score.'}</p>
              )}
            </div>

            {/* stat tiles */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile label={lang === 'zh' ? '已答' : 'Answered'} value={stats.totalAnswered} />
              <Tile label={lang === 'zh' ? '正确率' : 'Accuracy'} value={`${acc}%`} tone={acc >= 70 ? 'good' : acc >= 40 ? 'mid' : 'bad'} />
              <Tile label={lang === 'zh' ? '连续天数' : 'Day streak'} value={stats.streakDays} />
              <Tile label={lang === 'zh' ? '待复习' : 'To review'} value={stats.mistakeCount} tone={stats.mistakeCount ? 'bad' : 'good'} />
            </div>

            {/* accuracy by skill */}
            <div className="mt-6">
              <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.ink }}>{lang === 'zh' ? '各考点正确率' : 'Accuracy by skill'} <span className="font-normal text-[12px]" style={{ color: C.muted }}>({lang === 'zh' ? '最弱在前' : 'weakest first'})</span></h2>
              <div className="overflow-hidden rounded-xl border" style={{ background: C.panel, borderColor: C.border }}>
                {skills.map((s) => (
                  <div key={s.skill} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0" style={{ borderColor: C.hairline }}>
                    <div className="w-56 shrink-0 truncate text-[13px] font-semibold" title={skillLabel(s.skill, lang)}>{skillLabel(s.skill, lang)}</div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: C.track }}>
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.pct >= 70 ? C.good : s.pct >= 40 ? C.blue : C.flag }} />
                    </div>
                    <div className="w-24 shrink-0 text-right text-[12px] tabular-nums" style={{ color: C.muted }}>{s.correct}/{s.attempted} · {s.pct}%</div>
                    {onPracticeSkill ? (
                      <button type="button" onClick={() => onPracticeSkill(s.skill)} className="shrink-0 rounded border px-2 py-1 text-[11px] font-semibold" style={{ borderColor: C.border, color: C.blue }}>{lang === 'zh' ? '刷题' : 'Drill'}</button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* time per section + activity */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
                <h3 className="mb-3 text-[14px] font-bold" style={{ color: C.ink }}>{lang === 'zh' ? '每部分用时' : 'Time per section'}</h3>
                {stats.bySection.filter((s) => s.avgMs > 0).length ? stats.bySection.map((s) => (
                  <div key={s.section} className="flex items-center justify-between py-1.5 text-[13px]">
                    <span style={{ color: C.muted }}>{secLabel(s.section, lang)}</span>
                    <span className="font-semibold tabular-nums" style={{ color: C.ink }}>{s.avgMs ? `${(s.avgMs / 1000).toFixed(1)}s` : '—'}</span>
                  </div>
                )) : <p className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? '在考点练习中会记录用时。' : 'Timing is recorded during skill practice.'}</p>}
              </div>

              <div className="rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
                <h3 className="mb-3 text-[14px] font-bold" style={{ color: C.ink }}>{lang === 'zh' ? '活跃度' : 'Activity'} <span className="font-normal text-[11px]" style={{ color: C.muted }}>({lang === 'zh' ? '近 14 天' : 'last 14 days'})</span></h3>
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string | number; tone?: 'good' | 'mid' | 'bad' }) {
  const color = tone === 'good' ? C.good : tone === 'bad' ? C.flag : tone === 'mid' ? C.blue : C.ink;
  return (
    <div className="rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
      <div className="text-[24px] font-extrabold leading-none" style={{ color }}>{value}</div>
      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}
