'use client';

import { useEffect, useState } from 'react';
import type { QType } from '@/components/member/ielts/types';
import {
  getStats,
  predictedOverall,
  latestBands,
  quickCounts,
  QTYPE_LABELS,
  SKILL_LABELS,
  type ProgressStats,
  type Skill,
} from '@/lib/ielts/progress';

/**
 * 数据看板 — the IELTS Practice Center progress dashboard. Reads the accumulated
 * progress store into a real learning view: a predicted OVERALL band (mean of
 * the four skills), per-skill sub-bands, headline stat tiles, accuracy bucketed
 * by IELTS question TYPE (weakest first), and a 14-day activity chart.
 *
 * IELTS-native, not a copy of the SAT board: the score axis is a 0–9 band and
 * the accuracy axis is the question type that learners actually target.
 */

const SKILL_ORDER: Skill[] = ['listening', 'reading', 'writing', 'speaking'];

/** Show a band as a one-decimal number ("6.5", "7.0") or an em dash if absent. */
function fmtBand(b: number | null | undefined): string {
  return typeof b === 'number' ? b.toFixed(1) : '—';
}

/** Build the last 14 calendar days (oldest → newest) as YYYY-MM-DD keys. */
function last14Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    out.push(
      `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
    );
  }
  return out;
}

export function ProgressDashboard({ onBack, lang }: { onBack: () => void; lang: 'en' | 'zh' }) {
  const t = (en: string, zh: string): string => (lang === 'zh' ? zh : en);

  const [stats, setStats] = useState<ProgressStats>(() => getStats());
  const [pred, setPred] = useState<ReturnType<typeof predictedOverall>>(() => predictedOverall());
  const [bands, setBands] = useState<Partial<Record<Skill, number>>>(() => latestBands());
  const [counts, setCounts] = useState<ReturnType<typeof quickCounts>>(() => quickCounts());

  useEffect(() => {
    const refresh = () => {
      setStats(getStats());
      setPred(predictedOverall());
      setBands(latestBands());
      setCounts(quickCounts());
    };
    refresh();
    window.addEventListener('ngs-ielts-progress', refresh);
    return () => window.removeEventListener('ngs-ielts-progress', refresh);
  }, []);

  const accuracy = stats.totalAnswered
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  const byType = stats.byType.filter((tp) => tp.attempted > 0);

  // 14-day activity: fill missing days with zeros, tint by that day's accuracy.
  const dayMap = new Map(stats.byDay.map((d) => [d.day, d]));
  const activity = last14Days().map((day) => {
    const d = dayMap.get(day);
    const attempted = d?.attempted ?? 0;
    const correct = d?.correct ?? 0;
    return { day, attempted, correct, pct: attempted ? Math.round((correct / attempted) * 100) : 0 };
  });
  const maxAttempted = Math.max(1, ...activity.map((d) => d.attempted));

  const accColor = (pct: number): string =>
    pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-ngs-cyan' : 'bg-rose-400';

  return (
    <div className="ngs-redesign fixed inset-0 z-[60] overflow-y-auto">
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
        {/* top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/10 bg-night/80 px-6 backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[13px] font-semibold text-white/80 transition hover:bg-white/10"
          >
            ‹ {t('Back', '返回')}
          </button>
          <h1 className="text-[15px] font-bold">{t('Dashboard', '数据看板')}</h1>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* 1. predicted overall band + per-skill sub-bands */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-center">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                  {t('Predicted overall', '预测总分')}
                </div>
                {pred ? (
                  <>
                    <div className="mt-1 bg-ngs-gradient bg-clip-text text-6xl font-bold leading-none text-transparent">
                      {fmtBand(pred.overall)}
                    </div>
                    <p className="mt-2 text-[12px] text-white/60">
                      {t(
                        `Mean of your latest bands across ${pred.skillsCount} skill${pred.skillsCount === 1 ? '' : 's'}.`,
                        `基于你最近 ${pred.skillsCount} 项技能成绩的平均分。`,
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 max-w-xs text-[14px] text-white/60">
                    {t(
                      'Answer a couple of sections to unlock your predicted band.',
                      '完成几个部分即可解锁预测分数。',
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SKILL_ORDER.map((skill) => {
                  const meta = SKILL_LABELS[skill];
                  const band = bands[skill];
                  return (
                    <div
                      key={skill}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
                    >
                      <div className="text-lg leading-none" aria-hidden>
                        {meta.icon}
                      </div>
                      <div className="mt-2 text-2xl font-bold leading-none text-white">
                        {fmtBand(band)}
                      </div>
                      <div className="mt-1 text-[11px] text-white/60">
                        {lang === 'zh' ? meta.zh : meta.en}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2. stat tiles */}
          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label={t('Questions answered', '已答题数')} value={stats.totalAnswered} />
            <StatTile
              label={t('Overall accuracy', '总正确率')}
              value={`${accuracy}%`}
              accent={stats.totalAnswered > 0}
            />
            <StatTile label={t('Day streak', '连续天数')} value={stats.streakDays} />
            <StatTile label={t('To review', '待复习')} value={counts.mistakes} />
          </section>

          {/* 3. accuracy by question type */}
          <section className="mt-8">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-[15px] font-bold">
                {t('Accuracy by question type', '各题型正确率')}
              </h2>
              <span className="text-[12px] text-white/50">{t('weakest first', '最弱在前')}</span>
            </div>

            {byType.length ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                {byType.map((tp) => {
                  const pct = Math.round((tp.correct / tp.attempted) * 100);
                  const meta = QTYPE_LABELS[tp.qtype as QType];
                  const label = meta ? (lang === 'zh' ? meta.zh : meta.en) : tp.qtype;
                  return (
                    <div key={tp.qtype} className="flex items-center gap-3">
                      <div className="w-40 shrink-0 truncate text-[13px] font-medium text-white/80" title={label}>
                        {label}
                      </div>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-ngs-cyan/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 shrink-0 text-right text-[12px] tabular-nums text-white/60">
                        {tp.correct} / {tp.attempted} · {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-[13px] text-white/60">
                {t(
                  'This fills in as you practise — accuracy for each question type appears here.',
                  '随着你的练习,这里会显示各题型的正确率。',
                )}
              </p>
            )}
          </section>

          {/* 4. 14-day activity */}
          <section className="mt-8">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-[15px] font-bold">{t('Activity', '活跃度')}</h2>
              <span className="text-[12px] text-white/50">{t('last 14 days', '近 14 天')}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex h-28 items-end gap-1.5">
                {activity.map((d) => (
                  <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-1.5"
                    title={`${d.day}: ${d.correct} / ${d.attempted}${d.attempted ? ` (${d.pct}%)` : ''}`}
                  >
                    <div
                      className={`w-full rounded-t ${d.attempted ? accColor(d.pct) : 'bg-white/10'}`}
                      style={{
                        height: d.attempted
                          ? `${Math.max(6, Math.round((d.attempted / maxAttempted) * 88))}px`
                          : '4px',
                      }}
                    />
                    <span className="text-[9px] tabular-nums text-white/40">{d.day.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className={`text-4xl font-bold leading-none ${accent ? 'text-ngs-cyan' : 'text-white'}`}>
        {value}
      </div>
      <div className="mt-2 text-[12px] text-white/60">{label}</div>
    </div>
  );
}
