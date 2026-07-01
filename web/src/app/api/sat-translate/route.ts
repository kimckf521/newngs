import { NextRequest, NextResponse } from 'next/server';
import { completeChatReply, activeChatBackend, type ChatMessage } from '@/lib/chat/provider';

/**
 * AI translator — given a selected English word or phrase from an SAT passage /
 * question, returns its Simplified-Chinese meaning: a concise 释义 for a single
 * word, or a faithful natural 中文 translation for a phrase/sentence. Non-
 * streaming JSON, used by the passage/question right-click "释义 / Meaning" menu
 * and the direct phrase-translation popup. Reuses the same DeepSeek/CloudBase
 * provider as the SAT tutor (mirrors /api/sat-vocab).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}

// light per-IP rate limit (shared shape with sat-vocab)
const WINDOW = 60_000, MAX = 30;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX) return true;
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 1000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW)) hits.delete(k);
  return false;
}

const clip = (s: unknown, n: number): string => (typeof s === 'string' ? s.slice(0, n) : '');

/** Reject if the AI backend doesn't answer in time, so the request never hangs
 *  the caller (the CloudBase/DeepSeek gateway can stall under load). */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('ai_timeout')), ms)),
  ]);
}

type Payload = { text?: string; mode?: 'word' | 'sentence' };

/** Strip a leading/trailing pair of matching quotes the model sometimes wraps
 *  the whole output in — but ONLY when they're a single enclosing pair, so we
 *  don't mangle text that legitimately contains quotes (e.g. 他说：“走吧” or
 *  自由”与“平等). */
function unquote(s: string): string {
  const t = s.trim();
  if (t.length < 2) return t;
  const pairs: Array<[string, string]> = [['"', '"'], ['“', '”'], ['「', '」'], ['‘', '’'], ["'", "'"]];
  for (const [open, close] of pairs) {
    if (t.startsWith(open) && t.endsWith(close)) {
      const opens = t.split(open).length - 1;
      const closes = open === close ? opens : t.split(close).length - 1;
      // same-char quote → exactly 2 total; distinct pair → exactly one of each
      if (open === close ? opens === 2 : opens === 1 && closes === 1) return t.slice(1, -1).trim();
    }
  }
  return t;
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const b = (await req.json().catch(() => null)) as Payload | null;
  const text = clip(b?.text, 800).trim();
  if (!text) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  // A "word" if the caller says so, or if the selection has no internal whitespace.
  const isWord = b?.mode === 'word' || (b?.mode !== 'sentence' && !/\s/.test(text));

  const system: ChatMessage = {
    role: 'system',
    content: isWord
      ? 'You are a bilingual (English → 简体中文) SAT vocabulary coach. The user gives you a single English word or short expression. Reply with ONLY a concise 简体中文 释义 — just the core meaning a 学生 needs (a few 汉字; you may give 2–3 common senses separated by 、if genuinely distinct). No English, no part-of-speech tags, no examples, no preamble, no quotes, no punctuation at the end.'
      : 'You are a professional English → 简体中文 translator for SAT students. Translate the given English text into faithful, natural 简体中文. Reply with ONLY the 简体中文 translation — no English, no preamble, no explanation, no quotes.',
  };
  const user: ChatMessage = { role: 'user', content: text };

  try {
    // Force the direct DeepSeek API (low-latency, China-accessible) — same choice
    // as /api/sat-vocab and the IELTS speaking examiner. The CloudBase AI gateway
    // takes 60–90s for a one-shot completion, far too slow for a quick lookup.
    const raw = (await withTimeout(completeChatReply([system, user], { backend: 'deepseek' }), 28_000)).trim();
    const out = unquote(raw);
    if (!out) return NextResponse.json({ error: 'empty' }, { status: 502 });
    return NextResponse.json({ text: out });
  } catch (e) {
    console.error(`[sat-translate] AI unavailable (backend=${activeChatBackend()})`, e);
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
  }
}
