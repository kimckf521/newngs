export function FormHybridEn() {
  return (
    <section className="form-hybrid__section section-font-style">
      <div className="form-hybrid__flex-col">
        <h2 className="section_title form-hybrid__text-center">NGS HYBRID PROGRAM</h2>
        <div className="form-hybrid__grid-cols">
          <div className="form-hybrid__flex-col-e0d5">
            <img alt="Student learning online" src="/static/img/smilegirl.jpg" className="form-hybrid__rounded" />
            <p className="section_paragraph form-hybrid__style-1">
              Enjoy the Flexibility of Learning Anywhere
              <br />
              at Your Own Pace
            </p>
          </div>
          <div className="form-hybrid__flex-col-cbed">
            <table className="form-hybrid__text-center-6228">
              <thead>
                <tr className="section-font-style">
                  <th className="form-hybrid__style-2">Items</th>
                  <th className="form-hybrid__style-2">Hybrid Model</th>
                </tr>
              </thead>
              <tbody>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Course Options</td><td className="form-hybrid__style-3">ALevel / HKDSE / AP</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Entry Assessment</td><td className="form-hybrid__style-3">Online</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Subject Learning</td><td className="form-hybrid__style-3">Online + On Campus</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Learning Platform</td><td className="form-hybrid__style-3">ClassIn + Classroom</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Learning Community</td><td className="form-hybrid__style-3">SPARK LAB + School Community</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Formative Assessment</td><td className="form-hybrid__style-3">Online</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Official Assessment</td><td className="form-hybrid__style-3">On Campus</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-3">Official Transcripts</td><td className="form-hybrid__style-3">Issued by School</td></tr>
                <tr className="section-font-style"><td className="form-hybrid__style-4">Enrollment</td><td className="form-hybrid__style-4">NGS Online + School</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function IntroHybridEn() {
  return (
    <section className="intro-hybrid__flex section-font-style">
      <div className="intro-hybrid__flex-col">
        <h2 className="section_title intro-hybrid__text-center">NGS HYBRID PROGRAM</h2>
        <div className="intro-hybrid__grid-cols">
          <div className="intro-hybrid__flex-center">
            <div className="intro-hybrid__flex-col-2dab">
              <h3 className="section_subtitle intro-hybrid__style-1">Hybrid Program</h3>
              <div className="intro-hybrid__style-2"></div>
              <ul className="intro-hybrid__style-3">
                <li>Flexible Learning Architecture</li>
                <li>Expanded Course Catalog</li>
                <li>Enhanced Educational Innovation</li>
              </ul>
            </div>
          </div>
          <div className="intro-hybrid__flex-col-7cc8">
            <h3 className="section_subtitle intro-hybrid__style-4">What is Hybrid Program?</h3>
            <p className="section_paragraph intro-hybrid__style-5">
              The Hybrid Learning Program is a flexible educational delivery model that seamlessly blends in-person and online instruction.
            </p>
            <p className="section_paragraph connect-to-parents__style-1">
              {`Students attend some classes physically at their school campus while participating in other courses through NGS's advanced online platform, creating a personalized learning schedule that adapts to their individual needs, interests, and circumstances.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
