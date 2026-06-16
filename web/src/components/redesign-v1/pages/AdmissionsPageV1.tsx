import { siteLinks } from '@/lib/siteLinks';
import {
  TRIAL_URL,
  EXAM_PREP_URL,
  PACKAGE_LINKS,
  CONSULT_LINKS,
  COLLEGE_LINKS,
  K12_LINKS,
} from '@/content/zh/admissions';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GlassCard,
  GradientText,
  Badge,
  Steps,
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /admissions — Admissions & enrolment. Faithful port of the legacy
 * AdmissionsPlans / TakeCharge / StudentReviews / GlobalCommunity
 * content (subject packages, college admissions, diploma programs,
 * memberships, prices and entry steps), re-expressed in the bold dark
 * "v1" design.
 * ------------------------------------------------------------------ */

type Plan = {
  name: string;
  price?: string;
  blurb?: string;
  items: string[];
  cta: string;
  href?: string;
  external?: boolean;
};
type Point = { title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; trial: string; talk: string };
  packages: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    stages: string[];
    plans: Plan[];
  };
  college: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    regions: string;
    plans: Plan[];
  };
  diploma: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    curricula: string[];
    plans: { name: string; items: string[] }[];
    cta: string;
  };
  membership: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    plans: { name: string; items: string[] }[];
    cta: string;
  };
  steps: { eyebrow: string; title: React.ReactNode; sub: string; list: { title: string; description: string }[] };
  assurance: { eyebrow: string; title: React.ReactNode; cards: Point[] };
}> = {
  en: {
    hero: {
      eyebrow: 'Admissions & enrolment',
      title: (
        <>
          Choose your path. <GradientText>Enrol with confidence.</GradientText>
        </>
      ),
      lead:
        'Subject tutoring, college admissions coaching and full diploma programs — taught one-to-one by tutors from the world’s top 50 universities. Pick a plan, book a trial, and start in days.',
      trial: 'Book a trial class',
      talk: 'Talk to an advisor',
    },
    packages: {
      eyebrow: 'Subject tutoring packages',
      title: (
        <>
          One-to-one tutoring, <GradientText>by the hour or package</GradientText>
        </>
      ),
      sub: 'From a single trial lesson to a full study plan — flexible hours across IB, A-Level, AP and HKDSE.',
      stages: ['Foundation', 'Synchronization', 'Acceleration', 'Exam Prep'],
      plans: [
        {
          name: 'Trial Class',
          price: '¥285 / session',
          items: [
            '1-hour 1-on-1 lesson',
            'Top 50 global university tutors',
            'IB / A-Level / AP / HKDSE expertise',
            'Personalized study plan & advice',
          ],
          cta: 'Buy trial class',
          href: TRIAL_URL,
          external: true,
        },
        {
          name: 'Course Package',
          price: 'From 10 to 40 hours',
          items: [
            'Personalized study planning',
            '4-on-1 mentor support',
            'Premium learning materials',
            'Goal setting & progress reports',
            'Top 50 global university tutors',
            'IB / A-Level / AP / HKDSE coverage',
          ],
          cta: 'Buy package',
          href: PACKAGE_LINKS['10'],
          external: true,
        },
        {
          name: 'Exam Prep',
          price: '10 sessions × 1.5 hours',
          items: [
            'Senior subject tutors',
            'IB / A-Level / AP / HKDSE coverage',
            'Standardized tests: IELTS / TOEFL / SAT',
            'University entrance (Ivy / G5)',
          ],
          cta: 'Buy exam prep',
          href: EXAM_PREP_URL,
          external: true,
        },
      ],
    },
    college: {
      eyebrow: 'College admissions programs',
      title: (
        <>
          Guidance from first list to <GradientText>final offer</GradientText>
        </>
      ),
      sub: 'End-to-end admissions support for universities and K12 international schools.',
      regions: 'USA · UK · Canada · Australia · Hong Kong · Singapore',
      plans: [
        {
          name: 'Free Consultation',
          price: 'Complimentary',
          items: [
            'Free online chat with NGS mentors',
            'Personalized career roadmap',
            'Book a convenient time slot',
            'Parents welcome to attend',
          ],
          cta: 'Book consultation',
          href: CONSULT_LINKS.free,
          external: true,
        },
        {
          name: 'College Counseling',
          price: 'Annual & comprehensive plans',
          items: [
            'Academic planning',
            'School list & personal statement',
            'Activity list & CV',
            'Reference letters',
            'Interview & portfolio prep',
          ],
          cta: 'Buy college plan',
          href: COLLEGE_LINKS.annual,
          external: true,
        },
        {
          name: 'K12 School Selection',
          price: 'By case',
          items: [
            'Student assessment & strategy',
            'School list & visit booking',
            'School research reports',
            'Application support',
            'Entrance exam & interview',
          ],
          cta: 'Enquire',
          href: K12_LINKS['1'],
          external: true,
        },
      ],
    },
    diploma: {
      eyebrow: 'High school diploma programs',
      title: (
        <>
          Earn an international <GradientText>diploma online</GradientText>
        </>
      ),
      sub: 'Flexible, accredited routes to an international high school qualification — IGCSE, A-Level, AP and HKDSE.',
      curricula: ['IGCSE', 'A-Level', 'AP', 'HKDSE'],
      plans: [
        {
          name: 'Hybrid Learning Program',
          items: [
            'Flexible learning pace',
            'Flexible locations: online + on campus',
            'Wider subject choices',
            'Customized to student strengths',
          ],
        },
        {
          name: 'Dual-Track Program',
          items: [
            'Gaokao + International dual track',
            'Academic + international literacy',
            'Personalized learning plan',
            'Earn dual diplomas after completion',
          ],
        },
        {
          name: 'Online Diploma Program',
          items: [
            'Flexible learning pace',
            'Flexible locations: online / anywhere',
            'International high school transcript',
            'International diploma after completion',
          ],
        },
      ],
      cta: 'Enquire about diplomas',
    },
    membership: {
      eyebrow: 'Membership subscriptions',
      title: (
        <>
          Join the <GradientText>NextGen community</GradientText>
        </>
      ),
      sub: 'Monthly, half-year or annual access to the NextGen Inspires and NextGen Connects communities.',
      plans: [
        { name: 'NGS Family Member', items: ['Access to NextGen Connects community'] },
        { name: 'NGS Elite Member', items: ['Access to NextGen Inspires community'] },
        { name: 'NGS Premier Member', items: ['Access to all NGS communities', 'NextGen Inspires', 'NextGen Connects'] },
      ],
      cta: 'View membership plans',
    },
    steps: {
      eyebrow: 'How to enrol',
      title: (
        <>
          From first chat to <GradientText>first lesson</GradientText>
        </>
      ),
      sub: 'Four simple steps to start learning with NGS.',
      list: [
        { title: 'Free consultation', description: 'Tell us your goals, curriculum and timeline in a free online chat — parents welcome to join.' },
        { title: 'Entry assessment', description: 'Your tutor maps your current level and sets clear, measurable targets.' },
        { title: 'Personalized plan', description: 'Receive a tailored study plan with the right tutor, hours and materials for your goals.' },
        { title: 'Book & begin', description: 'Choose your package, schedule your sessions, and start learning within days.' },
      ],
    },
    assurance: {
      eyebrow: 'Peace of mind',
      title: (
        <>
          Built so <GradientText>parents</GradientText> can relax
        </>
      ),
      cards: [
        {
          title: 'Classes recorded on ClassIn',
          body: 'Lessons are fully recorded — all you need is a computer or tablet to attend, and students can review key points anytime.',
        },
        {
          title: 'Parental monitoring',
          body: 'Parents can sit in during lessons for peace of mind and to follow their child’s learning progress in full.',
        },
        {
          title: '100% satisfaction',
          body: 'High-quality, personalised teaching that saves study time — with students spanning Asia and beyond.',
        },
      ],
    },
  },
  zh: {
    hero: {
      eyebrow: '课程与招生',
      title: (
        <>
          选择你的路径，<GradientText>安心入学。</GradientText>
        </>
      ),
      lead:
        '单科辅导、升学择校与完整文凭课程 —— 由全球前 50 名校精英导师一对一授课。选择方案、预约试听，几天内即可开课。',
      trial: '预约试听课',
      talk: '咨询顾问',
    },
    packages: {
      eyebrow: '单科辅导课程包',
      title: (
        <>
          一对一辅导，<GradientText>按小时或套餐</GradientText>
        </>
      ),
      sub: '从单节试听到完整学习规划 —— 覆盖 IB、A-Level、AP 与 HKDSE 的灵活课时。',
      stages: ['学科先修', '学科同步', '学科加速', '考试冲刺'],
      plans: [
        {
          name: '试听课',
          price: '￥285 / 节',
          items: [
            '1 小时一对一课程',
            '全球前 50 名校精英导师',
            '熟悉 IB / A-Level / AP / HKDSE',
            '定制学习规划与建议',
          ],
          cta: '购买试听课',
          href: TRIAL_URL,
          external: true,
        },
        {
          name: '课程包',
          price: '10 至 40 小时按套餐',
          items: [
            '个性化学习规划',
            '4 对 1 全方位导师支持',
            '优质学习资料',
            '目标设定与学习报告',
            '全球前 50 名校精英导师',
            '覆盖 IB / A-Level / AP / HKDSE',
          ],
          cta: '购买课程包',
          href: PACKAGE_LINKS['10'],
          external: true,
        },
        {
          name: '考试冲刺',
          price: '10 节课 × 每节 1.5 小时',
          items: [
            '相关学科资深导师',
            '覆盖 IB / A-Level / AP / HKDSE 科目',
            '标准化考试：IELTS / TOEFL / SAT',
            '大学入学考试（常春藤 / G5）',
          ],
          cta: '购买考试冲刺',
          href: EXAM_PREP_URL,
          external: true,
        },
      ],
    },
    college: {
      eyebrow: '升学择校课程',
      title: (
        <>
          从选校名单到<GradientText>录取通知</GradientText>
        </>
      ),
      sub: '为大学申请与 K12 国际学校择校提供全程支持。',
      regions: '美国 · 英国 · 加拿大 · 澳大利亚 · 中国香港 · 新加坡',
      plans: [
        {
          name: '免费咨询',
          price: '免费',
          items: [
            '与 NGS 导师免费线上沟通',
            '个性化职业路线图',
            '预约合适的时间段',
            '欢迎家长参与',
          ],
          cta: '预约咨询',
          href: CONSULT_LINKS.free,
          external: true,
        },
        {
          name: '大学升学辅导',
          price: '年度计划与综合计划',
          items: [
            '学术规划',
            '选校名单与个人陈述',
            '活动清单与简历',
            '推荐信',
            '面试与作品集准备',
          ],
          cta: '购买升学计划',
          href: COLLEGE_LINKS.annual,
          external: true,
        },
        {
          name: 'K12 国际学校择校服务',
          price: '按个案',
          items: [
            '学生评估与策略',
            '学校名单与参观预约',
            '学校调研报告',
            '申请支持',
            '入学考试与面试',
          ],
          cta: '咨询了解',
          href: K12_LINKS['1'],
          external: true,
        },
      ],
    },
    diploma: {
      eyebrow: '高中国际文凭课程',
      title: (
        <>
          在线攻读<GradientText>国际文凭</GradientText>
        </>
      ),
      sub: '灵活、受认证的国际高中文凭路径 —— IGCSE、A-Level、AP 与 HKDSE。',
      curricula: ['IGCSE', 'A-Level', 'AP', 'HKDSE'],
      plans: [
        {
          name: '未来全域学习计划',
          items: [
            '灵活的学习进度',
            '灵活的学习地点：线上 + 线下',
            '更广泛的科目选择',
            '按学生自身特点量身定制',
          ],
        },
        {
          name: '未来教育双轨计划',
          items: [
            '高考、国际体系双轨兼顾',
            '学业 + 国际素养同步提升',
            '个性化学习规划',
            '达标后获得中外高中双凭',
          ],
        },
        {
          name: '未来无界文凭课程',
          items: [
            '灵活的学习进度',
            '灵活的学习地点：线上 / 任何地方',
            '国际高中成绩单',
            '达标后获得国际高中文凭',
          ],
        },
      ],
      cta: '咨询文凭课程',
    },
    membership: {
      eyebrow: '会员订阅服务',
      title: (
        <>
          加入 <GradientText>NextGen 社区</GradientText>
        </>
      ),
      sub: '按月、半年或全年订阅，畅享 NextGen Inspires 与 NextGen Connects 社区资源。',
      plans: [
        { name: 'NGS 家庭会员', items: ['获得 NextGen Connects 社区资讯'] },
        { name: 'NGS 精英会员', items: ['获得 NextGen Inspires 社区资讯'] },
        { name: 'NGS 卓越会员', items: ['获得 NGS 全社区资讯', 'NextGen Inspires', 'NextGen Connects'] },
      ],
      cta: '查看订阅方案',
    },
    steps: {
      eyebrow: '如何入学',
      title: (
        <>
          从初次沟通到<GradientText>第一节课</GradientText>
        </>
      ),
      sub: '四个简单步骤，开启 NGS 学习之旅。',
      list: [
        { title: '免费咨询', description: '在免费线上沟通中告诉我们你的目标、课程体系与时间安排 —— 欢迎家长参与。' },
        { title: '入学评估', description: '导师为你定位当前水平，并设定清晰、可衡量的学习目标。' },
        { title: '个性化方案', description: '获得量身定制的学习计划，匹配合适的导师、课时与学习资料。' },
        { title: '预约开课', description: '选择课程包、安排上课时间，几天内即可开始学习。' },
      ],
    },
    assurance: {
      eyebrow: '安心保障',
      title: (
        <>
          让<GradientText>家长</GradientText>真正安心
        </>
      ),
      cards: [
        {
          title: '课程实时录制',
          body: '课程完整录制 —— 一台电脑或平板即可上课，课后随时回看重点。',
        },
        {
          title: '家校同步',
          body: '上课期间，家长可实时旁听或课后回放，安心参与孩子的学习进度。',
        },
        {
          title: '100% 信心保证',
          body: '高质量、个性化的教学，不受地点束缚、提速增效，学员遍布亚洲及海外。',
        },
      ],
    },
  },
};

