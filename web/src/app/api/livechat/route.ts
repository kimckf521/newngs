import { NextRequest, NextResponse } from 'next/server';
import { addMessage, ensureConversation, getConversation, getMessages } from '@/lib/livechat/store';
import { MAX_MESSAGE_LEN } from '@/lib/livechat/types';
import { pushVisitorMessage } from '@/lib/wecom/relay';

// CloudBase node-sdk (when configured) needs Node APIs — pin the runtime.
export const runtime = 'nodejs';

// Visitor-held conversation token (generated client-side, kept in localStorage).
const ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

/** Poll: the visitor's widget calls this on an interval to fetch agent replies. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('conversationId') ?? '';
  if (!ID_RE.test(id)) return NextResponse.json({ status: 'none', messages: [] });
  const conv = await getConversation(id);
  if (!conv) return NextResponse.json({ status: 'none', messages: [] });
  const messages = await getMessages(id);
  return NextResponse.json({ status: conv.status, agentName: conv.agentName, messages });
}

/** Visitor sends a message (also creates the conversation on first send). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { conversationId?: unknown; text?: unknown; locale?: unknown; page?: unknown }
    | null;
  const id = String(body?.conversationId ?? '');
  const text = String(body?.text ?? '').trim();
  const locale = body?.locale === 'en' ? 'en' : 'zh';
  const page = typeof body?.page === 'string' ? body.page.slice(0, 200) : undefined;

  if (!ID_RE.test(id)) return NextResponse.json({ error: 'bad_conversation' }, { status: 400 });
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
  if (text.length > MAX_MESSAGE_LEN) return NextResponse.json({ error: 'too_long' }, { status: 400 });

  try {
    const conv = await ensureConversation(id, locale, page);
    const message = await addMessage(id, 'visitor', text);
    void pushVisitorMessage(conv, text); // notify staff in WeCom (no-op unless configured)
    return NextResponse.json({ ok: true, message });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
