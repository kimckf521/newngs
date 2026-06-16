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
 * /dual_track_learning — NGS Dual-Track Program (DTP). Faithful port of
 * the legacy FormDualTrack / IntroDualTrack / AdmissionsRequirement /
 * GlobalCommunity / NgsGlobal sections, re-expressed in the bold dark v1
 * design and ending in the reusable contact form.
 * ------------------------------------------------------------------ */

type Row = { item: string; detail: string };
type Feature = { title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; apply: string; talk: string };
  intro: {
    eyebrow: string;
    title: React.ReactNode;
    paras: string[];
    pillars: Feature[];
  };
  model: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    flexNote: string;
    head: { item: string; detail: string };
    rows: Row[];
  };
  admissions: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    head: { item: string; detail: string };
    rows: Row[];
    qrCaption: string;
  };
  community: {
    eyebrow: string;
    title: React.ReactNode;
    locations: React.ReactNode;
    explore: string;
    cards: { title: string; body: string; href: string }[];
  };
}> = {
  en: {
    hero: {
      eyebrow: 'NGS Dual-Track Program',
      title: (
        <>
          Two diplomas, <GradientText>one journey</GradientText>
        </>
      ),
      lead:
        'A customised support system that helps students in Chinese local schools transition into international curricula — IB, A-Level, AP and HKDSE — without ever disrupting their current Gaokao studies.',
      apply: 'Apply now',
      talk: 'Talk to an advisor',
    },
    intro: {
      eyebrow: 'What is DTP',
      title: (
        <>
          The Dual-Track <GradientText>Transition Program</GradientText>
        </>
      ),
      paras: [
        'The Dual-Track Transition Program (DTP) delivers systematic international-curriculum learning tailored to local-school students, bridging the move from a public school to international systems such as IB, A-Level, AP and HKDSE — seamlessly.',
        'Its advantage: the transition happens without interrupting a student’s existing Gaokao-track studies. Students with the capacity to do more gain a dual-enrolment opportunity, completing an international high-school curriculum alongside their public-school programme. Graduates who meet the standard earn both a public-school and an international high-school diploma.',
      ],
      pillars: [
        { title: 'Flexible learning architecture', body: 'A structure built to fit around an existing public-school timetable — study at your own pace, anywhere.' },
        { title: 'Dual enrolment, dual curricula', body: 'Hold two student records and study two curricula in parallel, with both pathways fully supported.' },
        { title: 'An innovative learning experience', body: 'Live online classes, the SPARK LAB community and on-campus assessment combine into one modern model.' },
      ],
    },
    model: {
      eyebrow: 'The model',
      title: (
        <>
          How the <GradientText>dual track</GradientText> works
        </>
      ),
      sub: 'Online subject learning paired with on-campus assessment — the best of flexible study and accredited, school-issued results.',
      flexNote: 'Enjoy the flexibility of learning anywhere, at your own pace.',
      head: { item: 'Item', detail: 'Dual-Track Model' },
      rows: [
        { item: 'Course options', detail: 'Chinese Public + A-Level / HKDSE / AP' },
        { item: 'Entry assessment', detail: 'Online + on campus' },
        { item: 'Subject learning', detail: 'Online' },
        { item: 'Learning platform', detail: 'ClassIn' },
        { item: 'Learning community', detail: 'SPARK LAB + school community' },
        { item: 'Formative assessment', detail: 'Online' },
        { item: 'Official assessment', detail: 'On campus' },
        { item: 'Official transcripts', detail: 'Issued by school' },
        { item: 'Enrollment', detail: 'NGS Online + school' },
      ],
    },
    admissions: {
      eyebrow: 'Admissions',
      title: (
        <>
          Admissions <GradientText>requirements</GradientText>
        </>
      ),
      sub: 'Open to G9 graduates ready to build an international pathway alongside their current studies.',
      head: { item: 'Item', detail: 'Details' },
      rows: [
        { item: 'Academic requirement', detail: 'G9 graduates' },
        { item: 'Age', detail: '15+' },
        { item: 'Nationality', detail: 'All welcome' },
        { item: 'Language', detail: 'English proficiency level B1+' },
        { item: 'Residency', detail: 'All welcome' },
        { item: 'Interview', detail: 'Required' },
        { item: 'Hardware / software', detail: 'Desktop or laptop computer / ClassIn App installed' },
      ],
      qrCaption: 'Scan for NGS Admissions',
    },
    community: {
      eyebrow: 'NextGen Global Community',
      title: (
        <>
          Learn within a <GradientText>global community</GradientText>
        </>
      ),
      locations: (
        <>
          San Francisco · Melbourne · Hong Kong · Taiwan · Greater Bay Area China
        </>
      ),
      explore: 'Explore',
      cards: [
        {
          title: 'Partner With Us',
          body: 'Expert online international programs, admissions coaching and personalised tutoring designed to empower educators and students to achieve academic excellence and unlock their full potential.',
          href: siteLinks.en.home,
        },
        {
          title: 'Study With Us',
          body: 'Dreaming of your ideal university but unsure how to get there? Our personalised mentoring guides you every step of the way.',
          href: siteLinks.en.programs,
        },
        {
          title: 'Join Us',
          body: 'Connect with global industry leaders, world-class universities, the cross-border SPARK LAB student club and a thriving global alumni network.',
          href: siteLinks.en.ngsInspires,
        },
      ],
    },
  },
  zh: {
    hero: {
      eyebrow: 'NGS 未来教育双轨计划',
      title: (
        <>
          双学籍双课程，<GradientText>一段成长之旅</GradientText>
        </>
      ),
      lead:
        '为本地学校学生量身定制的国际课程系统学习，帮助学生在不打断普高学习的前提下，顺利衔接 IB、A-Level、AP、HKDSE 等国际教育体系。',
      apply: '立即申请',
      talk: '咨询顾问',
    },
    intro: {
      eyebrow: '什么是 DTP',
      title: (
        <>
          未来教育<GradientText>双轨计划</GradientText>
        </>
      ),
      paras: [
        '未来教育双轨计划（DTP）为本地学校学生量身定制国际课程系统学习，帮助学生顺利实现公立学校到国际教育体系（如 IB、A-Level、AP、HKDSE）的无缝衔接。',
        '其优势在于不打断学生现有普高体系学习的前提下完成课程过渡，更为学有余力的学生提供双学籍学习机会，助其在完成普高学习的同时同步完成国际高中课程学习，毕业达标者可获得普高、国际高中双文凭。',
      ],
      pillars: [
        { title: '灵活学习架构', body: '围绕现有普高课表灵活安排，随时随地、以自己的节奏学习。' },
        { title: '双学籍双课程', body: '同时拥有两个学籍、并行修读两套课程，两条路径全程支持。' },
        { title: '创新学习体验', body: '线上直播课程、SPARK LAB 社区与线下评估融合为一套现代学习模式。' },
      ],
    },
    model: {
      eyebrow: '双轨模式',
      title: (
        <>
          <GradientText>双轨</GradientText>如何运作
        </>
      ),
      sub: '线上学科学习搭配线下评估 —— 兼顾灵活学习与学校签发的权威成绩。',
      flexNote: '享受随时随地、以自己的节奏学习的灵活性。',
      head: { item: '分类', detail: '未来教育双轨计划' },
      rows: [
        { item: '课程选择', detail: '普高 + A-Level / HKDSE / AP' },
        { item: '入学测试', detail: '线上 + 线下' },
        { item: '学习方式', detail: 'ClassIn + 教室' },
        { item: '学习平台', detail: 'SPARK LAB + 学校社区' },
        { item: '学习社区', detail: '线上' },
        { item: '阶段评估', detail: '线上 + 线下' },
        { item: '考试局测试', detail: '线下' },
        { item: '成绩单', detail: 'NGS 线上学校、线下学校' },
      ],
    },
    admissions: {
      eyebrow: '入学要求',
      title: (
        <>
          入学<GradientText>要求</GradientText>
        </>
      ),
      sub: '面向中考毕业生，在不影响现有学习的前提下搭建国际升学路径。',
      head: { item: '项目', detail: '详情' },
      rows: [
        { item: '学术要求', detail: '中考毕业生' },
        { item: '年龄', detail: '15 岁以上' },
        { item: '国籍', detail: '不限' },
        { item: '语言', detail: '英语水平 B1 以上' },
        { item: '居住地', detail: '不限' },
        { item: '面试', detail: '必需' },
        { item: '硬件 / 软件', detail: '台式、手提或平板电脑 / 安装 ClassIn App' },
      ],
      qrCaption: '扫码了解 NGS 招生',
    },
    community: {
      eyebrow: '未来学者全球社区',
      title: (
        <>
          在<GradientText>全球社区</GradientText>中学习
        </>
      ),
      locations: (
        <>
          美国三藩市 · 澳大利亚墨尔本 · 中国香港 · 中国台湾 · 中国大湾区
        </>
      ),
      explore: '查看详情',
      cards: [
        {
          title: '成为 NGS 伙伴',
          body: 'NGS 提供主流国际课程全科在线教育、升学辅导以及竞赛、标化考试冲刺等个性化教学服务，帮助贵校学生实现不受物理空间约束的卓越学术体验，激发无限潜能。',
          href: siteLinks.zh.home,
        },
        {
          title: '成为 NGS 学生',
          body: '梦想进入理想的大学，却不知如何实现目标？我们的个性化辅导服务将全程为你指引方向。',
          href: siteLinks.zh.programs,
        },
        {
          title: '加入 NGS 全球社区',
          body: '链接全球行业领袖、世界知名大学、跨国界同龄学生俱乐部 SPARK LAB 和蓬勃发展的全球校友网络。',
          href: siteLinks.zh.ngsInspires,
        },
      ],
    },
  },
};

