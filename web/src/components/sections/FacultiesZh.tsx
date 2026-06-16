import { TutorCard } from './TutorCard';
import {
  facultyMathScienceZh,
  facultyEnglishHistoryZh,
  facultyCollegeAdvisorsZh,
} from '@/content/zh/faculty';

export function FacultiesZh() {
  return (
    <>
      <section className="tutors_profile__flex-center section-font-style_zh">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">教学团队 - 数学|自然科学|经济</h2>
          <div className="tutors_profile__grid-cols">
            {facultyMathScienceZh.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="zh" />
            ))}
          </div>
        </div>
      </section>

      <section className="tutors_profile__flex-center section-font-style_zh">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">教学团队 - 英文|历史|法律|艺术</h2>
          <div className="tutors_profile__grid-cols">
            {facultyEnglishHistoryZh.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="zh" />
            ))}
          </div>
        </div>
      </section>

      <section className="tutors_profile__flex-center section-font-style_zh">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">全球方向升学导师</h2>
          <div className="tutors_profile__grid-cols">
            {facultyCollegeAdvisorsZh.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="zh" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
