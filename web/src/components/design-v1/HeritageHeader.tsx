'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import { navbar, type NavGroup } from '@/content/navbar';
import type { Locale } from '@/i18n/types';

/* Heritage Prestige header — ivory, letter-spaced nav, gold hairlines, a
 * typographic serif wordmark (no logo image). Condenses on scroll. The
 * mobile panel is a sibling of <header> so its fixed positioning is the
 * viewport, not a backdrop-filtered bar. */

export function HeritageHeader({ locale, langHref }: { locale: Locale; langHref: string }) {
  const t = navbar[locale];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const homeHref = locale === 'zh' ? '/design-v1' : '/design-v1?lang=en';
  const groups: NavGroup[] = [t.studyWithUs, t.partner, t.admissions, t.community];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? 'border-b border-[#14253f]/10 bg-[#f7f4ec]/95 backdrop-blur-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[78px] max-w-[1180px] items-center justify-between px-6 sm:px-8 lg:px-12">
          <Wordmark href={homeHref} onClick={() => setOpen(false)} />

          <nav className="hidden items-center gap-8 lg:flex">
            {groups.map((group) => (
              <NavItem key={group.label} group={group} />
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href={langHref}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14253f]/70 transition-colors hover:text-[#a8843a]"
            >
              {t.langSwitchLabel}
            </Link>
            <span aria-hidden className="h-4 w-px bg-[#14253f]/15" />
            <Link
              href={siteLinks[locale].login}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14253f] transition-colors hover:text-[#a8843a]"
            >
              {t.loginLabel}
            </Link>
          </div>

          <button
            type="button"
            aria-label={locale === 'zh' ? '菜单' : 'Menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] text-[#14253f] lg:hidden"
          >
            <span className={`block h-px w-6 bg-current transition-all duration-300 ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-current transition-all duration-300 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile panel */}
      <div className={`fixed inset-0 z-40 bg-[#f7f4ec] transition-all duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-28">
          <nav className="flex flex-col divide-y divide-[#14253f]/10">
            {groups.map((group) => (
              <div key={group.label} className="py-5">
                <Link href={group.href} onClick={() => setOpen(false)} className="font-display-serif text-2xl text-[#14253f]">
                  {group.label}
                </Link>
                {group.items && (
                  <ul className="mt-3 flex flex-col gap-2 pl-1">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} onClick={() => setOpen(false)} className="text-[14px] text-[#6f6a60] hover:text-[#a8843a]">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href={siteLinks[locale].login}
              onClick={() => setOpen(false)}
              className="flex-1 bg-[#14253f] px-5 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f7f4ec]"
            >
              {t.loginLabel}
            </Link>
            <Link href={langHref} onClick={() => setOpen(false)} className="border border-[#14253f]/25 px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#14253f]">
              {t.langSwitchLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Wordmark({ href, onClick }: { href: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="group flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center border border-[#a8843a]/60 bg-[#14253f]">
        <span className="font-display-serif text-lg italic leading-none text-[#f7f4ec]">N</span>
      </span>
      <span className="leading-none">
        <span className="block font-display-serif text-[19px] font-semibold tracking-tight text-[#14253f]">
          NextGen Scholars
        </span>
        <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#a8843a]">
          International Education
        </span>
      </span>
    </Link>
  );
}

function NavItem({ group }: { group: NavGroup }) {
  const base = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14253f]/75 transition-colors hover:text-[#a8843a]';
  if (!group.items) {
    return <Link href={group.href} className={base}>{group.label}</Link>;
  }
  return (
    <div className="group relative">
      <Link href={group.href} className={`inline-flex items-center gap-1.5 ${base}`}>{group.label}</Link>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="min-w-[252px] border border-[#14253f]/10 bg-[#fffdf9] p-2 shadow-[0_24px_60px_-20px_rgba(20,37,63,0.25)]">
          {group.items.map((item) => (
            <li key={item.href + item.label}>
              <Link href={item.href} className="block px-4 py-2.5 text-[13px] text-[#3c4250] transition-colors hover:bg-[#14253f]/[0.04] hover:text-[#a8843a]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
