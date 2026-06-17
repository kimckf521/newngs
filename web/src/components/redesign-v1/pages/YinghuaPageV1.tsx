import Image from 'next/image';
import { siteLinks, externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GlassCard,
  GradientText,
  Badge,
  Button,
  CTASection,
} from '../ui';

/* ------------------------------------------------------------------ *
 * /yinghua_online — Partner institution: Oriental Yinghua International
 * Academy (Zhuhai Yinghua Cambridge School, YCS). Faithful bold-dark
 * port of the legacy YcsIntro / YcsPrograms / DiplomaProgram / YcsTeams
 * content. EN copy translated from the richer ZH legacy page.
 * ------------------------------------------------------------------ */

type Program = { img: string; name: string; abbr: string; body: string; items: string[] };
type Leader = { img: string; name: string; role: string; bio: string };
type Accreditor = { src: string; alt: string };

const accreditors: Accreditor[] = [
  { src: '/static/img/ycs/cie.jpg', alt: 'Cambridge (CIE)' },
  { src: '/static/img/ycs/edexcel.png', alt: 'Edexcel' },
  { src: '/static/img/ycs/aqa.png', alt: 'AQA' },
  { src: '/static/img/ycs/ucas.png', alt: 'UCAS' },
  { src: '/static/img/ycs/college_board.jpg', alt: 'College Board' },
];

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; primary: string; secondary: string };
  accreditation: { eyebrow: string; title: React.ReactNode; sub: string; body: string[] };
  programsHeading: { eyebrow: string; title: React.ReactNode; sub: string };
  programs: Program[];
  diploma: { eyebrow: string; title: React.ReactNode; sub: string; tracks: string[] };
  diplomaPlans: { title: string; items: string[] }[];
  team: { eyebrow: string; title: React.ReactNode; sub: string };
  leaders: Leader[];
  cta: { eyebrow: string; title: React.ReactNode; sub: string; primary: string; secondary: string };
}> = {
  en: {
    hero: {
      eyebrow: 'Partner institution',
      title: (
        <>
          Oriental Yinghua <GradientText>International Academy</GradientText>
        </>
      ),
      lead:
        'Zhuhai Yinghua Cambridge School (YCS) pairs the world-renowned A-Level system with NGS online learning — a flexible, 21st-century path from Chinese classrooms to leading universities worldwide.',
      primary: 'Enrol online',
      secondary: 'Talk to an advisor',
    },
    accreditation: {
      eyebrow: 'About the school',
      title: (
        <>
          A Cambridge school, <GradientText>authorised and accredited</GradientText>
        </>
      ),
      sub: 'Founded by Zhuhai Yinghua International Education Exchange, YCS unites a rigorous A-Level system with an innovative teaching philosophy.',
      body: [
        'The YCS curriculum is formally authorised by the UK’s three major exam boards — Edexcel, AQA and CIE — and accredited by UCAS to deliver an international high-school programme.',
        'YCS offers the globally respected iGCSE and A-Level qualifications — a system with over 70 years of history, recognised by more than 10,000 universities across 160-plus countries, and an ideal route for Chinese students aiming for top global universities.',
        'Yinghua Online breaks the limits of place and time, blending on-campus classrooms with online study under an internationally standardised examination and assessment system — delivering a more personalised, flexible learning solution for students and families.',
      ],
    },
    programsHeading: {
      eyebrow: 'Three pathways',
      title: (
        <>
          Three ways to <GradientText>study with YCS</GradientText>
        </>
      ),
      sub: 'Choose the blend of campus and online learning that matches your goals.',
    },
    programs: [
      {
        img: '/static/img/ycs/course1.png',
        name: 'Hybrid Learning Plan',
        abbr: 'HLP',
        body: 'An innovative model that combines on-campus teaching with online international courses. Students enjoy a traditional campus life while accessing NGS online resources, building a highly customised plan matched to their interests, academics and schedule.',
        items: [
          'Flexible learning pace',
          'Learn anywhere: online + on campus',
          'A broader choice of subjects',
          'A study plan tailored to each student',
        ],
      },
      {
        img: '/static/img/ycs/course2.png',
        name: 'Dual-Track Plan',
        abbr: 'DTP',
        body: 'A tailored international curriculum for students at local schools, enabling a seamless bridge from the public system into international tracks (IB, A-Level, AP, HKDSE). Students with capacity can pursue dual enrolment and graduate with both a standard high-school and an international diploma.',
        items: [
          'Gaokao and international tracks in parallel',
          'Academics and international literacy together',
          'Personalised study planning',
          'Dual Chinese + international diplomas on completion',
        ],
      },
      {
        img: '/static/img/ycs/course3.png',
        name: 'Online Diploma Program',
        abbr: 'ODP',
        body: 'A predominantly online path that prepares students to sit international examinations and earn the corresponding certificates. Students complete every subject through the NGS online school, then sit unified exams at an approved venue; those meeting graduation standards receive a recognised international high-school diploma and transcript.',
        items: [
          'Flexible learning pace',
          'Learn from anywhere, online',
          'International high-school transcript',
          'International high-school diploma on completion',
        ],
      },
    ],
    diploma: {
      eyebrow: 'High-school diploma',
      title: (
        <>
          Internationally recognised <GradientText>qualifications</GradientText>
        </>
      ),
      sub: 'Across the three pathways, students work toward globally respected high-school credentials.',
      tracks: ['IGCSE', 'A-Level', 'AP', 'HKDSE'],
    },
    diplomaPlans: [
      {
        title: 'Hybrid Learning Plan',
        items: [
          'Flexible learning pace',
          'Learn anywhere: online + on campus',
          'A broader choice of subjects',
          'A study plan tailored to each student',
        ],
      },
      {
        title: 'Dual-Track Plan',
        items: [
          'Gaokao and international tracks in parallel',
          'Academics and international literacy together',
          'Personalised study planning',
          'Dual Chinese + international diplomas on completion',
        ],
      },
      {
        title: 'Online Diploma Program',
        items: [
          'Flexible learning pace',
          'Learn from anywhere',
          'International high-school transcript',
          'International high-school diploma on completion',
        ],
      },
    ],
    team: {
      eyebrow: 'Leadership',
      title: (
        <>
          The team behind <GradientText>YCS</GradientText>
        </>
      ),
      sub: 'Veteran international educators leading the school’s academic vision.',
    },
    leaders: [
      {
        img: '/static/img/ycs/yang.jpg',
        name: 'Mark Yang',
        role: 'School Supervisor',
        bio: 'An international-education specialist who has served as principal of the international division at Shenzhen Foreign Languages School, the international high school of Shenzhen University’s Normal College, and the international division of Shenzhen Yaohua College, with decades of leadership across the field.',
      },
      {
        img: '/static/img/ycs/chu.png',
        name: 'Chu Jian',
        role: 'Chief Advisor',
        bio: 'Founder of China’s first programme formally authorised by Cambridge (CIE) to deliver A-Level and IGCSE, and founder of the Shenzhen International Foundation College. A leading figure in international education in China who has lectured at more than 300 A-Level international schools nationwide.',
      },
      {
        img: '/static/img/ycs/xian.jpg',
        name: 'Peter Xian',
        role: 'Executive Principal',
        bio: 'BA in English Literature, MEd and MA in Child Psychology; founding principal of schools in Shenzhen and former principal of the junior division at Shenzhen Foreign Languages School. More than 20 years in front-line teaching, management and curriculum work.',
      },
      {
        img: '/static/img/ycs/xie.jpg',
        name: 'Justin Xie',
        role: 'Dean of Studies',
        bio: 'A graduate of a UK university with a master’s degree and years of international-school teaching experience, including A-Level Physics and IGCSE Science. He has served as a project manager, examiner and research lead, and has developed curricula for several leading international schools.',
      },
    ],
    cta: {
      eyebrow: 'Enrol with YCS',
      title: (
        <>
          Start your <GradientText>international journey</GradientText>
        </>
      ),
      sub: 'Talk to our team about the right pathway for your child at Oriental Yinghua International Academy.',
      primary: 'Enrol online',
      secondary: 'Meet the faculty',
    },
  },
  zh: {
    hero: {
      eyebrow: '合作院校',
      title: (
        <>
          珠海英华<GradientText>国际教育中心</GradientText>
        </>
      ),
      lead:
        '珠海英华国际教育中心（YCS）将享誉全球的 A-Level 课程体系与 NGS 在线教育相结合 —— 以更灵活的 21 世纪学习方案，助力中国学生迈向世界名校。',
      primary: '在线报名',
      secondary: '咨询顾问',
    },
    accreditation: {
      eyebrow: '学校简介',
      title: (
        <>
          剑桥授权，<GradientText>权威认证</GradientText>
        </>
      ),
      sub: '由珠海英华国际教育交流有限公司创办，YCS 将严谨的 A-Level 课程体系与创新教育理念兼顾。',
      body: [
        'YCS 课程体系获得英国三大主流考试局 —— Edexcel、AQA、CIE 的正式授权，并经由英国大学联合招生委员会（UCAS）认证开设国际高中课程。',
        '学校开设享誉全球、拥有逾七十年历史的国际权威课程 —— iGCSE 与 A-Level，该体系已获得全球 160 多个国家、超过一万所大学的广泛认可，是中国学生迈向世界名校的理想途径。',
        'Yinghua Online 打破地域与时间限制，创新性地融合线下课堂与线上学习，并采用国际标准化的统一考试与评估体系，为学生和家庭提供更具个性化与灵活性的学习方案。',
      ],
    },
    programsHeading: {
      eyebrow: '三大课程选择',
      title: (
        <>
          三种<GradientText>学习路径</GradientText>
        </>
      ),
      sub: '在校园学习与线上学习之间，选择最契合目标的组合方案。',
    },
    programs: [
      {
        img: '/static/img/ycs/course1.png',
        name: '未来全域学习计划',
        abbr: 'HLP',
        body: '采用创新的教育模式，结合线下校园教学与线上国际课程。学生既能享受传统校园的学习生活体验，又可通过 NGS 在线教育平台获得专业课程资源，形成高度定制化的学习方案，全面匹配学生的个人需求、学术兴趣与生活安排。',
        items: [
          '灵活的学习进度',
          '灵活的学习地点：线上 + 线下',
          '更广泛的科目选择',
          '按学生自身特点量身定制的课程计划',
        ],
      },
      {
        img: '/static/img/ycs/course2.png',
        name: '未来教育双轨计划',
        abbr: 'DTP',
        body: '为本地学校学生量身定制的国际课程体系学习，帮助学生顺利实现公立学校到国际教育体系（如 IB、A-Level、AP、HKDSE）的无缝衔接。学有余力的学生更可获得双学籍学习机会，在完成本地高中学习的同时完成国际高中课程，毕业后可获得普通高中与国际双文凭。',
        items: [
          '高考、国际体系双轨兼顾',
          '学业 + 国际素养同步提升',
          '个性化学习规划',
          '完成学业并达标后获得中外高中双文凭',
        ],
      },
      {
        img: '/static/img/ycs/course3.png',
        name: '未来无界文凭课程',
        abbr: 'ODP',
        body: '以线上学习为主，赋能学生参加国际课程统一考试并获得相关证书。学生将借助 NGS 在线学校完成所有科目的学习并获得阶段性成绩，随后在规定的实际考试地点参加统一考试。符合学校毕业评估标准的学生将获得认可的高中国际文凭和成绩单。',
        items: [
          '灵活的学习进度',
          '灵活的学习地点：线上 / 任何地方',
          '国际高中成绩单',
          '完成学业并达标后获得国际高中文凭',
        ],
      },
    ],
    diploma: {
      eyebrow: '高中国际文凭课程',
      title: (
        <>
          全球认可的<GradientText>国际文凭</GradientText>
        </>
      ),
      sub: '在三大学习路径中，学生均可朝着全球认可的高中文凭迈进。',
      tracks: ['IGCSE', 'A-Level', 'AP', 'HKDSE'],
    },
    diplomaPlans: [
      {
        title: '未来全域学习计划',
        items: [
          '灵活的学习进度',
          '灵活的学习地点：线上 + 线下',
          '更广泛的科目选择',
          '按学生自身特点量身定制的课程计划',
        ],
      },
      {
        title: '未来教育双轨计划',
        items: [
          '高考、国际体系双轨兼顾',
          '学业 + 国际素养同步提升',
          '个性化学习规划',
          '完成学业并达标后获得中外高中双文凭',
        ],
      },
      {
        title: '未来无界文凭课程',
        items: [
          '灵活的学习进度',
          '灵活的学习地点：线上 / 任何地方',
          '国际高中成绩单',
          '完成学业并达标后获得国际高中文凭',
        ],
      },
    ],
    team: {
      eyebrow: 'YCS 管理层',
      title: (
        <>
          YCS <GradientText>核心团队</GradientText>
        </>
      ),
      sub: '由资深国际教育专家引领学校的学术愿景。',
    },
    leaders: [
      {
        img: '/static/img/ycs/yang.jpg',
        name: '杨凯隆 | Mark Yang',
        role: '校监',
        bio: '国际教育专家，历任深圳外国语学校国际部校长、深大师范学院国际高中校长、深圳耀华书院国际部校长，在国际教育领域拥有数十年管理经验。',
      },
      {
        img: '/static/img/ycs/chu.png',
        name: '朱剑 | Chu Jian',
        role: '首席顾问',
        bio: '中国首家获英国剑桥大学考试院（CIE）正式授权开设 A-Level 与 IGCSE 课程项目、深圳国际预科学院创始人。国际教育领域权威人物，曾在全国 300 多所 A-Level 国际学校巡回讲座授课。',
      },
      {
        img: '/static/img/ycs/xian.jpg',
        name: '鲜永红 | Peter Xian',
        role: '执行校长',
        bio: '英语文学学士、教育学硕士、儿童心理学硕士，深圳多所学校创校校长，曾任深圳外国语学校初中部校长。从事一线教学、管理及课程工作 20 余年。',
      },
      {
        img: '/static/img/ycs/xie.jpg',
        name: '谢俊飞 | Justin Xie',
        role: '教务长',
        bio: '英国大学硕士，多年国际学校任教经验，曾教授 A-Level 物理与 IGCSE 科学。担任过项目经理、试卷批改员与教研组长，参与多所知名国际学校的课程研发。',
      },
    ],
    cta: {
      eyebrow: '加入 YCS',
      title: (
        <>
          开启你的<GradientText>国际之旅</GradientText>
        </>
      ),
      sub: '与我们的团队聊聊，为孩子在珠海英华国际教育中心选择合适的学习路径。',
      primary: '在线报名',
      secondary: '了解师资团队',
    },
  },
};

