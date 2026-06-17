import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';
import { RenderPage } from '@/components/puck/RenderPage';
import { getPublishedData } from '@/lib/puck/server';

// Render per request so newly-published page-builder content appears without a
// rebuild (reads CloudBase server-side). Phase 3 can switch to ISR + on-publish revalidate.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'NextGen Scholars — International Education Parents Trust',
  description:
    'NextGen Scholars connects ambitious students with mentors from the world’s leading universities and global industry leaders — an international education without borders.',
};

export default async function Page() {
  // Render the published page-builder content if it exists; otherwise fall
  // back to the hardcoded homepage (never breaks if CloudBase is unavailable).
  const data = await getPublishedData('home', 'en');
  return data ? <RenderPage data={data} locale="en" /> : <HomeContentV1 locale="en" />;
}
