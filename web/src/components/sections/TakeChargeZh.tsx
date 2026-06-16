import { siteLinks } from '@/lib/siteLinks';

export function TakeChargeZh() {
  return (
    <section className="take-charge__flex-center section-font-style_zh">
      <div className="take-charge__style-1">
        <h2 className="section_title take-charge__style-2">个人学习尽在掌握</h2>
        <img
          alt="Online Learning"
          src="/static/img/takecharge.jpg"
          className="take-charge__rounded"
        />
        <a href={siteLinks.zh.admissions} className="take-charge__gradient-bg">
          预约试听课
        </a>
      </div>
    </section>
  );
}
