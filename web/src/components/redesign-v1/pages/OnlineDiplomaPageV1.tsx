import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GlassCard,
  GradientText,
  CheckList,
  Steps,
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /online_diploma_program — NGS Online Diploma Program (ODP).
 * Bold dark "v1" reskin of the legacy OnlineDiploma{Zh,En} pages:
 * faithful port of the Form / Intro / AdmissionsRequirement / global
 * community content, re-expressed with the v1 kit. The EN legacy page
 * was thinner than the ZH one, so both locales are brought to full
 * parity here.
 * ------------------------------------------------------------------ */

type Row = { item: string; value: string };
type Card = { title: string; body: string; href: string };

const content: Record<
  Locale,
  {
    hero: { eyebrow: string; title: React.ReactNode; lead: string; apply: string; talk: string };
    intro: {
      eyebrow: string;
      title: React.ReactNode;
      lead: string;
      detail: string;
      benefitsTitle: string;
      benefits: string[];
      imageCaption: string;
    };
    model: { eyebrow: string; title: React.ReactNode; sub: string; head: [string, string]; rows: Row[] };
    requirements: {
      eyebrow: string;
      title: React.ReactNode;
      sub: string;
      head: [string, string];
      rows: Row[];
      scanCaption: string;
    };
    journey: { eyebrow: string; title: React.ReactNode; steps: { title: string; description: string }[] };
    explore: { eyebrow: string; title: React.ReactNode; sub: string; cards: Card[] };
    apply: string;
  }
