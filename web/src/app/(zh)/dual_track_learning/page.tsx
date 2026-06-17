import { DualTrackPageV1 } from '@/components/redesign-v1/pages/DualTrackPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'dualTrack',
  locale: 'zh',
  title: '双轨计划：普高与国际高中双文凭',
  description:
    '未来教育双轨计划（DTP）为本地学校学生定制国际课程，不打断普高学习即可衔接 IB、A-Level、AP、HKDSE，毕业达标可获普高与国际高中双文凭。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'dualTrack',
          locale: 'zh',
          name: '双轨计划：普高与国际高中双文凭',
          description:
            '未来教育双轨计划（DTP）为本地学校学生定制国际课程，不打断普高学习即可衔接 IB、A-Level、AP、HKDSE，毕业达标可获普高与国际高中双文凭。',
          type: 'Course',
        })}
      />
      <DualTrackPageV1 locale="zh" />
    </>
  );
}
