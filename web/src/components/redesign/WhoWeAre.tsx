import Image from 'next/image';
import { founderStory } from '@/content/founder';
import type { Locale } from '@/i18n/types';
import { Container, Display, Eyebrow } from './ui';

const headings = {
  en: {
    eyebrow: 'Who We Are',
    heading: (
      <>
        Built by educators, technologists & <em className="font-display italic">global industry leaders.</em>
      </>
    ),
    team: 'Founding Team',
    role: 'Co-Founder',
  },
  zh: {
    eyebrow: '关于我们',
    heading: (
      <>
        由教育者、科技领袖与<em className="font-display italic">行业专家</em>共同创立。
      </>
    ),
    team: '创始团队',
    role: '联合创始人',
  },
} as const;

export function WhoWeAre({ locale }: { locale: Locale }) {
  const t = founderStory[locale];
  const h = headings[locale];

  return (
    <section id={t.anchorId} className="bg-white">
      <Container className="py-24 lg:py-28">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <Display className="mt-6 text-[2rem] leading-[1.12] sm:text-[2.6rem]">
              {h.heading}
            </Display>
          </div>
          <div className="lg:col-span-7">
            <p className="font-display text-xl leading-relaxed text-slate-ink sm:text-2xl">
              {t.paragraphs[0]}
            </p>
            <div className="mt-6 space-y-5 text-[15.5px] leading-relaxed text-slate-body">
              {t.paragraphs.slice(1).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Founding team */}
        <div className="mt-16 border-t border-edge pt-12">
          <Eyebrow>{h.team}</Eyebrow>
          <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {t.founders.map((f) => (
              <li key={f.name} className="group flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-edge transition duration-300 group-hover:ring-2 group-hover:ring-ngs-violet/50">
                  <Image
                    src={f.img}
                    alt={f.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-ink">{f.name}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-mute">
                  {h.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