> = {
  en: {
    hero: {
      eyebrow: 'Online Diploma Program',
      title: (
        <>
          A high-school diploma, <GradientText>studied online</GradientText>
        </>
      ),
      lead:
        'The Online Diploma Program (ODP) is built for students who cannot commit to fixed-location study but still need a recognised high-school diploma — learn online at your own pace, then sit official exams on campus.',
      apply: 'Apply now',
      talk: 'Talk to admissions',
    },
    intro: {
      eyebrow: 'What is ODP?',
      title: (
        <>
          Learn anywhere, <GradientText>graduate accredited</GradientText>
        </>
      ),
      lead:
        'The Online Diploma Program is designed to meet the need of students who are not able to commit to fixed-location study but still require a high-school diploma at the end of the full course of study.',
      detail:
        'Students who opt for this route enrol in an accredited school and complete all subject learning and formative assessment at NGS Online School. Upon meeting the course-completion requirements, the student takes the official assessments at the school’s physical location. Those who meet the graduation criteria are then issued a credible high-school diploma and a full school transcript.',
      benefitsTitle: 'What you get',
      benefits: [
        'Flexible learning at your own pace',
        'Flexible study locations',
        'Accredited school enrolment & transcript',
        'A high-school diploma after completion',
      ],
      imageCaption: 'Enjoy the flexibility of learning anywhere, at your own pace.',
    },
    model: {
      eyebrow: 'Program model',
      title: (
        <>
          How the <GradientText>diploma model</GradientText> works
        </>
      ),
      sub: 'Online learning and assessment with NGS, official exams and credentials issued by an accredited partner school.',
      head: ['Item', 'Online Diploma Model'],
      rows: [
        { item: 'Course options', value: 'A-Level / HKDSE / AP' },
        { item: 'Entry assessment', value: 'Online' },
        { item: 'Subject learning', value: 'Online' },
        { item: 'Learning platform', value: 'ClassIn' },
        { item: 'Learning community', value: 'SPARK LAB' },
        { item: 'Formative assessment', value: 'Online / coursework' },
        { item: 'Official assessment', value: 'On campus' },
        { item: 'Official transcripts', value: 'Issued by school' },
        { item: 'Enrolment', value: 'NGS Online + School' },
      ],
    },
    requirements: {
      eyebrow: 'Admissions',
      title: (
        <>
          Admissions <GradientText>requirements</GradientText>
        </>
      ),
      sub: 'Open to motivated students worldwide. An interview is part of every application.',
      head: ['Item', 'Details'],
      rows: [
        { item: 'Academic requirement', value: 'G9 graduates' },
        { item: 'Age', value: '15+' },
        { item: 'Nationality', value: 'All welcome' },
        { item: 'Language', value: 'English proficiency level B1+' },
        { item: 'Residency', value: 'All welcome' },
        { item: 'Interview', value: 'Required' },
        { item: 'Hardware / software', value: 'Desktop, laptop or tablet with the ClassIn app installed' },
      ],
      scanCaption: 'Scan for NGS Admissions',
    },
    journey: {
      eyebrow: 'How it works',
      title: (
        <>
          From enrolment to <GradientText>diploma</GradientText>
        </>
      ),
      steps: [
        { title: 'Apply & interview', description: 'Submit your application and complete the required admissions interview with the NGS team.' },
        { title: 'Enrol & assess', description: 'Enrol in an accredited school and complete an online entry assessment to set your starting point.' },
        { title: 'Learn online', description: 'Study all subjects online on ClassIn at your own pace, with formative assessment along the way.' },
        { title: 'Exam & graduate', description: 'Sit official exams on campus; meet the criteria and receive your diploma and full transcript.' },
      ],
    },
    explore: {
      eyebrow: 'NextGen global community',
      title: (
        <>
          More ways to <GradientText>connect & grow</GradientText>
        </>
      ),
      sub: 'The Online Diploma Program is one part of the wider NextGen Scholars community.',
      cards: [
        {
          title: 'Partner with us',
          body: 'Expert online international programs, admissions coaching and personalised tutoring that empower educators and students to reach academic excellence.',
          href: siteLinks.en.home,
        },
        {
          title: 'Study with us',
          body: 'Dreaming of your ideal university but unsure how to get there? Our personalised mentoring guides you every step of the way.',
          href: siteLinks.en.programs,
        },
        {
          title: 'Join the community',
          body: 'Connect with global industry leaders, world-class universities, the SPARK LAB peer community and a growing global alumni network.',
          href: siteLinks.en.ngsInspires,
        },
      ],
    },
    apply: 'Apply now',
  },
  zh: {
    hero: {
      eyebrow: '未来无界文凭课程',
      title: (
        <>
          线上学习，<GradientText>无界文凭</GradientText>
        </>
      ),
      lead:
        '未来无界文凭课程（ODP）以线上学习为主，面向无法到校学习、但仍需在课程结束时获得高中文凭的学生 —— 按自己的节奏在线学习，再到校园参加统一考试。',
      apply: '立即申请',
      talk: '咨询招生顾问',
    },
    intro: {
      eyebrow: '什么是 ODP？',
      title: (
        <>
          随处学习，<GradientText>认证毕业</GradientText>
        </>
      ),
      lead:
        '未来无界文凭课程以线上学习为主，赋能学生参加国际课程统一考试并获得相关证书，满足无法到校学习、但仍需在课程结束时参加统一国际考试并获得高中文凭的学生需求。',
      detail:
        '选择这条路线的学生将注册认证学校，并在 NGS 在线学校完成所有科目的学习与阶段性评估。在完成课程学习后，学生将在规定学校的实际考试地点参加统一考试。符合学校毕业评估标准的学生，将获得可信的高中国际文凭和完整成绩单。',
      benefitsTitle: '你将获得',
      benefits: ['按照自己的节奏灵活学习', '灵活的学习地点', '认证学校入学和成绩单', '完成后获得高中毕业证书'],
      imageCaption: '随时随地，按照自己的节奏与进度学习。',
    },
    model: {
      eyebrow: '课程模式',
      title: (
        <>
          <GradientText>文凭课程</GradientText>如何运作
        </>
      ),
      sub: '由 NGS 负责在线学习与阶段评估，统一考试与官方证书由认证合作学校颁发。',
      head: ['分类', '未来无界文凭课程'],
      rows: [
        { item: '课程选择', value: 'A-Level / HKDSE / AP' },
        { item: '入学测试', value: '在线学习' },
        { item: '学习方式', value: '在线学习' },
        { item: '学习平台', value: 'ClassIn' },
        { item: '学习社区', value: 'SPARK LAB' },
        { item: '阶段评估', value: '线上 / 作业' },
        { item: '考试局测试', value: '在校园' },
        { item: '官方成绩单', value: '学校颁发' },
        { item: '学籍', value: 'NGS 线上 + 学校' },
      ],
    },
    requirements: {
      eyebrow: '入学要求',
      title: (
        <>
          入学<GradientText>要求</GradientText>
        </>
      ),
      sub: '面向全球有志向的学生开放，每位申请人都需完成入学面试。',
      head: ['项目', '详情'],
      rows: [
        { item: '学术要求', value: '中考毕业生' },
        { item: '年龄', value: '15 岁以上' },
        { item: '国籍', value: '不限' },
        { item: '语言', value: '英语水平 B1 以上' },
        { item: '居住地', value: '不限' },
        { item: '面试', value: '必需' },
        { item: '电子设备硬件及软件', value: '台式 / 手提或平板电脑，安装 ClassIn App' },
      ],
      scanCaption: '扫码了解 NGS 招生',
    },
    journey: {
      eyebrow: '流程',
      title: (
        <>
          从入学到<GradientText>文凭</GradientText>
        </>
      ),
      steps: [
        { title: '申请与面试', description: '提交申请，并与 NGS 团队完成入学面试。' },
        { title: '注册与评估', description: '注册认证学校，完成线上入学测试以确定起点。' },
        { title: '在线学习', description: '在 ClassIn 上按自己的节奏完成所有科目的学习与阶段性评估。' },
        { title: '考试与毕业', description: '到校园参加统一考试；达标后获得高中文凭与完整成绩单。' },
      ],
    },
    explore: {
      eyebrow: 'NGS 全球社区',
      title: (
        <>
          更多<GradientText>连接与成长</GradientText>的方式
        </>
      ),
      sub: '未来无界文凭课程是 NextGen Scholars 全球社区的一部分。',
      cards: [
        {
          title: '成为 NGS 伙伴',
          body: 'NGS 提供主流国际课程全科在线教育、升学辅导以及竞赛、标化考试冲刺等个性化教学服务，帮助学校学生实现不受空间约束的卓越学术体验。',
          href: siteLinks.zh.home,
        },
        {
          title: '成为 NGS 学生',
          body: '梦想进入理想大学，却不知道如何实现目标？我们的个性化辅导服务将全程为你指引方向。',
          href: siteLinks.zh.programs,
        },
        {
          title: '加入全球社区',
          body: '链接全球行业领袖、世界知名大学、跨国界同龄学生俱乐部 SPARK LAB，以及蓬勃发展的全球校友网络。',
          href: siteLinks.zh.ngsInspires,
        },
      ],
    },
    apply: '立即申请',
  },
};

