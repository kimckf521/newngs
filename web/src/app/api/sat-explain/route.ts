import { NextRequest, NextResponse } from 'next/server';
import { streamChatReply, activeChatBackend, type ChatMessage } from '@/lib/chat/provider';

/**
 * On-demand SAT tutor — streams an explanation of why a student's answer is
 * wrong and the correct one is right. Reuses the DeepSeek/CloudBase streaming
 * provider (same as the advisor chat) but with an SAT-tutor system prompt. Sent
 * from the practice / notebook / results "Ask AI" button.
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

// light per-IP rate limit
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

type Payload = {
  section?: string; skill?: string; difficulty?: string;
  stem?: string; passage?: string;
  choices?: { id?: string; text?: string }[];
  correct?: string; sprAccepted?: string[]; chosen?: string;
  explanation?: string; locale?: string;
};

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const b = (await req.json().catch(() => null)) as Payload | null;
  if (!b || !b.stem) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const zh = b.locale !== 'en';
  const lang = zh
    ? 'Answer in Simplified Chinese (中文), but keep SAT terms, answer-choice letters, and math notation in English/symbols.'
    : 'Answer in English.';

  const system: ChatMessage = {
    role: 'system',
    content:
      `You are an expert, encouraging Digital SAT tutor. A student just answered an SAT ${clip(b.section, 40)} question` +
      (b.skill ? ` testing the skill "${clip(b.skill, 60)}"` : '') +
      `. In under ~150 words: (1) if the student's answer is wrong, explain the specific misconception that leads to it; (2) explain why the correct answer is right and the fastest reliable strategy to get there next time. Be concrete to THIS question — do not merely restate a given explanation; add insight. ${lang}`,
  };

  const choiceLines = Array.isArray(b.choices)
    ? b.choices.map((c) => `${clip(c.id, 2)}) ${clip(c.text, 400)}`).join('\n')
    : '';
  const answerKey = b.correct ? `Correct answer: ${clip(b.correct, 2)}` : b.sprAccepted?.length ? `Accepted answer(s): ${b.sprAccepted.slice(0, 6).map((a) => clip(a, 20)).join(', ')}` : '';

  const user: ChatMessage = {
    role: 'user',
    content: [
      b.passage ? `Passage:\n${clip(b.passage, 3000)}` : null,
      `Question:\n${clip(b.stem, 1500)}`,
      choiceLines ? `Choices:\n${choiceLines}` : null,
      answerKey,
      b.chosen ? `The student chose: ${clip(b.chosen, 20)}` : `The student did not answer.`,
      b.explanation ? `(Reference explanation for you, do not just repeat it:)\n${clip(b.explanation, 1500)}` : null,
    ].filter(Boolean).join('\n\n'),
  };

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await streamChatReply([system, user]);
  } catch (e) {
    console.error(`[sat-explain] AI unavailable (backend=${activeChatBackend()})`, e);
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
  }

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' },
  });
}
