/** A course authored in the admin console and stored in the CloudBase
 *  `courses` collection (doc id = the slug). Based on the member-portal
 *  MemberCourse shape plus admin authoring fields. */
export type CourseModule = {
  title: string;
  progress?: number;
  mcqButton?: 'mcq' | 'retry' | 'none';
};

export type AdminCourse = {
  _id?: string; // CloudBase doc id (== id); STRIPPED before .set()
  id: string; // slug, stable key
  name: string;
  description?: string;
  level?: string; // e.g. "OTHM Level 4"
  track?: string; // e.g. "IELTS" / "Business"
  coverImage?: string; // cloud:// handle or URL (ImageUploadField)
  modules: CourseModule[];
  published: boolean;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: string;
};

export function courseDocId(slug: string): string {
  return slug;
}

/** Ensure a slug doesn't collide with an existing course id — append -2, -3, …
 *  so creating two same-named courses never silently overwrites the first. */
export function uniqueSlug(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  let i = 2;
  while (taken.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/** Make a DB-safe slug from a course name. Non-ASCII names (e.g. Chinese) fall
 *  back to a timestamped id — the human-readable label is `name`, not the id. */
export function slugify(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return s || `course-${Date.now().toString(36)}`;
}
