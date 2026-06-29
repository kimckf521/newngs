'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import rawTest from './data/cam15-test1-reading.json';
import type { ColorTheme, Passage, QGroup, ReadingTest, TextSize } from './types';
import { scoreGroup, type Verdict } from './scoring';
import {
  BottomNav, GroupView, ResultsOverlay, SettingsPanel, SIZE, THEME, TopBar, academicReadingBand, range, useCountdown,
} from './shared';

const test = rawTest as unknown as ReadingTest;

type Highlight = { id: string; para: string; start: number; end: number; note?: string };
type SelRange = { para: string; start: number; end: number };
type Menu = { x: number; y: number; sel?: SelRange; hlId?: string };

export function ReadingSection({
  theme,
  size,
  setTheme,
  setSize,
  onExit,
}: {
  theme: ColorTheme;
  size: TextSize;
  setTheme: (t: ColorTheme) => void;
  setSize: (s: TextSize) => void;
  onExit: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(1);
  const [split, setSplit] = useState(50);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [notePos, setNotePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [secs, setSecs] = useCountdown(test.timeLimitMinutes * 60, !submitted, () => setSubmitted(true));
  const [timerHidden, setTimerHidden] = useState(false);
  const idRef = useRef(0);

  const passageById = useMemo(() => {
    const m = new Map<number, Passage>();
    test.passages.forEach((p) => m.set(p.id, p));
    return m;
  }, []);
  const groupOfQ = useMemo(() => {
    const m = new Map<number, QGroup>();
    test.questionGroups.forEach((g) => g.questions.forEach((q) => m.set(q.n, g)));
    return m;
  }, []);
  const currentPart = groupOfQ.get(current)?.passageId ?? 1;
  const passage = passageById.get(currentPart)!;
  const partGroups = test.questionGroups.filter((g) => g.passageId === currentPart);

  const setAnswer = useCallback((n: number, v: string) => setAnswers((a) => ({ ...a, [n]: v })), []);
  const toggleFlag = useCallback((n: number) => {
    setFlagged((f) => {
      const next = new Set(f);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }, []);
  const isAnswered = useCallback(
    (n: number) => {
      const g = groupOfQ.get(n)!;
      if (g.type === 'mcq' && /\bTWO\b/i.test(g.instructions)) {
        return (answers[g.questions[0].n] || '').split(',').filter(Boolean).length >= 2;
      }
      return !!answers[n];
    },
    [answers, groupOfQ]
  );

  const splitRef = useRef<HTMLDivElement>(null);
  const onDrag = useCallback(() => {
    const el = splitRef.current;
    if (!el) return;
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setSplit(Math.min(72, Math.max(28, ((ev.clientX - r.left) / r.width) * 100)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, []);

  // Read the current text selection, if it sits inside a single passage paragraph.
  const getSelection = useCallback((): SelRange | null => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    const startEl = (r.startContainer.parentElement as HTMLElement)?.closest('[data-para]');
    if (!startEl || startEl !== (r.endContainer.parentElement as HTMLElement)?.closest('[data-para]')) return null;
    const para = startEl.getAttribute('data-para')!;
    const pre = document.createRange();
    pre.selectNodeContents(startEl);
    pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    const end = start + r.toString().length;
    if (end <= start) return null;
    return { para, start, end };
  }, []);

  // Right-click → Highlight / Note (real-test interaction). Right-click on an
  // existing highlight → Edit note / Remove highlight.
  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const hlEl = (e.target as HTMLElement).closest('[data-hl-id]');
      const x = Math.min(e.clientX, window.innerWidth - 180);
      const y = Math.min(e.clientY, window.innerHeight - 110);
      if (hlEl) {
        e.preventDefault();
        setMenu({ x, y, hlId: hlEl.getAttribute('data-hl-id')! });
        return;
      }
      const sel = getSelection();
      if (sel) {
        e.preventDefault();
        setMenu({ x, y, sel });
      } else {
        setMenu(null);
      }
    },
    [getSelection]
  );

  const addHighlight = (sel: SelRange) => {
    const id = `hl-${++idRef.current}`;
    setHighlights((h) => [...h, { id, ...sel }]);
    window.getSelection()?.removeAllRanges();
    return id;
  };
  const openNote = (id: string, x: number, y: number) => {
    setNotePos({ x: Math.min(x, window.innerWidth - 280), y: Math.min(y, window.innerHeight - 170) });
    setNoteEditId(id);
  };
  const removeHighlight = (id: string) => {
    setHighlights((h) => h.filter((x) => x.id !== id));
    if (noteEditId === id) setNoteEditId(null);
  };
  const setNote = (id: string, note: string) => setHighlights((h) => h.map((x) => (x.id === id ? { ...x, note } : x)));

  const verdicts = useMemo<Verdict[]>(
    () => (submitted ? test.questionGroups.flatMap((g) => scoreGroup(g, answers)) : []),
    [submitted, answers]
  );
  const score = verdicts.filter((v) => v.correct).length;
  const th = THEME[theme];
  const answeredCount = range(1, 40).filter(isAnswered).length;
  const menuHl = menu?.hlId ? highlights.find((h) => h.id === menu.hlId) : undefined;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar label="IELTS Academic Reading" secs={secs} hidden={timerHidden} toggleHidden={() => setTimerHidden((v) => !v)} onSettings={() => setSettingsOpen(true)} onExit={onExit} />

      <div ref={splitRef} className="relative flex min-h-0 flex-1" style={{ background: th.bg, color: th.fg }}>
        <section className="min-h-0 overflow-y-auto px-6 py-5" style={{ width: `${split}%`, fontSize: SIZE[size], lineHeight: 1.7 }} onContextMenu={onContextMenu}>
          <div className="mb-3 border-b border-current/20 pb-2 text-[0.8em] opacity-90">
            <span className="font-bold">Part {currentPart}</span>
            <span className="ml-2">Read the passage and answer the questions. Select text and right-click to highlight or add a note.</span>
          </div>
          <h2 className="mb-1 text-[1.35em] font-bold">{passage.title}</h2>
          {passage.subtitle ? <p className="mb-3 italic opacity-80">{passage.subtitle}</p> : null}
          <div className="space-y-3">
            {passage.paragraphs.map((p, i) => {
              const key = `${passage.id}-${i}`;
              return (
                <p key={key} className="flex gap-2">
                  {p.label ? <span className="shrink-0 font-bold">{p.label}</span> : null}
                  <span data-para={key} style={{ whiteSpace: 'pre-wrap' }}>
                    {renderHighlighted(p.text, highlights.filter((h) => h.para === key), th.mark, openNote)}
                  </span>
                </p>
              );
            })}
          </div>
        </section>

        <div onPointerDown={onDrag} className="group relative w-2 shrink-0 cursor-col-resize bg-[#cfcfcf]" title="Drag to resize">
          <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            <span className="h-10 w-[3px] rounded bg-[#8a8a8a] group-hover:bg-[#555]" />
          </div>
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto px-6 py-5" style={{ width: `${100 - split}%`, fontSize: SIZE[size], lineHeight: 1.6 }}>
          {partGroups.map((g) => (
            <GroupView key={g.range} group={g} answers={answers} setAnswer={setAnswer} current={current} setCurrent={setCurrent} submitted={submitted} inputBg={th.input} fg={th.fg} />
          ))}
        </section>
      </div>

      <BottomNav
        total={40}
        parts={[['Part 1', range(1, 13)], ['Part 2', range(14, 26)], ['Part 3', range(27, 40)]]}
        current={current}
        setCurrent={setCurrent}
        isAnswered={isAnswered}
        flagged={flagged}
        toggleFlag={toggleFlag}
        onSubmit={() => setSubmitted(true)}
      />

      {/* right-click context menu */}
      {menu ? (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setMenu(null)} onContextMenu={(e) => { e.preventDefault(); setMenu(null); }} />
          <div className="fixed z-[71] w-44 overflow-hidden rounded border border-[#bbb] bg-white py-1 text-[13px] text-[#222] shadow-xl" style={{ left: menu.x, top: menu.y, fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {menu.sel ? (
              <>
                <MenuItem onClick={() => { addHighlight(menu.sel!); setMenu(null); }}>Highlight</MenuItem>
                <MenuItem onClick={() => { const id = addHighlight(menu.sel!); openNote(id, menu.x, menu.y); setMenu(null); }}>Add note</MenuItem>
              </>
            ) : null}
            {menu.hlId ? (
              <>
                <MenuItem onClick={() => { openNote(menu.hlId!, menu.x, menu.y); setMenu(null); }}>{menuHl?.note ? 'Edit note' : 'Add note'}</MenuItem>
                <MenuItem onClick={() => { removeHighlight(menu.hlId!); setMenu(null); }}>Remove highlight</MenuItem>
              </>
            ) : null}
          </div>
        </>
      ) : null}

      {/* note editor popover */}
      {noteEditId ? (
        (() => {
          const hl = highlights.find((h) => h.id === noteEditId);
          if (!hl) return null;
          return (
            <>
              <div className="fixed inset-0 z-[72]" onClick={() => setNoteEditId(null)} />
              <div className="fixed z-[73] w-64 rounded border border-[#bbb] bg-white p-2.5 shadow-2xl" style={{ left: notePos.x, top: notePos.y, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#d97706]"><span aria-hidden>●</span> Note</div>
                <textarea
                  autoFocus
                  value={hl.note || ''}
                  onChange={(e) => setNote(noteEditId, e.target.value)}
                  placeholder="Type a note…"
                  rows={4}
                  className="w-full resize-none rounded border border-[#ccc] p-2 text-[13px] text-[#222] outline-none focus:border-[#1565c0]"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <button type="button" onClick={() => removeHighlight(noteEditId)} className="text-[12px] text-[#c8102e] hover:underline">Delete</button>
                  <button type="button" onClick={() => setNoteEditId(null)} className="rounded bg-[#1565c0] px-3 py-1 text-[12px] font-bold text-white hover:bg-[#0f4ea0]">Done</button>
                </div>
              </div>
            </>
          );
        })()
      ) : null}

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} onClose={() => setSettingsOpen(false)} /> : null}

      {submitted ? (
        <ResultsOverlay
          title="Reading — results"
          subtitle="Cambridge IELTS 15 · Academic Reading · Test 1"
          score={score}
          total={40}
          band={academicReadingBand(score)}
          verdicts={verdicts}
          answered={answeredCount}
          onReview={() => setSubmitted(false)}
          onRestart={() => {
            setAnswers({});
            setFlagged(new Set());
            setHighlights([]);
            setSecs(test.timeLimitMinutes * 60);
            setCurrent(1);
            setSubmitted(false);
          }}
        />
      ) : null}
    </div>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="block w-full px-3 py-1.5 text-left hover:bg-[#e8f0fb]">
      {children}
    </button>
  );
}

function renderHighlighted(
  text: string,
  ranges: Highlight[],
  mark: string,
  onOpenNote: (id: string, x: number, y: number) => void,
) {
  if (ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((r) => {
    if (r.start > cursor) out.push(text.slice(cursor, r.start));
    out.push(
      <mark key={r.id} data-hl-id={r.id} style={{ background: mark, color: 'inherit', padding: '0 1px' }}>
        {text.slice(r.start, r.end)}
      </mark>
    );
    if (r.note) {
      out.push(
        <button
          key={`${r.id}-note`}
          type="button"
          title={r.note}
          onClick={(e) => onOpenNote(r.id, e.clientX, e.clientY)}
          style={{ color: '#d97706', fontSize: '0.7em', verticalAlign: 'super', margin: '0 1px', cursor: 'pointer' }}
        >
          ●
        </button>
      );
    }
    cursor = Math.max(cursor, r.end);
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
