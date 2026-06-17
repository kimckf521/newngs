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
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /ngs_connects — NextGen Connects. Faithful port of the legacy
 * ConnectsCards / IntroConnects / HighschoolMappingSections /
 * ConnectToSchools / ConnectToParents / ConnectToExperts content,
 * re-expressed in the bold dark "v1" design.
 * ------------------------------------------------------------------ */

type Pillar = { name: string; img: string; alt: string; body: string };
type MapCol = { title: string; items: string[] };
type Network = { title: string; img: string; alt: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; subscribe: string; consult: string };
  pillarsHeading: { eyebrow: string; title: React.ReactNode; sub: string };
  pillars: Pillar[];
  intro: { eyebrow: string; title: React.ReactNode; body: string[] };
  mapping: { eyebrow: string; title: React.ReactNode; sub: string; stages: string[]; columns: MapCol[]; cta: string };
  networksHeading: { eyebrow: string; title: React.ReactNode; sub: string };
  networks: Network[];
  cta: { title: string; sub: string; subscribe: string };
}> = {
  en: {
    hero: {
      eyebrow: 'NextGen Connects',
      title: (
        <>
          Navigate school selection with <GradientText>clarity</GradientText>
        </>
      ),
      lead:
        'NextGen Connects helps families and students cut through a bewildering school-selection process. Through deep school visits, comprehensive school reports, and learning-path matching analysis, we deliver an information-rich, well-matched decision-making experience — and support every step of the transition from exam prep to a new learning environment.',
      subscribe: 'Subscribe now',
      consult: 'Book a free call',
    },
    pillarsHeading: {
      eyebrow: 'Four pillars',
      title: (
        <>
          School insights, growth planning &amp; <GradientText>academic readiness</GradientText>
        </>
      ),
      sub: 'School Insights · Growth Planning · Academic Readiness · Family Decisions.',
    },
    pillars: [
      {
        name: 'K12 School Visits',
        img: '/static/img/connects/vanke.JPG',
        alt: 'K12 school visit',
        body: 'Deep school visits help families experience each school’s learning environment, teaching philosophy, and core values to make better-informed enrollment decisions.',
      },
      {
        name: 'School Reports',
        img: '/static/img/connects/schoolreports.jpg',
        alt: 'School reports',
        body: 'In-depth school reports for students and parents with future-goal matching analysis, providing insider information beyond what websites offer.',
      },
      {
        name: 'Growth Mapping',
        img: '/static/img/connects/growth.jpg',
        alt: 'Growth mapping',
        body: 'Personalised high-school academic planning that fits each student’s growth, interests, family plans, and future aspirations.',
      },
      {
        name: 'Academic Clinics',
        img: '/static/img/connects/academic.jpg',
        alt: 'Academic clinics',
        body: 'Help students adapt to international-school environments through language and academic bridging plus social-expectations preparation.',
      },
    ],
    intro: {
      eyebrow: 'NextGen Global Community',
      title: (
        <>
          One global community, <GradientText>end to end</GradientText>
        </>
      ),
      body: [
        'NextGen Connects helps families and students navigate the complex school-selection process. Through deep school visits, comprehensive school reports, and learning-path matching analysis, we provide an information-rich, well-matched decision-making experience for students and parents.',
        'The programme also helps families and students through the complex transition from exam preparation to a new learning environment, providing comprehensive support across exam prep, academics, and emotional well-being.',
      ],
    },
    mapping: {
      eyebrow: 'High-school mapping',
      title: (
        <>
          A full path across <GradientText>every curriculum</GradientText>
        </>
      ),
      sub: 'From the school list to entrance exams to academic planning — across A-Level, IB, AP and HKDSE.',
      stages: ['A-Level', 'IB', 'AP', 'HKDSE'],
      columns: [
        {
          title: 'School Visits',
          items: ['Growth Mapping', 'School List', 'School Visits', 'Interview / Test Scheduling'],
        },
        {
          title: 'School Reports',
          items: [
            'School Profile',
            'School Systems',
            'School Board',
            'School Leadership',
            'School Faculty',
            'Student Demographics',
            'Track Records',
          ],
        },
        {
          title: 'Entrance-Exam Preparation',
          items: ['General Assessment', 'English Exam', 'Math Exam', 'Interview Preparation'],
        },
        {
          title: 'Academic Planning',
          items: [
            'Distance Learning',
            'Hybrid Learning',
            'Dual-track Learning',
            'On-campus Exams',
            'High-school Diploma',
            'University Applications',
          ],
        },
      ],
      cta: 'Book a free call',
    },
    networksHeading: {
      eyebrow: 'NextGen networks',
      title: (
        <>
          Connected to <GradientText>schools, parents &amp; experts</GradientText>
        </>
      ),
      sub: 'Three connected networks that surround every student and family.',
    },
    networks: [
      {
        title: 'Connect to International Schools',
        img: '/static/img/connects/school1.jpg',
        alt: 'International schools',
        body: 'Empowering students and schools through connections, customised learning opportunities, and a global perspective to help them reach greater achievements.',
      },
      {
        title: 'Global Parents Network',
        img: '/static/img/connects/parent1.jpg',
        alt: 'Global parents network',
        body: 'Cross-region connections for families to share experiences and insights, building supportive communities to help students succeed and strengthen school partnerships.',
      },
      {
        title: 'Global Education Experts Forum',
        img: '/static/img/connects/expert1.jpg',
        alt: 'Global education experts',
        body: 'Through this network, students and educators connect with thought leaders and practitioners in education and industry, gaining cutting-edge insights, mentorship support, and a global perspective.',
      },
    ],
    cta: {
      title: 'Join the NextGen Global Education Network',
      sub: 'Subscribe today to connect with schools, parents and experts worldwide.',
      subscribe: 'Subscribe now',
    },
  },
  zh: {
    hero: {
      eyebrow: 'NextGen Connects',
      title: (
        <>
          从容应对<GradientText>择校全流程</GradientText>
        </>
      ),
      lead:
        'NextGen Connects 帮助家庭和学生从容应对眼花缭乱的择校流程。通过深度访校、出具全面学校报告、学习路径匹配度分析，为学生和家长提供信息充分、匹配度高的决策体验，并陪伴从报考准备到适应新学习环境的每一步过渡。',
      subscribe: '立即订阅',
      consult: '免费咨询预约',
    },
    pillarsHeading: {
      eyebrow: '四大支柱',
      title: (
        <>
          学校洞察、成长规划与<GradientText>学术准备</GradientText>
        </>
      ),
      sub: '学校洞察 · 成长规划 · 学术准备 · 家庭决策。',
    },
    pillars: [
      {
        name: 'K12 · 深度访校',
        img: '/static/img/connects/vanke.JPG',
        alt: '深度访校',
        body: '深度访校，让家庭能够亲身感受各校的学习环境、教学理念与核心价值，从而做出更有信息依据的入学决策。',
      },
      {
        name: '学校报告',
        img: '/static/img/connects/schoolreports.jpg',
        alt: '学校报告',
        body: '为学生和家长出具学校深度报告，结合学生未来目标进行深度匹配度分析，帮家长掌握官网上无法获得的内幕信息。',
      },
      {
        name: '成长地图',
        img: '/static/img/connects/growth.jpg',
        alt: '成长地图',
        body: '为学生提供适合自身学术增长、兴趣爱好、家庭计划及未来发展规划的高中学术规划路径。',
      },
      {
        name: '学术诊所',
        img: '/static/img/connects/academic.jpg',
        alt: '学术诊所',
        body: '帮助学生提前适应国际学校全英文学习环境，通过强化语言及学术衔接与社交期待，为顺利过渡新课程与新文化打好准备。',
      },
    ],
    intro: {
      eyebrow: 'NextGen 全球社区',
      title: (
        <>
          一个<GradientText>全程陪伴</GradientText>的全球社区
        </>
      ),
      body: [
        'NextGen Connects 帮助家庭和学生从容应对眼花缭乱的择校流程。通过深度访校、出具全面学校报告、学习路径匹配度分析，为学生和家长提供信息充分、匹配度高的决策体验。',
        '本计划同时帮助家庭和学生全面适应从报考准备到适应新学习环境的复杂过渡，获得从入学考试、面试、专业课程选择等全方位的备考、学术与心理支持。',
      ],
    },
    mapping: {
      eyebrow: '高中规划',
      title: (
        <>
          覆盖<GradientText>四大课程</GradientText>的完整路径
        </>
      ),
      sub: '从学校清单到入学考试再到学术规划 —— 覆盖 A-Level、IB、AP 与 HKDSE。',
      stages: ['A-Level', 'IB', 'AP', 'HKDSE'],
      columns: [
        {
          title: 'K12 国际学校探校',
          items: ['成长地图', '学校清单', '实地探校', '入学考试预约'],
        },
        {
          title: '学校综合情况报告',
          items: [
            '学校简介',
            '课程体系',
            '学校董事会',
            '学校管理层',
            '教职员工',
            '学生分布',
            '毕业成绩及大学录取',
          ],
        },
        {
          title: '入学考试准备',
          items: ['综合水平测试', '英文考试辅导', '数学考试辅导', '面试辅导'],
        },
        {
          title: '学术规划',
          items: [
            '未来无界文凭课程',
            '未来全域学习计划',
            '未来教育双轨计划',
            '在校考试安排',
            '高中文凭',
            '大学申请',
          ],
        },
      ],
      cta: '免费咨询预约',
    },
    networksHeading: {
      eyebrow: 'NextGen 网络',
      title: (
        <>
          连接<GradientText>学校、家长与专家</GradientText>
        </>
      ),
      sub: '三大相互联通的网络，环绕每一位学生与家庭。',
    },
    networks: [
      {
        title: '国际学校直连',
        img: '/static/img/connects/school1.jpg',
        alt: '国际学校',
        body: '赋能学生与学校，通过建立联系、提供定制化学习机会，并培养全球视野，帮助他们迈向更高成就。',
      },
      {
        title: '全球家长网络',
        img: '/static/img/connects/parent1.jpg',
        alt: '全球家长网络',
        body: 'NGS 全球家长网络跨区域连接家庭，分享经验洞见，建立支持性社区，助力学生成功并强化学校合作。',
      },
      {
        title: '全球教育专家论坛',
        img: '/static/img/connects/expert1.jpg',
        alt: '全球教育专家论坛',
        body: '通过 NGS 全球教育专家论坛，学生与教育者可与教育与产业领域的思想领袖和实务专家建立联系，获取前沿洞见、导师支持与全球化视野。',
      },
    ],
    cta: {
      title: '加入 NextGen 全球教育网络',
      sub: '今日订阅，连接全球的学校、家长与教育专家。',
      subscribe: '立即订阅',
    },
  },
};

