import Image from 'next/image';
import type { ReactNode } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import type { TutorCardData } from '@/components/sections/TutorCard';
import {
  PageHero,
  Section,
  SectionHeading,
  GlassCard,
  GradientText,
  Badge,
  CTASection,
} from '../ui';
import {
  facultyMathScienceEn,
  facultyEnglishHistoryEn,
  facultyCollegeAdvisorsEn,
} from '@/content/en/faculty';
import {
  facultyMathScienceZh,
  facultyEnglishHistoryZh,
  facultyCollegeAdvisorsZh,
} from '@/content/zh/faculty';

/* ------------------------------------------------------------------ *
 * /faculty — Teaching team. Faithful port of the legacy Faculties /
 * Comprehensive sections, re-expressed in the bold dark v1 design.
 * Faculty member data is REUSED from content/{en,zh}/faculty.tsx.
 * ------------------------------------------------------------------ */

type Group = { eyebrow: string; title: ReactNode; tutors: TutorCardData[] };
type Point = { title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: ReactNode; lead: string; primary: string; secondary: string };
  intro: { eyebrow: string; title: ReactNode; sub: string; tags: string[] };
  groups: Group[];
  tailored: { eyebrow: string; title: ReactNode; points: Point[] };
  cta: { eyebrow: string; title: ReactNode; sub: string; primary: string };
}> = {
  en: {
    hero: {
      eyebrow: 'Our teaching team',
      title: (
        <>
          Mentors from the world&apos;s <GradientText>leading universities</GradientText>
        </>
      ),
      lead:
        'Every NGS tutor is a top scorer in their own field — IB 40+, Top-50 graduates and Olympiad medalists who teach with patience, real-world clarity and a genuine drive to see students succeed.',
      primary: 'Book a trial class',
      secondary: 'Meet the team',
    },
    intro: {
      eyebrow: 'Why our faculty',
      title: (
        <>
          Subject specialists who <GradientText>raise scores</GradientText>
        </>
      ),
      sub: 'One-to-one and small-group tuition across IB, A-Level / IGCSE, AP and HKDSE — taught by mentors who have walked the path our students are on.',
      tags: ['IB 40+ tutors', 'Top-50 graduates', 'Olympiad medalists', 'Bilingual EN / 中文'],
    },
    groups: [
      { eyebrow: 'Faculty', title: <>Math · Science · Economics</>, tutors: facultyMathScienceEn },
      { eyebrow: 'Faculty', title: <>English · History · Law · Arts</>, tutors: facultyEnglishHistoryEn },
      { eyebrow: 'Faculty', title: <>College advisors</>, tutors: facultyCollegeAdvisorsEn },
    ],
    tailored: {
      eyebrow: 'How we teach',
      title: (
        <>
          A comprehensive and <GradientText>tailored</GradientText> approach
        </>
      ),
      points: [
        {
          title: 'Personalised tutoring',
          body: 'No cookie-cutter teaching or one-size-fits-all courses. Every student begins with an entry assessment, then receives a personalised study plan, real-time tracking and periodic feedback at every step.',
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
    },
    cta: {
      eyebrow: 'Get started',
      title: (
        <>
          Find the right tutor for <GradientText>your student</GradientText>
        </>
      ),
      sub: 'Book a trial class and we will match your student with a mentor who fits their subjects, level and goals.',
      primary: 'Book a trial class',
    },
  },
  zh: {
    hero: {
      eyebrow: '我们的教学团队',
      title: (
        <>
          来自<GradientText>全球顶尖大学</GradientText>的精英导师
        </>
      ),
      lead:
        '每一位 NGS 导师都是各自领域的高分学霸 —— IB 40+、Top 50 大学毕业生与奥林匹克奖牌获得者，以耐心、贴近真实世界的讲解，以及帮助学生成功的真诚热忱授课。',
      primary: '预约试听课',
      secondary: '认识团队',
    },
    intro: {
      eyebrow: '导师优势',
      title: (
        <>
          真正能<GradientText>帮学生提分</GradientText>的学科专家
        </>
      ),
      sub: '覆盖 IB、A-Level / IGCSE、AP 与 HKDSE 的一对一与小班教学 —— 由走过同一条升学之路的导师亲自授课。',
      tags: ['IB 40+ 导师', 'Top 50 大学毕业', '奥赛奖牌得主', '中英双语授课'],
    },
    groups: [
      { eyebrow: '教学团队', title: <>数学 · 自然科学 · 经济</>, tutors: facultyMathScienceZh },
      { eyebrow: '教学团队', title: <>英文 · 历史 · 法律 · 艺术</>, tutors: facultyEnglishHistoryZh },
      { eyebrow: '教学团队', title: <>全球方向升学导师</>, tutors: facultyCollegeAdvisorsZh },
    ],
    tailored: {
      eyebrow: '我们的教学方式',
      title: (
        <>
          四大课程体系 + <GradientText>定制化</GradientText>教学
        </>
      ),
      points: [
        {
          title: '个性化辅导',
          body: '没有千篇一律的教学或一刀切的课程。每个学生都从入学评估开始，获得个性化学习计划、实时跟踪与定期反馈，陪伴每一步成长。',
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
    },
    cta: {
      eyebrow: '开始学习',
      title: (
        <>
          为<GradientText>你的孩子</GradientText>找到合适的导师
        </>
      ),
      sub: '预约一节试听课，我们会根据学生的科目、水平与目标，为其匹配最合适的导师。',
      primary: '预约试听课',
    },
  },
};

function FacultyCard({ tutor }: { tutor: TutorCardData }) {
  return (
    <GlassCard hover className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden border-b border-white/10">
        <Image
          src={tutor.avatar}
          alt={tutor.name}
          fill
          sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/55 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-grotesk text-base font-bold leading-snug text-white">{tutor.name}</h3>
        <span aria-hidden className="mt-3 block h-px w-8 bg-ngs-gradient" />
        <p className="mt-4 text-sm leading-relaxed text-white/65">{tutor.bio}</p>
      </div>
    </GlassCard>
  );
}

export function FacultyPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.primary, href: links.admissions }}
        secondary={{ label: t.hero.secondary, href: '#team' }}
      />

      {/* Why our faculty */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} sub={t.intro.sub} />
            <div className="mt-8 flex flex-wrap gap-2.5">
              {t.intro.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/Graduation.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
        </div>
      </Section>

      {/* Faculty groups */}
      <Section id="team" tone="night" glow="cyan" glowPosition="left">
        <div className="space-y-20">
          {t.groups.map((group, gi) => (
            <div key={gi}>
              <SectionHeading eyebrow={group.eyebrow} title={group.title} />
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.tutors.map((tutor) => (
                  <FacultyCard key={tutor.name} tutor={tutor} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How we teach */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/smilegirl.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
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
          </div>
        </div>
      </Section>

      <CTASection
        eyebrow={t.cta.eyebrow}
        title={t.cta.title}
        sub={t.cta.sub}
        primary={{ label: t.cta.primary, href: links.admissions }}
      />
    </>
  );
}
