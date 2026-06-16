import { externalLinks } from '@/lib/siteLinks';

export function YcsIntroZh() {
  return (
    <section className="ycs_intro_section section-font-style_zh">
      <div className="ycs_intro_section__container">
        <div className="ycs_intro_section__logos">
          <div className="ycs_intro_section__logo-item">
            <img src="/static/img/ycs/cie.jpg" alt="Cambridge" className="ycs_intro_section__logo-img" />
          </div>
          <div className="ycs_intro_section__logo-item">
            <img src="/static/img/ycs/edexcel.png" alt="Edexcel" className="ycs_intro_section__logo-img" />
          </div>
          <div className="ycs_intro_section__logo-item">
            <img src="/static/img/ycs/aqa.png" alt="Oxford" className="ycs_intro_section__logo-img" />
          </div>
          <div className="ycs_intro_section__logo-item">
            <img src="/static/img/ycs/aqa.png" alt="UCAS" className="ycs_intro_section__logo-img" />
          </div>
          <div className="ycs_intro_section__logo-item">
            <img src="/static/img/ycs/college_board.jpg" alt="College Board" className="ycs_intro_section__logo-img" />
          </div>
        </div>
        <div className="ycs_intro_section__header">
          <div className="ycs_intro_section__badge">
            <div className="ycs_intro_section__badge-circle">
              <div className="ycs_intro_section__badge-icon">
                <img src="/static/img/ycs/ycs_logo.png" alt="Cambridge Building" />
              </div>
            </div>
          </div>
          <h1 className="ycs_intro_section__title">学校简介</h1>
        </div>
        <div className="ycs_intro_section__content">
          <p className="ycs_intro_section__text ycs_intro_section__text--intro">
            <strong>珠海英华国际教育中心（Zhuhai Yinghua Cambridge School，简称 YCS）</strong>
            由珠海英华国际教育交流有限公司创办。
            <strong>拥有A Level、所以国际课程体系与创新教育理念兼顾的教育品牌</strong>
            。旗下设有<strong>珠海东方外语实验学校英华融合课程项目（YCS Zhuhai Oriental）</strong>及{' '}
            <strong>英华未来学堂者在线课程（Yinghua Online）</strong>，形成多元化、全方位的国际教育体系。
          </p>
          <p className="ycs_intro_section__text">
            YCS课程体系获得英国三大主流考试局——Edexcel、AQA、CIE 的正式授权，并经由英国大学联合招生委员会（UCAS）认证开设国际高中课程。学校开设享誉全球、拥有逾七十年历史的国际权威课程——iGCSE 与 A-Level，该体系已获得全球160多个国家、超过一万所大学的广泛认可，是中国学生迈向世界名校的理想途径。
          </p>
          <p className="ycs_intro_section__text">
            在教学实施方面，<strong>Yinghua Online</strong>{' '}
            打破地域与时间限制，创新性地融合线下课堂与线上学习，并采用国际标准化的统一考试与评估体系，为学生和家庭提供更具个性化与灵活性的21世纪学习方案。通过高质量学术支持与多元学习路径，YCS致力于帮助学生在全球舞台中保持竞争力，培养具备独立思考力、创造力与社会责任感的未来世界公民。
          </p>
        </div>
        <div className="ycs_intro_section__cta">
          <a href={externalLinks.customerServiceWeChat} className="ycs_intro_section__button">
            在线报名
          </a>
        </div>
      </div>
    </section>
  );
}
