import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';
import { RenderPage } from '@/components/puck/RenderPage';
import { getPublishedData } from '@/lib/puck/server';

// ISR: statically generate and refresh in the background every 5 min, so the
// homepage is served as a cached page instead of blocking SSR on a CloudBase
// read each request. The admin publish flow should call revalidatePath('/index_en')
// to push edits instantly; otherwise they appear within the revalidate window.
export const revalidate = 300;

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
