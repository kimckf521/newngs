import { siteLinks } from '@/lib/siteLinks';

export function IntroInspiresEn() {
  return (
    <section className="intro-connects__bg-white section-font-style">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-connects__text-center">NextGen Inspires</h2>
        <div className="intro-connects__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle intro-connects__style-1">NextGen Global Community</h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a className="bullet-link" href={siteLinks.en.cclr}>CCLR Programme</a>
              </li>
              <li>
                <a>Hybrid Learning</a>
              </li>
              <li>
                <a className="bullet-link active" href={siteLinks.en.ngsInspires}>NextGen Inspires</a>
              </li>
              <li>
                <a className="bullet-link" href={siteLinks.en.ngsConnects}>NextGen Connects</a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <h3 className="intro-connects__style-3">Join the NGS Global Learning Community!</h3>
            <p className="section_paragraph intro-connects__style-3">
              <strong>NextGen Inspires</strong> is an exclusive subscription service designed for NGS partner schools, connecting students and educators to global opportunities.
            </p>
            <p className="section_paragraph connect-to-parents__style-1">
              Through partnerships with global industry leaders and renowned universities, combined with the innovative SPARK LAB and a thriving alumni network, <strong>NextGen Inspires</strong> provides unmatched resources, mentorship, and inspiration to help the next generation thrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
