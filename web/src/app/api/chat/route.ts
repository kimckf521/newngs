import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/chat/knowledge';
import { streamChatReply, activeChatBackend, type ChatMessage } from '@/lib/chat/provider';
import type { Locale } from '@/i18n/types';

/**
 * AI advisor chat — backs the on-site "咨询顾问" widget. Streams the reply as
 * plain text. The model backend (CloudBase native AI gateway in prod; direct
 * DeepSeek API as a local/off-platform fallback) is chosen in lib/chat/provider.
 *
 * runtime=nodejs: the native path uses @cloudbase/node-sdk (Node APIs); the
 * fallback uses fetch + ReadableStream.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- Origin check (CSRF defense) -------------------------------------------
// Allow SAME-ORIGIN POSTs (whatever domain the app is served from — the custom
// domain, *.vercel.app prod/preview, localhost) plus a few explicit known
// hosts; block true cross-site POSTs. Absent Origin (older clients) is allowed.
// A hardcoded allow-list alone would 403 the chat on Vercel preview/prod URLs.
const ALLOWED_ORIGINS = new Set([
  'https://nextgenscholars.asia',
  'https://www.nextgenscholars.asia',
  'http://localhost:3000',
]);

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin GET-style / old clients
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return new URL(origin).host === req.headers.get('host'); // same-origin
  } catch {
    return false;
  }
}

// ---- Limits ----------------------------------------------------------------
const MAX_MESSAGES = 20; // most recent turns kept
const MAX_CONTENT_CHARS = 4000; // per message
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // chat requests per IP per minute
const RATE_LIMIT_MAP_CAP = 1000;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  ipHits.set(ip, recent);
  if (ipHits.size > RATE_LIMIT_MAP_CAP) {
    for (const [k, v] of ipHits) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) ipHits.delete(k);
    }
  }
  return false;
}

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim() !== '',
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }));
}

export async function POST(req: NextRequest) {
  // CSRF: allow same-origin (any served domain) + known hosts; block cross-site.
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { messages?: unknown; locale?: string } | null;
  const messages = sanitizeMessages(body?.messages);
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const locale: Locale = body?.locale === 'en' ? 'en' : 'zh';

  const fullMessages: ChatMessage[] = [{ role: 'system', content: buildSystemPrompt(locale) }, ...messages];

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await streamChatReply(fullMessages);
  } catch (e) {
    // No usable backend (missing creds/key, model not enabled, upstream error) →
    // graceful 503 so the UI falls back to the WeChat 客服 handoff.
    console.error(`[chat] AI unavailable (backend=${activeChatBackend()})`, e);
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no', // disable nginx buffering so tokens stream through
    },
  });
}