export function YinghuaPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.primary, href: externalLinks.customerServiceWeChat, external: true }}
        secondary={{ label: t.hero.secondary, href: links.admissions }}
      />

      {/* About / accreditation */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.accreditation.eyebrow} title={t.accreditation.title} sub={t.accreditation.sub} />
            <div className="mt-8 space-y-5">
              {t.accreditation.body.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-white/65">{p}</p>
              ))}
            </div>
          </div>
          <GlassCard className="p-7 sm:p-9">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/static/img/ycs/ycs_banner.jpg"
                alt={locale === 'en' ? 'Oriental Yinghua Cambridge School (YCS) campus' : '珠海英华国际教育中心（YCS）校园'}
                fill
                sizes="(min-width:1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-5">
              {accreditors.map((a) => (
                <span
                  key={a.alt}
                  className="inline-flex h-10 items-center rounded-lg bg-white/90 px-3 ring-1 ring-white/10"
                >
                  <Image src={a.src} alt={a.alt} width={92} height={32} className="h-7 w-auto object-contain" />
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* Three pathways */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.programsHeading.eyebrow} title={t.programsHeading.title} sub={t.programsHeading.sub} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.programs.map((p) => (
            <GlassCard key={p.abbr} hover className="flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
                <Image src={p.img} alt={p.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <div className="flex items-center gap-3">
                  <h3 className="font-grotesk text-lg font-bold tracking-tight text-white">{p.name}</h3>
                  <Badge>{p.abbr}</Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* High-school diploma */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.diploma.eyebrow} title={t.diploma.title} sub={t.diploma.sub} align="center" />
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {t.diploma.tracks.map((track) => (
            <Badge key={track}>{track}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.diplomaPlans.map((plan, i) => (
            <FeatureCard
              key={plan.title}
              number={i + 1}
              title={plan.title}
              items={plan.items}
            />
          ))}
        </div>
      </Section>

      {/* Leadership */}
      <Section tone="night" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.team.eyebrow} title={t.team.title} sub={t.team.sub} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {t.leaders.map((m) => (
            <GlassCard key={m.name} className="flex h-full flex-col p-7 sm:flex-row sm:gap-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                <Image src={m.img} alt={m.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="mt-5 sm:mt-0">
                <h3 className="font-grotesk text-lg font-bold text-white">{m.name}</h3>
                <p className="mt-1 text-sm font-semibold">
                  <GradientText>{m.role}</GradientText>
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/60">{m.bio}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10">
          <Button href={links.faculty} variant="glass">{t.cta.secondary}</Button>
        </div>
      </Section>

      <CTASection
        eyebrow={t.cta.eyebrow}
        title={t.cta.title}
        sub={t.cta.sub}
        primary={{ label: t.cta.primary, href: externalLinks.customerServiceWeChat, external: true }}
        secondary={{ label: t.cta.secondary, href: links.faculty }}
      />
    </>
  );
}
