import { siteLinks } from '@/lib/siteLinks';

export function PartnerWithNgsEn() {
  return (
    <section className="programs our-programs__section section-font-style">
      <h2 className="section_title partner-with-ngs__text-center">PARTNER WITH NGS</h2>
      <div className="our-programs__grid-cols">
        <a href={siteLinks.en.cclr} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-2">
              <img alt="Partner With Us" src="/static/img/partnerwithus.jpg" className="our-programs__full-size" />
            </div>
            <h3 className="section_subtitle our-programs__text-center-fcad">Partner With Us</h3>
            <p className="section_paragraph our-programs__style-3">
              We offer expert online international programs, admissions coaching, and personalized tutoring services designed to empower educators and students to achieve academic excellence and unlock their full potential.
            </p>
          </div>
        </a>
        <a href={siteLinks.en.hybrid} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-4">
              <img alt="Study With Us" src="/static/img/Studywithus.jpg" className="our-programs__full-size" />
            </div>
            <h3 className="section_subtitle our-programs__text-center-8988">Study With Us</h3>
            <p className="section_paragraph our-programs__style-3">
              Perhaps you&apos;re dreaming of gaining admission to your dream university but unsure how to get there. Our personalized mentoring services are here to guide you every step of the way.
            </p>
          </div>
        </a>
        <a href={siteLinks.en.ngsInspires} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-4">
              <img alt="Join Us" src="/static/img/Joinus.jpg" className="our-programs__full-size" />
            </div>
            <h3 className="section_subtitle our-programs__text-center-9eec">Join Us</h3>
            <p className="section_paragraph our-programs__style-3">
              Connect global industry leaders, global universities, and global learners at NextGen Scholars!
            </p>
          </div>
        </a>
      </div>
    </section>
  );
}
