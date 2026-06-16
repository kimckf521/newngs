import { ImageCarousel } from './ImageCarousel';

export function GlobalUniversitiesZh() {
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
    <section className="global-universities__bg-white section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">全球高校直连</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel
            id="carouseluni"
            images={images}
            imageClassName="global-universities__rounded"
            controlClassName=""
          />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white section-font-style_zh">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS全球高校直连</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                NGS与世界知名大学建立长期合作联系, 为学生提供独家升学指导、 学校专业介绍、校园参观以及众多交流拓展机会, 助力他们迈向更广阔的未来。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
