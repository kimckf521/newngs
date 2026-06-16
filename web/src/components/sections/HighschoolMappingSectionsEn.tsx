import { externalLinks } from '@/lib/siteLinks';

export function HighschoolMappingSectionsEn() {
  return (
    <section className="highschool-mapping-sections__gradient-bg section-font-style">
      <div className="highschool-mapping-sections__flex-col">
        <h2 className="section_title highschool-mapping-sections__style-1">High-School Mapping</h2>
        <div className="highschool-mapping-sections__flex-gap">
          <span className="highschool-mapping-sections__rounded">A-Level</span>
          <span className="highschool-mapping-sections__rounded-5740">IB</span>
          <span className="highschool-mapping-sections__rounded-c71f">AP</span>
          <span className="highschool-mapping-sections__rounded-1397">HKDSE</span>
        </div>
        <div className="highschool-mapping-sections__grid-cols">
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">School Visits</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>Growth Mapping</li>
              <li>School List</li>
              <li>School Visits</li>
              <li>Interview/Test Scheduling</li>
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">School Reports</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>School Profile</li>
              <li>School Systems</li>
              <li>School Board</li>
              <li>School Leadership</li>
              <li>School Faculty</li>
              <li>Student Demographics</li>
              <li>Track-records</li>
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">Entrance-Exam Preparation</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>General Assessment</li>
              <li>English Exam</li>
              <li>Math Exam</li>
              <li>Interview Preparation</li>
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">Academic Planning</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>Distant Learning</li>
              <li>Hybrid Learning</li>
              <li>Dual-track Learning</li>
              <li>On-campus Exams</li>
              <li>Highschool Diploma</li>
            </ul>
          </div>
        </div>
        <div className="highschool-mapping-sections__style-4">
          <a href={externalLinks.customerServiceWeChat} className="highschool-mapping-sections__rounded-4d4a">
            Book a Free Call
          </a>
        </div>
      </div>
    </section>
  );
}
