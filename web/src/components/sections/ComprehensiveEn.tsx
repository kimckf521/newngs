import { siteLinks } from '@/lib/siteLinks';

export function ComprehensiveEn() {
  return (
    <section className="comprehensive__flex-center section-font-style">
      <div className="k12-school__flex-col">
        <h2 className="section_title comprehensive__text-center">A Comprehensive and Tailored Curriculum</h2>
        <div className="comprehensive__grid-cols">
          <div className="intro-hybrid__flex-center">
            <img alt="Student" src="/static/img/smilegirl.jpg" className="comprehensive__rounded" />
          </div>
          <div className="comprehensive__flex-col">
            <div className="comprehensive__style-1">
              <h3 className="section_subtitle comprehensive__style-2">Personalize Tutoring</h3>
              <p className="section_paragraph comprehensive__style-3">
                No cookie-cutter teaching or one-size-fits-all courses. Every student is a unique learner. At NGS, we provide an entry assessment, design a personalized study plan, offer real-time tracking, and give periodic feedback to support your growth every step of the way.
              </p>
              <br />
              <h3 className="section_subtitle comprehensive__style-2">Clear Learning Goals</h3>
              <p className="section_paragraph comprehensive__style-3">
                Whether you aim to prepare in advance, achieve a short-term score boost, or excel in exam preparation, NGS tutors will create a study plan tailored to your specific goals.
              </p>
              <br />
              <h3 className="section_subtitle comprehensive__style-2">Popular Subjects Covered</h3>
              <p className="section_paragraph comprehensive__style-4">
                NGS offers 1-on-1 tutoring for most subjects across IB, A-Level, AP, and IGCSE curriculums.
              </p>
            </div>
            <div className="comprehensive__text-center-c30c">
              <a href={siteLinks.en.admissions} className="comprehensive__bg-dark">
                Book a Trial Class
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
