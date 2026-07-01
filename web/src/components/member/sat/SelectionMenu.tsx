'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { C } from './shared';
import { useSatLang } from './i18n';
import { addVocab } from '@/lib/sat/progress';

/**
 * Right-click (contextmenu) helper for SAT text areas (the RW passage and the
 * question stem). On a right-click over selected text:
 *   • empty selection            → do nothing (native menu shows)
 *   • single word (no whitespace) → small menu: "释义 / Meaning" + "+ 生词"
 *   • phrase/sentence (whitespace)→ translate directly, show the 中文 in a popup
 *
 * Self-contained: `useSelectionMenu()` returns an `onContextMenu` handler you
 * spread onto the text container, plus a `<SelectionMenuOverlay>` element to
 * render once. Positioned at the cursor; closes on outside-click and Escape.
 */

const L = {
  en: { meaning: 'Meaning', save: '+ Word', saved: '✓ Saved', loading: 'Translating…', unavailable: 'Translation unavailable' },
  zh: { meaning: '释义', save: '+ 生词', saved: '✓ 已收藏', loading: '翻译中…', unavailable: '翻译暂不可用' },
} as const;

/** The 8-line sentence that `word` sits in, derived from the node's text — used
 *  as the vocab context and shown under the meaning. Falls back to '' if we
 *  can't cheaply locate it. */
