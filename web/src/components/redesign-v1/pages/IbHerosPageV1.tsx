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
  Badge,
  CheckList,
  CTASection,
  IconGlobe,
  IconUsers,
  IconCompass,
  IconCap,
  IconBook,
  IconStar,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /ib_heros — Partner institution: IB Heros (Melbourne tutoring).
 * The legacy route was a placeholder "in progress" page, so the
 * partner facts are sourced from the verified PartnersV1 entry
 * (Melbourne · tutoring; global, data-driven 1:1 and small-group
 * support across every major international curriculum) and re-expressed
 * in the bold dark v1 design. No prices or named faculty are invented.
 * ------------------------------------------------------------------ */

const LOGO = '/static/img/ibheros/ibheros_logo.png';

type Feature = { icon: React.ReactNode; title: string; description: string };
type Curriculum = { name: string; subjects: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; primary: string; secondary: string };
  intro: { eyebrow: string; title: React.ReactNode; sub: string; logoCaption: string; points: string[] };
  approach: { eyebrow: string; title: React.ReactNode; sub: string; features: Feature[] };
  curricula: { eyebrow: string; title: React.ReactNode; sub: string; list: Curriculum[] };
  partnership: { eyebrow: string; title: React.ReactNode; sub: string; points: Feature[] };
  cta: { eyebrow: string; title: React.ReactNode; sub: string; primary: string; secondary: string };
}> = {
  en: {
    hero: {
      eyebrow: 'Institutional Partner',
      title: (
        <>
          IB Heros — <GradientText>Melbourne</GradientText> tutoring, worldwide reach
        </>
      ),
      lead:
        'A global tutoring institution and trusted NextGen Scholars partner, delivering rigorous, data-driven one-to-one and small-group support across every major international curriculum.',
      primary: 'Talk to an advisor',
      secondary: 'See the curricula',
    },
    intro: {
      eyebrow: 'About IB Heros',
      title: (
        <>
          A partner built for <GradientText>international results</GradientText>
        </>
      ),
      sub:
        'Headquartered in Melbourne and serving families worldwide, IB Heros works alongside NextGen Scholars to give students focused, accountable academic support — wherever they study.',
      logoCaption: 'Melbourne · Tutoring',
      points: [
        'Rigorous, data-driven teaching that tracks progress lesson by lesson',
        'One-to-one and small-group formats matched to each student',
        'Coverage across every major international curriculum',
        'A global team supporting students across time zones',
      ],
    },
    approach: {
      eyebrow: 'The approach',
      title: (
        <>
          Focused support, <GradientText>measurable</GradientText> progress
        </>
      ),
      sub: 'Teaching that is structured, personal and accountable from the first lesson to the final exam.',
      features: [
        {
          icon: <IconCompass />,
          title: 'Data-driven teaching',
          description:
            'Every student starts from a clear baseline. Lessons are mapped to the syllabus and progress is tracked so families always know where things stand.',
        },
        {
          icon: <IconUsers />,
          title: 'One-to-one & small group',
          description:
            'Choose focused one-to-one tuition or small-group classes — the format is matched to the student, the subject and the goal.',
        },
        {
          icon: <IconGlobe />,
          title: 'Worldwide delivery',
          description:
            'A Melbourne base with a global team means students get consistent, high-quality support no matter where in the world they are studying.',
        },
      ],
    },
    curricula: {
      eyebrow: 'Curricula',
      title: (
        <>
          Every major <GradientText>international curriculum</GradientText>
        </>
      ),
      sub: 'Specialist tutoring aligned to the exam boards and syllabi that international students sit.',
      list: [
        {
          name: 'IB',
          subjects: 'International Baccalaureate — HL & SL support across the Diploma Programme subject groups.',
        },
        {
          name: 'A-Level · IGCSE',
          subjects: 'AQA, CIE and Edexcel exam boards — from IGCSE foundations through to A-Level finals.',
        },
        {
          name: 'AP',
          subjects: 'College Board Advanced Placement — exam-focused preparation across core AP subjects.',
        },
        {
          name: 'HKDSE',
          subjects: 'Hong Kong Diploma of Secondary Education — targeted support for the HKDSE pathway.',
        },
      ],
    },
    partnership: {
      eyebrow: 'With NextGen Scholars',
      title: (
        <>
          One partnership, <GradientText>one standard</GradientText>
        </>
      ),
      sub: 'IB Heros and NextGen Scholars share a single commitment: high-quality, personalised academic support that families can rely on.',
      points: [
        {
          icon: <IconCap />,
          title: 'Aligned standards',
          description:
            'Both teams hold to the same bar for teaching quality and student outcomes, so the experience is seamless from enquiry to exam day.',
        },
        {
          icon: <IconBook />,
          title: 'Joined-up planning',
          description:
            'Tutoring is coordinated around each student’s wider NGS study plan — no duplicated effort, no gaps between programmes.',
        },
        {
          icon: <IconStar />,
          title: 'Accountable support',
          description:
            'Clear baselines, regular feedback and progress tracking give parents real visibility into how their child is doing.',
        },
      ],
    },
    cta: {
      eyebrow: 'Get started',
      title: (
        <>
          Find the right <GradientText>tutoring</GradientText> fit
        </>
      ),
      sub: 'Tell us about your student and goals, and our team will help you start with IB Heros and NextGen Scholars.',
      primary: 'Talk to an advisor',
      secondary: 'Contact the team',
    },
  },
  zh: {
    hero: {
      eyebrow: '机构合作伙伴',
      title: (
        <>
          IB Heros —— 立足<GradientText>墨尔本</GradientText>，服务全球
        </>
      ),
      lead:
        '面向全球家庭的国际教育辅导机构，也是 NextGen Scholars 的信赖伙伴，以专业、系统、数据驱动的一对一与小班教学，覆盖各大核心国际课程体系。',
      primary: '咨询顾问',
      secondary: '查看课程体系',
    },
    intro: {
      eyebrow: '关于 IB Heros',
      title: (
        <>
          为<GradientText>国际课程成绩</GradientText>而生的伙伴
        </>
      ),
      sub:
        '总部位于墨尔本、服务全球家庭，IB Heros 与 NextGen Scholars 携手，为学生提供专注、可追踪的学术辅导 —— 无论他们在何处学习。',
      logoCaption: '墨尔本 · 学术辅导',
      points: [
        '数据驱动的教学，逐节课追踪学习进度',
        '一对一与小班教学，因人匹配',
        '覆盖各大核心国际课程体系',
        '全球团队，跨时区陪伴学习',
      ],
    },
    approach: {
      eyebrow: '教学方式',
      title: (
        <>
          专注辅导，<GradientText>可量化</GradientText>的进步
        </>
      ),
      sub: '从第一节课到最终考试，教学始终系统、个性化且可追踪。',
      features: [
        {
          icon: <IconCompass />,
          title: '数据驱动教学',
          description:
            '每位学生都从清晰的入学基线开始。课程紧扣考试大纲，进度全程追踪，让家长随时了解学习状况。',
        },
        {
          icon: <IconUsers />,
          title: '一对一与小班',
          description:
            '可选专注的一对一辅导或小班课程 —— 教学形式依学生、科目与目标灵活匹配。',
        },
        {
          icon: <IconGlobe />,
          title: '全球授课',
          description:
            '以墨尔本为基地、辅以全球团队，无论学生身处世界何地，都能获得稳定、高质量的支持。',
        },
      ],
    },
    curricula: {
      eyebrow: '课程体系',
      title: (
        <>
          覆盖各大<GradientText>核心国际课程</GradientText>
        </>
      ),
      sub: '紧扣国际学生所考的考试局与大纲，提供专业学科辅导。',
      list: [
        {
          name: 'IB 国际文凭课程',
          subjects: '国际文凭课程 —— 覆盖 IB Diploma 各学科组别的 HL 与 SL 辅导。',
        },
        {
          name: 'A-Level · IGCSE',
          subjects: 'AQA、CIE、Edexcel 三大考试局 —— 从 IGCSE 基础到 A-Level 冲刺。',
        },
        {
          name: 'AP',
          subjects: 'College Board 美国大学先修课程 —— 围绕核心 AP 科目的应试备考。',
        },
        {
          name: 'HKDSE',
          subjects: '香港中学文凭考试 —— 针对 HKDSE 升学路径的专项辅导。',
        },
      ],
    },
    partnership: {
      eyebrow: '携手 NextGen Scholars',
      title: (
        <>
          一份合作，<GradientText>同一标准</GradientText>
        </>
      ),
      sub: 'IB Heros 与 NextGen Scholars 秉持同一承诺：为家庭提供值得信赖的高质量、个性化学术辅导。',
      points: [
        {
          icon: <IconCap />,
          title: '标准一致',
          description:
            '两支团队在教学质量与学习成果上对齐同一标准，从咨询到考试，体验无缝衔接。',
        },
        {
          icon: <IconBook />,
          title: '统一规划',
          description:
            '辅导围绕学生在 NGS 的整体学习计划协同推进 —— 不重复、不脱节。',
        },
        {
          icon: <IconStar />,
          title: '可追踪的支持',
          description:
            '清晰的基线、定期反馈与进度追踪，让家长真正看见孩子的成长。',
        },
      ],
    },
    cta: {
      eyebrow: '开始咨询',
      title: (
        <>
          找到最适合的<GradientText>辅导方案</GradientText>
        </>
      ),
      sub: '告诉我们您学生的情况与目标，我们的团队将协助您开启 IB Heros 与 NextGen Scholars 的学习之旅。',
      primary: '咨询顾问',
      secondary: '联系我们',
    },
  },
};

