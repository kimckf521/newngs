import { siteLinks } from '@/lib/siteLinks';

export function IntroConnectsEn() {
  return (
    <section className="intro-connects__bg-white section-font-style">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-connects__text-center">NextGen Connects</h2>
        <div className="intro-connects__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle intro-connects__style-1">
              NextGen Global
              <br />
              Community
            </h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a className="bullet-link" href={siteLinks.en.cclr}>CCLR Programme</a>
              </li>
              <li>
                <a>Partner With Us</a>
              </li>
              <li>
                <a className="bullet-link" href={siteLinks.en.ngsInspires}>NextGen Inspires</a>
              </li>
              <li>
                <a className="bullet-link active" href={siteLinks.en.ngsConnects}>NextGen Connects</a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <p className="section_paragraph intro-connects__style-3">
              <strong>NextGen Connects</strong> helps families and students navigate the complex school selection process. Through deep school visits, comprehensive school reports, and learning path matching analysis, we provide an information-rich, well-matched decision-making experience for students and parents.
              <br />
              <br />
              The program also helps families and students adapt to the complex transition from exam preparation to a new learning environment, providing comprehensive support across exam prep, academics, and emotional well-being.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
