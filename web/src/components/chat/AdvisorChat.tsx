'use client';

import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import type { LiveMessage } from '@/lib/livechat/types';

type Msg = { role: 'user' | 'assistant'; content: string };

/**
 * Minimal, dependency-free Markdown-lite renderer for assistant replies:
 * normalises "- "/"* " bullets to "• ", renders **bold**, and leaves newlines
 * to the bubble's whitespace-pre-wrap. React escapes all text, so there's no
 * HTML-injection surface.
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
    disclaimer: 'AI assistant — for fees, enrolment or your specific case, connect to a human advisor.',
    error: 'Sorry, the AI advisor is unavailable right now. Tap “Talk to a human” to reach our team.',
    // live mode
    liveTitle: 'Human advisor',
    liveConnecting: 'Connecting you with the NextGen Scholars team',
    liveNote: 'An advisor will reply right here — usually within a few minutes during business hours (Beijing time).',
    liveWaiting: 'Waiting for an advisor…',
    liveWith: 'Chatting with',
    backToAi: 'Back to AI assistant',
    liveError: 'Could not send. Please try again.',
  },
  zh: {
    fab: '咨询顾问',
    title: 'NGS 智能顾问',
    subtitle: '课程、申请等问题都可以问我',
    greeting:
      '您好！我是 NextGen Scholars 的智能顾问。关于我们的课程、申请或国际教育规划，您随时都可以问我。',
    placeholder: '请输入您的问题…',
    send: '发送',
    human: '转人工顾问',
    close: '关闭对话',
    disclaimer: 'AI 助手 —— 涉及费用、报名或您的具体情况，可转接人工顾问。',
    error: '抱歉，智能顾问暂时无法使用。您可点击“转人工顾问”联系我们的团队。',
    // live mode
    liveTitle: '人工顾问',
    liveConnecting: '正在为您接入 NextGen Scholars 团队',
    liveNote: '顾问会在这里直接回复您 —— 工作时间内（北京时间）通常几分钟内答复。',
    liveWaiting: '正在等待顾问接入…',
    liveWith: '正在对话',
    backToAi: '返回 AI 助手',
    liveError: '发送失败，请重试。',
  },
} as const;

const LIVE_ID_KEY = 'ngs-live-id';

export function AdvisorChat({ locale = 'zh' }: { locale?: Locale }) {
  const t = content[locale];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'ai' | 'live'>('ai');

  // AI mode
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t.greeting }]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(false);

  // live mode
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [liveAgent, setLiveAgent] = useState<string | undefined>(undefined);
  const [liveError, setLiveError] = useState(false);
  const convIdRef = useRef<string>('');

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Autoscroll to the newest message.
  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, liveMessages, open, streaming, mode]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, mode]);

  // ── Live-chat polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open || mode !== 'live' || !convIdRef.current) return;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/livechat?conversationId=${encodeURIComponent(convIdRef.current)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: LiveMessage[]; agentName?: string };
        if (!active) return;
        if (Array.isArray(data.messages)) setLiveMessages(data.messages);
        if (data.agentName) setLiveAgent(data.agentName);
      } catch {
        /* transient — next tick retries */
      }
    };
    void poll();
    const id = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [open, mode]);

  const startLive = useCallback(() => {
    let id = '';
    try {
      id = localStorage.getItem(LIVE_ID_KEY) ?? '';
    } catch {
      /* ignore */
    }
    if (!id) {
      const rand = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(36).slice(2)}`;
      id = `v-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      try {
        localStorage.setItem(LIVE_ID_KEY, id);
      } catch {
        /* ignore */
      }
    }
    convIdRef.current = id;
    setLiveError(false);
    setMode('live');
  }, []);

  async function sendAi(text: string) {
    const history: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
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
      setMessages((m) => (m[m.length - 1]?.role === 'assistant' && !m[m.length - 1].content ? m.slice(0, -1) : m));
    } finally {
      setStreaming(false);
    }
  }

  async function sendLive(text: string) {
    // Optimistic echo; the next poll reconciles with the server copy.
    setLiveMessages((l) => [...l, { id: `tmp-${Date.now()}`, role: 'visitor', text, createdAt: Date.now() }]);
    setLiveError(false);
    try {
      const res = await fetch('/api/livechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convIdRef.current, text, locale, page: location.pathname }),
      });
      if (!res.ok) throw new Error('send_failed');
    } catch {
      setLiveError(true);
    }
  }

  function submit() {
    const text = input.trim();
    if (!text) return;
    if (mode === 'ai') {
      if (streaming) return;
      setInput('');
      void sendAi(text);
    } else {
      setInput('');
      void sendLive(text);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const waiting = streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1].content;
  const isLive = mode === 'live';

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={isLive ? t.liveTitle : t.title}
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-night/95 text-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 backdrop-blur-xl sm:bottom-28 sm:right-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-white">
                {isLive ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M8.5 10h7M8.5 13h4" />
                  </svg>
                )}
                {isLive && (
                  <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-night" />
                )}
              </span>
              <div className="leading-tight">
                <p className="font-grotesk text-sm font-bold">{isLive ? t.liveTitle : t.title}</p>
                <p className="text-[11px] text-white/50">{isLive ? (liveAgent ? `${t.liveWith} ${liveAgent}` : t.liveConnecting) : t.subtitle}</p>
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
            {isLive ? (
              <>
                <p className="mx-auto max-w-[90%] rounded-xl bg-white/[0.05] px-3 py-2 text-center text-[11px] leading-relaxed text-white/55">
                  {t.liveNote}
                </p>
                {liveMessages.map((m) => (
                  <div key={m.id} className={m.role === 'visitor' ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={
                        m.role === 'visitor'
                          ? 'max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-ngs-gradient px-3.5 py-2.5 text-sm text-white'
                          : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white/90'
                      }
                    >
                      {m.role === 'agent' && (
                        <span className="mb-0.5 block text-[10px] font-semibold text-ngs-cyan">{m.agentName || t.liveTitle}</span>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
                {liveMessages.filter((m) => m.role === 'agent').length === 0 && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs text-white/50">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {t.liveWaiting}
                    </div>
                  </div>
                )}
                {liveError && <p className="text-center text-xs text-rose-400">{t.liveError}</p>}
              </>
            ) : (
              <>
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
              </>
            )}
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
                disabled={(mode === 'ai' && streaming) || !input.trim()}
                aria-label={t.send}
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-ngs-gradient text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2">
              {isLive ? (
                <>
                  <p className="text-[10px] leading-tight text-white/35">{t.liveConnecting}</p>
                  <button
                    type="button"
                    onClick={() => setMode('ai')}
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {t.backToAi}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[10px] leading-tight text-white/35">{t.disclaimer}</p>
                  <button
                    type="button"
                    onClick={startLive}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t.human}
                  </button>
                </>
              )}
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
