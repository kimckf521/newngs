import { ImageCarousel } from './ImageCarousel';

export function ConnectToParentsZh() {
  const images = [
    { src: '/static/img/connects/parent1.jpg' },
    { src: '/static/img/connects/parent2.jpg' },
    { src: '/static/img/connects/parent3.jpg' },
    { src: '/static/img/connects/parent4.jpg' },
  ];

  return (
    <section className="connect-to-parents__gradient-bg section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">全球家长网络</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselparents" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS 全球家长网络</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                跨区域连接家庭，分享经验洞见，建立支持性社区，助力学生成功并强化学校合作。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
