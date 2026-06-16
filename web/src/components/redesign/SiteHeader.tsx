'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { externalLinks } from '@/lib/siteLinks';
import { navbar, type NavGroup } from '@/content/navbar';
import type { Locale } from '@/i18n/types';
import { ArrowRight } from './ui';

/**
 * Redesigned site header. Transparent over the hero, solidifies into a
 * paper bar on scroll. Hover dropdowns on desktop, full-screen panel on
 * mobile. Reuses the real navbar content so links stay in sync.
 */
export function SiteHeader({ locale, langHref }: { locale: Locale; langHref?: string }) {
  const t = navbar[locale];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const homeHref = locale === 'zh' ? '/redesign' : '/redesign?lang=en';
  // In the preview, the language toggle stays inside /redesign.
  const langSwitchHref = langHref ?? t.langSwitchHref;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // The bar gets a solid paper background only when scrolled AND the mobile
  // menu is closed. While the menu is open the bar stays transparent so the
  // dark panel reads through it and the white close-X stays legible on top.
  const barSolid = scrolled && !open;
  const onDark = !barSolid; // white text over hero or open menu
  const textBase = onDark ? 'text-white' : 'text-slate-ink';

  const groups: NavGroup[] = [t.studyWithUs, t.partner, t.admissions, t.community];

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        barSolid
          ? 'border-b border-edge bg-paper/85 shadow-soft backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
        {/* Brand */}
        <Link
          href={homeHref}
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/static/img/big_n.png"
            alt="NextGen Scholars"
            width={38}
            height={38}
            className="h-9 w-9 object-contain"
            priority
          />
          <span
            className={`text-[17px] font-bold leading-none tracking-tight transition-colors ${textBase}`}
          >
            NextGen<span className="font-medium opacity-70"> Scholars</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {groups.map((group) => (
            <DesktopNavItem key={group.label} group={group} solid={barSolid} />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={langSwitchHref}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              barSolid
                ? 'border-edge text-slate-ink hover:border-slate-ink'
                : 'border-white/30 text-white hover:border-white/70'
            }`}
          >
            {t.langSwitchLabel}
          </Link>
          <a
            href={externalLinks.classportalLogin}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-ngs-gradient px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(236,28,139,0.6)] transition-transform hover:-translate-y-0.5"
          >
            {t.loginLabel}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={locale === 'zh' ? '菜单' : 'Menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${textBase}`}
        >
          <span
            className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              open ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              open ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>
    </header>

      {/* Mobile panel — rendered as a sibling of <header> (not a child) so its
          fixed positioning is relative to the viewport. A backdrop-filter on
          the header would otherwise make it a containing block and clip this
          to the bar. Sits below the header (z-40) so the white close-X in the
          transparent bar stays on top and tappable. */}
      <div
        className={`fixed inset-0 z-40 origin-top bg-canvas transition-all duration-300 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
          <nav className="flex flex-col divide-y divide-white/10">
            {groups.map((group) => (
              <div key={group.label} className="py-4">
                <Link
                  href={group.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-semibold text-white"
                >
                  {group.label}
                </Link>
                {group.items && (
                  <ul className="mt-3 flex flex-col gap-2.5 pl-1">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="text-[15px] text-white/65 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-3">
            <a
              href={externalLinks.classportalLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ngs-gradient px-5 py-3.5 text-sm font-semibold text-white"
            >
              {t.loginLabel}
              <ArrowRight />
            </a>
            <Link
              href={langSwitchHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-sm font-semibold text-white"
            >
              {t.langSwitchLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function DesktopNavItem({ group, solid }: { group: NavGroup; solid: boolean }) {
  const linkColor = solid
    ? 'text-slate-body hover:text-slate-ink'
    : 'text-white/85 hover:text-white';

  if (!group.items) {
    return (
      <Link
        href={group.href}
        className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${linkColor}`}
      >
        {group.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={group.href}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${linkColor}`}
      >
        {group.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className="opacity-60">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      {/* hover bridge + menu */}
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="min-w-[244px] overflow-hidden rounded-2xl border border-edge bg-white p-2 shadow-lift">
          {group.items.map((item) => (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-body transition-colors hover:bg-paper hover:text-slate-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
