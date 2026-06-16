import Image from 'next/image';
import Link from 'next/link';
import { footer } from '@/content/footer';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

const copy = {
  en: {
    tagline: 'International education for the next generation.',
    explore: 'Explore',
    offices: 'Offices',
    contact: 'Contact',
  },
  zh: {
    tagline: '为下一代而生的国际教育。',
    explore: '探索',
    offices: '办公地点',
    contact: '联系',
  },
} as const;

const socials = [
  { src: '/static/img/media_icons/WeChat.png', alt: 'WeChat', href: externalLinks.customerServiceWeChat },
  { src: '/static/img/media_icons/RedNote.png', alt: 'RedNote', href: externalLinks.xiaohongshu },
  { src: '/static/img/media_icons/LinkedIn.png', alt: 'LinkedIn', href: externalLinks.linkedin },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = footer[locale];
  const c = copy[locale];

  return (
    <footer className="bg-canvas text-white">
      <div className="mx-auto w-full max-w-page px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/static/img/big_n.png"
                alt="NextGen Scholars"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-[17px] font-bold tracking-tight">
                NextGen<span className="font-medium opacity-70"> Scholars</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{c.tagline}</p>

            <div className="mt-6 space-y-1.5 text-sm">
              <a
                href="mailto:info@nextgenscholars.asia"
                className="block text-white/80 transition-colors hover:text-ngs-cyan"
              >
                info@nextgenscholars.asia
              </a>
              <p className="text-white/60">{t.contact.phone}</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.alt}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.alt}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <Image src={s.src} alt={s.alt} width={20} height={20} className="h-5 w-5 object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-white/50">{c.explore}</h3>
            <ul className="mt-5 space-y-3">
              {t.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-white/50">{c.offices}</h3>
            <ul className="mt-5 space-y-5">
              {t.offices.slice(0, 2).map((o) => (
                <li key={o.title}>
                  <p className="text-sm font-semibold text-white">{o.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{o.address}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 lg:pt-[2.1rem]">
            <ul className="space-y-5">
              {t.offices.slice(2, 4).map((o) => (
                <li key={o.title}>
                  <p className="text-sm font-semibold text-white">{o.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{o.address}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar — copyright, regulatory filings, legal */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 text-xs text-white/45 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/80"
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
            <div className="flex items-center gap-3">
              <Link href={t.privacyHref} className="transition-colors hover:text-white/80">
                {t.privacyLabel}
              </Link>
              <span aria-hidden>·</span>
              <Link href={t.termsHref} className="transition-colors hover:text-white/80">
                {t.termsLabel}
              </Link>
            </div>
            <p>{t.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
