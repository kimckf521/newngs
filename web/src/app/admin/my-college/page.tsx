import { MyCollegeView } from '@/components/admin/console/MyCollegeView';

/** School-side tenant portal ("我的学院") — the view a partner college sees of
 *  its own info, authorization requests, resources and manual. Scaffold w/ sample
 *  data; real per-tenant data + role-gating is the next phase. */
export default function MyCollegePage() {
  return <MyCollegeView locale="zh" />;
}
