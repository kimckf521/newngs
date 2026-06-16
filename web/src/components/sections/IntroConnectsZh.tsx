import { siteLinks } from '@/lib/siteLinks';

export function IntroConnectsZh() {
  return (
    <section className="intro-connects__bg-white section-font-style_zh">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-connects__text-center">NextGen Connects</h2>
        <div className="intro-connects__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle intro-connects__style-1">
              NextGen Global
              <br />
              Community
            </h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a className="bullet-link" href={siteLinks.zh.cclr}>
                  升学探索课程
                </a>
              </li>
              <li>
                <a>成为NGS伙伴</a>
              </li>
              <li>
                <a className="bullet-link" href={siteLinks.zh.ngsInspires}>
                  NextGen Inspires
                </a>
              </li>
              <li>
                <a className="bullet-link active" href={siteLinks.zh.ngsConnects}>
                  NextGen Connects
                </a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <p className="section_paragraph intro-connects__style-3">
              <strong>NextGen Connects</strong>
              帮助家庭和学生从容应对眼花缭乱的择校流程。
              通过深度访校、出具全面学校报告、学习路径匹配度分析，为学生和家长提供信息充分、匹配度高的决策体验。
              <br />
              <br />
              本计划同时帮助家庭和学生在全面适应从报考准备到适应新学习环境的复杂过渡——获得从入学考试、面试、专业课程选择等全方位备考、学术、心理支持。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
