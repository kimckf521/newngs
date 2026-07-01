'use client';

import { useRef, useState } from 'react';
import type { SatRwQuestion } from '@/lib/sat/types';
import { C, SERIF, ChoiceList, QuestionChip, MarkForReview, EliminatorToggle } from './shared';
import { useSatLang, COMMON } from './i18n';
import { useSelectionMenu } from './SelectionMenu';

export type Highlight = { id: string; start: number; end: number; color: string; underline?: boolean; note?: string };

const HL_COLORS = [C.hl.yellow, C.hl.pink, C.hl.blue];

/** Character offset of (node, offset) within `root`'s text content. */
function offsetWithin(root: Node, node: Node, nodeOffset: number): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let cur = walker.nextNode();
  while (cur) {
    if (cur === node) return total + nodeOffset;
    total += (cur.textContent || '').length;
    cur = walker.nextNode();
  }
  return total;
}

export function RwModule({
  question, number, answer, onAnswer, marked, onToggleMark,
  eliminatorOn, setEliminatorOn, eliminated, onToggleEliminate,
  highlights, setHighlights, annotateOn, split, setSplit,
  reveal,
}: {
  question: SatRwQuestion;
  number: number;
  answer?: string;
  onAnswer: (v: string) => void;
  marked: boolean;
  onToggleMark: () => void;
  eliminatorOn: boolean;
  setEliminatorOn: (v: boolean) => void;
  eliminated: Set<string>;
  onToggleEliminate: (id: string) => void;
  highlights: Highlight[];
  setHighlights: (hs: Highlight[]) => void;
  annotateOn: boolean;
  split: number;
  setSplit: (n: number) => void;
  reveal?: boolean;
}) {
  const { lang } = useSatLang();
  const { onContextMenu: onSelectionContextMenu, overlay: selectionOverlay } = useSelectionMenu();
  const splitRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{ x: number; y: number; start: number; end: number; existing?: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  function onDragDivider(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const rect = splitRef.current?.getBoundingClientRect();
    function move(ev: PointerEvent) {
      if (!rect) return;
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(72, Math.max(28, pct)));
    }
    function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function onMouseUp(e: React.MouseEvent) {
    if (e.button !== 0) return; // ignore right/middle click — that drives the translate menu, not annotate
    if (!annotateOn || reveal) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passRef.current) { return; }
    const r = sel.getRangeAt(0);
    if (!passRef.current.contains(r.commonAncestorContainer)) return;
    const start = offsetWithin(passRef.current, r.startContainer, r.startOffset);
    const end = offsetWithin(passRef.current, r.endContainer, r.endOffset);
    if (end <= start) return;
    const rect = r.getBoundingClientRect();
    const box = splitRef.current?.getBoundingClientRect();
    setNoteDraft(''); setNoteOpen(false);
    setPopover({ x: rect.left - (box?.left ?? 0) + rect.width / 2, y: rect.top - (box?.top ?? 0) - 8, start, end });
  }

  // open the editor for an existing highlight (loads its note)
  function openExisting(h: Highlight) {
    if (reveal) return;
    setNoteDraft(h.note || ''); setNoteOpen(Boolean(h.note));
    setPopover({ x: 0, y: 0, start: h.start, end: h.end, existing: h.id });
  }

  function applyHighlight(color: string, underline = false) {
    if (!popover) return;
    // Drop overlapping highlights, then add the new one (carrying any drafted note).
    const kept = highlights.filter((h) => h.end <= popover.start || h.start >= popover.end);
    setHighlights([...kept, { id: `h${Date.now()}`, start: popover.start, end: popover.end, color, underline, note: noteDraft.trim() || undefined }]);
    setPopover(null); setNoteDraft(''); setNoteOpen(false);
    window.getSelection()?.removeAllRanges();
  }
  function saveNote() {
    if (!popover?.existing) return;
    setHighlights(highlights.map((h) => (h.id === popover.existing ? { ...h, note: noteDraft.trim() || undefined } : h)));
    setPopover(null); setNoteDraft(''); setNoteOpen(false);
  }
  function clearAt(start: number, end: number) {
    setHighlights(highlights.filter((h) => !(h.start === start && h.end === end)));
    setPopover(null); setNoteDraft(''); setNoteOpen(false);
  }

  const text = question.passage;
  const segments = buildSegments(text, highlights);

  return (
    <div ref={splitRef} className="relative flex min-h-0 flex-1">
      {/* passage pane */}
      <section onContextMenu={onSelectionContextMenu} className="min-h-0 overflow-y-auto px-7 py-6" style={{ width: `${split}%` }}>
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
          {question.passageB ? (lang === 'zh' ? '文本 1 和 文本 2' : 'Text 1 & Text 2') : (lang === 'zh' ? '文章' : 'Passage')}
        </div>
        <div ref={passRef} onMouseUp={onMouseUp} className="whitespace-pre-wrap text-[17px] leading-[1.7]" style={{ fontFamily: SERIF, color: C.ink }}>
          {segments.map((s, i) =>
            s.hl ? (
              <mark key={i} onClick={() => openExisting(s.hl!)} title={s.hl.note || undefined}
                style={{ background: s.hl.color, textDecoration: s.hl.underline ? 'underline' : undefined, cursor: 'pointer', padding: '1px 0' }}>
                {s.text}
                {s.hl.note ? <sup style={{ color: C.blue, fontSize: '0.7em' }} title={s.hl.note}> 📝</sup> : null}
              </mark>
            ) : (
              <span key={i}>{s.text}</span>
            ),
          )}
        </div>
        {question.passageB ? (
          <div className="mt-5 whitespace-pre-wrap text-[17px] leading-[1.7]" style={{ fontFamily: SERIF, color: C.ink }}>{question.passageB}</div>
        ) : null}

        {popover ? (
          <div className="absolute z-[76] -translate-x-1/2 -translate-y-full rounded-lg border p-1.5 shadow-xl"
            style={{ left: popover.x, top: popover.y, borderColor: C.border, background: C.panel, minWidth: noteOpen ? 220 : undefined }} onMouseDown={(e) => e.preventDefault()}>
            <div className="flex items-center gap-1.5">
              {HL_COLORS.map((col) => (
                <button key={col} type="button" onClick={() => (popover.existing ? clearAt(popover.start, popover.end) : applyHighlight(col))}
                  className="h-6 w-6 rounded-full border" style={{ background: col, borderColor: C.border }} title={lang === 'zh' ? '高亮' : 'Highlight'} />
              ))}
              <button type="button" onClick={() => applyHighlight(C.hl.yellow, true)} className="rounded px-2 py-1 text-[12px] font-semibold underline" style={{ color: C.ink }} title={lang === 'zh' ? '下划线' : 'Underline'}>U</button>
              <button type="button" onClick={() => setNoteOpen((v) => !v)} className="rounded px-2 py-1 text-[12px] font-semibold" style={{ background: noteOpen ? C.tint : 'transparent', color: noteOpen ? C.blue : C.ink }} title={lang === 'zh' ? '笔记' : 'Note'}>
                📝 {lang === 'zh' ? '笔记' : 'Note'}
              </button>
              <button type="button" onClick={() => (popover.existing ? clearAt(popover.start, popover.end) : setPopover(null))} className="rounded px-2 py-1 text-[12px]" style={{ color: C.muted }}>
                {popover.existing ? COMMON[lang].remove : COMMON[lang].cancel}
              </button>
            </div>
            {noteOpen ? (
              <div className="mt-1.5">
                <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3}
                  placeholder={lang === 'zh' ? '在此写笔记…' : 'Write a note…'} autoFocus
                  className="w-full rounded border px-2 py-1.5 text-[13px] outline-none" style={{ borderColor: C.border, color: C.ink, background: C.panel, fontFamily: 'Inter, sans-serif' }} />
                <div className="mt-1 flex justify-end">
                  <button type="button" onClick={() => (popover.existing ? saveNote() : applyHighlight(HL_COLORS[0]))}
                    className="rounded-full px-3 py-1 text-[12px] font-bold text-white" style={{ background: C.blue }}>
                    {lang === 'zh' ? '保存笔记' : 'Save note'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* divider */}
      <div onPointerDown={onDragDivider} className="w-1.5 shrink-0 cursor-col-resize" style={{ background: C.hairline }} title={lang === 'zh' ? '拖动以调整宽度' : 'Drag to resize'} />

      {/* question pane */}
      <section className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: C.hairline }}>
          <div className="flex items-center gap-3">
            <QuestionChip n={number} />
            <MarkForReview on={marked} onToggle={onToggleMark} />
          </div>
          <EliminatorToggle on={eliminatorOn} onToggle={() => setEliminatorOn(!eliminatorOn)} />
        </div>

        <p onContextMenu={onSelectionContextMenu} className="mt-5 text-[17px] font-semibold leading-relaxed" style={{ color: C.ink }}>{question.stem}</p>

        <ChoiceList
          choices={question.choices}
          selected={answer}
          onSelect={onAnswer}
          eliminatorOn={eliminatorOn}
          eliminated={eliminated}
          onToggleEliminate={onToggleEliminate}
          reveal={reveal}
          correct={question.correct}
        />

        {reveal && question.explanation ? (
          <div className="mt-5 rounded-lg border p-4 text-[14px] leading-relaxed" style={{ borderColor: C.border, background: C.panel2, color: C.ink }}>
            <div className="mb-1 font-bold">{COMMON[lang].explanation}</div>
            {question.explanation}
          </div>
        ) : null}
      </section>

      {selectionOverlay}
    </div>
  );
}

/** Split the passage text into rendered segments at highlight boundaries. */
function buildSegments(text: string, highlights: Highlight[]): { text: string; hl?: Highlight }[] {
  if (!highlights.length) return [{ text }];
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const out: { text: string; hl?: Highlight }[] = [];
  let cursor = 0;
  for (const h of sorted) {
    const s = Math.max(cursor, h.start);
    if (s > cursor) out.push({ text: text.slice(cursor, s) });
    out.push({ text: text.slice(s, h.end), hl: h });
    cursor = h.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}
