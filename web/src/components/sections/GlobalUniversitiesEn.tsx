import { ImageCarousel } from './ImageCarousel';

export function GlobalUniversitiesEn() {
  const images = [
    { src: '/static/img/inspires/uni1.jpg' },
    { src: '/static/img/inspires/uni2.jpeg' },
    { src: '/static/img/inspires/uni3.jpg' },
    { src: '/static/img/inspires/uni4.jpg' },
    { src: '/static/img/inspires/uni5.jpeg' },
    { src: '/static/img/inspires/uni6.jpg' },
    { src: '/static/img/inspires/uni7.jpg' },
    { src: '/static/img/inspires/uni8.jpg' },
    { src: '/static/img/inspires/uni9.jpg' },
  ];

  return (
    <section className="global-universities__bg-white section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">Global Universities</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel
            id="carouseluniEn"
            images={images}
            imageClassName="global-universities__rounded"
            controlClassName=""
          />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white section-font-style">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS Global University Connections</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                Explore partnerships with renowned universities worldwide, offering students exclusive access to admissions guidance, campus tours, and networking opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
