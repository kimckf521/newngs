import type { NextRequest } from 'next/server';
import { completeChatReply } from '@/lib/chat/provider';
import { buildGraderMessages, parseJsonObject, type Bands, type Turn } from '@/lib/ielts/examiner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { history?: Turn[]; pronunciation?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  const history: Turn[] = Array.isArray(body?.history) ? body.history : [];
  const candidateTurns = history.filter((t) => t.role === 'candidate' && t.text.trim());
  if (candidateTurns.length === 0) {
    return Response.json({ error: 'no_candidate_speech' }, { status: 400 });
  }
  const pron = body?.pronunciation != null ? Number(body.pronunciation) : undefined;

  try {
    const raw = await completeChatReply(buildGraderMessages(history, pron), { backend: 'deepseek' });
    const parsed = parseJsonObject<Bands>(raw);
    if (!parsed || typeof parsed.overall !== 'number') {
      return Response.json({ error: 'parse_failed', raw: (raw || '').slice(0, 500) }, { status: 502 });
    }
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: 'grader_unavailable', detail: String(e).slice(0, 200) }, { status: 503 });
  }
}
