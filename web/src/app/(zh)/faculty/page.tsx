import { FacultyPageV1 } from '@/components/redesign-v1/pages/FacultyPageV1';
import { pageSeo } from '@/lib/seo';
import { pageJsonLd } from '@/lib/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageSeo({ page: 'faculty', locale: 'zh', title: '教学团队：来自全球顶尖大学的精英导师', description: '认识 NGS 教学团队，IB 40+ 高分、Top 50 大学毕业及奥赛奖牌导师，提供 IB、A-Level、AP 与 HKDSE 一对一与小班定制化辅导，助力学生提分升学。' });

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd({ page: 'faculty', locale: 'zh', name: '教学团队：来自全球顶尖大学的精英导师', description: '认识 NGS 教学团队，IB 40+ 高分、Top 50 大学毕业及奥赛奖牌导师，提供 IB、A-Level、AP 与 HKDSE 一对一与小班定制化辅导，助力学生提分升学。', type: 'CollectionPage' })} />
      <FacultyPageV1 locale="zh" />
    </>
  );
}
