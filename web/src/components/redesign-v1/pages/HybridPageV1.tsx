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
  Badge,
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /hybrid_learning — NGS Hybrid Program (未来全域学习计划). Faithful port
 * of the legacy FormHybrid / IntroHybrid / AdmissionsRequirement /
 * GlobalCommunity sections, re-expressed in the bold dark v1 design.
 * ------------------------------------------------------------------ */

type Row = { label: string; value: string };
type Point = { title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; primary: string; secondary: string };
  intro: {
    eyebrow: string;
    title: React.ReactNode;
    body: string[];
    pillars: string[];
    imageAlt: string;
    caption: string;
  };
  model: { eyebrow: string; title: React.ReactNode; sub: string; rows: Row[] };
  admissions: { eyebrow: string; title: React.ReactNode; sub: string; rows: Row[] };
  community: { eyebrow: string; title: React.ReactNode; sub: string; locations: Point[]; imageAlt: string };
}> = {
  en: {
    hero: {
      eyebrow: 'Hybrid Program',
      title: (
        <>
          The NGS Hybrid Program — <GradientText>learn anywhere</GradientText>, at your own pace.
        </>
      ),
      lead:
        'A flexible delivery model that seamlessly blends in-person campus learning with NGS online international courses — a personalised schedule that adapts to each student.',
      primary: 'Apply now',
      secondary: 'Talk to an advisor',
    },
    intro: {
      eyebrow: 'What is the Hybrid Program?',
      title: (
        <>
          Campus life and a <GradientText>world-class</GradientText> online curriculum
        </>
      ),
      body: [
        'The Hybrid Learning Program blends in-person and online instruction. Students attend some classes physically at their school campus while taking other courses through NGS’s advanced online platform.',
        'The result is a highly personalised learning schedule that adapts to each student’s individual needs, interests and circumstances — without giving up the experience of campus life.',
      ],
      pillars: ['Flexible learning architecture', 'Expanded course catalog', 'Enhanced educational innovation'],
      imageAlt: 'Student studying NGS hybrid international courses online',
      caption: 'Enjoy the flexibility of learning anywhere, at your own pace.',
    },
    model: {
      eyebrow: 'How it works',
      title: (
        <>
          The <GradientText>Hybrid Model</GradientText>, end to end
        </>
      ),
      sub: 'On-campus and online combine across every stage — from entry assessment to official, school-issued transcripts.',
      rows: [
        { label: 'Course options', value: 'A-Level / HKDSE / AP' },
        { label: 'Entry assessment', value: 'Online' },
        { label: 'Subject learning', value: 'Online + on campus' },
        { label: 'Learning platform', value: 'ClassIn + classroom' },
        { label: 'Learning community', value: 'SPARK LAB + school community' },
        { label: 'Formative assessment', value: 'Online' },
        { label: 'Official assessment', value: 'On campus' },
        { label: 'Official transcripts', value: 'Issued by school' },
        { label: 'Enrollment', value: 'NGS Online + school' },
      ],
    },
    admissions: {
      eyebrow: 'Admissions',
      title: (
        <>
          Admissions <GradientText>requirements</GradientText>
        </>
      ),
      sub: 'Open to G9 graduates ready for an international pathway. An interview is part of every application.',
      rows: [
        { label: 'Academic requirement', value: 'G9 graduates' },
        { label: 'Age', value: '15+' },
        { label: 'Nationality', value: 'All welcome' },
        { label: 'Language', value: 'English proficiency level B1+' },
        { label: 'Residency', value: 'All welcome' },
        { label: 'Interview', value: 'Required' },
        { label: 'Hardware / software', value: 'Desktop, laptop or tablet with the ClassIn app installed' },
      ],
    },
    community: {
      eyebrow: 'Global community',
      title: (
        <>
          Part of the <GradientText>NextGen global</GradientText> community
        </>
      ),
      sub: 'Hybrid students join a worldwide network of learners, mentors and partner campuses.',
      locations: [
        { title: 'Americas', body: 'San Francisco' },
        { title: 'Asia-Pacific', body: 'Hong Kong · Taiwan · Greater Bay Area China' },
        { title: 'Oceania', body: 'Melbourne' },
      ],
      imageAlt:
        'World map of NGS partner campuses — San Francisco, Hong Kong, Taiwan, the Greater Bay Area of China, and Melbourne',
    },
  },
  zh: {
    hero: {
      eyebrow: '未来全域学习计划',
      title: (
        <>
          NGS 未来全域学习计划 —— <GradientText>随时随地</GradientText>，按自己的节奏学习。
        </>
      ),
      lead:
        '一种灵活的教育模式，将线下校园教学与 NGS 在线国际课程无缝结合，形成高度定制化的学习方案，全面匹配每位学生的需求。',
      primary: '立即申请',
      secondary: '咨询顾问',
    },
    intro: {
      eyebrow: '什么是未来全域学习计划？',
      title: (
        <>
          校园生活 + <GradientText>世界级</GradientText>在线课程
        </>
      ),
      body: [
        '未来全域学习计划（HLP）采用创新教育模式，结合线下校园教学与线上国际课程。学生既能在校园学习部分课程，又可通过 NGS 在线教育平台修读其他课程。',
        '由此形成高度定制化的学习方案，全面匹配学生的个人需求、学术兴趣与生活安排 —— 同时不放弃传统校园的学习生活体验。',
      ],
      pillars: ['灵活的学习架构', '扩展课程体系', '创新性混合式学习体验'],
      imageAlt: '学生通过 NGS 在线平台修读混合式国际课程',
      caption: '享受随时随地、按自己节奏学习的灵活性。',
    },
    model: {
      eyebrow: '运作方式',
      title: (
        <>
          完整的<GradientText>混合模式</GradientText>
        </>
      ),
      sub: '线上与校园贯穿每个环节 —— 从入学测试到由学校颁发的官方成绩单。',
      rows: [
        { label: '课程选择', value: 'A-Level / HKDSE / AP' },
        { label: '入学测试', value: '线上' },
        { label: '学科学习', value: '线上 + 校园' },
        { label: '学习平台', value: 'ClassIn + 课堂' },
        { label: '学习社区', value: 'SPARK LAB + 学校社区' },
        { label: '形成性评估', value: '线上' },
        { label: '官方评估', value: '校园' },
        { label: '官方成绩单', value: '由学校颁发' },
        { label: '注册入学', value: 'NGS Online + 学校' },
      ],
    },
    admissions: {
      eyebrow: '入学要求',
      title: (
        <>
          入学<GradientText>要求</GradientText>
        </>
      ),
      sub: '面向已完成中考的毕业生，开启国际课程路径。每位申请者均需参加面试。',
      rows: [
        { label: '学术要求', value: '中考毕业生' },
        { label: '年龄', value: '15 岁以上' },
        { label: '国籍', value: '不限' },
        { label: '语言', value: '英语水平 B1 以上' },
        { label: '居住地', value: '不限' },
        { label: '面试', value: '必需' },
        { label: '电子设备硬件及软件', value: '台式 / 手提或平板电脑，并安装 ClassIn App' },
      ],
    },
    community: {
      eyebrow: '全球社区',
      title: (
        <>
          加入 <GradientText>NextGen 全球</GradientText>社区
        </>
      ),
      sub: '全域学习的学生将融入遍布全球的学习者、导师与合作校园网络。',
      locations: [
        { title: '美洲', body: '美国三藩市' },
        { title: '亚太', body: '中国香港 · 中国台湾 · 中国大湾区' },
        { title: '大洋洲', body: '澳大利亚墨尔本' },
      ],
      imageAlt: 'NGS 合作校园全球分布地图 —— 美国三藩市、中国香港、中国台湾、中国大湾区及澳大利亚墨尔本',
    },
  },
};

