'use client';

import { useEffect, useRef, useState } from 'react';
import type { SatQuestion } from '@/lib/sat/types';
import { isRw, isMc, isSpr } from '@/lib/sat/types';
import { C } from './shared';
import { useSatLang } from './i18n';

/**
 * On-demand AI explanation for a single question — streams from /api/sat-explain
 * (DeepSeek/CloudBase). Shown after an answer is revealed: "为什么错了?".
 */
export function AskAI({ question, chosen }: { question: SatQuestion; chosen?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [cache, setCache] = useState<{ en?: string; zh?: string }>({});
  const started = useRef(false);
  const gen = useRef(0); // bumped per ask(); an older stream stops writing once superseded
  const ctrlRef = useRef<AbortController | null>(null);
  const { lang: uiLang } = useSatLang();

  // Reset everything when navigating to a different question — clears both
  // cached languages and any displayed explanation so the next question is fresh.
  useEffect(() => {
    ctrlRef.current?.abort();
    gen.current += 1;
    setCache({});
    setText('');
    setState('idle');
    setOpen(false);
    started.current = false;
  }, [question.id]);

  async function ask(locale: 'zh' | 'en') {
    const myGen = ++gen.current;
    ctrlRef.current?.abort(); // supersede any in-flight stream (e.g. switching language mid-stream)
    setOpen(true);
    setLang(locale);
    // Cache hit: show the stored explanation and skip the network entirely.
    const cached = cache[locale];
    if (cached !== undefined) {
      setText(cached);
      setState('done');
      return;
    }
    setState('loading');
    setText('');
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const payload = {
      section: question.section,
      skill: question.skill,
      difficulty: question.difficulty,
      stem: question.stem,
      passage: isRw(question) ? question.passage : undefined,
      choices: isMc(question) ? (question as { choices: { id: string; text: string }[] }).choices : undefined,
      correct: isMc(question) ? (question as { correct: string }).correct : undefined,
      sprAccepted: isSpr(question) ? question.answer.accepted : undefined,
      chosen,
      explanation: question.explanation,
      locale,
    };
    try {
      const res = await fetch('/api/sat-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      if (myGen !== gen.current) return; // superseded while awaiting the response
      if (!res.ok || !res.body) { setState('error'); return; }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (myGen !== gen.current) return; // a newer ask() / question change took over — stop writing
        if (value) {
          acc += dec.decode(value, { stream: true });
          setText(acc);
        }
      }
      if (myGen !== gen.current) return;
      setCache((c) => ({ ...c, [locale]: acc }));
      setState('done');
    } catch {
      if (myGen === gen.current) setState('error'); // ignore aborts from being superseded
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { started.current = true; void ask('zh'); }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold"
        style={{ borderColor: C.blue, color: C.blue, background: C.tint }}
      >
        🤖 {uiLang === 'zh' ? 'AI 讲解 · 为什么这样选?' : 'Ask AI · Why this answer?'}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border p-4" style={{ borderColor: C.blue, background: C.aiBg }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold" style={{ color: C.blue }}>🤖 {uiLang === 'zh' ? 'AI 导师' : 'AI Tutor'}</span>
        <div className="flex items-center gap-1">
          {(['zh', 'en'] as const).map((ll) => (
            <button key={ll} type="button" onClick={() => void ask(ll)}
              className="rounded px-2 py-0.5 text-[11px] font-bold"
              style={lang === ll ? { background: C.blue, color: '#fff' } : { color: C.muted }}>
              {ll === 'zh' ? '中' : 'EN'}
            </button>
          ))}
        </div>
      </div>
      {state === 'error' ? (
        <p className="text-[13px]" style={{ color: C.muted }}>
          {uiLang === 'zh'
            ? 'AI 暂不可用,上方的文字解析已包含完整推理。'
            : 'AI is unavailable right now. The written explanation above still has the full reasoning.'}
        </p>
      ) : (
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: C.ink }}>
          {text}
          {state === 'loading' ? <span className="ml-0.5 inline-block animate-pulse">▍</span> : null}
        </p>
      )}
    </div>
  );
}
