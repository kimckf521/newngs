import { externalLinks } from '@/lib/siteLinks';

export function HighschoolMappingProgramZh() {
  return (
    <section className="highschool-mapping-program__flex-center section-font-style_zh">
      <div className="highschool-mapping-program__grid-cols">
        <div className="highschool-mapping-program__flex-col">
          <h2 className="section_title highschool-mapping-program__style-1">NGS国际高中规划</h2>
          <p className="section_paragraph highschool-mapping-program__style-2">
            NGS国际高中规划咨询为学生提供清晰、全景化路线规划图，帮助学生将高中学习与未来学业和职业目标相结合。NGS国际高中规划了包括
            <strong>国际课程路线选择、高中选课、课外活动和技能发展</strong>
            在内的关键决策，确保学生为大学及未来发展做好充分准备。
          </p>
          <p className="section_paragraph highschool-mapping-program__style-2">
            本服务旨在帮助学生设定符合自我发展的目标，有效的进行学业规划，且作出最适合个人发展和家庭综合情况的求学路径选择。
          </p>
        </div>
        <div className="highschool-mapping-program__flex-col-6d6b">
          <img
            alt="高中规划参访"
            src="/static/img/vanke.JPG"
            className="highschool-mapping-program__rounded"
          />
          <a
            href={externalLinks.customerServiceWeChat}
            className="highschool-mapping-program__rounded-1f88"
          >
            预约免费咨询
          </a>
        </div>
      </div>
    </section>
  );
}
