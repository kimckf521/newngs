import 'server-only';
import type { ChatMessage } from '@/lib/chat/provider';

export type Turn = { role: 'examiner' | 'candidate'; text: string };

export type ExaminerReply = { say: string; part: 1 | 2 | 3; done: boolean };

export type Bands = {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  // Bilingual so the report can switch between English and 中文.
  feedback: { fluency: Bilingual; lexical: Bilingual; grammar: Bilingual; pronunciation: Bilingual };
  tips: Bilingual[];
  summary: Bilingual;
};

const EXAMINER_SYSTEM = `You are a friendly but professional IELTS Speaking examiner conducting a live one-to-one speaking test in English. Run it in three parts:
- Part 1 (interview): short questions about the candidate and familiar topics.
- Part 2 (long turn): give ONE cue card — "Describe ..." with 3 "You should say:" bullet points — and tell the candidate they have about a minute to think and should then speak for one to two minutes.
- Part 3 (discussion): more abstract two-way questions linked to the Part 2 topic.

Rules:
- Ask only ONE thing per turn. Keep each of your turns short and natural, like a real examiner (usually under 45 words). Do NOT teach, correct, or comment on their English during the test.
- Adapt to the candidate's level: if answers are short or simple, ask easier, encouraging follow-ups; if the candidate is advanced, probe with "why / how / to what extent" abstract questions.
- You are told the elapsed and total time each turn. Pace yourself: Part 1 in the first third, Part 2 around the middle, Part 3 in the last third.
- If the candidate's answer is empty or off-topic, gently re-ask or move on.

Output ONLY your next spoken line, as plain text — no JSON, no quotation marks, no labels like "Examiner:", no stage directions or parentheses. Just the words you speak next.`;

const GRADER_SYSTEM = `You are an IELTS Speaking examiner applying the official band descriptors. You are given the transcript of a speaking test. Assess THE CANDIDATE only, on the four criteria, each scored 0–9 in whole or half bands:
- "fluency": Fluency and Coherence
- "lexical": Lexical Resource
- "grammar": Grammatical Range and Accuracy
- "pronunciation": Pronunciation

If a measured pronunciation score is supplied, let it inform the Pronunciation band; otherwise estimate from the transcript and say so in the feedback. "overall" = the mean of the four rounded to the nearest 0.5. For each criterion give a 1–2 sentence justification that quotes or refers to the candidate's actual language, plus practical tips. Be fair and specific; this is a practice estimate, not an official score.

CRITICAL — bilingual: every feedback/tip/summary field MUST contain BOTH an English version ("en") AND a Simplified Chinese (简体中文) version ("zh") that conveys the same thing in natural, encouraging language a Chinese student can act on. The "zh" is a real translation/adaptation, never blank or pinyin.

Output STRICT JSON only, no markdown:
{"fluency":n,"lexical":n,"grammar":n,"pronunciation":n,"overall":n,"feedback":{"fluency":{"en":"...","zh":"..."},"lexical":{"en":"...","zh":"..."},"grammar":{"en":"...","zh":"..."},"pronunciation":{"en":"...","zh":"..."}},"tips":[{"en":"...","zh":"..."},{"en":"...","zh":"..."}],"summary":{"en":"<2-3 sentence overall summary>","zh":"<中文总结>"}}`;

/* ---------- Writing assessment ---------- */

export type Bilingual = { en: string; zh: string };

// Per-task criterion bands (0–9, half-band steps). Task 1 uses Task Achievement
// (`ta`); Task 2 uses Task Response (`tr`).
export type WritingTaskBand = {
  ta?: number;
  tr?: number;
  cc: number; // Coherence and Cohesion
  lr: number; // Lexical Resource
  gra: number; // Grammatical Range and Accuracy
  band: number; // task band = mean of the four criteria
  feedback: Bilingual; // what the candidate did well / must fix, EN + 中文
};

export type WritingBands = {
  task1: WritingTaskBand | null;
  task2: WritingTaskBand | null;
  overall: number; // Task 2 weighted double, rounded to nearest 0.5
  recommendations: Bilingual[]; // concrete next-time improvements, bilingual
  summary: Bilingual;
};

export type WritingTaskInput = {
  prompt: string;
  response: string;
  minWords: number;
  kind: 'task1' | 'task2';
};

