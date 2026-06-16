export function StudentReviewsEn() {
  return (
    <section className="student-reviews__flex-center section-font-style">
      <div className="student-reviews__flex-col">
        <div className="student-reviews__grid-cols">
          <div>
            <h3 className="section_subtitle student-reviews__style-1">
              Classes Recorded
              <br />
              on ClassIn
            </h3>
            <p className="section_paragraph student-reviews__style-2">
              Classes are fully recorded on ClassIn: All you need is a computer or a tablet to attend classes, and you can review key points from the lessons anytime.
            </p>
          </div>
          <div>
            <h3 className="section_subtitle student-reviews__style-1">
              Parental
              <br />
              Monitoring
            </h3>
            <p className="section_paragraph student-reviews__style-2">
              During the lessons, parents can sit in to ensure peace of mind and comprehensively track their child&apos;s learning progress.
            </p>
          </div>
          <div>
            <h3 className="section_subtitle student-reviews__style-1">100% Satisfaction</h3>
            <p className="section_paragraph student-reviews__style-2">
              High-quality teaching and personalized learning that saves study time, with students spanning across Asia.
            </p>
          </div>
        </div>
        <div className="student-reviews__grid-cols">
          <div className="student-reviews__flex-col-a612">
            <img alt="Noah" src="/static/img/students/Noah.jpg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Noah</h4>
            <p className="section_paragraph student-reviews__style-4">
              {`"I have been studying A-level Math and Physics with NGS for about a year now, and I couldn't be happier with my experience. The teaching quality is simply outstanding. The tutors are not only highly knowledgeable but also genuinely passionate about helping students succeed."`}
            </p>
          </div>
          <div className="student-reviews__flex-col-a612">
            <img alt="Lucy" src="/static/img/students/Lucy.jpeg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Lucy</h4>
            <p className="section_paragraph student-reviews__style-4">
              {`"I enjoy learning flexibly with NGS. Not only I'm able to learn while traveling with family, but am able to learn at my own pace and preferences. I'm able to finish my 3 main course study at NGS and am looking forward to complete my finals."`}
            </p>
          </div>
          <div className="student-reviews__flex-col-a612">
            <img alt="Tiffany" src="/static/img/students/Tiffany.jpeg" className="student-reviews__circle" />
            <h4 className="student-reviews__style-3">Tiffany</h4>
            <p className="section_paragraph student-reviews__style-4">
              {`"Thanks to NGS, I've seen significant improvement in my understanding of IB Math and Computer Science, and I feel well-prepared for my upcoming exams. I highly recommend NGS to anyone looking for a supportive and effective learning environment!"`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
