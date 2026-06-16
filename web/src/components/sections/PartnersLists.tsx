import Image from 'next/image';
import Link from 'next/link';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

const partnersListsStrings = {
  zh: {
    title: '全球合作',
    yinghua: {
      cnTitle: '珠海英华国际教育中心',
      enTitle: (
        <>
          Zhuhai Oriental Yinghua
          <br />
          International Academy
        </>
      ),
      desc: (
        <>
          珠海唯一同时开展A-Level 及HKDSE课程的国际学校。
          <br />
          获得英国三大考试局（Edexcel、牛津AQA、CIE）认证，以及英国大学联合招生委员会UCAS授权开设的国际金牌A-LEVEL（英国高中课程）课程。2020年正式开设的HKDSE（香港中中文凭试）课程，以此满足香港澳门地区的升学需求。
        </>
      ),
      highlight: (
        <>
          <strong>英华未来学堂线上课程Yinghua Online</strong>
          面向全国招生，不限户籍，同时还招收适龄港澳台地区及外籍学生。
        </>
      ),
      cta: (
        <>
          进入英华在线
          <br />
          Yinghua Online
        </>
      ),
      ctaHref: siteLinks.zh.yinghuaOnline,
    },
    ibheros: {
      desc: (
        <>
          IB Heros 是一家面向全球家庭的国际教育辅导机构，致力于以专业、系统、数据驱动的方式，为学生提供高质量的个性化学习支持。我们的导师团队由来自世界知名学府的优秀毕业生与资深教师组成，覆盖各大核心国际课程体系，确保学生在最适合的老师指导下高效提升。
          <br />
          <br />
          我们通过高标准的一对一与小班制线上教学模式，为世界各地的学生提供灵活、精准且结果导向的学习体验。无论是基础知识夯实、学术科研能力培养，还是高分冲刺与升学规划，我们都提供一站式解决方案。
          <br />
          <br />
          {`IB Heros 始终坚持以"学术严谨 + 长期陪伴 + 可量化成果"为核心价值，帮助全球学生突破瓶颈，实现真正的学术成长与未来竞争力提升。`}
        </>
      ),
      cta: (
        <>
          进入IB Heros
          <br />
          IB Heros Tutoring
        </>
      ),
      ctaHref: siteLinks.zh.inProgress,
    },
  },
} as const;

/**
 * Partner institution cards. Currently zh-only — leaving room to add an en
 * variant when content is ready.
 */
export function PartnersLists({ locale }: { locale: Locale }) {
  if (locale !== 'zh') return null;
  const t = partnersListsStrings.zh;

  return (
    <section className="partnership_lists section-font-style_zh">
      <div className="partnership_lists__container">
        {/* Was an <h1>; demoted to <h2> because the page already has an h1
            in the navbar/hero. */}
        <h2 className="partnership_lists__title">{t.title}</h2>
        <div className="partnership_lists__cards">
          <div className="partnership_lists__card partnership_lists__card--left">
            <div className="partnership_lists__card-content">
              <div className="partnership_lists__text-section">
                <h3 className="partnership_lists__institution-name partnership_lists__institution-name--cn">
                  {t.yinghua.cnTitle}
                </h3>
                <h3 className="partnership_lists__institution-name partnership_lists__institution-name--en">
                  {t.yinghua.enTitle}
                </h3>
                <p className="partnership_lists__description">{t.yinghua.desc}</p>
                <p className="partnership_lists__description partnership_lists__description--highlight">
                  {t.yinghua.highlight}
                </p>
              </div>
              <div className="partnership_lists__logo-section">
                <div className="partnership_lists__logo">
                  <Image
                    src="/static/img/ycs/ycs_color_logo.png"
                    alt="YCS Online Logo"
                    width={200}
                    height={200}
                    className="partnership_lists__logo-image"
                  />
                </div>
                <Link
                  href={t.yinghua.ctaHref}
                  className="partnership_lists__cta-button partnership_lists__cta-button--blue"
                >
                  {t.yinghua.cta}
                </Link>
              </div>
            </div>
          </div>

          <div className="partnership_lists__card partnership_lists__card--right">
            <div className="partnership_lists__card-content">
              <div className="partnership_lists__text-section">
                <h3 className="partnership_lists__institution-name partnership_lists__institution-name--blue">
                  IB HEROS
                </h3>
                <h3 className="partnership_lists__institution-name partnership_lists__institution-name--subtitle">
                  IB Heros Melbourne
                </h3>
                <p className="partnership_lists__description">{t.ibheros.desc}</p>
              </div>
              <div className="partnership_lists__logo-section">
                <div className="partnership_lists__hero-logo">
                  <Image
                    src="/static/img/ibheros/ibheros_logo.png"
                    alt="IB Heros Logo"
                    width={200}
                    height={200}
                    className="partnership_lists__logo-image"
                  />
                </div>
                <Link
                  href={t.ibheros.ctaHref}
                  className="partnership_lists__cta-button partnership_lists__cta-button--blue"
                >
                  {t.ibheros.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
