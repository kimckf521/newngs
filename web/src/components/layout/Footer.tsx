import Image from 'next/image';
import Link from 'next/link';
import { footer } from '@/content/footer';
import type { Locale } from '@/i18n/types';

/**
 * Locale-aware footer. Replaces FooterZh + FooterEn.
 */
export function Footer({ locale }: { locale: Locale }) {
  const t = footer[locale];

  return (
    <footer className="footer__bg-dark">
      <div className="footer__grid-cols">
        <ul className="footer__style-1">
          {t.links.map((link) => (
            <li key={link.label} className="footer__style-2">
              <Link href={link.href} className="footer__link-hover">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <p className="footer__style-3">{t.offices[0].title}</p>
          <p className="footer__style-4">{t.offices[0].address}</p>
          <p className="footer__style-3">{t.offices[1].title}</p>
          <p className="connect-to-parents__style-1">{t.offices[1].address}</p>
        </div>
        <div>
          <p className="footer__style-3">{t.offices[2].title}</p>
          <p className="footer__style-4">{t.offices[2].address}</p>
          <p className="footer__style-3">{t.offices[3].title}</p>
          <p className="connect-to-parents__style-1">{t.offices[3].address}</p>
        </div>
        <div className="footer__text-right">
          <p className="footer__style-5">
            {locale === 'zh' ? '电邮：' : ''}
            {t.contact.email}
          </p>
          <p className="footer__style-5">{t.contact.phone}</p>
        </div>
      </div>
      <div className="footer__grid-cols-065f">
        <div className="footer__flex-gap">
          <p className="connect-to-parents__style-1">
            粤ICP备：
            <br />
            2025400078号
          </p>
          <p className="connect-to-parents__style-1">
            增值电信业务许可证：
            <br />
            粤B2-20252299
          </p>
          <p className="connect-to-parents__style-1">
            <Image
              src="/static/img/police.png"
              alt=""
              width={20}
              height={20}
              className="police-logo"
            />
            粤公网安备：
            <br />
            44030002008307号
          </p>
        </div>
        <div className="index__text-center-1307">
          <p className="footer__style-6">{t.copyright}</p>
        </div>
        <div className="footer__text-right">
          <Link href={t.privacyHref} className="footer__style-7">
            {t.privacyLabel}
          </Link>{' '}
          |{' '}
          <Link href={t.termsHref} className="footer__style-7">
            {t.termsLabel}
          </Link>
        </div>
      </div>
    </footer>
  );
}
