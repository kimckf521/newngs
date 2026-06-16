import { siteLinks } from '@/lib/siteLinks';

export function IntroInspiresZh() {
  return (
    <section className="intro-connects__bg-white section-font-style_zh">
      <div className="intro-connects__flex-col">
        <h2 className="section_title intro-connects__text-center">NextGen Inspires</h2>
        <div className="intro-connects__grid-cols">
          <div className="intro-connects__flex-col-3f57">
            <h3 className="section_subtitle intro-connects__style-1">未来学者全球社区</h3>
            <div className="intro-hybrid__style-2"></div>
            <ul className="intro-connects__style-2">
              <li>
                <a className="bullet-link" href={siteLinks.zh.cclr}>
                  升学探索课程
                </a>
              </li>
              <li>
                <a>未来全域课程</a>
              </li>
              <li>
                <a className="bullet-link active" href={siteLinks.zh.ngsInspires}>
                  NextGen Inspires
                </a>
              </li>
              <li>
                <a className="bullet-link" href={siteLinks.zh.ngsConnects}>
                  NextGen Connects
                </a>
              </li>
            </ul>
          </div>
          <div className="intro-connects__flex-col-34c8">
            <h3 className="intro-connects__style-3">加入NGS 全球学习社区!</h3>
            <p className="section_paragraph intro-connects__style-3">
              <strong>NextGen Inspires</strong>
              是专为NGS合作学校打造的独家订阅服务,旨在为学生和教育者连接全球无限机遇。
            </p>
            <p className="section_paragraph connect-to-parents__style-1">
              通过与全球行业领袖、世界知名大学的合作, 结合创新的SPARK LAB 以及蓬勃发展的全球校友网络,{' '}
              <strong>NextGen Inspires</strong>
              为您提供无与伦比的资源、导师指导和灵感激发, 助力下一代成就卓越。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
