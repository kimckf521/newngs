import { HomeContentV1 } from '@/components/redesign-v1/HomeContentV1';
import { RenderPage } from '@/components/puck/RenderPage';
import { LocalPublishedView } from '@/components/puck/LocalPublishedView';
import { getPublishedData } from '@/lib/puck/server';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

// ISR: statically generate and refresh in the background every 5 min, so the
// homepage is served as a cached page instead of blocking SSR on a CloudBase
// read each request. The admin publish flow should call revalidatePath('/index_en')
// to push edits instantly; otherwise they appear within the revalidate window.
export const revalidate = 300;

export const metadata = pageSeo({
  page: 'home',
  locale: 'en',
  title: "International Education & University Mentorship",
  description:
    "Connect with mentors from Harvard and the world's leading universities. Personalised college admissions support, high-school programs and global pathways.",
});

export default async function Page() {
  // Render the published page-builder content if it exists; otherwise fall
  // back to the hardcoded homepage (never breaks if CloudBase is unavailable).
  const data = await getPublishedData('home', 'en');
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'home',
          locale: 'en',
          name: "International Education & University Mentorship",
          description:
            "Connect with mentors from Harvard and the world's leading universities. Personalised college admissions support, high-school programs and global pathways.",
          type: 'WebPage',
        })}
      />
      {data ? (
        <RenderPage data={data} locale="en" />
      ) : (
        <LocalPublishedView route="home" locale="en">
          <HomeContentV1 locale="en" />
        </LocalPublishedView>
      )}
    </>
  );
}
