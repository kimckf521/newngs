'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

type Msg = { role: 'user' | 'assistant'; content: string };

/**
 * Minimal, dependency-free Markdown-lite renderer for assistant replies:
 * normalises "- "/"* " bullets to "• ", renders **bold**, and leaves newlines
 * to the bubble's whitespace-pre-wrap. The model tends to emit Markdown; this
 * keeps it from showing literal asterisks without pulling in a parser. React
 * escapes all text, so there's no HTML-injection surface.
 */
function renderRich(text: string): ReactNode {
  const normalized = text.replace(/^[ \t]*[-*•][ \t]+/gm, '• ');
  return normalized.split(/(\*\*[^*\n]+\*\*)/g).map((seg, i) => {
    const bold = /^\*\*([^*\n]+)\*\*$/.exec(seg);
    return bold ? (
      <strong key={i} className="font-semibold text-white">{bold[1]}</strong>
    ) : (
      <Fragment key={i}>{seg}</Fragment>
    );
  });
}

const content = {
  en: {
    fab: 'Talk to us',
    title: 'NGS AI Advisor',
    subtitle: 'Ask about programs, admissions & more',
    greeting:
      "Hi! I'm the NextGen Scholars AI advisor. Ask me about our programs, admissions, or the international-education journey — anytime.",
    placeholder: 'Type your question…',
    send: 'Send',
    human: 'Talk to a human',
    close: 'Close chat',
    disclaimer: 'AI assistant — for fees, enrolment or your specific case, tap “Talk to a human”.',
    error: 'Sorry, the AI advisor is unavailable right now. Please reach us on WeChat for help.',
  },
  zh: {
    fab: '咨询顾问',
    title: 'NGS 智能顾问',
    subtitle: '课程、申请等问题都可以问我',
    greeting:
      '你好！我是 NextGen Scholars 的智能顾问。关于我们的课程、申请或国际教育规划，随时都可以问我～',
    placeholder: '输入你的问题…',
    send: '发送',
    human: '转人工顾问',
    close: '关闭对话',
    disclaimer: 'AI 助手 —— 涉及费用、报名或你的具体情况，请点击“转人工顾问”。',
    error: '抱歉，智能顾问暂时不可用。可通过微信联系我们获取帮助。',
  },
} as const;

export function AdvisorChat({ locale = 'zh' }: { locale?: Locale }) {
  const t = content[locale];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t.greeting }]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Autoscroll to the newest message while the panel is open.
  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const history: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]); // placeholder to stream into
    setInput('');
    setStreaming(true);
    setError(false);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, locale }),
      });
      if (!res.ok || !res.body) throw new Error('request_failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: 'assistant', content: acc };
          return next;
        });
      }
      if (!acc.trim()) throw new Error('empty');
    } catch {
      setError(true);
      // Drop the empty assistant placeholder so the error note stands alone.
      setMessages((m) => (m[m.length - 1]?.role === 'assistant' && !m[m.length - 1].content ? m.slice(0, -1) : m));
    } finally {
      setStreaming(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const waiting = streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1].content;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-night/95 text-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 backdrop-blur-xl sm:bottom-28 sm:right-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M9.5 9.5h.01M14.5 9.5h.01M9 13s1 1.2 3 1.2S15 13 15 13" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="font-grotesk text-sm font-bold">{t.title}</p>
                <p className="text-[11px] text-white/50">{t.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-ngs-gradient px-3.5 py-2.5 text-sm text-white'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white/90'
                  }
                >
                  {m.role === 'assistant' ? renderRich(m.content) : m.content}
                </div>
              </div>
            ))}
            {waiting && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-rose-400">{t.error}</p>}
          </div>

          {/* Composer */}
          <div className="border-t border-white/10 bg-white/[0.02] px-3 py-3">
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={t.placeholder}
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                aria-label={t.send}
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-ngs-gradient text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[10px] leading-tight text-white/35">{t.disclaimer}</p>
              <a
                href={externalLinks.customerServiceWeChat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                <Image src="/static/img/media_icons/WeChat.png" alt="" width={13} height={13} className="h-[13px] w-[13px] object-contain" />
                {t.human}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        {/* Soft breathing halo behind the closed button to draw the eye.
            Paused when the panel is open and for reduced-motion users. */}
        {!open && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-ngs-gradient opacity-50 blur-lg motion-safe:animate-pulse"
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t.close : t.fab}
          aria-expanded={open}
          className={`group relative flex items-center overflow-hidden rounded-full bg-ngs-gradient py-2.5 pl-2.5 font-semibold text-white shadow-[0_10px_30px_-8px_rgba(236,28,139,0.65)] ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_46px_-10px_rgba(236,28,139,0.85)] active:translate-y-0 active:scale-[0.97] ${open ? 'gap-0 pr-2.5' : 'gap-2.5 pr-2.5 sm:pr-5'}`}
        >
          {/* Glossy top sheen for a premium, dimensional feel */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent"
          />
          {/* Icon disc + live-status dot */}
          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-inset ring-white/25 transition-colors duration-300 group-hover:bg-white/30">
            {open ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8.5 10h7M8.5 13h4" />
              </svg>
            )}
            {!open && (
              <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-night" />
              </span>
            )}
          </span>
          <span className={`relative whitespace-nowrap text-sm tracking-tight ${open ? 'hidden' : 'hidden sm:inline'}`}>
            {t.fab}
          </span>
        </button>
      </div>
    </>
  );
}
