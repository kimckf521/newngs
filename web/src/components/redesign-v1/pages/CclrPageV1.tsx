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
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /cclr_programs — Career · College · Life Readiness, the partner-with-us
 * flagship. Faithful port of the legacy CclrIntro / CclrDiagram /
 * PartnerWithUs / OurPrograms / GlobalCommunity content, re-expressed
 * in the bold dark "v1" design.
 * ------------------------------------------------------------------ */

type Competency = { name: string; body: string };
type Pillar = { title: React.ReactNode; body: string };
type Program = { title: string; href: string; items: string[] };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; partner: string; talk: string };
  intro: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    competencies: Competency[];
    pillars: Pillar[];
  };
  diagram: { eyebrow: string; title: React.ReactNode; caption: string };
  ecosystem: { eyebrow: string; title: React.ReactNode; sub: string; programs: Program[]; explore: string };
  partner: { eyebrow: string; title: React.ReactNode; cards: Pillar[]; cta: string };
  community: { eyebrow: string; title: React.ReactNode; locations: React.ReactNode };
}> = {
  en: {
    hero: {
      eyebrow: 'Partner with NextGen Scholars',
      title: (
        <>
          Career · College · <GradientText>Life Readiness</GradientText>
        </>
      ),
      lead:
        'A complete four-year high-school framework that defines, guides and assesses the competencies students need for academic success, career development and life beyond the classroom.',
      partner: 'Partner with us',
      talk: 'Talk to our team',
    },
    intro: {
      eyebrow: 'The CCLR programme',
      title: (
        <>
          One framework for the <GradientText>whole high-school journey</GradientText>
        </>
      ),
      sub: 'The NGS CCLR (College, Career & Life Readiness) course gives schools and families a comprehensive, progressive framework across all four years of high school — so every major decision is well-informed and every student leaves ready.',
      competencies: [
        {
          name: 'College Readiness',
          body: 'Admissions planning, global school selection, applications and interview coaching — so students transition seamlessly into higher education.',
        },
        {
          name: 'Career Readiness',
          body: 'Career and major exploration that connects classroom learning to real professional pathways and concrete career goals.',
        },
        {
          name: 'Life Readiness',
          body: 'The cognitive strategies, academic management, relationships and adaptability that help students thrive socially and personally.',
        },
        {
          name: 'Global Competency',
          body: 'The mindset and soft-skill set students need to navigate, contribute and lead in an interconnected world.',
        },
      ],
      pillars: [
        {
          title: 'Beyond academic achievement',
          body: 'CCLR equips students with the skills and knowledge to navigate university admissions, achieve career goals and thrive in society — not just pass exams.',
        },
        {
          title: 'Reliable insight at every stage',
          body: 'By empowering students, families, educators and schools with dependable insights, every decision made for the student is well-informed at every stage of their journey.',
        },
        {
          title: 'A confident transition',
          body: 'With its focus on college readiness, career competencies and life skills, CCLR prepares students to move into higher education, the workforce and society with confidence and capability.',
        },
      ],
    },
    diagram: {
      eyebrow: 'The framework',
      title: (
        <>
          Four competencies, <GradientText>one connected model</GradientText>
        </>
      ),
      caption:
        'College, Career, Life and Global competencies build on one another across all four high-school years.',
    },
    ecosystem: {
      eyebrow: 'A complete ecosystem',
      title: (
        <>
          CCLR sits at the heart of the <GradientText>NextGen ecosystem</GradientText>
        </>
      ),
      sub: 'From readiness to delivery to global exposure — four connected programmes that prepare students for a global future.',
      explore: 'Explore',
      programs: [
        {
          title: 'Career College Life Readiness Programme',
          href: siteLinks.en.cclr,
          items: ['Career Readiness', 'College Readiness', 'Life Readiness', 'Global Competency'],
        },
        {
          title: 'Partnership Programmes',
          href: siteLinks.en.hybrid,
          items: ['Hybrid Program', 'Dual-track Program', 'Online Diploma Program'],
        },
        {
          title: 'NextGen Inspires',
          href: siteLinks.en.ngsInspires,
          items: ['Global Industry Leaders', 'Global Universities', 'SPARK LAB', 'Global Alumni'],
        },
        {
          title: 'NextGen Connects',
          href: siteLinks.en.ngsConnects,
          items: ['School Visits', 'School Reports', 'Growth Mapping', 'Academic Clinics'],
        },
      ],
    },
    partner: {
      eyebrow: 'Partner with us',
      title: (
        <>
          Empower your students, <GradientText>unlock their potential</GradientText>
        </>
      ),
      cta: 'Partner with us',
      cards: [
        {
          title: 'Partner With Us',
          body: 'Expert online international programmes, admissions coaching and personalised tutoring — designed to empower educators and students to achieve academic excellence and unlock their full potential.',
        },
        {
          title: 'Study With Us',
          body: 'Dreaming of your ideal university but unsure how to get there? Our personalised mentoring services guide each student every step of the way.',
        },
        {
          title: 'Join Us',
          body: 'Connect with global industry leaders, global universities and global learners across the NextGen Scholars community.',
        },
      ],
    },
    community: {
      eyebrow: 'Global community',
      title: (
        <>
          The <GradientText>NextGen Global Community</GradientText>
        </>
      ),
      locations: (
        <>
          San Francisco · Melbourne
          <br />
          Hong Kong · Taiwan · Greater Bay Area, China
        </>
      ),
    },
  },
  zh: {
    hero: {
      eyebrow: '成为 NGS 伙伴',
      title: (
        <>
          NGS<GradientText>升学探索课程</GradientText>
        </>
      ),
      lead:
        '为学校和家庭提供高中四年完整、循序渐进的升学课程框架，帮助学生获得学术、升学、职业发展、社会参与和人生成长所需的综合实力。',
      partner: '成为合作伙伴',
      talk: '咨询我们的团队',
    },
    intro: {
      eyebrow: '升学探索课程',
      title: (
        <>
          一套贯穿<GradientText>整个高中阶段</GradientText>的框架
        </>
      ),
      sub: 'NGS 升学探索课程通过全面塑造学生的四大胜任力，帮助学校与家庭建立完整、循序渐进的课程框架 —— 让每一个重要决策都经过深思熟虑，让每一位学生都做好准备。',
      competencies: [
        {
          name: '大学胜任力',
          body: '升学规划、全球选校、申请与面试个性化辅导 —— 帮助学生顺利过渡到高等教育阶段。',
        },
        {
          name: '职业胜任力',
          body: '职业及专业探索，将课堂学习与真实的职业发展路径和明确的职业目标紧密连接。',
        },
        {
          name: '人生胜任力',
          body: '认知策略、学术管理、关系与人际交往、适应环境等重要软技能，帮助学生在社交与个人成长中游刃有余。',
        },
        {
          name: '全球竞争力',
          body: '帮助学生在互联互通的世界中导航、贡献并担当领导所需的视野与软技能组合。',
        },
      ],
      pillars: [
        {
          title: '超越学术成绩',
          body: '本课程不止于应试，更帮助学生构建认知策略、学术管理与人际交往等重要软技能，从容应对大学申请、实现职业目标并在社会中蓬勃发展。',
        },
        {
          title: '每个阶段的可靠洞察',
          body: '通过为学生、家庭、教育者与学校提供可靠洞察，确保高中阶段的每一个重要决策都经过深思熟虑、信息充分。',
        },
        {
          title: '自信地迈向下一程',
          body: '聚焦大学准备、职业胜任力与生活技能，本课程帮助学生自信而有能力地迈入高等教育、职场与社会。',
        },
      ],
    },
    diagram: {
      eyebrow: '课程框架',
      title: (
        <>
          四大胜任力，<GradientText>一个相互衔接的模型</GradientText>
        </>
      ),
      caption: '大学、职业、人生与全球四大胜任力，在高中四年中层层递进、相互衔接。',
    },
    ecosystem: {
      eyebrow: '完整的教育体系',
      title: (
        <>
          升学探索课程是<GradientText>未来教育体系</GradientText>的核心
        </>
      ),
      sub: '从升学准备到课程落地再到全球视野 —— 四条相互衔接的路径，助力学生迈向全球未来。',
      explore: '查看详情',
      programs: [
        {
          title: '升学探索课程',
          href: siteLinks.zh.cclr,
          items: ['职业准备', '大学准备', '生活准备', '全球胜任力'],
        },
        {
          title: '线上学校课程',
          href: siteLinks.zh.hybrid,
          items: ['未来全域学习计划', '未来教育双轨计划', '未来无界文凭课程'],
        },
        {
          title: 'NextGen Inspires',
          href: siteLinks.zh.ngsInspires,
          items: ['全球产业领袖', '全球大学', 'SPARK LAB', '全球校友'],
        },
        {
          title: 'NextGen Connects',
          href: siteLinks.zh.ngsConnects,
          items: ['校园参访', '学校报告', '成长规划', '学术诊所'],
        },
      ],
    },
    partner: {
      eyebrow: '成为 NGS 伙伴',
      title: (
        <>
          赋能学生，<GradientText>释放潜能</GradientText>
        </>
      ),
      cta: '成为合作伙伴',
      cards: [
        {
          title: '成为 NGS 伙伴',
          body: '我们提供专业的线上国际课程、升学辅导以及个性化家教服务，旨在帮助教育者与学生实现学术卓越，释放他们的全部潜能。',
        },
        {
          title: '成为 NGS 学生',
          body: '或许你梦想进入理想的大学，却不确定如何实现。我们的个性化辅导服务将全程为你指引方向。',
        },
        {
          title: '加入 NGS 全球社区',
          body: '在 NextGen Scholars，连接全球产业领袖、全球大学与全球学习者！',
        },
      ],
    },
    community: {
      eyebrow: '全球社区',
      title: (
        <>
          <GradientText>未来学者全球社区</GradientText>
        </>
      ),
      locations: (
        <>
          美国三藩市 · 澳大利亚墨尔本
          <br />
          中国香港 · 中国台湾 · 中国大湾区
        </>
      ),
    },
  },
};

