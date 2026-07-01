'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSatLang, useSatTheme, COMMON, type Lang } from './i18n';

/**
 * Shared, STANDALONE white Bluebook chrome for the SAT runner. Deliberately
 * does NOT import any IELTS/redesign primitives — the test app is a faithful
 * recreation of College Board's Bluebook UI, not the NGS dark/glass theme.
 * Style isolation: every full-screen root uses `fixed inset-0` + opaque
 * `bg-white` + explicit ink color + inline font-family to beat the global dark
 * `body { color:#fff; background:#0a0a12 }`.
 */

/* ----------------------------------------------------------------- tokens */

// All colours resolve to CSS variables defined in globals.css under `.sat-app`
// (light) / `.sat-app.sat-dark` (dark). Keeping the same token keys means every
// existing `C.ink` etc. becomes theme-aware with no change at the call site.
// (SVG note: var() does NOT work in SVG *presentation attributes* — use
// currentColor there and set `color` on the SVG/container instead.)
export const C = {
  blue: 'var(--sat-blue)',
  blueDeep: 'var(--sat-blue-deep)',
  link: 'var(--sat-link)',
  tint: 'var(--sat-tint)',
  ink: 'var(--sat-ink)',
  muted: 'var(--sat-muted)',
  border: 'var(--sat-border)',
  hairline: 'var(--sat-hairline)',
  barBg: 'var(--sat-bar-bg)',
  flag: 'var(--sat-flag)',
  elim: 'var(--sat-elim)',
  // surfaces (previously hardcoded #fff / #f4f5f8 / … in components)
  bg: 'var(--sat-bg)',
  panel: 'var(--sat-panel)',
  panel2: 'var(--sat-panel-2)',
  soft: 'var(--sat-soft)',
  raised: 'var(--sat-raised)',
  track: 'var(--sat-track)',
  hover: 'var(--sat-hover)',
  // semantic
  good: 'var(--sat-good)',
  goodBg: 'var(--sat-good-bg)',
  badBg: 'var(--sat-bad-bg)',
  aiBg: 'var(--sat-ai-bg)',
  hl: { yellow: '#fff38c', pink: '#ffc0da', blue: '#abdcff' },
} as const;

export const SAT_FONT = 'Inter, Arial, Helvetica, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", serif';

export function range(a: number, b: number) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export function fmtClock(secs: number) {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Per-module countdown. Pauses when `running` is false. */
export function useCountdown(initial: number, running: boolean, onExpire: () => void) {
  const [secs, setSecs] = useState(initial);
  const fired = useRef(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (secs === 0 && !fired.current) {
      fired.current = true;
      onExpire();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);
  return secs;
}

/* ------------------------------------------------------------------ icons */

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const Icon = {
  clock: (p: { size?: number }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  flag: (p: { filled?: boolean; size?: number }) => (
    // filled → red (its own colour, so it reads on any parent); outline → inherits currentColor
    <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" aria-hidden
      style={p.filled ? { color: 'var(--sat-flag)' } : undefined}
      fill={p.filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
      <path d="M6 21V4h11l-2 4 2 4H6" />
    </svg>
  ),
  calc: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h0M12 11h0M16 11h0M8 15h0M12 15h0M16 15h0M8 18h4" />
    </svg>
  ),
  ref: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  pencil: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M4 20h4L20 8l-4-4L4 16z" /><path d="M14 6l4 4" />
    </svg>
  ),
  more: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" />
    </svg>
  ),
  chevronUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} aria-hidden><path d="M6 15l6-6 6 6" /></svg>
  ),
  pin: () => (
    // style-based fills so the CSS vars resolve (var() is ignored in SVG attrs)
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ color: 'var(--sat-ink)' }}>
      <path d="M12 2c-3.3 0-6 2.7-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6z" fill="currentColor" />
      <circle cx="12" cy="8" r="2.2" style={{ fill: 'var(--sat-panel)' }} />
    </svg>
  ),
};

/* -------------------------------------------------- theme + language toggle */

