import { siteLinks } from '@/lib/siteLinks';

export function DiplomaProgramZh() {
  const cards = [
    {
      title: '未来全域学习计划',
      items: ['灵活的学习进度', '灵活的学习地点：线上+线下', '更广泛的科目选择', '按照学生自身特点量身定制的课程计划'],
    },
    {
      title: '未来教育双轨计划',
      items: ['高考、国际体系双轨兼顾', '学业+国际素养同步提升', '个性化学习规划', '完成学业并达标后获得中外高中双凭'],
    },
    {
      title: '未来无界文凭课程',
      items: ['灵活的学习进度', '灵活的学习地点：线上/任何地方', '国际高中成绩单', '完成学业并达标后获得国际高中文凭'],
    },
  ];

  return (
    <section className="addmissions-plans__flex section-font-style_zh">
      <div className="addmissions-plans__flex-col">
        <h2 className="section_title addmissions-plans__style-12">高中国际文凭课程</h2>
        <div className="addmissions-plans__flex-gap">
          <span className="addmissions-plans__gradient-bg-2f48">IGCSE</span>
          <span className="addmissions-plans__gradient-bg-cc62">A-Level</span>
          <span className="addmissions-plans__gradient-bg-b245">AP</span>
          <span className="addmissions-plans__gradient-bg-c02f">HKDSE</span>
        </div>
        <div className="addmissions-plans__grid-cols-0823">
          {cards.map((card) => (
            <div key={card.title} className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">{card.title}</h3>
                <ul className="addmissions-plans__style-13">
                  {card.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
              <div className="addmissions-plans__style-14"></div>
              <div>
                <label className="addmissions-plans__style-15">选择课程体系</label>
                <select className="addmissions-plans__rounded-03a8" defaultValue="IGCSE">
                  <option>IGCSE</option>
                  <option>A-Level</option>
                  <option>AP</option>
                  <option>HKDSE</option>
                </select>
                <label className="addmissions-plans__style-16">选择学习方案：</label>
                <select className="addmissions-plans__rounded-03a8" defaultValue="2025-2026 学年">
                  <option>2025-2026 学年</option>
                  <option>2025-2026 学年 第一学期</option>
                  <option>2025-2026 学年 第二学期</option>
                  <option>单科课程</option>
                </select>
              </div>
              <div className="addmissions-plans__style-5">
                <a href={siteLinks.zh.inProgress}>
                  <button className="addmissions-plans__rounded" type="button">
                    购买
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
