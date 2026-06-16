import Image from 'next/image';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';

const mediaStrings = {
  zh: {
    heading: '联系NGS',
    handles: {
      wechat: '@NextGenScholars',
      weclass: '@视频号',
      rednote: '@小红书',
      linkedin: '@LinkedIn',
    },
  },
  en: {
    heading: ['GET IN', 'TOUCH', 'WITH US'],
    handles: {
      wechat: '@NextGenScholars',
      weclass: '@WeClass',
      rednote: '@RedNote',
      linkedin: '@LinkedIn',
    },
  },
} as const;

const mediaLinks = [
  { key: 'wechat', src: '/static/img/media_icons/WeChat.png', alt: 'WeChat', href: externalLinks.customerServiceWeChat },
  { key: 'weclass', src: '/static/img/media_icons/WeClass.png', alt: 'WeClass', href: externalLinks.customerServiceWeChat },
  { key: 'rednote', src: '/static/img/media_icons/RedNote.png', alt: 'RedNote', href: externalLinks.xiaohongshu },
  { key: 'linkedin', src: '/static/img/media_icons/LinkedIn.png', alt: 'LinkedIn', href: externalLinks.linkedin },
] as const;

const handleClassByIndex = ['media__style-3', 'media__style-4', 'media__style-5', 'media__style-6'];

/**
 * "Get in touch with us" / "联系NGS" section. Replaces MediaZh + MediaEn.
 */
export function Media({ locale }: { locale: Locale }) {
  const t = mediaStrings[locale];
  return (
    <section className="media__section">
      <div className="media__grid-cols">
        <div className="media__flex-col">
          <Image
            src="/static/img/big_n.png"
            alt="NextGen Scholars"
            width={140}
            height={140}
            className="media__style-1"
          />
          <h2 className="media__text-center">
            {Array.isArray(t.heading)
              ? t.heading.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < t.heading.length - 1 && <br />}
                  </span>
                ))
              : t.heading}
          </h2>
          <p className="media__text-center-93a7">info@nextgenscholars.asia</p>
          <div className="media__style-2"></div>
          <div className="media__flex-gap">
            {mediaLinks.map((link, i) => (
              <div key={link.key} className="media__text-center-e79f">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={link.src}
                    alt={link.alt}
                    width={64}
                    height={64}
                    className="media__rounded"
                  />
                </a>
                <small className={handleClassByIndex[i]}>{t.handles[link.key]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="media__flex-center">
          <div className="media__relative">
            <div className="media__radial-bg"></div>
            <div className="media__radial-bg-aff0"></div>
            <div className="media__radial-bg-b331"></div>
            <div className="media__radial-bg-b67e"></div>
            <div className="media__bg-white">
              NextGen
              <br />
              Scholars
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
