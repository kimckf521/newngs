import { externalLinks } from '@/lib/siteLinks';

export function HighschoolMappingProgramEn() {
  return (
    <section className="highschool-mapping-program__flex-center section-font-style">
      <div className="highschool-mapping-program__grid-cols">
        <div className="highschool-mapping-program__flex-col">
          <h2 className="section_title highschool-mapping-program__style-1">
            NGS High-School
            <br />
            Mapping Program
          </h2>
          <p className="section_paragraph highschool-mapping-program__style-2">
            The <strong>NGS High-School Mapping Program</strong> provides students with a clear, structured roadmap to align their high school journey with their future academic and career aspirations.
          </p>
          <p className="section_paragraph highschool-mapping-program__style-2">
            By mapping out key milestones, including curriculum and course selection, extracurricular activities, and skill development, the program ensures students are well-prepared for college readiness and beyond.
          </p>
          <p className="section_paragraph highschool-mapping-program__style-3">
            This initiative empowers students to set meaningful goals, manage their progress effectively, and make informed decisions throughout high school, creating a strong foundation for success in higher education and life.
          </p>
        </div>
        <div className="highschool-mapping-program__flex-col-6d6b">
          <img alt="High-school mapping visit" src="/static/img/vanke.JPG" className="highschool-mapping-program__rounded" />
          <a href={externalLinks.customerServiceWeChat} className="highschool-mapping-program__rounded-1f88">
            Book a Free Call
          </a>
        </div>
      </div>
    </section>
  );
}
