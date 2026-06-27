import { AdminConsole } from '@/components/admin/console/AdminConsole';

/** Admin landing = the design-v1 console (Dashboard / Courses / Members), with
 *  links out to the Site Editor (/admin/page-list) and Live Chat (/admin/inbox). */
export default function AdminHome() {
  return <AdminConsole locale="zh" />;
}
