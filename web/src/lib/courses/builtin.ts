import type { AdminCourse } from './types';

/**
 * Built-in courses that ship with the product. They always appear in the admin
 * console's 课程 list — even with no database configured — so admins can manage
 * them without a one-time seed step.
 *
 * Editing a built-in in the standard editor and saving writes a normal row to
 * the courses store; that stored row then takes precedence over the default
 * (see {@link mergeBuiltins}). The rich lessons / videos / per-module tests for
 * the IELTS course are authored in the dedicated editor at /admin/ielts_training
 * (linked from the course editor) — the AdminCourse record here holds the
 * course metadata + module list shown in the console and student portal.
 */

/** Course id under which the IELTS question bank (Cambridge tests) is stored,
 *  and the slug for the built-in IELTS Training course. Keeping these equal
 *  means opening the course in the editor shows its linked question bank. */
export const IELTS_COURSE_ID = 'ielts';

/** Stable creation timestamp (2025-01-01) so the record doesn't look like it
 *  "changed" on every build. */
const BUILTIN_CREATED_AT = 1735689600000;

export const BUILTIN_COURSES: AdminCourse[] = [
  {
    id: IELTS_COURSE_ID,
    name: 'English Language Course (IELTS Training)',
    description:
      'A 10-module IELTS preparation course covering everyday and academic topics across Listening, Reading, Writing and Speaking — with rich lessons, videos and a timed multiple-choice test per module.',
    level: 'B1–C1',
    track: 'IELTS',
    published: true,
    createdAt: BUILTIN_CREATED_AT,
    modules: [
      { title: 'Home, Family & Daily Life', mcqButton: 'mcq' },
      { title: 'Politics and Socio-Cultural Issues', mcqButton: 'mcq' },
      { title: 'Work and Professions', mcqButton: 'mcq' },
      { title: 'Health and Fitness', mcqButton: 'mcq' },
      { title: 'Citizenship & Politics', mcqButton: 'mcq' },
      { title: 'Crime and Punishment', mcqButton: 'mcq' },
      { title: 'The Environment', mcqButton: 'mcq' },
      { title: 'Technology and Social Networking', mcqButton: 'mcq' },
      { title: 'Science and Education', mcqButton: 'mcq' },
      { title: 'The IELTS Exam', mcqButton: 'none' },
    ],
  },
];

/** Whether `id` is a built-in (shipped) course. */
export function isBuiltinCourse(id: string): boolean {
  return BUILTIN_COURSES.some((c) => c.id === id);
}

/** Route to the rich lesson/test editor for a built-in course, or null. */
export function builtinContentHref(id: string): string | null {
  return id === IELTS_COURSE_ID ? '/admin/ielts_training' : null;
}

/** Merge built-in courses with stored ones. A stored course with the same id
 *  wins, so admin edits override the shipped default. */
export function mergeBuiltins(stored: AdminCourse[]): AdminCourse[] {
  const ids = new Set(stored.map((c) => c.id));
  return [...stored, ...BUILTIN_COURSES.filter((c) => !ids.has(c.id))];
}
