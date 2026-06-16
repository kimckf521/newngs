import { siteLinks } from '@/lib/siteLinks';

export function SubscribeConnectsZh() {
  return (
    <section className="subscribe__flex-center section-font-style_zh">
      <div className="subscribe__style-1">
        <a href={siteLinks.zh.inProgress} className="subscribe__gradient-bg">
          立即订阅！
        </a>
        <p className="section_paragraph subscribe__style-2">
          今日订阅,加入NextGen全球教育网络!
        </p>
      </div>
    </section>
  );
}
