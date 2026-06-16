import { ImageCarousel } from './ImageCarousel';

export function ConnectToExpertsEn() {
  const images = [
    { src: '/static/img/connects/vanke.JPG' },
    { src: '/static/img/connects/expert1.jpg' },
    { src: '/static/img/connects/expert2.jpg' },
    { src: '/static/img/connects/expert3.jpg' },
  ];

  return (
    <section className="connect-to-schools__bg-white section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">Global Education Experts Forum</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselexpertsEn" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                <strong>NGS Global Education Experts Forum</strong>
                <br />
                Through this network, students and educators can connect with thought leaders and practitioners in education and industry, gaining cutting-edge insights, mentorship support, and a global perspective.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