function sentenceAround(word: string, nodeText: string | null | undefined): string {
  if (!nodeText) return '';
  const clean = nodeText.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentences = clean.split(/(?<=[.!?"”])\s+/);
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${esc}\\b`, 'i');
  const hit = sentences.find((s) => re.test(s));
  const out = (hit || '').trim();
  return out.length > 240 ? `${out.slice(0, 240)}…` : out;
}

type MenuState = {
  x: number;
  y: number;
  kind: 'menu' | 'popup'; // 'menu' = word (two items); 'popup' = translation result
  word: string;
  context: string;
  title: string; // heading of the popup (the word or the selected phrase)
  body: string; // translation text (popup); '' while loading / for the menu
  status: 'idle' | 'loading' | 'error';
  saved: boolean;
};

async function translate(text: string, mode: 'word' | 'sentence'): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 32_000); // client-side ceiling so the UI never hangs
  try {
    const res = await fetch('/api/sat-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    return data.text ? data.text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function useSelectionMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const reqId = useRef(0); // guards against a stale in-flight translation writing over a newer one

  const close = useCallback(() => { reqId.current += 1; setMenu(null); }, []);

  // dismiss on outside-click and Escape
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const onDown = () => close(); // any pointerdown outside the menu (the menu stops its own)
    window.addEventListener('keydown', onKey);
    // defer so the opening contextmenu's own event doesn't immediately close it
    const id = window.setTimeout(() => window.addEventListener('pointerdown', onDown), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [menu, close]);

  const runTranslate = useCallback((title: string, text: string, mode: 'word' | 'sentence', base: Omit<MenuState, 'kind' | 'body' | 'status'>) => {
    reqId.current += 1;
    const mine = reqId.current;
    setMenu({ ...base, kind: 'popup', title, body: '', status: 'loading' });
    void translate(text, mode).then((zh) => {
      if (reqId.current !== mine) return; // superseded
      setMenu((m) => (m ? { ...m, body: zh ?? '', status: zh ? 'idle' : 'error' } : m));
    });
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    const raw = sel?.toString() ?? '';
    const text = raw.trim();
    if (!text) return; // nothing selected → leave the native menu alone

    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    // a "word" is a single Latin token (letters, hyphen/apostrophe) — so a CJK
    // phrase or anything with whitespace is treated as a sentence, not a word.
    const isWord = /^[A-Za-z][A-Za-z'’-]*$/.test(text);
    // context = the sentence the selection sits in, taken from the WHOLE
    // container's text (the element the handler is bound to) — so a word inside
    // a <mark>/<span> highlight fragment still resolves to its full sentence.
    const containerText = (e.currentTarget as HTMLElement)?.textContent ?? sel?.anchorNode?.textContent ?? '';
    const context = isWord ? sentenceAround(text, containerText) : '';
    const base = { x, y, word: text, context, title: text, saved: false };

    if (isWord) {
      // single word → offer the two-item menu
      setMenu({ ...base, kind: 'menu', body: '', status: 'idle' });
    } else {
      // phrase/sentence → translate straight away
      runTranslate(text, text, 'sentence', base);
    }
  }, [runTranslate]);

  const overlay = <SelectionMenuOverlay menu={menu} setMenu={setMenu} close={close} runTranslate={runTranslate} />;

  return { onContextMenu, overlay };
}

function SelectionMenuOverlay({
  menu, setMenu, close, runTranslate,
}: {
  menu: MenuState | null;
  setMenu: React.Dispatch<React.SetStateAction<MenuState | null>>;
  close: () => void;
  runTranslate: (title: string, text: string, mode: 'word' | 'sentence', base: Omit<MenuState, 'kind' | 'body' | 'status'>) => void;
}) {
  const { lang } = useSatLang();
  const t = L[lang];
  const ref = useRef<HTMLDivElement>(null);

  // keep the box inside the viewport (flip left/up near the edges)
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: menu?.x ?? 0, top: menu?.y ?? 0 });
  // useLayoutEffect: measure + clamp BEFORE paint, so the box never flashes at
  // (0,0) / the previous position before jumping to the cursor.
  useLayoutEffect(() => {
    if (!menu) return;
    const el = ref.current;
    const w = el?.offsetWidth ?? 200;
    const h = el?.offsetHeight ?? 120; // already bounded by maxHeight below
    const pad = 8;
    const left = Math.min(menu.x, window.innerWidth - w - pad);
    const top = Math.min(menu.y, window.innerHeight - h - pad);
    setPos({ left: Math.max(pad, left), top: Math.max(pad, top) });
  }, [menu]);

  if (!menu) return null;

  const onSave = () => {
    addVocab({ word: menu.word, context: menu.context || undefined });
    setMenu((m) => (m ? { ...m, saved: true } : m));
    window.setTimeout(close, 900); // brief "已收藏" confirmation, then close
  };

  const onMeaning = () => {
    runTranslate(menu.word, menu.word, 'word', { x: menu.x, y: menu.y, word: menu.word, context: menu.context, title: menu.word, saved: false });
  };

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[90] overflow-y-auto rounded-lg border shadow-2xl"
      style={{ left: pos.left, top: pos.top, borderColor: C.border, background: C.panel, minWidth: 168, maxWidth: 320, maxHeight: 'calc(100vh - 16px)' }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.kind === 'menu' ? (
        <div className="py-1">
          <button type="button" role="menuitem" onClick={onMeaning}
            className="sat-hover block w-full px-3.5 py-2 text-left text-[14px] font-medium" style={{ color: C.ink }}>
            {t.meaning}
          </button>
          <button type="button" role="menuitem" onClick={onSave} disabled={menu.saved}
            className="sat-hover block w-full px-3.5 py-2 text-left text-[14px] font-medium" style={{ color: menu.saved ? C.good : C.ink }}>
            {menu.saved ? t.saved : t.save}
          </button>
        </div>
      ) : (
        <div className="p-3">
          <div className="mb-1 break-words text-[13px] font-bold" style={{ color: C.ink }}>{menu.title}</div>
          {menu.status === 'loading' ? (
            <div className="text-[13px]" style={{ color: C.muted }}>{t.loading}</div>
          ) : menu.status === 'error' ? (
            <div className="text-[13px] font-medium" style={{ color: C.flag }}>{t.unavailable}</div>
          ) : (
            <div className="whitespace-pre-wrap break-words text-[14px] leading-relaxed" style={{ color: C.ink }}>{menu.body}</div>
          )}
          {menu.context && menu.status !== 'error' ? (
            <div className="mt-2 border-t pt-2 text-[12px] italic leading-relaxed" style={{ borderColor: C.hairline, color: C.muted }}>“{menu.context}”</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