export function AdmissionsPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.trial, href: TRIAL_URL, external: true }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* Subject tutoring packages */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.packages.eyebrow} title={t.packages.title} sub={t.packages.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {t.packages.stages.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.packages.plans.map((p) => (
            <FeatureCard
              key={p.name}
              title={p.name}
              description={p.price}
              items={p.items}
              cta={p.cta}
              href={p.href}
              external={p.external}
            />
          ))}
        </div>
      </Section>

      {/* College admissions programs */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.college.eyebrow} title={t.college.title} sub={t.college.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Badge>{t.college.regions}</Badge>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.college.plans.map((p) => (
            <FeatureCard
              key={p.name}
              title={p.name}
              description={p.price}
              items={p.items}
              cta={p.cta}
              href={p.href}
              external={p.external}
            />
          ))}
        </div>
      </Section>

      {/* High school diploma programs */}
      <Section tone="night-800" glow="magenta" glowPosition="right">
        <SectionHeading eyebrow={t.diploma.eyebrow} title={t.diploma.title} sub={t.diploma.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {t.diploma.curricula.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.diploma.plans.map((p, i) => (
            <FeatureCard key={p.name} number={i + 1} title={p.name} items={p.items} />
          ))}
        </div>
        <div className="mt-10">
          <Button href={links.hybrid} variant="gradient">{t.diploma.cta}</Button>
        </div>
      </Section>

      {/* Membership subscriptions */}
      <Section tone="night" glow="violet" glowPosition="center">
        <SectionHeading eyebrow={t.membership.eyebrow} title={t.membership.title} sub={t.membership.sub} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {t.membership.plans.map((p) => (
            <FeatureCard key={p.name} title={p.name} items={p.items} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button href={links.inProgress} variant="glass" withArrow={false}>{t.membership.cta}</Button>
        </div>
      </Section>

      {/* How to enrol */}
      <Section tone="night-800" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.steps.eyebrow} title={t.steps.title} sub={t.steps.sub} />
        <div className="mt-12">
          <Steps steps={t.steps.list} />
        </div>
        <div className="mt-10">
          <Button href={TRIAL_URL} external variant="gradient">{t.hero.trial}</Button>
        </div>
      </Section>

      {/* Parent assurance */}
      <Section tone="night" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.assurance.eyebrow} title={t.assurance.title} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {t.assurance.cards.map((c) => (
            <GlassCard key={c.title} className="flex h-full flex-col p-7">
              <h3 className="font-grotesk text-lg font-bold text-white">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{c.body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
