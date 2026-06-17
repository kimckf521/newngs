import { NextRequest, NextResponse } from 'next/server';
import { env, requireDeepSeekKey } from '@/lib/env';
import { buildSystemPrompt } from '@/lib/chat/knowledge';
import type { Locale } from '@/i18n/types';

/**
 * AI advisor chat — proxies the on-site "咨询顾问" widget to DeepSeek
 * (China-hosted, OpenAI-compatible) and STREAMS the reply back as plain text.
 *
 * Why a server route: the DeepSeek key must never reach the browser, and the
 * (China) server-to-DeepSeek hop is fast/reliable. fetch + ReadableStream need
 * Node APIs available on the nodejs runtime.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- Origin allow-list (CSRF defense) — mirrors /api/partner_with_us -------
const ALLOWED_ORIGINS = new Set([
  'https://nextgenscholars.asia',
  'https://www.nextgenscholars.asia',
  'http://localhost:3000',
]);

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

type ChatMessage = { role: 'user' | 'assistant'; content: string };

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
  // CSRF: reject cross-origin POSTs (absent Origin is allowed for old clients).
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
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

  // Missing key → graceful 503 so the UI can fall back to the WeChat handoff.
  let apiKey: string;
  try {
    apiKey = requireDeepSeekKey();
  } catch {
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL,
        messages: [{ role: 'system', content: buildSystemPrompt(locale) }, ...messages],
        stream: true,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });
  } catch (e) {
    console.error('[chat] DeepSeek request failed', e);
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('[chat] DeepSeek bad response', upstream.status, detail.slice(0, 500));
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  // Transform the OpenAI-style SSE stream into a plain UTF-8 text stream of just
  // the assistant's content deltas — keeps the client trivial.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep the trailing partial line
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* keepalive / partial chunk — ignore */
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no', // disable nginx buffering so tokens stream through
    },
  });
}
