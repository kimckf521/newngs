'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { externalLinks, siteLinks, counterpartPath } from '@/lib/siteLinks';
import { navbar, type NavGroup } from '@/content/navbar';
import type { Locale } from '@/i18n/types';
import { ArrowRight } from './ui';

/**
 * v1 header — dark + glassy. Transparent over the hero, condenses into a
 * frosted night bar on scroll. White text throughout (the whole design is
 * dark). Mobile panel is a sibling of <header> so its fixed positioning is
 * relative to the viewport, not the backdrop-filtered bar.
 */
export function SiteHeaderV1({ locale, langHref }: { locale: Locale; langHref?: string }) {
  const t = navbar[locale];
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const homeHref = siteLinks[locale].home;
  const langSwitchHref = langHref ?? counterpartPath(pathname ?? siteLinks[locale].home, locale === 'zh' ? 'en' : 'zh');
  const groups: NavGroup[] = [t.studyWithUs, t.partner, t.admissions, t.community];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Light/dark theme. The choice is a `.v1-light` class on <html> (a pre-paint
  // script in the root layout applies the saved value before hydration). We
  // sync the button's icon from the DOM on mount, then toggle directly.
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('v1-light') ? 'light' : 'dark');
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('ngs-theme', next); } catch {}
    document.documentElement.classList.toggle('v1-light', next === 'light');
  };
  const themeLabel =
    locale === 'zh'
      ? theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const solid = scrolled || open;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? 'border-b border-white/10 bg-night/70 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}>
        <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
          <Link href={homeHref} className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <span className="font-grotesk text-[17px] font-bold tracking-tight text-white">
              NextGen<span className="font-normal text-white/65"> Scholars</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {groups.map((group) => (
              <NavItem key={group.label} group={group} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:text-white"
            >
              <ThemeIcon theme={theme} />
            </button>
            <Link href={langSwitchHref} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {t.langSwitchLabel}
            </Link>
            <a href={externalLinks.classportalLogin} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ngs-gradient px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_28px_-8px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">
              {t.loginLabel}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>

          <button type="button" aria-label={locale === 'zh' ? '菜单' : 'Menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] text-white lg:hidden">
            <span className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile panel (sibling of header) */}
      <div className={`fixed inset-0 z-40 bg-night transition-all duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
          <nav className="flex flex-col divide-y divide-white/10">
            {groups.map((group) => (
              <div key={group.label} className="py-4">
                <Link href={group.href} onClick={() => setOpen(false)} className="font-grotesk text-lg font-semibold text-white">{group.label}</Link>
                {group.items && (
                  <ul className="mt-3 flex flex-col gap-2.5 pl-1">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} onClick={() => setOpen(false)} className="text-[15px] text-white/60 hover:text-white">{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-3">
            <a href={externalLinks.classportalLogin} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ngs-gradient px-5 py-3.5 text-sm font-semibold text-white">
              {t.loginLabel}
              <ArrowRight />
            </a>
            <Link href={langSwitchHref} onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3.5 text-sm font-semibold text-white">{t.langSwitchLabel}</Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/25 text-white"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ThemeIcon({ theme }: { theme: 'dark' | 'light' }) {
  // Show a sun while dark (tap to brighten) and a moon while light.
  return theme === 'dark' ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 7.3 7.3 0 1 0 20.5 14.8z" />
    </svg>
  );
}

function NavItem({ group }: { group: NavGroup }) {
  if (!group.items) {
    return (
      <Link href={group.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
        {group.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <Link href={group.href} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
        {group.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className="opacity-60">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="min-w-[244px] overflow-hidden rounded-2xl border border-white/10 bg-night-700 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {group.items.map((item) => (
            <li key={item.href + item.label}>
              <Link href={item.href} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white">{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
