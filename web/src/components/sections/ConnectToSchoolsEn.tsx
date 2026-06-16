import { ImageCarousel } from './ImageCarousel';

export function ConnectToSchoolsEn() {
  const images = [
    { src: '/static/img/connects/school1.jpg' },
    { src: '/static/img/connects/school2.png' },
    { src: '/static/img/connects/school3.jpg' },
    { src: '/static/img/connects/school4.jpg' },
  ];

  return (
    <section className="connect-to-schools__bg-white section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">Connect to International Schools</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselschoolsEn" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                <strong>Empowering</strong> students and schools through connections, customized learning opportunities, and a global perspective to help them reach greater achievements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
