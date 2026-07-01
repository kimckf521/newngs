import { NextRequest, NextResponse } from 'next/server';
import { completeChatReply, activeChatBackend, type ChatMessage } from '@/lib/chat/provider';

/**
 * AI vocabulary definer — given a word (and optionally the sentence it appeared
 * in), returns a compact bilingual study note (part of speech + English gloss +
 * 中文释义 + example). Non-streaming JSON, used by the 生词本 "AI 释义" button.
 * Reuses the same DeepSeek/CloudBase provider as the SAT tutor.
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

// light per-IP rate limit (shared shape with sat-explain)
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

type Payload = { word?: string; context?: string; locale?: string };

/** The structured card the card component renders (both language faces at once). */
type VocabDefOut = {
  glossEn: string; glossZh: string;
  synonyms: string[]; antonyms: string[];
  example: string; exampleZh: string; sourceZh: string;
};

/** Parse the model's JSON (defensively — strip fences, take the outermost object)
 *  into a validated, trimmed VocabDefOut. Returns null if unusable. */
function parseDef(raw: string, hadContext: boolean): VocabDefOut | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a === -1 || b <= a) return null;
  let obj: Record<string, unknown>;
  try { obj = JSON.parse(s.slice(a, b + 1)) as Record<string, unknown>; } catch { return null; }
  const str = (x: unknown) => (typeof x === 'string' ? x.trim() : '');
  const list = (x: unknown) => (Array.isArray(x) ? x.map(str).filter(Boolean).slice(0, 4) : []);
  const glossEn = str(obj.gloss_en), glossZh = str(obj.gloss_zh);
  if (!glossEn && !glossZh) return null; // must carry at least one meaning
  return {
    glossEn, glossZh,
    synonyms: list(obj.synonyms), antonyms: list(obj.antonyms),
    example: str(obj.example), exampleZh: str(obj.example_zh),
    sourceZh: hadContext ? str(obj.source_zh) : '',
  };
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const b = (await req.json().catch(() => null)) as Payload | null;
  const word = clip(b?.word, 60).trim();
  if (!word) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const context = clip(b?.context, 600).trim();

  const system: ChatMessage = {
    role: 'system',
    content:
      'You are a bilingual (English + 简体中文) SAT vocabulary coach. Given an English word — and, if provided, the sentence where the student saw it — return a compact flashcard as STRICT JSON and nothing else. ' +
      'Schema (all keys required): {"gloss_en": string, "gloss_zh": string, "synonyms": string[], "antonyms": string[], "example": string, "example_zh": string, "source_zh": string}. ' +
      'gloss_en: a short English definition (max ~9 words) of the sense used in the given context, if any. ' +
      'gloss_zh: a tight 简体中文 释义 (max ~12 汉字). ' +
      'synonyms and antonyms: exactly 3 common single English words each. ' +
      'example: one short, natural English sentence that uses the word (do not reuse the context sentence). example_zh: its 简体中文 translation. ' +
      'source_zh: a faithful 简体中文 translation of the provided context sentence, or "" if no context was given. ' +
      'Output ONLY the JSON object — no markdown code fences, no commentary.',
  };
  const user: ChatMessage = {
    role: 'user',
    content: [
      `Word: ${word}`,
      context ? `Context sentence the student saw it in:\n${context}` : 'No context sentence provided — use the most common SAT-level sense.',
    ].join('\n\n'),
  };

  try {
    // Force the direct DeepSeek API (low-latency, China-accessible). The CloudBase
    // AI gateway takes 60–90s for a one-shot completion — fine for the streaming
    // advisor, far too slow for a quick flashcard definition. Same choice the
    // IELTS speaking examiner makes.
    const text = (await withTimeout(completeChatReply([system, user], { backend: 'deepseek' }), 28_000)).trim();
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 502 });
    const def = parseDef(text, Boolean(context));
    if (!def) return NextResponse.json({ error: 'bad_ai_output' }, { status: 502 });
    return NextResponse.json({ def });
  } catch (e) {
    console.error(`[sat-vocab] AI unavailable (backend=${activeChatBackend()})`, e);
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
  }
}
