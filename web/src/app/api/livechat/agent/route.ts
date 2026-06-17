import { NextRequest, NextResponse } from 'next/server';
import {
  addMessage,
  closeConversation,
  getConversation,
  getMessages,
  listOpenConversations,
} from '@/lib/livechat/store';
import { MAX_MESSAGE_LEN } from '@/lib/livechat/types';

export const runtime = 'nodejs';

/**
 * Agent-side auth. Set LIVECHAT_AGENT_KEY in the environment and the console
 * sends it as the `x-livechat-key` header. If no key is configured we allow the
 * endpoints ONLY in non-production (local/demo testing) and deny in production —
 * so a deployed inbox is never wide open.
 */
function authorized(req: NextRequest): boolean {
  const key = process.env.LIVECHAT_AGENT_KEY;
  if (key) return req.headers.get('x-livechat-key') === key;
  return process.env.NODE_ENV !== 'production';
}

/** List open conversations, or fetch one conversation + its messages. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('conversationId');
  if (id) {
    const conversation = await getConversation(id);
    const messages = conversation ? await getMessages(id) : [];
    return NextResponse.json({ conversation, messages });
  }
  return NextResponse.json({ conversations: await listOpenConversations() });
}

/** Agent replies to, or closes, a conversation. */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { conversationId?: unknown; action?: unknown; text?: unknown; agentName?: unknown }
    | null;
  const id = String(body?.conversationId ?? '');
  if (!id) return NextResponse.json({ error: 'bad_conversation' }, { status: 400 });

  try {
    if (body?.action === 'close') {
      await closeConversation(id);
      return NextResponse.json({ ok: true });
    }
    const text = String(body?.text ?? '').trim();
    const agentName = typeof body?.agentName === 'string' ? body.agentName.slice(0, 40) : '';
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
    if (text.length > MAX_MESSAGE_LEN) return NextResponse.json({ error: 'too_long' }, { status: 400 });
    const message = await addMessage(id, 'agent', text, agentName || undefined);
    return NextResponse.json({ ok: true, message });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
