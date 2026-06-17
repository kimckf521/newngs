import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Coarse defense-in-depth for /admin: mark it noindex so the editor never gets
 * crawled. The real access control is the client AdminGate + the CloudBase
 * security rules on `pages` (the edge can't verify the client-held CloudBase
 * token, so we don't hard-block here).
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
