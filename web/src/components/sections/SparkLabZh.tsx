import { ImageCarousel } from './ImageCarousel';

export function SparkLabZh() {
  const images = [
    { src: '/static/img/inspires/lab1.png' },
    { src: '/static/img/inspires/lab2.jpg' },
    { src: '/static/img/inspires/lab3.png' },
    { src: '/static/img/inspires/lab4.png' },
    { src: '/static/img/inspires/lab5.png' },
    { src: '/static/img/inspires/lab6.jpg' },
    { src: '/static/img/inspires/lab7.jpg' },
    { src: '/static/img/inspires/lab8.jpg' },
  ];

  return (
    <section className="connect-to-parents__gradient-bg section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">SPARK LAB</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carousellab" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS 全球青年网络</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                NGS全球同龄学子的互动平台, 连接世界各地的中学生, 鼓励他们协作、创新与创作。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
