import { siteLinks } from '@/lib/siteLinks';

export function NgsGlobalZh() {
  return (
    <section className="programs our-programs__section section-font-style_zh">
      <h2 className="section_title our-programs__text-center">NGS全球社区</h2>
      <div className="our-programs__grid-cols">
        <a href={siteLinks.zh.home} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-2">
              <img
                alt="Partner With Us"
                src="/static/img/partnerwithus.jpg"
                className="our-programs__full-size"
              />
            </div>
            <h3 className="section_subtitle our-programs__text-center-fcad">成为NGS伙伴</h3>
            <p className="section_paragraph our-programs__style-3">
              NGS提供主流国际课程全科在线教育、升学辅导以及竞赛、标化考试冲刺等个性化教学服务，帮助贵校学生实现不受物理空间约束的品质卓越的学术体验与成就，激发无限潜能。
            </p>
          </div>
        </a>
        <a href={siteLinks.zh.programs} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-4">
              <img
                alt="Study With Us"
                src="/static/img/Studywithus.png"
                className="our-programs__full-size"
              />
            </div>
            <h3 className="section_subtitle our-programs__text-center-8988">成为NGS学生</h3>
            <p className="section_paragraph our-programs__style-3">
              也许你为如何在语言考试中取得高分、SAT考试中脱颖而出或选择合适的专业而困惑？或者，你正梦想进入理想的大学，却不知道如何实现目标？我们的个性化辅导服务将全程为你指引方向。
            </p>
          </div>
        </a>
        <a href={siteLinks.zh.ngsInspires} className="partner-with-us__style-1">
          <div className="our-programs__style-1">
            <div className="our-programs__style-4">
              <img
                alt="Join Us"
                src="/static/img/Joinus.jpg"
                className="our-programs__full-size"
              />
            </div>
            <h3 className="section_subtitle our-programs__text-center-9eec">加入NGS全球社区</h3>
            <p className="section_paragraph our-programs__style-3">
              链接全球行业领袖、世界知名大学、跨国界同龄学生俱乐部 SPARK LAB 和蓬勃发展的全球校友网络。
            </p>
          </div>
        </a>
      </div>
    </section>
  );
}