function ComparisonTable({ head, rows }: { head: [string, string]; rows: Row[] }) {
  return (
    <GlassCard className="overflow-hidden">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-white/[0.06]">
            <th className="px-5 py-4 font-grotesk text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60 sm:px-7">
              {head[0]}
            </th>
            <th className="px-5 py-4 font-grotesk text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60 sm:px-7">
              {head[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item} className="border-t border-white/10">
              <td className="px-5 py-4 font-medium text-white/75 sm:px-7">{row.item}</td>
              <td className="px-5 py-4 text-white/90 sm:px-7">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}

export function OnlineDiplomaPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.apply, href: links.admissions }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* What is ODP — intro + benefits + flexibility image */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} />
            <p className="mt-6 text-[15px] leading-relaxed text-white/70">{t.intro.lead}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/60">{t.intro.detail}</p>
            <div className="mt-9">
              <h3 className="font-grotesk text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
                {t.intro.benefitsTitle}
              </h3>
              <CheckList className="mt-5" columns={1} items={t.intro.benefits} />
            </div>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/static/img/smilegirl.jpg"
                alt=""
                fill
                sizes="(min-width:1024px) 44vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/55">{t.intro.imageCaption}</p>
          </div>
        </div>
      </Section>

      {/* Program model comparison */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.model.eyebrow} title={t.model.title} sub={t.model.sub} />
        <div className="mt-12 max-w-3xl">
          <ComparisonTable head={t.model.head} rows={t.model.rows} />
        </div>
      </Section>

      {/* Admissions requirements + how it works */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.requirements.eyebrow} title={t.requirements.title} sub={t.requirements.sub} />
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ComparisonTable head={t.requirements.head} rows={t.requirements.rows} />
          </div>
          <GlassCard className="flex flex-col items-center p-7 text-center lg:col-span-5">
            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-white/10 bg-white">
              <Image
                src="/static/img/wechatQR.png"
                alt={t.requirements.scanCaption}
                fill
                sizes="176px"
                className="object-contain p-2"
              />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/65">{t.requirements.scanCaption}</p>
            <div className="mt-6">
              <Button href={links.admissions} variant="gradient">
                {t.apply}
              </Button>
            </div>
          </GlassCard>
        </div>

        <div className="mt-16">
          <SectionHeading eyebrow={t.journey.eyebrow} title={t.journey.title} />
          <div className="mt-10">
            <Steps steps={t.journey.steps} />
          </div>
        </div>
      </Section>

      {/* Wider NGS community */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.explore.eyebrow} title={t.explore.title} sub={t.explore.sub} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.explore.cards.map((c) => (
            <FeatureCard
              key={c.title}
              title={c.title}
              description={c.body}
              href={c.href}
              cta={locale === 'zh' ? '查看详情' : 'Explore'}
            />
          ))}
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
