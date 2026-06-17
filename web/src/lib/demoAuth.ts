/**
 * FRONT-END DEMO AUTH (no real security).
 * ----------------------------------------------------------------------
 * This is a UI-only stand-in so the login/register/member flows work
 * visually. The "session" is just a value in localStorage — there is NO
 * real authentication, no password checking, and nothing is secure.
 * Replace this (and /api/auth) with a real auth backend before launch.
 */

import type { Role } from './roles';

export type DemoUser = { name: string; email: string; role?: Role };

const KEY = 'ngs-demo-user';

export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearDemoUser(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NG'
  );
}