export function CclrPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.partner, href: '#contact' }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* Intro: framework + four competencies */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} sub={t.intro.sub} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.intro.competencies.map((c, i) => (
            <FeatureCard key={c.name} number={i + 1} title={c.name} description={c.body} />
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {t.intro.pillars.map((p, i) => (
            <GlassCard key={i} className="p-7">
              <h3 className="font-grotesk text-lg font-bold text-white">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{p.body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Framework diagram */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.diagram.eyebrow} title={t.diagram.title} />
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">{t.diagram.caption}</p>
            <div className="mt-9">
              <Button href="#contact" variant="gradient">{t.hero.partner}</Button>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <Image
              src="/static/img/circles.jpg"
              alt={t.diagram.caption}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      </Section>

      {/* NextGen ecosystem */}
      <Section tone="night-800" glow="magenta" glowPosition="right">
        <SectionHeading eyebrow={t.ecosystem.eyebrow} title={t.ecosystem.title} sub={t.ecosystem.sub} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.ecosystem.programs.map((p) => (
            <FeatureCard
              key={p.title}
              title={p.title}
              items={p.items}
              href={p.href}
              cta={t.ecosystem.explore}
            />
          ))}
        </div>
      </Section>

      {/* Partner with us */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.partner.eyebrow} title={t.partner.title} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {t.partner.cards.map((c, i) => (
            <FeatureCard key={i} title={c.title} description={c.body} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button href="#contact" variant="gradient">{t.partner.cta}</Button>
        </div>
      </Section>

      {/* Global community */}
      <Section tone="night-800" glow="cyan" glowPosition="center">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} />
            <p className="mt-6 text-lg leading-relaxed text-white/65">{t.community.locations}</p>
            <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <Image
                src="/static/img/world-map.png"
                alt=""
                fill
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-contain p-4"
              />
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/harvard.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
