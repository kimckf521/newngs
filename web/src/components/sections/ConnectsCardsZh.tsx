import { siteLinks } from '@/lib/siteLinks';

export function ConnectsCardsZh() {
  return (
    <section className="connects-cards-zh__flex section-font-style_zh">
      <div className="connects-cards__flex-col">
        <h2 className="section_title connects-cards__style-1">NextGen Connects</h2>
        <p className="section_paragraph connects-cards__style-2">
          学校洞察 • 成长规划 • 学术准备 • 家庭决策
        </p>
        <div className="connects-cards__grid-cols">
          <div className="connects-cards__flex-col-9b69">
            <img
              alt="School Visits"
              src="/static/img/connects/vanke.JPG"
              className="connects-cards__circle"
            />
            <h3 className="section_subtitle connects-cards__style-3">K12·深度访校</h3>
            <p className="section_paragraph connects-cards__style-4">
              深度访校，让家庭能够亲身感受各校的学习环境、教学理念与核心价值，从而做出更有信息依据的入学决策。
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img
              alt="School Reports"
              src="/static/img/connects/schoolreports.jpg"
              className="connects-cards__circle"
            />
            <h3 className="section_subtitle connects-cards__style-3">学校报告</h3>
            <p className="section_paragraph connects-cards__style-4">
              为学生和家长出具学校深度报告，结合学生未来目标进行深度匹配度分析，帮家长掌握官网上无法获得的内幕信息。
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img
              alt="Growth Mapping"
              src="/static/img/connects/growth.jpg"
              className="connects-cards__circle"
            />
            <h3 className="section_subtitle connects-cards__style-3">成长地图</h3>
            <p className="section_paragraph connects-cards__style-4">
              为学生提供适合自身学术增长、兴趣爱好、家庭计划及未来发展规划的高中学术规划路径。
            </p>
          </div>
          <div className="connects-cards__flex-col-9b69">
            <img
              alt="Academic Clinics"
              src="/static/img/connects/academic.jpg"
              className="connects-cards__circle"
            />
            <h3 className="section_subtitle connects-cards__style-3">学术诊所</h3>
            <p className="section_paragraph connects-cards__style-4">
              帮助学生提前适应国际学校全英文学习环境，通过强化语言及学术衔接与社交期待，为顺利过渡新课程与新文化打好准备。
            </p>
          </div>
        </div>
        <div className="connects-cards__style-5">
          <a href={siteLinks.zh.inProgress} className="connects-cards__gradient-bg">
            立即订阅
          </a>
        </div>
      </div>
    </section>
  );
}
