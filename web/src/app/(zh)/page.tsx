import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';
import { RenderPage } from '@/components/puck/RenderPage';
import { LocalPublishedView } from '@/components/puck/LocalPublishedView';
import { getPublishedData } from '@/lib/puck/server';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

// ISR: statically generate and refresh in the background every 5 min, so the
// homepage is served as a cached page instead of blocking SSR on a CloudBase
// read each request. The admin publish flow should call revalidatePath('/') to
// push edits instantly; otherwise they appear within the revalidate window.
export const revalidate = 300;

export const metadata = pageSeo({
  page: 'home',
  locale: 'zh',
  title: '连接全球顶尖大学导师的国际教育平台',
  description:
    '未来学者连接哈佛等全球顶尖大学导师与行业领袖，提供国际课程、个性化升学辅导与全球学习路径，助力学生迈向理想大学。',
});

export default async function Page() {
  // Render the published page-builder content if it exists; otherwise fall
  // back to the hardcoded homepage (never breaks if CloudBase is unavailable).
  const data = await getPublishedData('home', 'zh');
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'home',
          locale: 'zh',
          name: '连接全球顶尖大学导师的国际教育平台',
          description:
            '未来学者连接哈佛等全球顶尖大学导师与行业领袖，提供国际课程、个性化升学辅导与全球学习路径，助力学生迈向理想大学。',
          type: 'WebPage',
        })}
      />
      {data ? (
        <RenderPage data={data} locale="zh" />
      ) : (
        <LocalPublishedView route="home" locale="zh">
          <HomeContentV1 locale="zh" />
        </LocalPublishedView>
      )}
    </>
  );
}
