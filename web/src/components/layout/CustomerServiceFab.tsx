import Image from 'next/image';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

/**
 * Floating "contact us" button that links to WeChat. Lives at the bottom-
 * right of every page.
 */
export function CustomerServiceFab({ locale = 'zh' }: { locale?: Locale }) {
  const ariaLabel = locale === 'zh' ? '联系客服' : 'Contact Us';
  return (
    <a
      href={externalLinks.customerServiceWeChat}
      className="customer-service__circular-btn"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      <Image
        src="/static/img/customer_service.png"
        alt=""
        width={40}
        height={40}
        className="customer-service__circular-icon"
      />
    </a>
  );
}
