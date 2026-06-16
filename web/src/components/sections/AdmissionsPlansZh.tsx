'use client';

import { useState } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import {
  TRIAL_URL,
  EXAM_PREP_URL,
  PACKAGE_LINKS,
  CONSULT_LINKS,
  COLLEGE_LINKS,
  K12_LINKS,
} from '@/content/zh/admissions';

export function AdmissionsPlansZh() {
  const [packageSelection, setPackageSelection] = useState('10');
  const [consultSelection, setConsultSelection] = useState('free');
  const [collegeSelection, setCollegeSelection] = useState('annual');
  const [k12Selection, setK12Selection] = useState('1');

  function openUrl(url?: string) {
    if (!url) {
      alert('This option does not have a checkout link yet. Please contact support.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {/* 单科辅导课程包 */}
      <section className="addmissions-plans__flex section-font-style_zh">
        <div className="addmissions-plans__flex-col">
          <h2 className="section_title addmissions-plans__style-1">单科辅导课程包</h2>
          <div className="addmissions-plans__flex-gap section-font-style_zh">
            <span className="addmissions-plans__gradient-bg">学科先修</span>
            <span className="addmissions-plans__gradient-bg-4820">学科同步</span>
            <span className="addmissions-plans__gradient-bg-2138">学科加速</span>
            <span className="addmissions-plans__gradient-bg-b8b3">考试冲刺</span>
          </div>
          <div className="addmissions-plans__grid-cols">
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">试听课</h3>
                <p className="section_paragraph addmissions-plans__style-3">￥285/节</p>
                <ul className="addmissions-plans__style-4">
                  <li>1小时一对一课程</li>
                  <li>全球前50名校精英导师</li>
                  <li>熟悉 IB/A-Level/AP/HKDSE</li>
                  <li>定制学习规划与建议</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(TRIAL_URL)}
                >
                  购买
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">课程包</h3>
                <p className="section_paragraph addmissions-plans__style-3">按套餐</p>
                <ul className="addmissions-plans__style-4">
                  <li>个性化学习规划</li>
                  <li>4对1全方位导师支持</li>
                  <li>优质学习资料</li>
                  <li>目标设定与学习报告</li>
                  <li>全球前50名校精英导师</li>
                  <li>覆盖 IB/A-Level/AP/HKDSE</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5 section-font-style_zh">
                <label htmlFor="package-order" className="addmissions-plans__style-6">
                  购买选项：
                </label>
                <select
                  id="package-order"
                  className="addmissions-plans__rounded-b4a7"
                  value={packageSelection}
                  onChange={(e) => setPackageSelection(e.target.value)}
                >
                  <option value="10">尝鲜：10小时</option>
                  <option value="20">学科先修：20小时</option>
                  <option value="30-sync">学科同步：30小时</option>
                  <option value="30-acc">学科加速：30小时</option>
                  <option value="40">跨科组合：40小时</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(PACKAGE_LINKS[packageSelection])}
                >
                  购买
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-2">考试冲刺</h3>
                <p className="section_paragraph addmissions-plans__style-7">
                  套餐：<strong>10节课（每节1.5小时）</strong>
                </p>
                <ul className="addmissions-plans__style-4">
                  <li>相关学科资深导师</li>
                  <li>覆盖 IB/A-Level/AP/HKDSE 科目</li>
                  <li>标准化考试：IELTS/TOEFL/SAT</li>
                  <li>大学入学考试（常春藤/G5）</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(EXAM_PREP_URL)}
                >
                  购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 升学择校课程 */}
      <section className="addmissions-plans__flex section-font-style_zh">
        <div className="addmissions-plans__flex-col-548e">
          <h2 className="section_title addmissions-plans__style-8">升学择校课程</h2>
          <div className="addmissions-plans__style-9">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇭🇰 🇸🇬</div>
          <div className="addmissions-plans__grid-cols-fc0f">
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">免费咨询</h3>
                <ul className="addmissions-plans__style-4">
                  <li>与 NGS 导师免费线上沟通</li>
                  <li>个性化职业路线图</li>
                  <li>预约合适的时间段</li>
                  <li>欢迎家长参与</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11 section-font-style_zh">
                <label htmlFor="order-consult" className="addmissions-plans__style-6">
                  购买选项
                </label>
                <select
                  id="order-consult"
                  className="addmissions-plans__rounded-b4a7"
                  value={consultSelection}
                  onChange={(e) => setConsultSelection(e.target.value)}
                >
                  <option value="free">1次（免费）</option>
                  <option value="trial">试听课</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(CONSULT_LINKS[consultSelection])}
                >
                  购买
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">大学升学辅导</h3>
                <p className="section_paragraph addmissions-plans__style-3">年度计划与综合计划</p>
                <ul className="addmissions-plans__style-4">
                  <li>学术规划</li>
                  <li>选校名单</li>
                  <li>个人陈述写作</li>
                  <li>活动清单与简历</li>
                  <li>推荐信</li>
                  <li>面试辅导</li>
                  <li>作品集准备</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11">
                <label htmlFor="order-college" className="addmissions-plans__style-6">
                  购买选项
                </label>
                <select
                  id="order-college"
                  className="addmissions-plans__rounded-b4a7"
                  value={collegeSelection}
                  onChange={(e) => setCollegeSelection(e.target.value)}
                >
                  <option value="annual">年度计划</option>
                  <option value="3yr">三年计划</option>
                  <option value="4yr">四年计划</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(COLLEGE_LINKS[collegeSelection])}
                >
                  购买
                </button>
              </div>
            </div>
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">K12国际学校择校服务</h3>
                <p className="section_paragraph addmissions-plans__style-3">按个案</p>
                <ul className="addmissions-plans__style-4">
                  <li>学生评估与策略</li>
                  <li>学校名单</li>
                  <li>学校参观预约</li>
                  <li>学校调研报告</li>
                  <li>申请支持</li>
                  <li>入学考试与面试</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-11">
                <label htmlFor="order-k12" className="addmissions-plans__style-6">
                  购买选项
                </label>
                <select
                  id="order-k12"
                  className="addmissions-plans__rounded-b4a7"
                  value={k12Selection}
                  onChange={(e) => setK12Selection(e.target.value)}
                >
                  <option value="1">1个案</option>
                </select>
                <button
                  className="addmissions-plans__rounded"
                  type="button"
                  onClick={() => openUrl(K12_LINKS[k12Selection])}
                >
                  购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 高中国际文凭课程 */}
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
            {[
              { title: '未来全域学习计划', items: ['灵活的学习进度', '灵活的学习地点：线上+线下', '更广泛的科目选择', '按照学生自身特点量身定制的课程计划'] },
              { title: '未来教育双轨计划', items: ['高考、国际体系双轨兼顾', '学业+国际素养同步提升', '个性化学习规划', '完成学业并达标后获得中外高中双凭'] },
              { title: '未来无界文凭课程', items: ['灵活的学习进度', '灵活的学习地点：线上/任何地方', '国际高中成绩单', '完成学业并达标后获得国际高中文凭'] },
            ].map((card) => (
              <div key={card.title} className="addmissions-plans__flex-col-2e0a">
                <div>
                  <h3 className="section_subtitle addmissions-plans__style-10">{card.title}</h3>
                  <ul className="addmissions-plans__style-13">
                    {card.items.map((item) => <li key={item}>{item}</li>)}
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

      {/* 订阅方案 */}
      <section className="addmissions-plans__flex section-font-style_zh">
        <div className="addmissions-plans__flex-col-2a57">
          <h2 className="section_title addmissions-plans__style-12">会员订阅服务</h2>
          <div className="addmissions-plans__flex-gap-6cfc">
            <span className="addmissions-plans__gradient-bg-7d20">NextGen Inspires</span>
            <span className="addmissions-plans__gradient-bg-42b7">NextGen Connects</span>
          </div>
          <div className="addmissions-plans__grid-cols-e7af">
            {[
              { title: 'NGS家庭会员', desc: <>获得<strong>NextGen Connects</strong>社区资讯</>, id: 'family-plan' },
              { title: 'NGS精英会员', desc: <>获得<strong>NextGen Inspires</strong>社区资讯</>, id: 'premium-plan' },
            ].map((card) => (
              <div key={card.id} className="addmissions-plans__flex-col-2e0a">
                <div>
                  <h3 className="section_subtitle addmissions-plans__style-10">{card.title}</h3>
                  <p className="section_paragraph addmissions-plans__style-17">{card.desc}</p>
                </div>
                <div className="addmissions-plans__style-5">
                  <label htmlFor={card.id} className="addmissions-plans__style-18">
                    选择订阅方案：
                  </label>
                  <select id={card.id} className="addmissions-plans__rounded-485c" defaultValue="monthly">
                    <option value="monthly">每月订阅</option>
                    <option value="halfyear">半年订阅</option>
                    <option value="annual">全年订阅</option>
                  </select>
                  <a href={siteLinks.zh.inProgress}>
                    <button className="addmissions-plans__rounded" type="button">
                      立即购买
                    </button>
                  </a>
                </div>
              </div>
            ))}
            <div className="addmissions-plans__flex-col-2e0a">
              <div>
                <h3 className="section_subtitle addmissions-plans__style-10">NGS卓越会员</h3>
                <p className="section_paragraph addmissions-plans__style-19">获得 NGS全社区资讯</p>
                <ul className="addmissions-plans__style-4">
                  <li>NextGen Inspires</li>
                  <li>NextGen Connects</li>
                </ul>
              </div>
              <div className="addmissions-plans__style-5">
                <label htmlFor="elite-plan" className="addmissions-plans__style-18">
                  选择订阅方案：
                </label>
                <select id="elite-plan" className="addmissions-plans__rounded-485c" defaultValue="monthly">
                  <option value="monthly">每月订阅</option>
                  <option value="halfyear">半年订阅</option>
                  <option value="annual">全年订阅</option>
                </select>
                <a href={siteLinks.zh.inProgress}>
                  <button className="addmissions-plans__rounded" type="button">
                    立即购买
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
