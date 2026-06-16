'use client';

import { useState } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import {
  TRIAL_URL,
  EXAM_PREP_URL,
  PACKAGE_LINKS,
  CONSULT_LINKS,
  COLLEGE_LINKS,
  K12_LINKS,
} from '@/content/zh/admissions';

export function AdmissionsPlansEn() {
  const [packageSelection, setPackageSelection] = useState('10');
  const [consultSelection, setConsultSelection] = useState('free');
  const [collegeSelection, setCollegeSelection] = useState('annual');
  const [k12Selection, setK12Selection] = useState('1');

  function openUrl(url?: string) {
    if (!url) {
      alert('This option does not have a checkout link yet. Please contact support.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <section className="addmissions-plans__flex section-font-style">
        <div className="addmissions-plans__flex-col">
          <h2 className="section_title addmissions-plans__style-1">Subject Tutoring Packages</h2>
          <div className="addmissions-plans__flex-gap section-font-style">
            <span className="addmissions-plans__gradient-bg">Foundation</span>
            <span className="addmissions-plans__gradient-bg-4820">Synchronization</span>
            <span className="addmissions-plans__gradient-bg-2138">Acceleration</span>
            <span className="addmissions-plans__gradient-bg-b8b3">Exam Prep</span>
          </div>
          <div className="addmissions-plans__grid-cols">
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">Trial Class</h3>
                <p className="section_paragraph addmissions-plans__style-3">¥285/session</p>
                <ul className="addmissions-plans__style-4">
                  <li>1-hour 1-on-1 lesson</li>
                  <li>Top 50 global university tutors</li>
                  <li>IB / A-Level / AP / HKDSE expertise</li>
                  <li>Personalized study plan &amp; advice</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <button className="addmissions-plans__rounded" type="button" onClick={() => openUrl(TRIAL_URL)}>
                  Buy
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">Course Package</h3>
                <p className="section_paragraph addmissions-plans__style-3">By Package</p>
                <ul className="addmissions-plans__style-4">
                  <li>Personalized study planning</li>
                  <li>4-on-1 mentor support</li>
                  <li>Premium learning materials</li>
                  <li>Goal setting &amp; reports</li>
                  <li>Top 50 global university tutors</li>
                  <li>IB / A-Level / AP / HKDSE coverage</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5 section-font-style">
                <label htmlFor="package-order-en" className="addmissions-plans__style-6">
                  Choose option:
                </label>
                <select
                  id="package-order-en"
                  className="addmissions-plans__rounded-b4a7"
                  value={packageSelection}
                  onChange={(e) => setPackageSelection(e.target.value)}
                >
                  <option value="10">Starter: 10 hours</option>
                  <option value="20">Foundation: 20 hours</option>
                  <option value="30-sync">Synchronization: 30 hours</option>
                  <option value="30-acc">Acceleration: 30 hours</option>
                  <option value="40">Cross-subject: 40 hours</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(PACKAGE_LINKS[packageSelection])}
                >
                  Buy
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">Exam Prep</h3>
                <p className="section_paragraph addmissions-plans__style-7">
                  Package: <strong>10 sessions × 1.5 hours</strong>
                </p>
                <ul className="addmissions-plans__style-4">
                  <li>Senior subject tutors</li>
                  <li>IB / A-Level / AP / HKDSE coverage</li>
                  <li>Standardized tests: IELTS / TOEFL / SAT</li>
                  <li>University entrance (Ivy / G5)</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <button className="addmissions-plans__rounded" type="button" onClick={() => openUrl(EXAM_PREP_URL)}>
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="addmissions-plans__flex section-font-style">
        <div className="addmissions-plans__flex-col-548e">
          <h2 className="section_title addmissions-plans__style-8">College Admissions Programs</h2>
          <div className="addmissions-plans__style-9">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇭🇰 🇸🇬</div>
          <div className="addmissions-plans__grid-cols-fc0f">
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">Free Consultation</h3>
                <ul className="addmissions-plans__style-4">
                  <li>Free online chat with NGS mentors</li>
                  <li>Personalized career roadmap</li>
                  <li>Book a convenient time slot</li>
                  <li>Parents welcome to attend</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11 section-font-style">
                <label htmlFor="order-consult-en" className="addmissions-plans__style-6">
                  Choose option
                </label>
                <select
                  id="order-consult-en"
                  className="addmissions-plans__rounded-b4a7"
                  value={consultSelection}
                  onChange={(e) => setConsultSelection(e.target.value)}
                >
                  <option value="free">1 session (free)</option>
                  <option value="trial">Trial Class</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(CONSULT_LINKS[consultSelection])}
                >
                  Buy
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">College Counseling</h3>
                <p className="section_paragraph addmissions-plans__style-3">Annual &amp; comprehensive plans</p>
                <ul className="addmissions-plans__style-4">
                  <li>Academic planning</li>
                  <li>School list</li>
                  <li>Personal statement writing</li>
                  <li>Activity list &amp; CV</li>
                  <li>Reference letters</li>
                  <li>Interview prep</li>
                  <li>Portfolio prep</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11">
                <label htmlFor="order-college-en" className="addmissions-plans__style-6">
                  Choose option
                </label>
                <select
                  id="order-college-en"
                  className="addmissions-plans__rounded-b4a7"
                  value={collegeSelection}
                  onChange={(e) => setCollegeSelection(e.target.value)}
                >
                  <option value="annual">Annual Plan</option>
                  <option value="3yr">3-Year Plan</option>
                  <option value="4yr">4-Year Plan</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(COLLEGE_LINKS[collegeSelection])}
                >
                  Buy
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">K12 School Selection Service</h3>
                <p className="section_paragraph addmissions-plans__style-3">By Case</p>
                <ul className="addmissions-plans__style-4">
                  <li>Student assessment &amp; strategy</li>
                  <li>School list</li>
                  <li>School visit booking</li>
                  <li>School research reports</li>
                  <li>Application support</li>
                  <li>Entrance exam &amp; interview</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11">
                <label htmlFor="order-k12-en" className="addmissions-plans__style-6">
                  Choose option
                </label>
                <select
                  id="order-k12-en"
                  className="addmissions-plans__rounded-b4a7"
                  value={k12Selection}
                  onChange={(e) => setK12Selection(e.target.value)}
                >
                  <option value="1">1 case</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(K12_LINKS[k12Selection])}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="addmissions-plans__flex section-font-style">
        <div className="addmissions-plans__flex-col">
          <h2 className="section_title addmissions-plans__style-12">High School Diploma Programs</h2>
          <div className="addmissions-plans__flex-gap">
            <span className="addmissions-plans__gradient-bg-2f48">IGCSE</span>
            <span className="addmissions-plans__gradient-bg-cc62">A-Level</span>
            <span className="addmissions-plans__gradient-bg-b245">AP</span>
            <span className="addmissions-plans__gradient-bg-c02f">HKDSE</span>
          </div>
          <div className="addmissions-plans__grid-cols-0823">
            {[
              {
                title: 'Hybrid Learning Program',
                items: [
                  'Flexible learning pace',
                  'Flexible locations: online + on campus',
                  'Wider subject choices',
                  'Customized to student strengths',
                ],
              },
              {
                title: 'Dual-Track Program',
                items: [
                  'Gaokao + International dual track',
                  'Academic + International literacy',
                  'Personalized learning plan',
                  'Earn dual diplomas after completion',
                ],
              },
              {
                title: 'Online Diploma Program',
                items: [
                  'Flexible learning pace',
                  'Flexible locations: online / anywhere',
                  'International high school transcript',
                  'International high school diploma after completion',
                ],
              },
            ].map((card) => (
              <div key={card.title} className="addmissions-plans__flex-col-2e0a">
                <div>
                  <h3 className="section_subtitle addmissions-plans__style-10">{card.title}</h3>
                  <ul className="addmissions-plans__style-13">
                    {card.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </div>
                <div className="addmissions-plans__style-14"></div>
                <div>
                  <label className="addmissions-plans__style-15">Choose curriculum</label>
                  <select className="addmissions-plans__rounded-03a8" defaultValue="IGCSE">
                    <option>IGCSE</option>
                    <option>A-Level</option>
                    <option>AP</option>
                    <option>HKDSE</option>
                  </select>
                  <label className="addmissions-plans__style-16">Choose plan:</label>
                  <select className="addmissions-plans__rounded-03a8" defaultValue="2025-2026 Academic Year">
                    <option>2025-2026 Academic Year</option>
                    <option>2025-2026 Semester 1</option>
                    <option>2025-2026 Semester 2</option>
                    <option>Single Subject</option>
                  </select>
                </div>
                <div className="addmissions-plans__style-5">
                  <a href={siteLinks.en.inProgress}>
                    <button className="addmissions-plans__rounded" type="button">
                      Buy
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="addmissions-plans__flex section-font-style">
        <div className="addmissions-plans__flex-col-2a57">
          <h2 className="section_title addmissions-plans__style-12">Membership Subscription Services</h2>
          <div className="addmissions-plans__flex-gap-6cfc">
            <span className="addmissions-plans__gradient-bg-7d20">NextGen Inspires</span>
            <span className="addmissions-plans__gradient-bg-42b7">NextGen Connects</span>
          </div>
          <div className="addmissions-plans__grid-cols-e7af">
            {[
              { title: 'NGS Family Member', desc: <>Access to <strong>NextGen Connects</strong> community</>, id: 'family-plan-en' },
              { title: 'NGS Elite Member', desc: <>Access to <strong>NextGen Inspires</strong> community</>, id: 'premium-plan-en' },
            ].map((card) => (
              <div key={card.id} className="addmissions-plans__flex-col-2e0a">
                <div>
                  <h3 className="section_subtitle addmissions-plans__style-10">{card.title}</h3>
                  <p className="section_paragraph addmissions-plans__style-17">{card.desc}</p>
                </div>
                <div className="addmissions-plans__style-5">
                  <label htmlFor={card.id} className="addmissions-plans__style-18">
                    Choose plan:
                  </label>
                  <select id={card.id} className="addmissions-plans__rounded-485c" defaultValue="monthly">
                    <option value="monthly">Monthly</option>
                    <option value="halfyear">Half Year</option>
                    <option value="annual">Annual</option>
                  </select>
                  <a href={siteLinks.en.inProgress}>
                    <button className="addmissions-plans__rounded" type="button">
                      Buy Now
                    </button>
                  </a>
                </div>
              </div>
            ))}
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">NGS Premier Member</h3>
                <p className="section_paragraph addmissions-plans__style-19">Access to all NGS communities</p>
                <ul className="addmissions-plans__style-4">
                  <li>NextGen Inspires</li>
                  <li>NextGen Connects</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <label htmlFor="elite-plan-en" className="addmissions-plans__style-18">
                  Choose plan:
                </label>
                <select id="elite-plan-en" className="addmissions-plans__rounded-485c" defaultValue="monthly">
                  <option value="monthly">Monthly</option>
                  <option value="halfyear">Half Year</option>
                  <option value="annual">Annual</option>
                </select>
                <a href={siteLinks.en.inProgress}>
                  <button className="addmissions-plans__rounded" type="button">
                    Buy Now
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
