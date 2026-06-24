import type { NextRequest } from 'next/server';
import { streamChatReply } from '@/lib/chat/provider';
import { buildExaminerMessages, type Turn } from '@/lib/ielts/examiner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Streams the examiner's next spoken line as plain UTF-8 text (token-by-token),
// so the client can start speaking the first sentence before generation finishes.
// `closing` (timer-driven on the client) asks for a wrap-up line.
export async function POST(req: NextRequest) {
  let body: { history?: Turn[]; elapsedSec?: number; totalSec?: number; closing?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  const history: Turn[] = Array.isArray(body?.history) ? body.history : [];
  const elapsedSec = Number(body?.elapsedSec ?? 0);
  const totalSec = Number(body?.totalSec ?? 600);
  const closing = Boolean(body?.closing);

  try {
    const stream = await streamChatReply(buildExaminerMessages(history, elapsedSec, totalSec, closing), { backend: 'deepseek' });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
    });
  } catch (e) {
    return Response.json({ error: 'examiner_unavailable', detail: String(e).slice(0, 200) }, { status: 503 });
  }
}
