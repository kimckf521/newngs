'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import { navbar } from '@/content/navbar';
import type { Locale } from '@/i18n/types';

/**
 * Locale-aware navbar. Replaces NavbarZh + NavbarEn + NavbarBehavior.
 *
 * The mobile menu and scroll-shadow state live in React state instead of
 * being wired up via getElementById and classList.toggle.
 */
export function Navbar({ locale }: { locale: Locale }) {
  const t = navbar[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.classList.toggle('navbar__body-lock', menuOpen);
    return () => document.body.classList.remove('navbar__body-lock');
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`navbar__bg-dark${scrolled ? ' navbar__scrolled' : ''}`}>
      <div className="navwrap navbar__flex">
        <Link href={t.studyWithUs.href} className="logo navbar__style-1">
          <Image
            src="/static/img/logo.png"
            alt="NextGen Scholars"
            width={140}
            height={40}
            className="navbar__style-2"
            priority
          />
        </Link>
        <button
          type="button"
          aria-label={locale === 'zh' ? '打开菜单' : 'Toggle menu'}
          aria-expanded={menuOpen}
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger-active' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`navbar__style-3${menuOpen ? ' navbar__nav-open' : ''}`}>
          <ul className="navbar__flex-gap">
            <NavDropdown group={t.studyWithUs} onLinkClick={closeMenu} />
            <NavDropdown group={t.partner} onLinkClick={closeMenu} />
            <li>
              <Link
                href={t.admissions.href}
                className="navbar__style-4"
                onClick={closeMenu}
              >
                {t.admissions.label}
              </Link>
            </li>
            <NavDropdown group={t.community} onLinkClick={closeMenu} />
            <li className="navbar__mobile-only">
              <Link href={siteLinks[locale].login} className="navbar__style-4" onClick={closeMenu}>
                {t.loginLabel}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="navbar__flex-gap-4ce3">
          <Link href={t.langSwitchHref} className="navbar__lang-btn">
            {t.langSwitchLabel}
          </Link>
          <Link href={siteLinks[locale].login} className="navbar__login-btn">
            {t.loginLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavDropdown({
  group,
  onLinkClick,
}: {
  group: import('@/content/navbar').NavGroup;
  onLinkClick: () => void;
}) {
  return (
    <li className="navbar__dropdown">
      <Link href={group.href} className="navbar__style-4" onClick={onLinkClick}>
        {group.label} ▾
      </Link>
      {group.items && (
        <ul className="navbar__dropdown-menu">
          {group.items.map((item) => (
            <li key={item.href + item.label}>
              <Link href={item.href} onClick={onLinkClick}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