export function ConnectsPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.subscribe, href: links.inProgress }}
        secondary={{ label: t.hero.consult, href: externalLinks.customerServiceWeChat, external: true }}
      />

      {/* Four pillars */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.pillarsHeading.eyebrow} title={t.pillarsHeading.title} sub={t.pillarsHeading.sub} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.pillars.map((p) => (
            <GlassCard key={p.name} hover className="flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10">
                <Image src={p.img} alt={p.alt} fill sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-grotesk text-lg font-bold tracking-tight text-white">{p.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.body}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Intro / global community */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image src="/static/img/painting.jpg" alt={locale === 'en' ? 'Students and mentors connecting in the NGS global education community' : '国际教育全球社区中师生交流的场景'} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} />
            <div className="mt-8 space-y-5">
              {t.intro.body.map((para) => (
                <p key={para} className="text-[15px] leading-relaxed text-white/65">{para}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* High-school mapping */}
      <Section tone="night-800" glow="magenta" glowPosition="right">
        <SectionHeading eyebrow={t.mapping.eyebrow} title={t.mapping.title} sub={t.mapping.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {t.mapping.stages.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.mapping.columns.map((col, i) => (
            <FeatureCard key={col.title} number={i + 1} title={col.title} items={col.items} />
          ))}
        </div>
        <div className="mt-12">
          <Button href={externalLinks.customerServiceWeChat} external variant="gradient">{t.mapping.cta}</Button>
        </div>
      </Section>

      {/* Networks: schools, parents, experts */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.networksHeading.eyebrow} title={t.networksHeading.title} sub={t.networksHeading.sub} />
        <div className="mt-12 space-y-6">
          {t.networks.map((n, i) => (
            <GlassCard key={n.title} className="grid items-stretch gap-0 overflow-hidden lg:grid-cols-2">
              <div className={`relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[260px] ${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                <Image src={n.img} alt={n.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/40 to-transparent" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <h3 className="font-grotesk text-xl font-bold tracking-tight text-white sm:text-2xl">{n.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/65">{n.body}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Subscribe CTA */}
      <Section tone="night-800" glow="cyan" glowPosition="center">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/65">{t.cta.sub}</p>
          <div className="mt-9 flex justify-center">
            <Button href={links.inProgress} variant="gradient">{t.cta.subscribe}</Button>
          </div>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
