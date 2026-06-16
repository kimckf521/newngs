import Image from 'next/image';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

/**
 * Floating "talk to us" button for the v1 dark site. Gradient pill that
 * links to the WeChat customer-service desk. Fixed bottom-right on every
 * page (rendered by the site shell).
 */
export function ContactFabV1({ locale = 'zh' }: { locale?: Locale }) {
  const label = locale === 'zh' ? '咨询顾问' : 'Talk to us';
  return (
    <a
      href={externalLinks.customerServiceWeChat}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-ngs-gradient py-3 pl-3 pr-5 text-sm font-semibold text-white shadow-[0_12px_40px_-10px_rgba(236,28,139,0.7)] ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-0.5 sm:bottom-8 sm:right-8"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
        <Image
          src="/static/img/media_icons/WeChat.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
