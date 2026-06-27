import 'server-only';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';

/**
 * Shared gate for the admin API routes (members, courses). The console sends the
 * secret as an `x-admin-key` header; it's compared in constant time against
 * ADMIN_API_KEY. If no key is configured, allow only OUTSIDE production so a
 * deployed route is never wide open, but local/preview stays frictionless.
 */
export function authorizedAdmin(req: NextRequest): boolean {
  const key = process.env.ADMIN_API_KEY;
  if (key) {
    const a = Buffer.from(req.headers.get('x-admin-key') || '');
    const b = Buffer.from(key);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return process.env.NODE_ENV !== 'production';
}
