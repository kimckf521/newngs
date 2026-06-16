import { TutorCard } from './TutorCard';
import { collegeCounselingTutorsEn } from '@/content/en/faculty';

export function CollegeCounselingEn() {
  return (
    <section className="tutors_profile__flex-center section-font-style">
      <div className="tutors_profile__flex-col">
        <h2 className="section_title faculties__text-center">NGS College Counseling Team</h2>
        <div className="college-counseling__flags">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇭🇰 🇸🇬</div>
        <div className="tutors_profile__grid-cols">
          {collegeCounselingTutorsEn.map((tutor) => (
            <TutorCard key={tutor.name} tutor={tutor} locale="en" />
          ))}
        </div>
      </div>
    </section>
  );
}