export function HybridPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.primary, href: links.admissions }}
        secondary={{ label: t.hero.secondary, href: '#contact' }}
      />

      {/* What is the Hybrid Program */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/static/img/smilegirl.jpg"
                alt={t.intro.imageAlt}
                fill
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/55">{t.intro.caption}</p>
          </div>
          <div>
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} />
            <div className="mt-6 space-y-4">
              {t.intro.body.map((p) => (
                <p key={p} className="text-[15px] leading-relaxed text-white/70">{p}</p>
              ))}
            </div>
            <div className="mt-7">
              <CheckList items={t.intro.pillars} columns={1} />
            </div>
          </div>
        </div>
      </Section>

      {/* The Hybrid Model */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.model.eyebrow} title={t.model.title} sub={t.model.sub} />
        <GlassCard className="mt-12 overflow-hidden">
          <dl className="divide-y divide-white/10">
            {t.model.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-6 sm:px-8">
                <dt className="font-grotesk text-sm font-semibold text-white/55">{row.label}</dt>
                <dd className="text-[15px] font-medium text-white sm:col-span-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      </Section>

      {/* Admissions requirements */}
      <Section tone="night-800" glow="magenta" glowPosition="right">
        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <SectionHeading eyebrow={t.admissions.eyebrow} title={t.admissions.title} sub={t.admissions.sub} />
            <GlassCard className="mt-10 overflow-hidden">
              <dl className="divide-y divide-white/10">
                {t.admissions.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-6 sm:px-8">
                    <dt className="font-grotesk text-sm font-semibold text-white/55">{row.label}</dt>
                    <dd className="text-[15px] font-medium text-white sm:col-span-2">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </GlassCard>
          </div>
          <div className="lg:col-span-2">
            <GlassCard className="flex flex-col items-center p-8 text-center">
              <div className="relative h-44 w-44 overflow-hidden rounded-2xl bg-white p-2">
                <Image
                  src="/static/img/wechatQR.png"
                  alt={locale === 'zh' ? 'NGS 招生二维码' : 'QR code for NGS admissions'}
                  fill
                  sizes="176px"
                  className="object-contain"
                />
              </div>
              <p className="mt-5 text-sm text-white/65">
                {locale === 'zh' ? '扫码了解 NGS 招生' : 'Scan to learn about NGS admissions'}
              </p>
              <div className="mt-7">
                <Button href={links.admissions} variant="gradient">{t.hero.primary}</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Global community */}
      <Section tone="night" glow="violet" glowPosition="center">
        <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} sub={t.community.sub} align="center" />
        <div className="relative mx-auto mt-12 aspect-[2/1] max-w-3xl">
          <Image
            src="/static/img/world-map.png"
            alt={t.community.imageAlt}
            fill
            sizes="(min-width:768px) 768px, 100vw"
            className="object-contain opacity-90"
          />
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {t.community.locations.map((loc) => (
            <FeatureCard key={loc.title} title={loc.title} description={loc.body} />
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-2.5">
          <Badge>{locale === 'zh' ? '主流国际课程' : 'Leading international curricula'}</Badge>
          <Badge>{locale === 'zh' ? '全球导师网络' : 'Global mentor network'}</Badge>
          <Badge>SPARK LAB</Badge>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
