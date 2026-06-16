import { TutorCard } from './TutorCard';
import { collegeCounselingTutorsZh } from '@/content/zh/faculty';

export function CollegeCounselingZh() {
  return (
    <section className="tutors_profile__flex-center section-font-style_zh">
      <div className="tutors_profile__flex-col">
        <h2 className="section_title faculties__text-center">NGS 升学指导老师</h2>
        <div className="college-counseling__flags">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇭🇰 🇸🇬</div>
        <div className="tutors_profile__grid-cols">
          {collegeCounselingTutorsZh.map((tutor) => (
            <TutorCard key={tutor.name} tutor={tutor} locale="zh" />
          ))}
        </div>
      </div>
    </section>
  );
}
