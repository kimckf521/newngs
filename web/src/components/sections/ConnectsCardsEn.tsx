import { siteLinks } from '@/lib/siteLinks';

export function ConnectsCardsEn() {
  return (
    <section className="connects-cards-zh__flex section-font-style">
      <div className="connects-cards__flex-col">
        <h2 className="section_title connects-cards__style-1">NextGen Connects</h2>
        <p className="section_paragraph connects-cards__style-2">
          School Insights • Growth Planning • Academic Readiness • Family Decisions
        </p>
        <div className="connects-cards__grid-cols">
          <div className="connects-cards__flex-col-9b69">
            <img alt="School Visits" src="/static/img/connects/vanke.JPG" className="connects-cards__circle" />
            <h3 className="section_subtitle connects-cards__style-3">K12 School Visits</h3>
            <p className="section_paragraph connects-cards__style-4">
              Deep school visits help families experience each school&apos;s learning environment, teaching philosophy, and core values to make better-informed enrollment decisions.
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img alt="School Reports" src="/static/img/connects/schoolreports.png" className="connects-cards__circle" />
            <h3 className="section_subtitle connects-cards__style-3">School Reports</h3>
            <p className="section_paragraph connects-cards__style-4">
              In-depth school reports for students and parents with future-goal matching analysis, providing insider information beyond what websites offer.
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img alt="Growth Mapping" src="/static/img/connects/growth.jpg" className="connects-cards__circle" />
            <h3 className="section_subtitle connects-cards__style-3">Growth Mapping</h3>
            <p className="section_paragraph connects-cards__style-4">
              Personalized high-school academic planning that fits each student&apos;s growth, interests, family plans, and future aspirations.
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img alt="Academic Clinics" src="/static/img/connects/academic.png" className="connects-cards__circle" />
            <h3 className="section_subtitle connects-cards__style-3">Academic Clinics</h3>
            <p className="section_paragraph connects-cards__style-4">
              Help students adapt to international school environments through language and academic bridging plus social expectations preparation.
            </p>
          </div>
        </div>
        <div className="connects-cards__style-5">
          <a href={siteLinks.en.inProgress} className="connects-cards__gradient-bg">
            Subscribe Now
          </a>
        </div>
      </div>
    </section>
  );
}
