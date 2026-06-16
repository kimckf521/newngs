import { siteLinks } from '@/lib/siteLinks';

export function SubscribeInspiresEn() {
  return (
    <section className="subscribe__flex-center section-font-style">
      <div className="subscribe__style-1">
        <a href={siteLinks.en.inProgress} className="subscribe__gradient-bg">
          Subscribe Now!
        </a>
        <p className="section_paragraph subscribe__style-2">Subscribe today and join the NGS Global Learning Community!</p>
      </div>
    </section>
  );
}

export function SubscribeConnectsEn() {
  return (
    <section className="subscribe__flex-center section-font-style">
      <div className="subscribe__style-1">
        <a href={siteLinks.en.inProgress} className="subscribe__gradient-bg">
          Subscribe Now!
        </a>
        <p className="section_paragraph subscribe__style-2">
          Subscribe today and join the NextGen Global Education Network!
        </p>
      </div>
    </section>
  );
}
