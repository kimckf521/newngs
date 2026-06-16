import { siteLinks } from '@/lib/siteLinks';

export function ComprehensiveZh() {
  return (
    <section className="comprehensive__flex-center section-font-style_zh">
      <div className="k12-school__flex-col">
        <h2 className="section_title comprehensive__text-center">四大国际课程体系+定制化教学</h2>
        <div className="comprehensive__grid-cols">
          <div className="intro-hybrid__flex-center">
            <img alt="学生" src="/static/img/smilegirl.jpg" className="comprehensive__rounded" />
          </div>
          <div className="comprehensive__flex-col">
            <div className="comprehensive__style-1">
              <h3 className="section_subtitle comprehensive__style-2">个性化辅导</h3>
              <p className="section_paragraph comprehensive__style-3">
                没有千篇一律的教学或一刀切的课程。每个学生都是独特的学习者。
                <br />
                在NGS, 我们提供入学评估, 设计个性化学习计划,提供实时跟踪, 并定期提供反馈, 以支持您的每一步成长。
              </p>
              <br />
              <h3 className="section_subtitle comprehensive__style-2">明确的学习目标</h3>
              <p className="section_paragraph comprehensive__style-3">
                无论学生诉求为超前学习、巩固学科知识、短期提分还在考试中取得目标成绩,NGS导师会根据您的具体目标制定学习规划。
              </p>
              <br />
              <h3 className="section_subtitle comprehensive__style-2">科目全覆盖</h3>
              <p className="section_paragraph comprehensive__style-4">
                NGS 提供四大国际课程,包括IB、A-Level、AP和HKDSE课程的大多数科目的一对一辅导。
              </p>
            </div>
            <div className="comprehensive__text-center-c30c">
              <a href={siteLinks.zh.admissions} className="comprehensive__bg-dark">
                预约试听课
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
