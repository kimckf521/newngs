import type { QGroup } from './types';

/** Lowercase, strip punctuation/hyphens to spaces, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Expand a printed answer key into the set of accepted normalized strings.
 * Handles: alternatives separated by "/" or "//"; optional words in (parens)
 * accepted either way; hyphens treated as spaces.
 */
export function acceptedVariants(answer: string): string[] {
  const out = new Set<string>();
  for (const altRaw of answer.split(/\s*\/\/\s*|\s*\/\s*/)) {
    const alt = altRaw.trim();
    if (!alt) continue;
    const withParens = alt.replace(/[()]/g, '');          // grass(es) -> grasses
    const withoutParens = alt.replace(/\([^)]*\)/g, ' ');  // (unique) expeditions -> expeditions
    out.add(normalize(withParens));
    out.add(normalize(withoutParens));
  }
  out.delete('');
  return [...out];
}

/** True if the candidate's typed/selected value matches the key. */
export function isCorrect(answer: string, value: string | undefined): boolean {
  if (!value) return false;
  const v = normalize(value);
  return acceptedVariants(answer).includes(v);
}

/** Letters of a "choose TWO" key, e.g. "C/D" -> ["c","d"]. */
export function answerLetters(answer: string): string[] {
  return answer.split(/[\/,]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export type Verdict = { n: number; correct: boolean; your: string; key: string };

/** Score one group, returning a verdict per question number. */
export function scoreGroup(group: QGroup, answers: Record<number, string>): Verdict[] {
  const out: Verdict[] = [];
  const isChooseTwo = group.type === 'mcq' && /\bTWO\b/i.test(group.instructions);
  if (isChooseTwo) {
    // both question slots share one multi-select stored on the first n as "C,E"
    const first = group.questions[0].n;
    const picked = (answers[first] || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const key = answerLetters(group.questions[0].answer);
    group.questions.forEach((q, i) => {
      // award one mark per correct letter, mapped onto the slots in order
      const got = picked.filter((p) => key.includes(p));
      const correct = got.length > i;
      out.push({
        n: q.n,
        correct,
        your: picked.map((p) => p.toUpperCase()).join(', ') || '—',
        key: key.map((k) => k.toUpperCase()).join(' / '),
      });
    });
    return out;
  }
  for (const q of group.questions) {
    const your = answers[q.n] || '';
    out.push({ n: q.n, correct: isCorrect(q.answer, your), your: your || '—', key: q.answer });
  }
  return out;
}
