'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SatQuestion, SatSection } from '@/lib/sat/types';
import { isMc, isSpr } from '@/lib/sat/types';
import { listMistakes, listDue, setMastered, removeMistake, type MistakeEntry } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, COMMON, secLabel, domLabel, skillLabel, diffLabel } from './i18n';
import { PracticeQuestion } from './PracticeQuestion';

function correctOf(q: SatQuestion): string {
  if (isMc(q)) return (q as { correct: string }).correct;
  if (isSpr(q)) return q.answer.accepted[0] ?? '';
  return '';
}

/** 错题本 — auto-collected wrong answers. Filter, review with the full question
 *  + explanation, mark mastered, or re-drill the set. */
export function MistakeNotebook({ pool, onPractice, onBack, renderExtra }: {
  pool: SatQuestion[];
  onPractice: (qs: SatQuestion[], title: string) => void;
  onBack: () => void;
  renderExtra?: (q: SatQuestion, revealed: boolean) => React.ReactNode;
}) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const t = COMMON[lang];
  const byId = useMemo(() => { const m = new Map<string, SatQuestion>(); pool.forEach((q) => m.set(q.id, q)); return m; }, [pool]);
  const [section, setSection] = useState<SatSection | 'all'>('all');
  const [showMastered, setShowMastered] = useState(false);
  const [tick, setTick] = useState(0); // re-read after mutations / cloud sync
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener('ngs-sat-progress', on);
    return () => window.removeEventListener('ngs-sat-progress', on);
  }, []);

  const mistakes = useMemo(
    () => listMistakes({ includeMastered: showMastered, ...(section === 'all' ? {} : { section }) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section, showMastered, tick],
  );
  const refresh = () => setTick((t) => t + 1);

  const resolved = mistakes.map((m) => ({ m, q: byId.get(m.id) })).filter((x): x is { m: MistakeEntry; q: SatQuestion } => Boolean(x.q));
  const activeCount = listMistakes({ includeMastered: false }).length;
  const masteredCount = listMistakes({ includeMastered: true }).filter((m) => m.mastered).length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dueQs = useMemo(() => listDue().map((m) => byId.get(m.id)).filter(Boolean) as SatQuestion[], [byId, tick]);

  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col ${dark ? 'sat-dark' : ''}`} style={{ background: C.soft, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {t.back}</button>
        <div className="text-[15px] font-bold">{lang === 'zh' ? '错题本' : 'Mistake Notebook'}</div>
        <span className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? `${activeCount} 题待复习 · ${masteredCount} 题已掌握` : `${activeCount} to review · ${masteredCount} mastered`}</span>
        <div className="ml-auto flex items-center gap-2">
          {dueQs.length ? (
            <button type="button" onClick={() => onPractice(dueQs, lang === 'zh' ? '间隔重练' : 'Spaced review · 间隔重练')}
              className="rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: C.good }} title={lang === 'zh' ? '到期的间隔复习' : 'Due for spaced-repetition review'}>
              {lang === 'zh' ? `到期复习 (${dueQs.length})` : `Review due (${dueQs.length})`}
            </button>
          ) : null}
          {resolved.length ? (
            <button type="button" onClick={() => onPractice(resolved.map((r) => r.q), lang === 'zh' ? '错题本' : 'Mistake Notebook · 错题本')}
              className="rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: C.blue }}>
              {lang === 'zh' ? `练习这些 (${resolved.length})` : `Practice these (${resolved.length})`}
            </button>
          ) : null}
          <ThemeLangToggle />
        </div>
      </header>

      <div className="flex items-center gap-3 border-b px-5 py-2.5" style={{ borderColor: C.hairline, background: C.panel }}>
        <select value={section} onChange={(e) => setSection(e.target.value as SatSection | 'all')} className="rounded-lg border px-3 py-1.5 text-[13px]" style={{ borderColor: C.border, color: C.ink, background: C.panel }}>
          <option value="all">{lang === 'zh' ? '全部部分' : 'All sections'}</option>
          <option value="reading_writing">{secLabel('reading_writing', lang)}</option>
          <option value="math">{secLabel('math', lang)}</option>
        </select>
        <label className="flex items-center gap-2 text-[13px]" style={{ color: C.muted }}>
          <input type="checkbox" checked={showMastered} onChange={(e) => setShowMastered(e.target.checked)} /> {lang === 'zh' ? '显示已掌握' : 'Show mastered'}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-[min(880px,94vw)] py-6">
          {resolved.length === 0 ? (
            <div className="rounded-xl border p-10 text-center text-[14px]" style={{ borderColor: C.border, color: C.muted, background: C.panel }}>
              {lang === 'zh'
                ? '暂无错题。做模考或刷题后,答错的题会自动收进来。'
                : 'No mistakes here yet. Take a mock or practice a skill — questions you miss land here automatically.'}
            </div>
          ) : (
            <div className="space-y-3">
              {resolved.map(({ m, q }) => {
                const isOpen = open === m.id;
                return (
                  <div key={m.id} className="rounded-lg border" style={{ borderColor: C.border, background: C.panel }}>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: m.mastered ? C.good : C.flag }}>{m.mastered ? '✓' : '✕'}</span>
                      <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.tint, color: C.blue }}>{domLabel(q.domain, lang)}</span>
                          <span className="text-[11px]" style={{ color: C.muted }}>{skillLabel(q.skill, lang)} · {diffLabel(q.difficulty, lang)} · {lang === 'zh' ? `错 ×${m.wrongCount}` : `missed ×${m.wrongCount}`}</span>
                        </div>
                        {(() => {
                          // Stems often lead with a short math expression on its own
                          // line ("3x - 7 ≤ 11\n\nWhat is…"). Show that expression as a
                          // clean mono line, then the question wrapped to two lines —
                          // instead of crushing it all into one truncated row.
                          const parts = q.stem.split(/\n+/).map((s) => s.trim()).filter(Boolean);
                          const hasLead = parts.length > 1 && parts[0].length <= 48 && !/[?.]$/.test(parts[0]);
                          const lead = hasLead ? parts[0] : '';
                          const body = hasLead ? parts.slice(1).join('  ') : parts.join('  ');
                          return (
                            <div className="mt-1 space-y-0.5">
                              {lead ? <div className="font-mono text-[13px] font-semibold tracking-tight" style={{ color: C.blueDeep }}>{lead}</div> : null}
                              <div className="line-clamp-2 text-[13px] leading-snug" style={{ color: C.ink }}>{body}</div>
                            </div>
                          );
                        })()}
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden text-[12px] sm:block" style={{ color: C.muted }}>{lang === 'zh' ? '你:' : 'you: '}<b style={{ color: C.flag }}>{m.lastAnswer}</b> · {lang === 'zh' ? '答案:' : 'ans: '}<b style={{ color: C.good }}>{correctOf(q)}</b></span>
                        <button type="button" onClick={() => { setMastered(m.id, !m.mastered); refresh(); }} className="rounded border px-2 py-1 text-[11px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>{m.mastered ? (lang === 'zh' ? '取消掌握' : 'Unmaster') : (lang === 'zh' ? '已掌握' : 'Mastered')}</button>
                        <button type="button" onClick={() => { removeMistake(m.id); refresh(); }} className="rounded border px-2 py-1 text-[11px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>{t.remove}</button>
                      </div>
                    </div>
                    {isOpen ? (
                      <div className="border-t px-4 py-4" style={{ borderColor: C.hairline }}>
                        <PracticeQuestion question={q} selected={correctOf(q)} aiChosen={m.lastAnswer} onSelect={() => {}} revealed extra={renderExtra?.(q, true)} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
