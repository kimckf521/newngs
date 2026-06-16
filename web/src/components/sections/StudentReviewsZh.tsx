export function StudentReviewsZh() {
  return (
    <section className="student-reviews__flex-center section-font-style_zh">
      <div className="student-reviews__flex-col">
        <div className="student-reviews-zh__grid-cols">
          <div>
            <h3 className="section_subtitle student-reviews__style-1">课程实时录制</h3>
            <p className="section_paragraph student-reviews__style-2">
              NGS根据学员需求,提供完整的上课记录,方便课后复习。
            </p>
          </div>
          <div>
            <h3 className="section_subtitle student-reviews__style-1">家校同步</h3>
            <p className="section_paragraph student-reviews__style-2">
              上课期间, 家长可以选择实时旁听或课后回放, 确保安心、参与孩子的学习进度。
            </p>
          </div>
          <div>
            <h3 className="section_subtitle student-reviews__style-1">100%信心保证</h3>
            <p className="section_paragraph student-reviews__style-2">
              高质量的教学和个性化学习——不受学习地点束缚、 学习加快提速。
            </p>
          </div>
        </div>
        <div className="student-reviews__grid-cols">
          <div className="student-reviews__flex-col-a612">
            <img alt="Noah" src="/static/img/students/Noah.jpg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Noah</h4>
            <p className="section_paragraph student-reviews-zh__style-1">
              {`"我在NGS学习A-Leve/数学和物理已经一年了, 这段经历让我非常满意。两位老师都是学科学霸, 教学非常耐心, 我自己感觉相比在国际学校学习时提升很快。"`}
            </p>
          </div>
          <div className="student-reviews__flex-col-a612">
            <img alt="Lucy" src="/static/img/students/Lucy.jpeg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Lucy</h4>
            <p className="section_paragraph student-reviews-zh__style-2">
              {`"我喜欢在NGS的灵活学习。我不仅可以在与家人旅行期间学习, 还可以按照自己的节奏和喜好学习。我能够在NGS完成我的三门主修课程, 并期待着完成我的期末考试。"`}
            </p>
          </div>
          <div className="student-reviews__flex-col-a612">
            <img alt="Tiffany" src="/static/img/students/Tiffany.jpeg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Tiffany</h4>
            <p className="section_paragraph student-reviews-zh__style-2">
              {`"感谢NGS,我对/B数学和计算机科学有了显着提升, 感觉自己为即将到来的考试做好了充分的准备。我强烈推荐NGS 给所有寻求高效学习环境的同学们。"`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
