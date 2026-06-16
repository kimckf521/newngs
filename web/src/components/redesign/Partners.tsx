import Image from 'next/image';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowLink, Container, Display, Eyebrow } from './ui';

interface PartnerEntry {
  logo: string;
  name: string;
  kicker: string;
  blurb: string;
  cta: string;
  href: string;
}

const content: Record<Locale, { eyebrow: string; heading: React.ReactNode; partners: PartnerEntry[] }> = {
  en: {
    eyebrow: 'Institutional Partnerships',
    heading: (
      <>
        In partnership with <span className="font-display italic">leading academies</span>
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
        与<span className="font-display italic">顶尖学府</span>携手同行
      </>
    ),
    partners: [
      {
        logo: '/static/img/ycs/ycs_color_logo.png',
        kicker: '珠海 · 国际学校',
        name: '珠海英华国际教育中心',
        blurb:
          '珠海唯一同时开设 A-Level 与 HKDSE 课程的国际学校，获 Edexcel、牛津 AQA、CIE 认证，并由英国大学联合招生委员会 UCAS 授权。',
        cta: '进入英华在线',
        href: siteLinks.zh.yinghuaOnline,
      },
      {
        logo: '/static/img/ibheros/ibheros_logo.png',
        kicker: '墨尔本 · 学术辅导',
        name: 'IB Heros',
        blurb:
          'IB Heros 是面向全球家庭的国际教育辅导机构，以专业、系统、数据驱动的一对一与小班教学，覆盖各大核心国际课程体系。',
        cta: '进入 IB Heros',
        href: siteLinks.zh.ibHeros,
      },
    ],
  },
};

export function Partners({ locale }: { locale: Locale }) {
  const t = content[locale];
  return (
    <section className="bg-white">
      <Container className="py-24 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Display className="mt-6 text-[2rem] leading-tight sm:text-[2.6rem]">{t.heading}</Display>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          {t.partners.map((p) => (
            <article
              key={p.name}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-edge bg-paper p-9 transition-shadow duration-300 hover:shadow-lift"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-ngs-gradient" />
              <div className="flex h-20 items-center">
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={180}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-eyebrow text-slate-mute">
                {p.kicker}
              </p>
              <h3 className="mt-2 font-display text-2xl leading-snug text-slate-ink">{p.name}</h3>
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-body">{p.blurb}</p>
              <div className="mt-7">
                <ArrowLink href={p.href}>{p.cta}</ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
