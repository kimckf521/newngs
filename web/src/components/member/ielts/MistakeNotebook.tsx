'use client';

import { useEffect, useMemo, useState } from 'react';
import type { QType } from '@/components/member/ielts/types';
import {
  listMistakes,
  listDue,
  setMastered,
  removeMistake,
  clearMistakes,
  QTYPE_LABELS,
  SKILL_LABELS,
  type MistakeEntry,
  type Skill,
} from '@/lib/ielts/progress';

/**
 * 错题本 — the IELTS mistake notebook. Wrong answers from Reading/Listening
 * attempts are collected automatically into the shared progress store; here the
 * student filters them by skill and by IELTS question TYPE, reviews the prompt
 * with their answer vs. the key, marks items mastered, or clears the set.
 *
 * There is no re-drill runner yet, so the "due for review" figure is shown as an
 * informational chip rather than a launch button.
 */
export function MistakeNotebook({ onBack, lang }: { onBack: () => void; lang: 'en' | 'zh' }) {
  const t = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  const qtypeLabel = (q: QType) => (lang === 'zh' ? QTYPE_LABELS[q].zh : QTYPE_LABELS[q].en);
  const skillLabel = (s: Skill) => (lang === 'zh' ? SKILL_LABELS[s].zh : SKILL_LABELS[s].en);

  const [skill, setSkill] = useState<Skill | 'all'>('all');
  const [qtype, setQtype] = useState<QType | 'all'>('all');
  const [showMastered, setShowMastered] = useState(false);
  const [tick, setTick] = useState(0); // re-read after mutations / cloud sync
  const [open, setOpen] = useState<string | null>(null);

  // Re-read whenever the store fires its change event (add/remove/master/clear).
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener('ngs-ielts-progress', on);
    return () => window.removeEventListener('ngs-ielts-progress', on);
  }, []);

  const all = useMemo(
    () => listMistakes({ includeMastered: showMastered }),
    [showMastered, tick],
  );

  // Question types that actually appear in the current (skill-scoped) set,
  // so the type dropdown only offers meaningful choices.
  const typeOptions = useMemo(() => {
    const seen = new Set<QType>();
    for (const m of all) {
      if (skill !== 'all' && m.skill !== skill) continue;
      seen.add(m.qtype);
    }
    return Array.from(seen);
  }, [all, skill]);

  const mistakes = useMemo(
    () =>
      all
        .filter((m) => (skill === 'all' ? true : m.skill === skill))
        .filter((m) => (qtype === 'all' ? true : m.qtype === qtype)),
    [all, skill, qtype],
  );

  const dueCount = useMemo(() => listDue().length, [tick]);
  const refresh = () => setTick((n) => n + 1);

  return (
    <div className="ngs-redesign fixed inset-0 z-[60] overflow-y-auto">
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
        {/* top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-night/80 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white/50"
          >
            {t('‹ Back', '‹ 返回')}
          </button>
          <div className="text-sm font-semibold">{t('Mistake notebook', '错题本')}</div>
          <span className="ml-auto text-xs text-white/60">
            {t(`${mistakes.length} shown`, `显示 ${mistakes.length} 题`)}
          </span>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* review status + controls */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-ngs-cyan">
              {t(`Due for review (${dueCount})`, `待复习 (${dueCount})`)}
            </span>
            <span className="text-xs text-white/60">
              {dueCount > 0
                ? t(
                    'These are due for spaced review — reopen the relevant test to re-attempt them.',
                    '这些题已到复习时间 — 重新打开对应的试卷即可再次练习。',
                  )
                : t('Nothing is due for review right now.', '当前没有待复习的题目。')}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('Clear all mistakes? This cannot be undone.', '确定清空所有错题?此操作无法撤销。'))) {
                  clearMistakes();
                  refresh();
                }
              }}
              className="ml-auto rounded-full border border-white/20 px-3 py-1 text-xs text-white/60 hover:border-rose-400/60 hover:text-rose-400"
            >
              {t('Clear all', '清空')}
            </button>
          </div>

          {/* filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value as Skill | 'all');
                setQtype('all');
              }}
              className="rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs hover:border-white/50 focus:outline-none"
            >
              <option value="all">{t('All skills', '全部技能')}</option>
              <option value="listening">{t('Listening', '听力')}</option>
              <option value="reading">{t('Reading', '阅读')}</option>
            </select>

            <select
              value={qtype}
              onChange={(e) => setQtype(e.target.value as QType | 'all')}
              className="rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs hover:border-white/50 focus:outline-none"
            >
              <option value="all">{t('All question types', '全部题型')}</option>
              {typeOptions.map((q) => (
                <option key={q} value={q}>
                  {qtypeLabel(q)}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={showMastered}
                onChange={(e) => setShowMastered(e.target.checked)}
              />
              {t('Show mastered', '显示已掌握')}
            </label>
          </div>

          {/* list */}
          {mistakes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-white/60">
              {t(
                'No mistakes here yet. Answers you miss in Reading and Listening attempts are collected here automatically.',
                '暂无错题。阅读和听力练习中答错的题目会自动收集到这里。',
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {mistakes.map((m) => (
                <MistakeRow
                  key={m.id}
                  m={m}
                  isOpen={open === m.id}
                  onToggle={() => setOpen(open === m.id ? null : m.id)}
                  lang={lang}
                  t={t}
                  qtypeLabel={qtypeLabel}
                  skillLabel={skillLabel}
                  onMaster={() => {
                    setMastered(m.id, !m.mastered);
                    refresh();
                  }}
                  onRemove={() => {
                    removeMistake(m.id);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MistakeRow({
  m,
  isOpen,
  onToggle,
  lang,
  t,
  qtypeLabel,
  skillLabel,
  onMaster,
  onRemove,
}: {
  m: MistakeEntry;
  isOpen: boolean;
  onToggle: () => void;
  lang: 'en' | 'zh';
  t: (en: string, zh: string) => string;
  qtypeLabel: (q: QType) => string;
  skillLabel: (s: Skill) => string;
  onMaster: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 ${m.mastered ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-ngs-cyan">
              {qtypeLabel(m.qtype)}
            </span>
            <span className="text-[11px] text-white/60">
              {t(
                `Cam ${m.book} · Test ${m.test} · Q${m.n}`,
                `剑桥 ${m.book} · Test ${m.test} · 第${m.n}题`,
              )}
            </span>
            <span className="text-[11px] text-white/60">· {skillLabel(m.skill)}</span>
            <span className="text-[11px] text-white/60">
              · {t(`missed ×${m.wrongCount}`, `错 ×${m.wrongCount}`)}
            </span>
            {m.mastered ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-emerald-400">
                {t('Mastered', '已掌握')}
              </span>
            ) : null}
          </div>
          <div className={`mt-1 text-sm ${isOpen ? '' : 'truncate'}`}>{m.prompt}</div>
          <div className="mt-1 text-xs">
            <span className="text-white/60">{t('Your answer: ', '你的答案:')}</span>
            <b className="text-rose-400">{m.your || t('(blank)', '(空)')}</b>
            <span className="text-white/60"> → {t('Correct: ', '正确答案:')}</span>
            <b className="text-emerald-400">{m.key}</b>
          </div>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={onMaster}
            className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white/50"
          >
            {m.mastered ? t('Un-master', '取消掌握') : t('Mastered', '已掌握')}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60 hover:border-rose-400/60 hover:text-rose-400"
          >
            {t('Remove', '移除')}
          </button>
        </div>
      </div>
    </div>
  );
}
