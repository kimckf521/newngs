import { OnlineDiplomaPageV1 } from '@/components/redesign-v1/pages/OnlineDiplomaPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({
  page: 'onlineDiploma',
  locale: 'zh',
  title: '未来无界文凭课程 | 在线高中文凭与成绩单',
  description: '未来无界文凭课程（ODP）支持 A-Level、HKDSE、AP 在线学习，按自己的节奏学习，再到校园参加统一考试，达标后获认证高中文凭与完整成绩单。',
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: 'onlineDiploma',
          locale: 'zh',
          name: '未来无界文凭课程 | 在线高中文凭与成绩单',
          description: '未来无界文凭课程（ODP）支持 A-Level、HKDSE、AP 在线学习，按自己的节奏学习，再到校园参加统一考试，达标后获认证高中文凭与完整成绩单。',
          type: 'Course',
        })}
      />
      <OnlineDiplomaPageV1 locale="zh" />
    </>
  );
}
