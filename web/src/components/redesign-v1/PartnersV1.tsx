import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowLink, Container, GlassCard, GradientText, Kicker } from './ui';

type Partner = {
  logo: string;
  kicker: string;
  name: string;
  blurb: string;
  cta: string;
  href: string;
};

type PartnersContent = {
  eyebrow: string;
  heading: React.ReactNode;
  partners: Partner[];
};

const content: Record<Locale, PartnersContent> = {
  en: {
    eyebrow: 'Institutional Partnerships',
    heading: (
      <>
        In partnership with <GradientText>leading academies</GradientText>
      </>
    ),
    partners: [
      {
        logo: '/static/img/ycs/ycs_color_logo.png',
        kicker: 'Zhuhai · International Academy',
        name: 'Oriental Yinghua International Academy',
        blurb:
          'The only international school in Zhuhai offering both A-Level and HKDSE tracks — accredited by Edexcel, Oxford AQA and Cambridge (CIE), and authorised by UCAS.',
        cta: 'Yinghua Online',
        href: siteLinks.en.yinghuaOnline,
      },
      {
        logo: '/static/img/ibheros/ibheros_logo.png',
        kicker: 'Melbourne · Tutoring',
        name: 'IB Heros',
        blurb:
          'A global tutoring institution delivering rigorous, data-driven one-to-one and small-group support across every major international curriculum.',
        cta: 'IB Heros Tutoring',
        href: siteLinks.en.ibHeros,
      },
    ],
  },
  zh: {
    eyebrow: '全球合作',
    heading: (
      <>
        与<GradientText>顶尖学府</GradientText>携手同行
      </>
    ),
    partners: [
      {
        logo: '/static/img/ycs/ycs_color_logo.png',
        kicker: '珠海 · 国际学校',
        name: '珠海英华国际教育中心',
        blurb:
          '珠海唯一同时开设 A-Level 与 HKDSE 课程的国际学校，获 Edexcel、牛津 AQA、CIE 认证，并由 UCAS 授权。',
        cta: '进入英华在线',
        href: siteLinks.zh.yinghuaOnline,
      },
      {
        logo: '/static/img/ibheros/ibheros_logo.png',
        kicker: '墨尔本 · 学术辅导',
        name: 'IB Heros',
        blurb:
          '面向全球家庭的国际教育辅导机构，以专业、系统、数据驱动的一对一与小班教学，覆盖各大核心国际课程体系。',
        cta: '进入 IB Heros',
        href: siteLinks.zh.ibHeros,
      },
    ],
  },
};

export function PartnersV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section className="relative overflow-hidden bg-night">
      <Container className="relative py-24 lg:py-28">
        <Kicker>{t.eyebrow}</Kicker>
        <h2 className="mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.heading}
        </h2>

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-2">
          {t.partners.map((partner) => (
            <GlassCard key={partner.name} className="relative overflow-hidden p-9">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ngs-gradient" />

              <div className="inline-flex rounded-2xl bg-white/5 p-4">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={56}
                  className="h-14 w-auto object-contain"
                />
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-white/45">{partner.kicker}</p>
              <h3 className="mt-2 font-grotesk text-2xl font-bold tracking-tight text-white">{partner.name}</h3>
              <p className="mt-4 leading-relaxed text-white/60">{partner.blurb}</p>

              <div className="mt-7">
                <ArrowLink href={partner.href}>{partner.cta}</ArrowLink>
              </div>
            </GlassCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
