import { CourseEditPage } from '@/components/admin/console/CourseEditPage';

/** Full-page course editor. `id` is the course slug, or 'new' to create one.
 *  Reached by clicking a course card in /admin → 课程. */
export default function AdminCourseEditRoute({ params }: { params: { id: string } }) {
  return <CourseEditPage id={params.id} locale="zh" />;
}
