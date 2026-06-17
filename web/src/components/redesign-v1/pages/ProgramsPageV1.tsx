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
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /programs — International curricula. Reference v1 inner page: faithful
 * port of the legacy Programmes / ProgramOptions / Comprehensive /
 * StudentReviews content, re-expressed in the bold dark design.
 * ------------------------------------------------------------------ */

type Curriculum = { name: string; subjects: string; items: string[] };
type Point = { title: string; body: string };
type Review = { name: string; img: string; quote: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; trial: string; talk: string };
  stages: string[];
  curriculaHeading: { eyebrow: string; title: React.ReactNode; sub: string };
  curricula: Curriculum[];
  tailored: { eyebrow: string; title: React.ReactNode; imgAlt: string; points: Point[]; cta: string };
  assurance: { eyebrow: string; title: React.ReactNode; cards: Point[] };
  reviews: { eyebrow: string; title: React.ReactNode; sub: string; avatarAlt: (name: string) => string; list: Review[] };
}> = {
  en: {
    hero: {
      eyebrow: 'Study with NGS',
      title: (
        <>
          World-class international curricula, <GradientText>mastered.</GradientText>
        </>
      ),
      lead:
        'Class content is closely aligned to each exam syllabus — systematically covering the key knowledge points so students understand, learn effectively, and improve fast.',
      trial: 'Book a trial class',
      talk: 'Talk to an advisor',
    },
    stages: ['Foundation', 'Synchronization', 'Acceleration', 'Exam Prep'],
    curriculaHeading: {
      eyebrow: 'Curricula',
      title: (
        <>
          Four international systems, <GradientText>one expert team</GradientText>
        </>
      ),
      sub: 'One-to-one and small-group tuition across IB, A-Level / IGCSE, AP and HKDSE — taught by mentors from the world’s leading universities.',
    },
    curricula: [
      {
        name: 'IB',
        subjects: 'English · Math · Physics · Biology · Chemistry · CS · Economics · Business · Geography · History · Visual Art · Theatre · HL & SL',
        items: [
          'Comprehensive tutoring across all subjects',
          'Tutors with an average IB score of 42+',
          'Over 1,000 hours of teaching experience',
          'Mock exams and past-paper practice',
          'Tailored to diverse learning needs',
        ],
      },
      {
        name: 'A-Level · IGCSE',
        subjects: 'English · English Literature · Math · Further Math · Computer Science · Physics · Biology · Chemistry · Economics · Business · Accounting · Geography · History · Art History',
        items: [
          'Excellent homeschool options',
          'Expert tutoring for every A-Level subject',
          'Covers AQA, CIE and Edexcel exam boards',
          'Fast-track and personalised learning',
          'Strong track record of A / A* grades',
        ],
      },
      {
        name: 'AP',
        subjects: 'English Language · English Literature · Math · Calculus · Statistics · Microeconomics · Biology · Chemistry · Human Geography · World History · Art History',
        items: [
          'Tutors from Top-50 global universities',
          'Focused on achieving 4s and 5s',
          'College Board–style practice for readiness',
        ],
      },
    ],
    tailored: {
      eyebrow: 'Tailored teaching',
      title: (
        <>
          A comprehensive and <GradientText>tailored</GradientText> curriculum
        </>
      ),
      imgAlt: 'Smiling international-curriculum student learning with an NGS tutor',
      points: [
        {
          title: 'Personalised tutoring',
          body: 'No cookie-cutter teaching. Every student begins with an entry assessment, then receives a personalised study plan, real-time tracking and periodic feedback at every step.',
        },
        {
          title: 'Clear learning goals',
          body: 'Whether you want to prepare in advance, secure a short-term score boost, or excel in exams, NGS tutors build a study plan around your specific goals.',
        },
        {
          title: 'Subjects covered',
          body: 'One-to-one tutoring for most subjects across the IB, A-Level, AP and HKDSE curricula.',
        },
      ],
      cta: 'Book a trial class',
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
          body: 'High-quality teaching and personalised learning that saves study time, with students across Asia and beyond.',
        },
      ],
    },
    reviews: {
      eyebrow: 'Student reviews',
      title: (
        <>
          In our <GradientText>students’</GradientText> words
        </>
      ),
      sub: 'Real students, real results.',
      avatarAlt: (name) => `NGS student ${name}`,
      list: [
        {
          name: 'Noah',
          img: '/static/img/students/Noah.jpg',
          quote:
            'I have been studying A-Level Math and Physics with NGS for about a year now, and I couldn’t be happier. The teaching quality is outstanding — the tutors are highly knowledgeable and genuinely passionate about helping students succeed.',
        },
        {
          name: 'Lucy',
          img: '/static/img/students/Lucy.jpeg',
          quote:
            'I love learning flexibly with NGS. I can study while travelling with family, at my own pace and preferences. I finished my three main courses with NGS and look forward to my finals.',
        },
        {
          name: 'Tiffany',
          img: '/static/img/students/Tiffany.jpeg',
          quote:
            'Thanks to NGS, I’ve seen significant improvement in IB Math and Computer Science, and I feel well-prepared for my exams. I highly recommend NGS to anyone looking for a supportive, effective learning environment!',
        },
      ],
    },
  },
  zh: {
    hero: {
      eyebrow: '成为 NGS 学生',
      title: (
        <>
          国际课程<GradientText>全覆盖</GradientText>
        </>
      ),
      lead:
        '课程内容与考试大纲紧密结合，系统涵盖 90% 的核心知识点，确保学生听得懂、学得透、提分快。',
      trial: '预约试听课',
      talk: '咨询顾问',
    },
    stages: ['先修课程', '同步课程', '强化加速', '考试冲刺'],
    curriculaHeading: {
      eyebrow: '课程体系',
      title: (
        <>
          四大国际课程体系，<GradientText>一支专家团队</GradientText>
        </>
      ),
      sub: '覆盖 IB、A-Level / IGCSE、AP 与 HKDSE 的一对一与小班教学 —— 由来自全球顶尖大学的导师授课。',
    },
    curricula: [
      {
        name: 'IB 国际文凭课程',
        subjects: '英语 · 数学 · 物理 · 生物 · 化学 · 计算机科学 · 经济 · 商业 · 地理 · 历史 · 视觉艺术 · 戏剧 · HL & SL',
        items: [
          'IB 全科辅导',
          '全球 Top 50 大学精英导师，IB 均分 40+',
          '1000+ 小时教学经验',
          '真题与模考练习',
          '个性化学习计划与进度',
        ],
      },
      {
        name: 'A-Level · IGCSE',
        subjects: '英语 · 英国文学 · 数学 · 高等数学 · 计算机科学 · 物理 · 生物 · 化学 · 经济 · 商业 · 会计 · 地理 · 历史 · 艺术史',
        items: [
          '全脱产高中课程',
          '个性化教学，快速上岸',
          'Top 50 大学精英导师，授课科目 A*',
          'AQA、CIE、Edexcel 三大考试局',
          '帮助学生达标 A / A* 成绩',
        ],
      },
      {
        name: 'AP',
        subjects: '英语 · 英国文学 · 数学 · 微积分 · 统计 · 微观经济 · 生物 · 化学 · 人文地理 · 世界历史 · 艺术史',
        items: [
          'Top 50 大学 / 藤校导师',
          '帮助学生达标单科 4–5 分',
          '真题演练讲解',
        ],
      },
    ],
    tailored: {
      eyebrow: '定制化教学',
      title: (
        <>
          四大课程体系 + <GradientText>定制化</GradientText>教学
        </>
      ),
      imgAlt: '面带微笑的国际课程学生在 NGS 导师指导下学习',
      points: [
        {
          title: '个性化辅导',
          body: '没有千篇一律的教学。每个学生都从入学评估开始，获得个性化学习计划、实时跟踪与定期反馈，陪伴每一步成长。',
        },
        {
          title: '明确的学习目标',
          body: '无论是超前学习、巩固学科、短期提分，还是在考试中取得目标成绩，NGS 导师都会根据您的具体目标制定学习规划。',
        },
        {
          title: '科目全覆盖',
          body: '覆盖 IB、A-Level、AP 与 HKDSE 课程大多数科目的一对一辅导。',
        },
      ],
      cta: '预约试听课',
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
          body: '高质量教学与个性化学习，不受地点束缚、提速增效，学员遍布亚洲及海外。',
        },
      ],
    },
    reviews: {
      eyebrow: '学员评价',
      title: (
        <>
          听听<GradientText>学员</GradientText>怎么说
        </>
      ),
      sub: '真实的学生，真实的成长。',
      avatarAlt: (name) => `NGS 学员 ${name} 的头像`,
      list: [
        {
          name: 'Noah',
          img: '/static/img/students/Noah.jpg',
          quote:
            '我在 NGS 学习 A-Level 数学和物理已经一年了，这段经历让我非常满意。两位老师都是学科学霸，教学非常耐心，相比在国际学校学习时提升很快。',
        },
        {
          name: 'Lucy',
          img: '/static/img/students/Lucy.jpeg',
          quote:
            '我喜欢在 NGS 的灵活学习。不仅可以在与家人旅行期间学习，还能按照自己的节奏和喜好学习。我在 NGS 完成了三门主修课程，并期待着完成期末考试。',
        },
        {
          name: 'Tiffany',
          img: '/static/img/students/Tiffany.jpeg',
          quote:
            '感谢 NGS，我对 IB 数学和计算机科学有了显著提升，感觉自己为即将到来的考试做好了充分准备。我强烈推荐 NGS 给所有寻求高效学习环境的同学。',
        },
      ],
    },
  },
};

