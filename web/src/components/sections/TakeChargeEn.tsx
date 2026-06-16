import { siteLinks } from '@/lib/siteLinks';

export function TakeChargeEn() {
  return (
    <section className="take-charge__flex-center section-font-style">
      <div className="take-charge__style-1">
        <h2 className="section_title take-charge__style-2">Take charge of Your Own Learning</h2>
        <img alt="Online Learning" src="/static/img/takecharge.jpg" className="take-charge__rounded" />
        <a href={siteLinks.en.admissions} className="take-charge__gradient-bg">
          Book a Trial Class
        </a>
      </div>
    </section>
  );
}
