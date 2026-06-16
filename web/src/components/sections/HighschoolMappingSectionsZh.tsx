import { externalLinks } from '@/lib/siteLinks';

export function HighschoolMappingSectionsZh() {
  return (
    <section className="highschool-mapping-sections__gradient-bg section-font-style_zh">
      <div className="highschool-mapping-sections__flex-col">
        <h2 className="section_title highschool-mapping-sections__style-1">高中规划</h2>
        <div className="highschool-mapping-sections__flex-gap">
          <span className="highschool-mapping-sections__rounded">A-Level</span>
          <span className="highschool-mapping-sections__rounded-5740">IB</span>
          <span className="highschool-mapping-sections__rounded-c71f">AP</span>
          <span className="highschool-mapping-sections__rounded-1397">HKDSE</span>
        </div>
        <div className="highschool-mapping-sections__grid-cols">
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">K12国际学校探校</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>成长地图</li>
              <li>学校清单</li>
              <li>实地探校</li>
              <li>入学考试预约</li>
              <br />
              <br />
              <br />
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">学校综合情况报告</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>学校简介</li>
              <li>课程体系</li>
              <li>学校董事会</li>
              <li>学校管理层</li>
              <li>教职员工</li>
              <li>学生分布</li>
              <li>毕业成绩及大学录取</li>
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">入学考试准备</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>综合水平测试</li>
              <li>英文考试辅导</li>
              <li>数学考试辅导</li>
              <li>面试辅导</li>
              <br />
              <br />
              <br />
            </ul>
          </div>
          <div className="highschool-mapping-sections__flex-col-f295">
            <h3 className="section_subtitle highschool-mapping-sections__style-2">学术规划</h3>
            <ul className="highschool-mapping-sections__style-3">
              <li>未来无界文凭课程</li>
              <li>未来全域学习计划</li>
              <li>未来教育双轨计划</li>
              <li>在校考试安排</li>
              <li>高中文凭</li>
              <li>大学申请</li>
              <br />
            </ul>
          </div>
        </div>
        <div className="highschool-mapping-sections__style-4">
          <a
            href={externalLinks.customerServiceWeChat}
            className="highschool-mapping-sections__rounded-4d4a"
          >
            免费咨询预约
          </a>
        </div>
      </div>
    </section>
  );
}
