/**
 * User roles (用户角色) — the category a member belongs to.
 * ----------------------------------------------------------------------
 * Stored per user in the CloudBase `users` collection (see lib/userProfile).
 *
 * - `student` / `parent` are SELF-SELECTED on the register form.
 * - `admin` is NOT self-selectable — it's assigned out-of-band (CloudBase
 *   console, or a trusted server path). The client never writes `admin`.
 *
 * This is separate from the Puck editor's `admins` allowlist collection
 * (see lib/puck/admins) — that allowlist remains the real write-access
 * boundary for the page builder; `users.role` is for app-level personalisation
 * (greetings, routing, what a member sees).
 */
export const ROLES = ['student', 'parent', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** Fallback role for any account whose role is unknown / not yet stored. */
export const DEFAULT_ROLE: Role = 'student';

/** Roles a user may pick for themselves at registration (admin excluded). */
export const SELECTABLE_ROLES = ['student', 'parent'] as const satisfies readonly Role[];
export type SelectableRole = (typeof SELECTABLE_ROLES)[number];

export function isRole(v: unknown): v is Role {
  return typeof v === 'string' && (ROLES as readonly string[]).includes(v);
}

/** Coerce any value to a valid Role, falling back to the default. */
export function normalizeRole(v: unknown): Role {
  return isRole(v) ? v : DEFAULT_ROLE;
}

/** Localised display labels for each role. */
export const ROLE_LABELS: Record<'en' | 'zh', Record<Role, string>> = {
  en: { student: 'Student', parent: 'Parent', admin: 'Admin' },
  zh: { student: '学生', parent: '家长', admin: '管理员' },
};
