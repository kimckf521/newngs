import { externalLinks } from '@/lib/siteLinks';

export function MentorshipZh() {
  return (
    <section className="mentorship__bg-white section-font-style_zh">
      <div className="mentorship__grid-cols">
        <div className="mentorship__flex-col">
          <img alt="Bridge City" src="/static/img/bridgecity.png" className="mentorship__rounded" />
          <a href={externalLinks.customerServiceWeChat} className="mentorship__gradient-bg">
            预约免费咨询
          </a>
        </div>
        <div className="mentorship__flex-center">
          <div className="mentorship__style-1">
            <h2 className="section_title mentorship__style-2">NGS升学辅导课程</h2>
            <p className="section_paragraph mentorship__style-3">
              <strong>NGS升学辅导课程</strong>{' '}
              是一项针对每个学生度身制定的个性化大学升学辅导课程,旨在帮助学生从容应付繁重的高中课业和复杂的大学升学流程。通过{' '}
              <strong>4 对 1</strong>
              导师计划,学生可以获得全方位的支持,保证他们时间规划系统合理,除了完成学术目标和课外项目,同时为大学申请制定系统性目标和行动计划。
            </p>
            <p className="section_paragraph mentorship__style-4">
              本课程重点在于保证学生在充分知情的情况下,做出最适合个人长期发展的各项重要决策,帮助学生在满足申请要求和截止日期的同时,选择合适的大学和课程。在NGS升学老师的指导下,学生们有能力自信地冲击梦校,并在未来的学术生涯中茁壮成长。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
