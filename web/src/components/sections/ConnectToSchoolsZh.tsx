import { ImageCarousel } from './ImageCarousel';

export function ConnectToSchoolsZh() {
  const images = [
    { src: '/static/img/connects/school1.jpg' },
    { src: '/static/img/connects/school2.png' },
    { src: '/static/img/connects/school3.jpg' },
    { src: '/static/img/connects/school4.jpg' },
  ];

  return (
    <section className="connect-to-schools__bg-white section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">国际学校直连</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselschools" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                <strong>赋能</strong>{' '}
                学生与学校，通过建立联系、提供定制化学习机会，并培养全球视野，帮助他们迈向更高成就。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
