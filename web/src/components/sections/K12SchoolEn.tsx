import { TutorCard } from './TutorCard';
import { k12SchoolTutorsEn } from '@/content/en/faculty';

export function K12SchoolEn() {
  return (
    <section className="tutors_profile__flex-center section-font-style">
      <div className="tutors_profile__flex-col">
        <h2 className="section_title faculties__text-center">NGS K-12 School Specialists</h2>
        <div className="tutors_profile__grid-cols">
          {k12SchoolTutorsEn.map((tutor) => (
            <TutorCard key={tutor.name} tutor={tutor} locale="en" />
          ))}
        </div>
      </div>
    </section>
  );
}