/** Sun/moon theme toggle + EN/中 language toggle. Drop into any SAT header. */
export function ThemeLangToggle() {
  const { dark, toggle } = useSatTheme();
  const { lang, setLang } = useSatLang();
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={toggle} aria-label="Toggle light/dark theme" title="Light / dark"
        className="grid h-8 w-8 place-items-center rounded-md border" style={{ borderColor: C.border, color: C.ink, background: C.panel }}>
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" /></svg>
        )}
      </button>
      <div className="flex items-center rounded-md border p-0.5" style={{ borderColor: C.border, background: C.panel }}>
        {(['en', 'zh'] as Lang[]).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)} className="rounded px-2 py-0.5 text-[12px] font-bold"
            style={lang === l ? { background: C.blue, color: '#fff' } : { color: C.muted }}>
            {l === 'en' ? 'EN' : '中'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- top bar */

export function ToolButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex h-11 min-w-[58px] flex-col items-center justify-center rounded px-2 text-[11px] font-medium transition-colors"
      style={{ color: active ? C.blue : C.ink, background: active ? C.tint : 'transparent' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sat-hover)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <span aria-hidden>{icon}</span>
      <span className="mt-0.5">{label}</span>
    </button>
  );
}

export function TopBar({
  sectionLabel, secs, hidden, toggleHidden, onDirections, rightTools, moreItems,
}: {
  sectionLabel: string;
  secs?: number;
  hidden?: boolean;
  toggleHidden?: () => void;
  onDirections?: () => void;
  rightTools?: ReactNode;
  moreItems: { label: string; onClick: () => void }[];
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { lang } = useSatLang();
  const t = COMMON[lang];
  const hasTimer = typeof secs === 'number';
  const danger = hasTimer && secs! <= 300;
  return (
    <header className="relative flex h-[60px] shrink-0 items-stretch justify-between px-4" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.barBg }}>
      {/* left: module label + directions */}
      <div className="flex min-w-[220px] flex-col justify-center">
        <span className="text-[15px] font-bold" style={{ color: C.ink }}>{sectionLabel}</span>
        {onDirections ? (
          <button type="button" onClick={onDirections} className="mt-0.5 flex w-fit items-center gap-1 text-[13px] font-medium hover:underline" style={{ color: C.ink }}>
            {t.directions} <span style={{ fontSize: 10 }}>▾</span>
          </button>
        ) : null}
      </div>

      {/* center: timer */}
      <div className="flex flex-col items-center justify-center">
        {hasTimer ? (
          hidden ? (
            <button type="button" onClick={toggleHidden} className="flex items-center gap-2 rounded px-3 py-1.5 text-[15px] font-semibold" style={{ color: C.ink }} aria-label="Show timer">
              <Icon.clock /> <span style={{ color: C.muted }}>{lang === 'zh' ? '显示' : 'Show'}</span>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[22px] font-bold tabular-nums" style={{ color: danger ? C.flag : C.ink }}>
                {fmtClock(secs!)}
              </div>
              <button type="button" onClick={toggleHidden} className="rounded border px-3 text-[12px] font-medium leading-5" style={{ borderColor: C.border, color: C.ink }}>
                {lang === 'zh' ? '隐藏' : 'Hide'}
              </button>
            </>
          )
        ) : null}
      </div>

      {/* right: section tools + more + theme/lang */}
      <div className="flex min-w-[220px] items-center justify-end gap-1">
        {rightTools}
        <div className="relative">
          <ToolButton icon={<Icon.more />} label={t.more} active={moreOpen} onClick={() => setMoreOpen((v) => !v)} />
          {moreOpen ? (
            <>
              <div className="fixed inset-0 z-[70]" onClick={() => setMoreOpen(false)} />
              <div className="absolute right-0 top-[52px] z-[71] w-56 overflow-hidden rounded-md border py-1 shadow-lg" style={{ borderColor: C.border, background: C.panel }}>
                {moreItems.map((it) => (
                  <button key={it.label} type="button" onClick={() => { setMoreOpen(false); it.onClick(); }}
                    className="sat-hover block w-full px-4 py-2 text-left text-[14px]" style={{ color: C.ink }}>
                    {it.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div className="ml-1"><ThemeLangToggle /></div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ bottom nav */

export function BottomNav({
  studentName, current, total, onOpenNavigator, onBack, onNext, backDisabled, nextLabel = 'Next',
}: {
  studentName: string;
  current: number; // 1-based
  total: number;
  onOpenNavigator: () => void;
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextLabel?: string;
}) {
  const { lang } = useSatLang();
  const t = COMMON[lang];
  return (
    <footer className="relative flex h-[64px] shrink-0 items-center justify-between px-5" style={{ borderTop: `1px solid ${C.hairline}`, background: C.barBg }}>
      <div className="hidden text-[14px] font-semibold sm:block" style={{ color: C.ink }}>{studentName}</div>
      <button type="button" onClick={onOpenNavigator}
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md px-4 py-2 text-[14px] font-semibold"
        style={{ background: C.blueDeep, color: 'var(--sat-panel)' }}>
        {t.questionOf(current, total)} <Icon.chevronUp />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <button type="button" onClick={onBack} disabled={backDisabled}
          className="rounded-full px-6 py-2.5 text-[14px] font-bold disabled:opacity-40"
          style={{ background: C.tint, color: C.blue }}>
          {t.back}
        </button>
        <button type="button" onClick={onNext}
          className="rounded-full px-7 py-2.5 text-[14px] font-bold text-white"
          style={{ background: C.blue }}>
          {nextLabel}
        </button>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------- navigator popup */

function LegendDot({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.muted }}>
      <span className="grid h-6 w-6 place-items-center">{children}</span>{label}
    </div>
  );
}

export function NavGrid({
  total, current, answered, marked, onJump,
}: {
  total: number;
  current: number; // 1-based; 0 for none (review page)
  answered: Set<number>;
  marked: Set<number>;
  onJump: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2">
      {range(1, total).map((n) => {
        const isCur = n === current;
        const isAns = answered.has(n);
        const isMark = marked.has(n);
        return (
          <button key={n} type="button" onClick={() => onJump(n)}
            className="relative grid h-10 w-10 place-items-center rounded text-[14px] font-semibold"
            style={
              isAns
                ? { background: C.blue, color: '#fff', border: `1px solid ${C.blue}` }
                : { background: C.panel, color: C.ink, border: `1px dashed ${C.blue}` }
            }>
            {isCur ? <span className="absolute -top-3.5" style={{ color: C.ink }}><Icon.pin /></span> : null}
            {n}
            {isMark ? <span className="absolute -right-1 -top-1"><Icon.flag filled size={13} /></span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function NavigatorPopup({
  sectionLabel, total, current, answered, marked, onJump, onReview, onClose,
}: {
  sectionLabel: string;
  total: number;
  current: number;
  answered: Set<number>;
  marked: Set<number>;
  onJump: (i: number) => void;
  onReview: () => void;
  onClose: () => void;
}) {
  const { lang } = useSatLang();
  const leg = lang === 'zh' ? { c: '当前', u: '未作答', r: '待复查' } : { c: 'Current', u: 'Unanswered', r: 'For Review' };
  return (
    <>
      <div className="fixed inset-0 z-[74]" onClick={onClose} />
      <div className="absolute bottom-[72px] left-1/2 z-[75] w-[min(560px,92vw)] -translate-x-1/2 rounded-lg border p-4 shadow-2xl" style={{ borderColor: C.border, background: C.panel }}>
        <div className="mb-2 text-center text-[14px] font-bold" style={{ color: C.ink }}>{sectionLabel}</div>
        <div className="mb-3 flex items-center justify-center gap-4 border-y py-1.5" style={{ borderColor: C.hairline }}>
          <LegendDot label={leg.c}><Icon.pin /></LegendDot>
          <LegendDot label={leg.u}><span className="h-5 w-5 rounded" style={{ border: `1px dashed ${C.blue}` }} /></LegendDot>
          <LegendDot label={leg.r}><Icon.flag filled size={14} /></LegendDot>
        </div>
        <div className="max-h-[40vh] overflow-y-auto px-1 pt-2">
          <NavGrid total={total} current={current} answered={answered} marked={marked} onJump={onJump} />
        </div>
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={onReview} className="rounded-full px-6 py-2 text-[14px] font-bold text-white" style={{ background: C.blue }}>
            {lang === 'zh' ? '前往复查页' : 'Go to Review Page'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- review page */

export function ReviewPage({
  sectionLabel, total, answered, marked, onJump, onSubmit, submitLabel,
}: {
  sectionLabel: string;
  total: number;
  answered: Set<number>;
  marked: Set<number>;
  onJump: (i: number) => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const { lang } = useSatLang();
  const leg = lang === 'zh' ? { c: '当前', u: '未作答', r: '待复查' } : { c: 'Current', u: 'Unanswered', r: 'For Review' };
  const unanswered = range(1, total).filter((n) => !answered.has(n)).length;
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-10">
      <h1 className="text-[26px] font-bold" style={{ color: C.ink }}>{lang === 'zh' ? '检查你的作答' : 'Check Your Work'}</h1>
      <p className="mt-2 max-w-xl text-center text-[14px]" style={{ color: C.muted }}>
        {lang === 'zh'
          ? `真实考试中,在本模块时间结束前你无法进入下一模块。${unanswered > 0 ? `你还有 ${unanswered} 题未作答。` : '你可以复查这些题目的答案。'}`
          : `On test day, you won't be able to move on to the next module until time expires.${unanswered > 0 ? ` You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.` : ' For these questions, you can review your answers.'}`}
      </p>
      <div className="mt-6 w-[min(560px,92vw)] rounded-lg border p-4" style={{ borderColor: C.border, background: C.panel }}>
        <div className="mb-3 text-center text-[14px] font-bold" style={{ color: C.ink }}>{sectionLabel}</div>
        <div className="mb-3 flex items-center justify-center gap-4 border-y py-1.5" style={{ borderColor: C.hairline }}>
          <LegendDot label={leg.c}><Icon.pin /></LegendDot>
          <LegendDot label={leg.u}><span className="h-5 w-5 rounded" style={{ border: `1px dashed ${C.blue}` }} /></LegendDot>
          <LegendDot label={leg.r}><Icon.flag filled size={14} /></LegendDot>
        </div>
        <NavGrid total={total} current={0} answered={answered} marked={marked} onJump={onJump} />
      </div>
      <button type="button" onClick={onSubmit} className="mt-6 rounded-full px-8 py-2.5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
        {submitLabel}
      </button>
    </div>
  );
}

/* --------------------------------------------------------- mark / chip */

export function QuestionChip({ n }: { n: number }) {
  return (
    <span className="grid h-7 min-w-7 place-items-center rounded px-1.5 text-[14px] font-bold text-white" style={{ background: C.blue }}>{n}</span>
  );
}

export function MarkForReview({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { lang } = useSatLang();
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: on ? C.flag : C.ink }}>
      <Icon.flag filled={on} /> {lang === 'zh' ? '标记复查' : 'Mark for Review'}
    </button>
  );
}

export function EliminatorToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { lang } = useSatLang();
  return (
    <button type="button" onClick={onToggle} title={lang === 'zh' ? '划掉选项' : 'Cross out answer choices'}
      className="flex h-7 items-center gap-1 rounded border px-2 text-[13px] font-bold"
      style={{ borderColor: on ? C.blue : C.border, color: on ? C.blue : C.ink, background: on ? C.tint : C.panel }}>
      <span style={{ textDecoration: 'line-through' }}>ABC</span>
    </button>
  );
}

/* --------------------------------------------------------- choice list */

export type ChoiceItem = { id: string; text: string };

/** The MC answer block shared by RW and Math: 4 letter-badged cards, radio
 *  select, plus the per-choice cross-out control when the eliminator is on. */
export function ChoiceList({
  choices, selected, onSelect, eliminatorOn, eliminated, onToggleEliminate, serif,
  reveal, correct,
}: {
  choices: ChoiceItem[];
  selected?: string;
  onSelect: (id: string) => void;
  eliminatorOn: boolean;
  eliminated: Set<string>;
  onToggleEliminate: (id: string) => void;
  serif?: boolean;
  reveal?: boolean; // results review: show correct/incorrect coloring
  correct?: string;
}) {
  return (
    <div className="mt-4 space-y-3">
      {choices.map((c) => {
        const isSel = selected === c.id;
        const isElim = eliminated.has(c.id);
        const isCorrect = reveal && correct === c.id;
        const isWrongPick = reveal && isSel && correct !== c.id;
        let border: string = C.border, bg: string = C.panel, badgeBg: string = C.panel, badgeColor: string = C.ink, badgeBorder: string = C.border;
        if (isSel) { border = C.blue; bg = C.tint; badgeBg = C.blue; badgeColor = '#fff'; badgeBorder = C.blue; }
        if (isCorrect) { border = C.good; bg = C.goodBg; badgeBg = C.good; badgeColor = '#fff'; badgeBorder = C.good; }
        if (isWrongPick) { border = C.flag; bg = C.badBg; badgeBg = C.flag; badgeColor = '#fff'; badgeBorder = C.flag; }
        return (
          <div key={c.id} className="flex items-stretch gap-2">
            <button type="button" disabled={reveal} onClick={() => onSelect(c.id)}
              className="flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
              style={{ borderColor: border, background: bg }}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[14px] font-bold"
                style={{ background: badgeBg, color: badgeColor, borderColor: badgeBorder }}>
                {c.id}
              </span>
              <span className="text-[16px] leading-snug" style={{ color: C.ink, fontFamily: serif ? SERIF : undefined, textDecoration: isElim ? 'line-through' : undefined, opacity: isElim ? 0.55 : 1 }}>
                {c.text}
              </span>
            </button>
            {eliminatorOn && !reveal ? (
              <button type="button" onClick={() => onToggleEliminate(c.id)} title={isElim ? 'Undo' : `Cross out ${c.id}`}
                className="grid w-9 shrink-0 place-items-center rounded border text-[12px] font-bold" style={{ borderColor: C.border, color: C.muted }}>
                {isElim ? 'Undo' : <span style={{ textDecoration: 'line-through' }}>{c.id}</span>}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- modals */

function CloseLabel() {
  const { lang } = useSatLang();
  return <>{lang === 'zh' ? '关闭' : 'Close'}</>;
}

export function Modal({ title, onClose, children, width = 560, hideClose = false }: { title: string; onClose: () => void; children: ReactNode; width?: number; hideClose?: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="max-h-[85vh] overflow-y-auto rounded-lg p-6 shadow-2xl" style={{ width: `min(${width}px, 94vw)`, background: C.panel }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-[18px] font-bold" style={{ color: C.ink }}>{title}</h2>
          <button type="button" onClick={onClose} className="sat-hover rounded p-1 text-[20px] leading-none" style={{ color: C.muted }} aria-label="Close">×</button>
        </div>
        <div className="text-[14px] leading-relaxed" style={{ color: C.ink }}>{children}</div>
        {hideClose ? null : (
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-full px-6 py-2 text-[14px] font-bold text-white" style={{ background: C.blue }}><CloseLabel /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export const DIRECTIONS = {
  reading_writing:
    'The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer to the question based on the passage(s). All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.',
  math:
    'The questions in this section address a number of important math skills. Use of a calculator is permitted for all questions. A reference sheet, calculator, and these directions can be accessed throughout the test.\n\nUnless otherwise indicated: All variables and expressions represent real numbers. Figures provided are drawn to scale. All figures lie in a plane. The domain of a given function f is the set of all real numbers x for which f(x) is a real number.\n\nFor multiple-choice questions, solve each problem and choose the correct answer from the choices provided. For student-produced response questions, solve each problem and enter your answer as described below. If your answer is a fraction that doesn’t fit in the space, enter the decimal equivalent. If your answer is a decimal that doesn’t fit, enter it by truncating or rounding at the fourth digit. If your answer is negative, use a negative sign.',
} as const;
