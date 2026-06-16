import { ImageCarousel } from './ImageCarousel';

export function ConnectToExpertsZh() {
  const images = [
    { src: '/static/img/connects/vanke.JPG' },
    { src: '/static/img/connects/expert1.jpg' },
    { src: '/static/img/connects/expert2.jpg' },
    { src: '/static/img/connects/expert3.jpg' },
  ];

  return (
    <section className="connect-to-schools__bg-white section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">全球教育专家论坛</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselexperts" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                <strong>NGS 全球教育专家论坛</strong>
                <br />
                通过这一网络，学生与教育者可与教育与产业领域的思想领袖和实务专家建立联系，获取前沿洞见、导师支持与全球化视野。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
