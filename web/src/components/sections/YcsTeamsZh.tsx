export function YcsTeamsZh() {
  const members = [
    {
      img: '/static/img/ycs/yang.jpg',
      name: '杨凯隆 | Mark Yang',
      position: '校监',
      bio: '国际教育专家，历任深圳外国语学校国际部校长、深大师范学院国际高中校长、深圳耀华书院国际部校长。深圳教师教育研究基地、基地组国际教育总顾问。曾是中国深圳外籍人士协会秘书长、华禾国际教育联盟协会副主席。美国新泽西教授方会会员，在国际教育，无其是最后学前国高外籍、无其课程名学校及经济学教合比联。',
    },
    {
      img: '/static/img/ycs/chu.png',
      name: '朱剑',
      position: '首席顾问',
      bio: '中国首家获英国剑桥大学考试院(CIE)正式授权开设A-Level和IGCSE课程项目、深圳国际预科学院创始人，前中国科技大学少年班教师主任，深圳市博爱实验学校创校校长（分管国际教育与国家教育）。国际教育第一人物，在全国拥有权威影响力，也是深圳市福田区人大代表，常年在全国各地讲座，培养学生已数以万计，曾先后在300多所A-Level国际学校巡演讲座授业。',
    },
    {
      img: '/static/img/ycs/xian.jpg',
      name: '鲜永红 | Peter Xian',
      position: '执行校长',
      bio: '英语文学学士、教育学硕士，儿童心理学硕士，创校校长（深圳南山中英文学校、深圳市民办学校）。曾任梅沙国际幼儿园理事长。深圳外国语学校初中部校长。英语学科组长。院长的翰林国际教育研发总监。师从心理学大咖、从事一线教学、管理及方案工作20余年，曾获"深圳市学科管理、家校先进、教子有方"称号等。',
    },
    {
      img: '/static/img/ycs/xie.jpg',
      name: '谢俊飞 | Justin Xie',
      position: '教务长',
      bio: '曾任华侨英国，获了汉文学学士。硕士学位，多年国际学校任教经验，曾担任深圳外国教学副校、UIC教授IGCSE科学。A-level物理、力学、光学操纵实验。熟悉国际课程体系。从事A level数育，从事A level各学科教师、项目经理、UIC教授试卷批改、曾担任多所知名国际学校以及经理、教研组长。曾研发多本国际学校各课程、参与多种国际课程学院教学开发教与推特专业。',
    },
  ];

  return (
    <section className="ycs_teams_section section-font-style_zh">
      <div className="ycs_teams_section__container">
        <h1 className="ycs_teams_section__title">YCS管理层</h1>
        <div className="ycs_teams_section__grid">
          {members.map((m) => (
            <div key={m.name} className="ycs_teams_section__member">
              <div className="ycs_teams_section__photo">
                <img src={m.img} alt={m.name} className="ycs_teams_section__photo-img" />
              </div>
              <div className="ycs_teams_section__info">
                <h3 className="ycs_teams_section__name">{m.name}</h3>
                <p className="ycs_teams_section__position">{m.position}</p>
              </div>
              <p className="ycs_teams_section__bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
