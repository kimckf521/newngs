import { ImageCarousel } from './ImageCarousel';

export function GlobalIndustryLeadersZh() {
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
    <section className="connect-to-schools__bg-white section-font-style_zh">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">NGS全球行业领袖</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carouselleaders" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-schools__flex-center">
              <p className="section_paragraph connect-to-schools__text-center">
                NGS与各行业创新与卓越的前沿领袖深度链接。通过邀请行业专家领袖作为线上研讨会主讲嘉宾、导师计划和职业发展工作坊,
                学生可以深入了解新兴趋势、职业发展路径, 以及在竞争激烈的全球市场中取得成功所需的实际知识技能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