export function ProgramsPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.trial, href: links.admissions }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* Curricula */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.curriculaHeading.eyebrow} title={t.curriculaHeading.title} sub={t.curriculaHeading.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {t.stages.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.curricula.map((c, i) => (
            <FeatureCard key={c.name} number={i + 1} title={c.name} description={c.subjects} items={c.items} />
          ))}
        </div>
      </Section>

      {/* Tailored curriculum */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image src="/static/img/smilegirl.jpg" alt={t.tailored.imgAlt} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
          <div>
            <SectionHeading eyebrow={t.tailored.eyebrow} title={t.tailored.title} />
            <div className="mt-8 space-y-6">
              {t.tailored.points.map((p) => (
                <div key={p.title}>
                  <h3 className="font-grotesk text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65">{p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-9">
              <Button href={links.admissions} variant="gradient">{t.tailored.cta}</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Parent assurance */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.assurance.eyebrow} title={t.assurance.title} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {t.assurance.cards.map((c) => (
            <FeatureCard key={c.title} title={c.title} description={c.body} />
          ))}
        </div>
      </Section>

      {/* Student reviews */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.reviews.eyebrow} title={t.reviews.title} sub={t.reviews.sub} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.reviews.list.map((r) => (
            <GlassCard key={r.name} className="flex h-full flex-col p-7">
              <span aria-hidden className="font-grotesk text-4xl leading-none text-ngs-violet/70">&ldquo;</span>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/80">{r.quote}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <Image src={r.img} alt={t.reviews.avatarAlt(r.name)} width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-1 ring-white/15" />
                <span className="font-grotesk text-sm font-semibold text-white">{r.name}</span>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-12">
          <Button href={links.admissions} variant="gradient">{t.hero.trial}</Button>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
