import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';
import { RenderPage } from '@/components/puck/RenderPage';
import { getPublishedData } from '@/lib/puck/server';

// ISR: statically generate and refresh in the background every 5 min, so the
// homepage is served as a cached page instead of blocking SSR on a CloudBase
// read each request. The admin publish flow should call revalidatePath('/') to
// push edits instantly; otherwise they appear within the revalidate window.
export const revalidate = 300;

export const metadata = {
  title: 'NextGen Scholars 未来学者 — 值得家长信赖的国际教育',
  description:
    'NextGen Scholars（未来学者）连接全球顶尖大学导师与各行业领袖，为下一代打造没有边界的国际教育。',
};

export default async function Page() {
  // Render the published page-builder content if it exists; otherwise fall
  // back to the hardcoded homepage (never breaks if CloudBase is unavailable).
  const data = await getPublishedData('home', 'zh');
  return data ? <RenderPage data={data} locale="zh" /> : <HomeContentV1 locale="zh" />;
}
