import type { NextRequest } from 'next/server';
import { completeChatReply } from '@/lib/chat/provider';
import {
  buildWritingGraderMessages,
  overallWritingBand,
  parseJsonObject,
  taskBandFromCriteria,
  type WritingBands,
  type WritingTaskBand,
  type WritingTaskInput,
} from '@/lib/ielts/examiner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TaskBody = { prompt?: string; response?: string; minWords?: number };

// Trust the model's criterion scores but recompute the task band (mean of the
// four) and the overall band (Task 2 weighted double) ourselves, so the IELTS
// arithmetic is always exact regardless of the model's own rounding.
function reconcile(t: WritingTaskBand | null): WritingTaskBand | null {
  if (!t) return null;
  return { ...t, band: taskBandFromCriteria(t) };
}

export async function POST(req: NextRequest) {
  let body: { task1?: TaskBody; task2?: TaskBody };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  const tasks: WritingTaskInput[] = [];
  if (body.task1?.response?.trim()) {
    tasks.push({
      kind: 'task1',
      prompt: String(body.task1.prompt ?? ''),
      response: String(body.task1.response),
      minWords: Number(body.task1.minWords) || 150,
    });
  }
  if (body.task2?.response?.trim()) {
    tasks.push({
      kind: 'task2',
      prompt: String(body.task2.prompt ?? ''),
      response: String(body.task2.response),
      minWords: Number(body.task2.minWords) || 250,
    });
  }
  if (tasks.length === 0) {
    return Response.json({ error: 'no_writing' }, { status: 400 });
  }

  try {
    const raw = await completeChatReply(buildWritingGraderMessages(tasks), { backend: 'deepseek' });
    const parsed = parseJsonObject<WritingBands>(raw);
    if (!parsed || (!parsed.task1 && !parsed.task2)) {
      return Response.json({ error: 'parse_failed', raw: (raw || '').slice(0, 500) }, { status: 502 });
    }
    const task1 = reconcile(parsed.task1);
    const task2 = reconcile(parsed.task2);
    const result: WritingBands = {
      task1,
      task2,
      overall: overallWritingBand(task1?.band ?? null, task2?.band ?? null),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      summary: parsed.summary ?? { en: '', zh: '' },
    };
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: 'grader_unavailable', detail: String(e).slice(0, 200) }, { status: 503 });
  }
}
