import { ImageCarousel } from './ImageCarousel';

export function GlobalIndustryLeadersEn() {
  const images = [
    { src: '/static/img/inspires/leader1.jpg' },
    { src: '/static/img/inspires/leader2.jpg' },
    { src: '/static/img/inspires/leader3.jpg' },
    { src: '/static/img/inspires/leader4.jpg' },
    { src: '/static/img/inspires/leader5.jpg' },
    { src: '/static/img/inspires/leader6.jpg' },
    { src: '/static/img/inspires/leader7.jpg' },
    { src: '/static/img/inspires/leader8.jpg' },
  ];

  return (
    <section className="connect-to-schools__bg-white section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">NGS Global Industry Leaders</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselleadersEn" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                Connect with leaders at the forefront of innovation and excellence across diverse industries. Through expert-led webinars, mentorship programs, and career-focused workshops, students gain first-hand insights into emerging trends, career pathways, and the real-world skills required to succeed in a competitive global market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
