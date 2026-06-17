import type { Metadata } from 'next';
import { OAuthCallback } from '@/components/auth/OAuthCallback';

export const metadata: Metadata = { title: '登录中 — NextGen Scholars' };
// OAuth callback consumes runtime URL params; never prerender it.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <OAuthCallback locale="zh" />;
}
