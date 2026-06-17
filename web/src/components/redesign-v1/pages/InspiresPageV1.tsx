import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GradientText,
  CTASection,
  IconChat,
  IconCap,
  IconSpark,
  IconUsers,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /ngs_inspires — NextGen Inspires. Faithful port of the legacy
 * IntroInspires / Inspires / GlobalIndustryLeaders / GlobalUniversities /
 * SparkLab / GlobalCommunity / Subscribe content, re-expressed in the
 * bold dark v1 design.
 * ------------------------------------------------------------------ */

type Pillar = { icon: React.ReactNode; title: string; description: string };
type Feature = { eyebrow: string; title: React.ReactNode; lead: string; body: string; img: string; alt: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; subscribe: string; talk: string };
  intro: { eyebrow: string; title: React.ReactNode; lead: string; body: string };
  pillarsHeading: { eyebrow: string; title: React.ReactNode; sub: string };
  pillars: Pillar[];
  leaders: Feature;
  universities: Feature;
  spark: Feature;
  community: { eyebrow: string; title: React.ReactNode; lead: string; locations: string[] };
  cta: { eyebrow: string; title: React.ReactNode; sub: string; subscribe: string; talk: string };
}> = {
  en: {
    hero: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          Join the NGS <GradientText>global learning</GradientText> community
        </>
      ),
      lead:
        'NextGen Inspires is an exclusive subscription service for NGS partner schools, connecting students and educators to global opportunities — industry leaders, renowned universities, SPARK LAB and a thriving alumni network.',
      subscribe: 'Subscribe now',
      talk: 'Talk to our team',
    },
    intro: {
      eyebrow: 'The global community',
      title: (
        <>
          Unmatched <GradientText>resources, mentorship</GradientText> and inspiration
        </>
      ),
      lead:
        'NextGen Inspires is an exclusive subscription service designed for NGS partner schools, connecting students and educators to global opportunities.',
      body:
        'Through partnerships with global industry leaders and renowned universities, combined with the innovative SPARK LAB and a thriving alumni network, NextGen Inspires provides unmatched resources, mentorship, and inspiration to help the next generation thrive.',
    },
    pillarsHeading: {
      eyebrow: 'Four pillars',
      title: (
        <>
          One community, <GradientText>four ways to grow</GradientText>
        </>
      ),
      sub: 'Every NextGen Inspires subscription opens four connected domains, each designed to expand what students can see, learn and become.',
    },
    pillars: [
      {
        icon: <IconChat />,
        title: 'Global Industry Leaders',
        description:
          'Connect with leaders at the forefront of innovation across diverse industries. Through expert-led webinars, mentorship programs, and career-focused workshops, students gain first-hand insights into emerging trends, career pathways, and the real-world skills required to succeed in a competitive global market.',
      },
      {
        icon: <IconCap />,
        title: 'Global Universities',
        description:
          'Explore partnerships with renowned universities worldwide, offering students exclusive access to admissions guidance, campus tours, and networking opportunities.',
      },
      {
        icon: <IconSpark />,
        title: 'SPARK LAB',
        description:
          'An interactive platform connecting Global K-12 students to collaborate, innovate, and create. By fostering a global network of young minds, SPARK LAB inspires students to think boldly, develop a global perspective, and take the lead in shaping the future.',
      },
      {
        icon: <IconUsers />,
        title: 'Global Alumni',
        description:
          'Leverage a thriving network of international alumni who have successfully pursued their academic and professional goals — offering students the chance to learn from those who have walked similar paths, with mentorship, guidance, and inspiration.',
      },
    ],
    leaders: {
      eyebrow: 'Global Industry Leaders',
      title: (
        <>
          Learn from leaders at the <GradientText>forefront</GradientText>
        </>
      ),
      lead: 'NGS connects deeply with pioneering leaders of innovation and excellence across diverse industries.',
      body:
        'Through expert-led webinars, mentorship programs, and career-focused workshops, students gain first-hand insights into emerging trends, career pathways, and the real-world skills required to succeed in a competitive global market.',
      img: '/static/img/globalindustry.jpg',
      alt: 'NGS global industry leaders',
    },
    universities: {
      eyebrow: 'Global Universities',
      title: (
        <>
          A <GradientText>direct line</GradientText> to the world&rsquo;s universities
        </>
      ),
      lead: 'NGS builds long-term partnerships with renowned universities worldwide.',
      body:
        'Students gain exclusive access to admissions guidance, programme and major introductions, campus tours, and a wealth of networking and exchange opportunities — helping them step into a wider future.',
      img: '/static/img/globaluniversities.png',
      alt: 'NGS global university connections',
    },
    spark: {
      eyebrow: 'SPARK LAB',
      title: (
        <>
          The NGS <GradientText>global youth</GradientText> network
        </>
      ),
      lead: 'SPARK LAB is an interactive platform connecting Global K-12 students to collaborate, innovate, and create.',
      body:
        'By fostering a global network of young minds, SPARK LAB inspires students to think boldly, develop a global perspective, and take the lead in shaping the future.',
      img: '/static/img/sparklab.jpg',
      alt: 'NGS SPARK LAB',
    },
    community: {
      eyebrow: 'Global community',
      title: (
        <>
          One <GradientText>worldwide</GradientText> network
        </>
      ),
      lead: 'NextGen Scholars connects students, educators and alumni across continents.',
      locations: ['San Francisco', 'Melbourne', 'Hong Kong', 'Taiwan', 'Greater Bay Area China'],
    },
    cta: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          Subscribe today and <GradientText>join the community</GradientText>
        </>
      ),
      sub: 'Open the doors to global industry leaders, world universities, SPARK LAB and a thriving alumni network.',
      subscribe: 'Subscribe now',
      talk: 'Talk to our team',
    },
  },
  zh: {
    hero: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          加入 NGS <GradientText>全球学习</GradientText>社区
        </>
      ),
      lead:
        'NextGen Inspires 是专为 NGS 合作学校打造的独家订阅服务，为学生与教育者连接全球无限机遇 —— 全球行业领袖、世界知名大学、SPARK LAB 以及蓬勃发展的全球校友网络。',
      subscribe: '立即订阅',
      talk: '咨询团队',
    },
    intro: {
      eyebrow: '全球社区',
      title: (
        <>
          无与伦比的<GradientText>资源、导师指导</GradientText>与灵感激发
        </>
      ),
      lead:
        'NextGen Inspires 是专为 NGS 合作学校打造的独家订阅服务，旨在为学生和教育者连接全球无限机遇。',
      body:
        '通过与全球行业领袖、世界知名大学的合作，结合创新的 SPARK LAB 以及蓬勃发展的全球校友网络，NextGen Inspires 为您提供无与伦比的资源、导师指导和灵感激发，助力下一代成就卓越。',
    },
    pillarsHeading: {
      eyebrow: '四大支柱',
      title: (
        <>
          一个社区，<GradientText>四种成长方式</GradientText>
        </>
      ),
      sub: '每一份 NextGen Inspires 订阅都开启四个彼此连接的领域，拓展学生的视野、所学与未来可能。',
    },
    pillars: [
      {
        icon: <IconChat />,
        title: '全球行业领袖',
        description:
          'NGS 与各行业创新与卓越的前沿领袖深度链接。通过邀请行业专家领袖作为线上研讨会主讲嘉宾、导师计划和职业发展工作坊，学生可以深入了解新兴趋势、职业发展路径，以及在竞争激烈的全球市场中取得成功所需的实际知识技能。',
      },
      {
        icon: <IconCap />,
        title: '全球高校直连',
        description:
          'NGS 与世界知名大学建立长期合作联系，为学生提供独家升学指导、学校专业介绍、校园参观以及众多交流拓展机会，助力他们迈向更广阔的未来。',
      },
      {
        icon: <IconSpark />,
        title: 'SPARK LAB',
        description:
          'SPARK LAB 是一个全球同龄学子的互动平台，连接世界各地的中学生，鼓励他们协作、创新与创作。通过构建一个全球青少年思想交流的网络，SPARK LAB 激发学生大胆思考，培养全球视野，并引导他们在塑造未来中发挥领导作用。',
      },
      {
        icon: <IconUsers />,
        title: '全球校友',
        description:
          '一个充满活力的跨国校友网络，这些校友已成功实现他们的学术和职业目标。该平台为学生提供向曾走过类似道路的校友学习的机会，提供导师支持、指导建议和灵感启发。',
      },
    ],
    leaders: {
      eyebrow: '全球行业领袖',
      title: (
        <>
          向<GradientText>前沿领袖</GradientText>学习
        </>
      ),
      lead: 'NGS 与各行业创新与卓越的前沿领袖深度链接。',
      body:
        '通过邀请行业专家领袖作为线上研讨会主讲嘉宾、导师计划和职业发展工作坊，学生可以深入了解新兴趋势、职业发展路径，以及在竞争激烈的全球市场中取得成功所需的实际知识技能。',
      img: '/static/img/globalindustry.jpg',
      alt: 'NGS 全球行业领袖',
    },
    universities: {
      eyebrow: '全球高校直连',
      title: (
        <>
          直连<GradientText>世界名校</GradientText>
        </>
      ),
      lead: 'NGS 与世界知名大学建立长期合作联系。',
      body:
        '为学生提供独家升学指导、学校专业介绍、校园参观以及众多交流拓展机会，助力他们迈向更广阔的未来。',
      img: '/static/img/globaluniversities.png',
      alt: 'NGS 全球高校直连',
    },
    spark: {
      eyebrow: 'SPARK LAB',
      title: (
        <>
          NGS <GradientText>全球青年</GradientText>网络
        </>
      ),
      lead: 'SPARK LAB 是 NGS 全球同龄学子的互动平台，连接世界各地的中学生，鼓励他们协作、创新与创作。',
      body:
        '通过构建一个全球青少年思想交流的网络，SPARK LAB 激发学生大胆思考，培养全球视野，并引导他们在塑造未来中发挥领导作用。',
      img: '/static/img/sparklab.jpg',
      alt: 'NGS SPARK LAB',
    },
    community: {
      eyebrow: '全球社区',
      title: (
        <>
          一个<GradientText>遍布全球</GradientText>的网络
        </>
      ),
      lead: '未来学者连接横跨各大洲的学生、教育者与校友。',
      locations: ['美国三藩市', '澳大利亚墨尔本', '中国香港', '中国台湾', '中国大湾区'],
    },
    cta: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          今天立刻订阅，<GradientText>加入全球社区</GradientText>
        </>
      ),
      sub: '开启通往全球行业领袖、世界名校、SPARK LAB 以及蓬勃校友网络的大门。',
      subscribe: '立即订阅',
      talk: '咨询团队',
    },
  },
};