const WRITING_GRADER_SYSTEM = `You are a senior IELTS Academic Writing examiner applying the official public band descriptors. You grade a candidate's Task 1 and/or Task 2 answer and return a band score plus actionable feedback.

Score each submitted task on its four criteria, each 0–9 in whole OR half bands:
- Task 1 → "ta" = Task Achievement, "cc" = Coherence and Cohesion, "lr" = Lexical Resource, "gra" = Grammatical Range and Accuracy.
- Task 2 → "tr" = Task Response, "cc" = Coherence and Cohesion, "lr" = Lexical Resource, "gra" = Grammatical Range and Accuracy.
Each task's "band" = the mean of its four criterion scores, rounded to the nearest 0.5.

Apply the marking scheme faithfully:
- Penalise under-length under Task Achievement/Task Response: Task 1 must be ≥150 words, Task 2 ≥250 words. If shorter, the answer cannot reach the higher bands for that criterion — say so.
- Reward a clear position/overview, fully developed and extended ideas, logical paragraphing and cohesion, range and precision of vocabulary and grammar, and accuracy. Penalise memorised/off-topic content, listing without development, and frequent errors that impede communication.
- Be specific: quote or paraphrase the candidate's actual words when justifying a score. Do NOT inflate scores.

CRITICAL — bilingual feedback: every feedback/recommendation/summary field MUST contain BOTH an English version ("en") AND a Simplified Chinese (简体中文) version ("zh") that says the same thing in natural, encouraging, concrete language a Chinese student can act on. The Chinese is a real translation/adaptation, not pinyin and not left blank.

The "overall" you return will be recomputed by the system from the task bands (Task 2 counts double), so focus on grading each task correctly.

Output STRICT JSON only, no markdown, no commentary. For a task that was NOT submitted, use null. Shape:
{"task1":{"ta":n,"cc":n,"lr":n,"gra":n,"band":n,"feedback":{"en":"...","zh":"..."}}|null,
 "task2":{"tr":n,"cc":n,"lr":n,"gra":n,"band":n,"feedback":{"en":"...","zh":"..."}}|null,
 "recommendations":[{"en":"...","zh":"..."},{"en":"...","zh":"..."},{"en":"...","zh":"..."}],
 "summary":{"en":"...","zh":"..."}}`;

function countWords(s: string): number {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function buildWritingGraderMessages(tasks: WritingTaskInput[]): ChatMessage[] {
  const blocks = tasks
    .filter((t) => t.response.trim())
    .map((t) => {
      const label = t.kind === 'task1' ? 'TASK 1' : 'TASK 2';
      return `=== ${label} (minimum ${t.minWords} words; submitted ${countWords(t.response)} words) ===
PROMPT:
${t.prompt.trim()}

CANDIDATE RESPONSE:
${t.response.trim()}`;
    })
    .join('\n\n');
  return [
    { role: 'system', content: WRITING_GRADER_SYSTEM },
    {
      role: 'user',
      content: `Grade the following IELTS Academic Writing answer(s). Remember: feedback, recommendations and summary must each include both "en" and "zh". Return JSON only.\n\n${blocks}`,
    },
  ];
}

const half = (n: number) => Math.round(n * 2) / 2;

/** Mean of the four criterion scores for a task, rounded to the nearest 0.5. */
export function taskBandFromCriteria(t: WritingTaskBand): number {
  const parts = [t.ta ?? t.tr, t.cc, t.lr, t.gra].filter(
    (n): n is number => typeof n === 'number' && !Number.isNaN(n),
  );
  if (!parts.length) return 0;
  return half(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/** IELTS Writing overall: Task 2 counts double, rounded to the nearest 0.5. */
export function overallWritingBand(task1: number | null, task2: number | null): number {
  if (task1 != null && task2 != null) return half((task1 + 2 * task2) / 3);
  return half(task2 ?? task1 ?? 0);
}

export function buildExaminerMessages(
  history: Turn[],
  elapsedSec: number,
  totalSec: number,
  closing = false,
): ChatMessage[] {
  const msgs: ChatMessage[] = [{ role: 'system', content: EXAMINER_SYSTEM }];
  // Only resend the last ~12 turns: the full transcript grows every turn and
  // inflates DeepSeek's time-to-first-token, making later turns sluggish. The
  // [time] hint below preserves pacing, so the examiner stays on track.
  for (const t of history.slice(-12)) {
    msgs.push({ role: t.role === 'examiner' ? 'assistant' : 'user', content: t.text || '(no answer)' });
  }
  const instruction = history.length === 0
    ? 'Begin the test: greet briefly and ask your first Part 1 question.'
    : closing
      ? 'Time is nearly up — give a brief, warm closing line to end the speaking test (thank the candidate and say that is the end of the test). Do not ask another question.'
      : 'Give your next examiner turn now.';
  msgs.push({ role: 'user', content: `[time] ${Math.round(elapsedSec)}s elapsed of ${totalSec}s total. ${instruction}` });
  return msgs;
}

export function buildGraderMessages(history: Turn[], measuredPronunciation?: number): ChatMessage[] {
  const transcript = history
    .map((t) => `${t.role === 'examiner' ? 'EXAMINER' : 'CANDIDATE'}: ${t.text}`)
    .join('\n');
  const pron = measuredPronunciation != null
    ? `\n\nA measured pronunciation score (0–100) from speech analysis: ${measuredPronunciation}. Map it onto the 0–9 Pronunciation band.`
    : '';
  return [
    { role: 'system', content: GRADER_SYSTEM },
    { role: 'user', content: `Transcript:\n${transcript}${pron}\n\nReturn the JSON assessment.` },
  ];
}

/** Pull a JSON object out of an LLM reply that may be fenced or have stray text. */
export function parseJsonObject<T>(raw: string): T | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
