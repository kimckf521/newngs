import Image from 'next/image';
import Link from 'next/link';
import { footer } from '@/content/footer';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { Container } from './ui';

/* ------------------------------------------------------------------ *
 * Footer for the BOLD "v1" homepage. Dark base with a top border,
 * brand + tagline, an Explore link column, two office columns, and a
 * bottom bar with the ICP / 公安备案 records.
 * ------------------------------------------------------------------ */

const content = {
  en: {
    tagline: 'International education for the next generation.',
    exploreLabel: 'Explore',
    officesLabel: 'Offices',
  },
  zh: {
    tagline: '为下一代而生的国际教育。',
    exploreLabel: '探索',
    officesLabel: '办公地点',
  },
} as const;

const socials = [
  { href: externalLinks.customerServiceWeChat, src: '/static/img/media_icons/WeChat.png', alt: 'WeChat' },
  { href: externalLinks.xiaohongshu, src: '/static/img/media_icons/RedNote.png', alt: 'RedNote' },
  { href: externalLinks.linkedin, src: '/static/img/media_icons/LinkedIn.png', alt: 'LinkedIn' },
];

export function FooterV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const f = footer[locale];
  const firstOffices = f.offices.slice(0, 2);
  const lastOffices = f.offices.slice(2, 4);

  return (
    <footer className="bg-night border-t border-white/10">
      <Container className="py-16">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={36} height={36} className="h-9 w-9" />
              <span className="font-grotesk text-[17px] font-bold text-white">
                NextGen<span className="font-normal text-white/65"> Scholars</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm text-white/55">{t.tagline}</p>

            <div className="mt-6 space-y-1">
              <a href="mailto:info@nextgenscholars.asia" className="block text-sm text-white/80 transition hover:text-white">
                info@nextgenscholars.asia
              </a>
              <p className="text-sm text-white/55">{f.contact.phone}</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.alt}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.alt}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-white/30 hover:bg-white/10"
                >
                  <Image src={s.src} alt={s.alt} width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.18em] text-white/45">{t.exploreLabel}</h3>
            <ul className="mt-5 space-y-3">
              {f.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices (first two) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs uppercase tracking-[0.18em] text-white/45">{t.officesLabel}</h3>
            <div className="mt-5 space-y-6">
              {firstOffices.map((office) => (
                <div key={office.title}>
                  <p className="text-sm font-semibold text-white">{office.title}</p>
                  <p className="mt-1 text-sm text-white/50">{office.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offices (last two) */}
          <div className="lg:col-span-3 lg:pt-[1.85rem]">
            <div className="space-y-6">
              {lastOffices.map((office) => (
                <div key={office.title}>
                  <p className="text-sm font-semibold text-white">{office.title}</p>
                  <p className="mt-1 text-sm text-white/50">{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 text-xs text-white/45 lg:flex-row lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white/80"
            >
              粤ICP备2025400078号-2
            </a>
            <span>增值电信业务许可证：粤B2-20252299</span>
            <span className="inline-flex items-center gap-1.5">
              <Image src="/static/img/police.png" alt="" width={14} height={14} className="h-3.5 w-3.5" />
              粤公网安备 44030002008307号
            </span>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex items-center gap-2">
              <Link href={f.privacyHref} className="transition hover:text-white/80">
                {f.privacyLabel}
              </Link>
              <span aria-hidden>·</span>
              <Link href={f.termsHref} className="transition hover:text-white/80">
                {f.termsLabel}
              </Link>
            </div>
            <p>{f.copyright}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
