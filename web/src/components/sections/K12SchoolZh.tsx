import { TutorCard } from './TutorCard';
import { k12SchoolTutorsZh } from '@/content/zh/faculty';

export function K12SchoolZh() {
  return (
    <section className="tutors_profile__flex-center section-font-style_zh">
      <div className="tutors_profile__flex-col">
        <h2 className="section_title faculties__text-center">K-12国际学校择校指导老师</h2>
        <div className="tutors_profile__grid-cols">
          {k12SchoolTutorsZh.map((tutor) => (
            <TutorCard key={tutor.name} tutor={tutor} locale="zh" />
          ))}
        </div>
      </div>
    </section>
  );
}
