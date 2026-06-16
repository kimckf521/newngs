import { siteLinks } from '@/lib/siteLinks';

export function CclrIntroZh() {
  return (
    <section className="intro-connects__bg-white section-font-style_zh">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-cclr__text-center">NGS升学探索课程</h2>
        <div className="cclr-programs-zh__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle partner-with-us-cclr-programs__style-1">
              升学探索系列课程
            </h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a href={siteLinks.zh.cclr} className="bullet-link active">
                  大学胜任力
                </a>
              </li>
              <li>
                <a>职业胜任力</a>
              </li>
              <li>
                <a href={siteLinks.zh.ngsInspires} className="bullet-link">
                  人生胜任力
                </a>
              </li>
              <li>
                <a href={siteLinks.zh.ngsConnects} className="bullet-link">
                  全球竞争力
                </a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <p className="section_paragraph intro-connects__style-3">
              <strong>「NGS升学探索课程」</strong>
              为学校和家庭提供高中四年的完整升学课程框架和循序渐进的内容，帮助学生获得学术、升学、职业发展、社会参与和人生成长所需具备的综合实力。
            </p>
            <p className="section_paragraph head-cclr__style-1">
              <strong>「NGS升学探索课程」</strong>
              通过全面塑造学生的"大学胜任力"、"职业胜任力"、"人生胜任力"、"全球竞争力"，帮助学生全方位构建认知策略、学术管理、关系与人际交往、适应环境等重要的软技能组合。
            </p>
            <p className="section_paragraph connect-to-parents__style-1">
              与此同时，本课程系统引导学生进行升学规划、职业及专业探索、全球选校、申请和面试等个性化辅导。确保学生高中阶段的每一个重要决策都经过深思熟虑并更好发现适合自己和家庭情况的路径，从而顺利获得梦校录取、实现职业目标、发挥个人潜能、获得自信发展。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CclrDiagramZh() {
  return (
    <section className="partner-with-us-cclr-programs__flex-center section-font-style_zh">
      <div className="partner-with-us-cclr-programs__text-center">
        <h2 className="section_title partner-with-us-cclr-programs__style-2">
          NGS升学探索课程
        </h2>
        <div className="partner-with-us-cclr-programs__flex-center-78b2">
          <img
            src="/static/img/circles.jpg"
            alt="CCLR 课程示意图"
            className="partner-with-us-cclr-programs__full-size"
          />
        </div>
      </div>
    </section>
  );
}
