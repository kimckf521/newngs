import { externalLinks } from '@/lib/siteLinks';

export function MentorshipEn() {
  return (
    <section className="mentorship__bg-white section-font-style">
      <div className="mentorship__grid-cols">
        <div className="mentorship__flex-col">
          <img alt="Bridge City" src="/static/img/bridgecity.png" className="mentorship__rounded" />
          <a href={externalLinks.customerServiceWeChat} className="mentorship__gradient-bg">
            Free Consultation
          </a>
        </div>
        <div className="mentorship__flex-center">
          <div className="mentorship__style-1">
            <h2 className="section_title mentorship__style-2">NGS College Mentorship Program</h2>
            <p className="section_paragraph mentorship__style-3">
              The <strong>NGS College Mentorship Program</strong> is a personalized guidance initiative designed to empower students in navigating the complex journey of college admissions. Through Four-on-one mentorship, students receive tailored support in identifying their passions, refining their academic and extracurricular profiles, and building a strategic plan for university applications.
            </p>
            <p className="section_paragraph mentorship__style-4">
              The program emphasizes informed decision-making, helping students select the right colleges and programs while meeting application requirements and deadlines. With expert mentorship, students are equipped to confidently pursue their higher education goals and thrive in their academic future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
