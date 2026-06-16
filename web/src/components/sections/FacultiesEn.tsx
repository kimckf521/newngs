import { TutorCard } from './TutorCard';
import {
  facultyMathScienceEn,
  facultyEnglishHistoryEn,
  facultyCollegeAdvisorsEn,
} from '@/content/en/faculty';

export function FacultiesEn() {
  return (
    <>
      <section className="tutors_profile__flex-center section-font-style">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">Faculty · Math | Science | Economy</h2>
          <div className="tutors_profile__grid-cols">
            {facultyMathScienceEn.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="en" />
            ))}
          </div>
        </div>
      </section>

      <section className="tutors_profile__flex-center section-font-style">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">Faculty · English | History | Law | Arts</h2>
          <div className="tutors_profile__grid-cols">
            {facultyEnglishHistoryEn.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="en" />
            ))}
          </div>
        </div>
      </section>

      <section className="tutors_profile__flex-center section-font-style">
        <div className="tutors_profile__flex-col">
          <h2 className="section_title faculties__text-center">Faculty · College Advisors</h2>
          <div className="tutors_profile__grid-cols">
            {facultyCollegeAdvisorsEn.map((tutor) => (
              <TutorCard key={tutor.name} tutor={tutor} locale="en" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
