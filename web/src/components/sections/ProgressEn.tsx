import { siteLinks } from '@/lib/siteLinks';

export function ProgressEn() {
  return (
    <section className="inprog progress__flex-center section-font-style">
      <div className="ip-card progress__flex-col">
        <div className="ip-grid progress__grid-cols">
          <div className="ip-copy progress__flex-col-aba9 section-font-style">
            <span className="progress__bg-dark">
              <h2>IN PROGRESS</h2>
            </span>
            <h1 className="ip-title progress__style-9">We&apos;re working on this page</h1>
            <p>
              Thanks for stopping by — this section is under active construction. We&apos;re polishing content and wiring things up so it&apos;s useful for you.
            </p>
            <div className="ip-row progress__flex-gap">
              <span aria-hidden="true" className="ip-spinner progress__circle"></span>
              <div aria-hidden="true" className="ip-bar progress__rounded">
                <span className="progress__bg-dark-1ca4"></span>
              </div>
            </div>
            <div className="ip-row progress__flex-center-a53f">
              <p>Live updates deploying soon</p>
            </div>
            <div className="ip-row progress__flex-gap-f4f1">
              <a className="btn btn-primary progress__bg-dark-71ff" href={siteLinks.en.home}>
                Go to Home
              </a>
              <a
                className="btn btn-outline progress__bg-white"
                href="mailto:info@nextgenscholars.asia?subject=NGS%20Page%20Inquiry&amp;body=Hello%20NGS%20team,"
              >
                Contact Us
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="ip-illust progress__flex-center-5877 section-font-style">
            <img alt="" src="/static/img/work_in_progress.jpg" className="progress__style-11" />
            <span className="blob b1"></span>
            <span className="blob b2"></span>
          </div>
        </div>
      </div>
    </section>
  );
}
