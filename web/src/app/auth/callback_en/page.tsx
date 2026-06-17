import type { Metadata } from 'next';
import { OAuthCallback } from '@/components/auth/OAuthCallback';

export const metadata: Metadata = {
  title: 'Signing in',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
// OAuth callback consumes runtime URL params; never prerender it.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <OAuthCallback locale="en" />;
}
