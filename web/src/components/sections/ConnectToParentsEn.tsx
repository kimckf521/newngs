import { ImageCarousel } from './ImageCarousel';

export function ConnectToParentsEn() {
  const images = [
    { src: '/static/img/connects/parent1.jpg' },
    { src: '/static/img/connects/parent2.jpg' },
    { src: '/static/img/connects/parent3.jpg' },
    { src: '/static/img/connects/parent4.jpg' },
  ];

  return (
    <section className="connect-to-parents__gradient-bg section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">Global Parents Network</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselparentsEn" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS Global Parents Network</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                Cross-region connections for families to share experiences and insights, building supportive communities to help students succeed and strengthen school partnerships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