function FeatureSplit({
  feature,
  reverse = false,
}: {
  feature: Feature;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 ${reverse ? 'lg:order-2' : ''}`}>
        <Image src={feature.img} alt={feature.alt} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <SectionHeading eyebrow={feature.eyebrow} title={feature.title} />
        <p className="mt-6 text-lg leading-relaxed text-white/75">{feature.lead}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-white/60">{feature.body}</p>
      </div>
    </div>
  );
}

export function InspiresPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.subscribe, href: links.inProgress }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* Intro + four pillars */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} sub={t.intro.lead} />
        <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-white/60">{t.intro.body}</p>

        <div className="mt-16">
          <SectionHeading eyebrow={t.pillarsHeading.eyebrow} title={t.pillarsHeading.title} sub={t.pillarsHeading.sub} />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.pillars.map((p) => (
              <FeatureCard key={p.title} icon={p.icon} title={p.title} description={p.description} />
            ))}
          </div>
        </div>
      </Section>

      {/* Global Industry Leaders */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <FeatureSplit feature={t.leaders} />
      </Section>

      {/* Global Universities */}
      <Section tone="night-800" glow="magenta" glowPosition="right">
        <FeatureSplit feature={t.universities} reverse />
      </Section>

      {/* SPARK LAB */}
      <Section tone="night" glow="violet" glowPosition="left">
        <FeatureSplit feature={t.spark} />
      </Section>

      {/* Global community */}
      <Section tone="night-800" glow="cyan" glowPosition="center">
        <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} sub={t.community.lead} align="center" />
        <div className="relative mx-auto mt-12 aspect-[2/1] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10">
          <Image src="/static/img/world-map.png" alt={locale === 'en' ? 'Map of the NextGen Scholars global community marking San Francisco, Melbourne, Hong Kong, Taiwan and the Greater Bay Area' : 'NextGen Scholars 全球社区地图，标注三藩市、墨尔本、香港、台湾与大湾区'} fill sizes="(min-width:1024px) 56rem, 100vw" className="object-contain p-6 opacity-90" />
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {t.community.locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-white/85 backdrop-blur"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ngs-gradient" />
              {loc}
            </span>
          ))}
        </div>
      </Section>

      <ContactV1 locale={locale} />

      <CTASection
        eyebrow={t.cta.eyebrow}
        title={t.cta.title}
        sub={t.cta.sub}
        primary={{ label: t.cta.subscribe, href: links.inProgress }}
        secondary={{ label: t.cta.talk, href: '#contact' }}
      />
    </>
  );
}