export function IbHerosPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.primary, href: links.admissions }}
        secondary={{ label: t.hero.secondary, href: '#curricula' }}
      />

      {/* About IB Heros */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} sub={t.intro.sub} />
            <div className="mt-8">
              <CheckList items={t.intro.points} columns={1} />
            </div>
          </div>
          <GlassCard className="relative overflow-hidden p-9">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ngs-gradient" />
            <div className="inline-flex rounded-2xl bg-white/5 p-5">
              <Image
                src={LOGO}
                alt="IB Heros"
                width={260}
                height={72}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="mt-7 text-xs uppercase tracking-[0.18em] text-white/45">{t.intro.logoCaption}</p>
            <h3 className="mt-2 font-grotesk text-2xl font-bold tracking-tight text-white">IB Heros</h3>
          </GlassCard>
        </div>
      </Section>

      {/* Approach */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.approach.eyebrow} title={t.approach.title} sub={t.approach.sub} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.approach.features.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      </Section>

      {/* Curricula */}
      <Section id="curricula" tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.curricula.eyebrow} title={t.curricula.title} sub={t.curricula.sub} align="center" />
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {t.curricula.list.map((c) => (
            <Badge key={c.name}>{c.name}</Badge>
          ))}
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          {t.curricula.list.map((c, i) => (
            <FeatureCard key={c.name} number={i + 1} title={c.name} description={c.subjects} />
          ))}
        </div>
      </Section>

      {/* Partnership with NGS */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.partnership.eyebrow} title={t.partnership.title} sub={t.partnership.sub} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.partnership.points.map((p) => (
            <FeatureCard key={p.title} icon={p.icon} title={p.title} description={p.description} />
          ))}
        </div>
      </Section>

      <CTASection
        eyebrow={t.cta.eyebrow}
        title={t.cta.title}
        sub={t.cta.sub}
        primary={{ label: t.cta.primary, href: links.admissions }}
        secondary={{ label: t.cta.secondary, href: '#contact' }}
      />

      <ContactV1 locale={locale} />
    </>
  );
}