export function DualTrackPageV1({ locale }: { locale: Locale }) {
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

      {/* What is DTP */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} />
            <div className="mt-7 space-y-5">
              {t.intro.paras.map((p) => (
                <p key={p} className="text-[15px] leading-relaxed text-white/65">{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {t.intro.pillars.map((pillar) => (
                <Badge key={pillar.title}>{pillar.title}</Badge>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/smilegirl.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.intro.pillars.map((pillar) => (
            <FeatureCard key={pillar.title} title={pillar.title} description={pillar.body} />
          ))}
        </div>
      </Section>

      {/* The dual-track model */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.model.eyebrow} title={t.model.title} sub={t.model.sub} />
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/static/img/classroom.jpg"
                alt=""
                fill
                sizes="(min-width:1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-white/65">{t.model.flexNote}</p>
          </div>
          <div className="lg:col-span-7">
            <GlassCard className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t.model.head.item}</th>
                    <th className="px-6 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t.model.head.detail}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.model.rows.map((row) => (
                    <tr key={row.item} className="border-b border-white/5 last:border-0">
                      <td className="px-6 py-3.5 align-top text-white/55">{row.item}</td>
                      <td className="px-6 py-3.5 align-top font-medium text-white/90">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Admissions requirements */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.admissions.eyebrow} title={t.admissions.title} sub={t.admissions.sub} />
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 lg:order-2">
            <GlassCard className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t.admissions.head.item}</th>
                    <th className="px-6 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t.admissions.head.detail}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.admissions.rows.map((row) => (
                    <tr key={row.item} className="border-b border-white/5 last:border-0">
                      <td className="px-6 py-3.5 align-top text-white/55">{row.item}</td>
                      <td className="px-6 py-3.5 align-top font-medium text-white/90">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
          <div className="lg:col-span-5 lg:order-1">
            <GlassCard className="flex flex-col items-center p-8 text-center">
              <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                <Image
                  src="/static/img/wechatQR.png"
                  alt={t.admissions.qrCaption}
                  fill
                  sizes="176px"
                  className="object-contain"
                />
              </div>
              <p className="mt-5 text-sm text-white/65">{t.admissions.qrCaption}</p>
              <div className="mt-7">
                <Button href={links.admissions} variant="gradient">{t.hero.apply}</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Global community */}
      <Section tone="night" glow="violet" glowPosition="left">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} />
            <p className="mt-6 text-[15px] leading-relaxed text-white/65">{t.community.locations}</p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/world-map.png"
              alt=""
              fill
              sizes="(min-width:1024px) 48vw, 100vw"
              className="object-contain p-4"
            />
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.community.cards.map((card, i) => (
            <FeatureCard
              key={card.title}
              number={i + 1}
              title={card.title}
              description={card.body}
              href={card.href}
              cta={t.community.explore}
            />
          ))}
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
