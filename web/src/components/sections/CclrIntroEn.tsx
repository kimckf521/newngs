import { siteLinks } from '@/lib/siteLinks';

export function CclrIntroEn() {
  return (
    <section className="intro-connects__bg-white section-font-style">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-cclr__text-center">PARTNER WITH NEXTGEN SCHOLARS</h2>
        <div className="intro-connects__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle partner-with-us-cclr-programs__style-1">
              Career College
              <br />
              Life Readiness Programme
            </h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a href={siteLinks.en.cclr} className="bullet-link active">Career Readiness</a>
              </li>
              <li>
                <a>College Readiness</a>
              </li>
              <li>
                <a href={siteLinks.en.ngsInspires} className="bullet-link">Life Readiness</a>
              </li>
              <li>
                <a href={siteLinks.en.ngsConnects} className="bullet-link">Global Competency</a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <p className="section_paragraph intro-connects__style-3">
              {`The NGS CCLR (College, Career, and Life Readiness) course is designed to provide a comprehensive framework for defining, guiding, and assessing students' critical competencies essential for academic success, career development, and social engagement.`}
            </p>
            <p className="section_paragraph head-cclr__style-1">
              Beyond academic achievements, the CCLR curriculum equips students with the skills and knowledge necessary to navigate university admissions, achieve career goals, and thrive in society. By empowering students, families, educators, and schools with reliable insights, CCLR ensures that every decision made for the student is well-informed, fostering success at every stage of their educational and professional journey.
            </p>
            <p className="section_paragraph connect-to-parents__style-1">
              Through its focus on college readiness, career competencies, and life skills, the CCLR course prepares students to seamlessly transition into higher education, the workforce, and society with confidence and capability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CclrDiagramEn() {
  return (
    <section className="partner-with-us-cclr-programs__flex-center section-font-style">
      <div className="partner-with-us-cclr-programs__text-center">
        <h2 className="section_title partner-with-us-cclr-programs__style-2">
          CAREER COLLEGE LIFE READINESS
          <br />
          PROGRAMME
        </h2>
        <div className="partner-with-us-cclr-programs__flex-center-78b2">
          <img
            src="/static/img/circles.jpg"
            alt="CCLR Diagram"
            className="partner-with-us-cclr-programs__full-size"
          />
        </div>
      </div>
    </section>
  );
}
