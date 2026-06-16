import type { Localized } from '@/i18n/types';
import { siteLinks } from '@/lib/siteLinks';

export interface FooterStrings {
  links: { label: string; href: string }[];
  offices: {
    title: string;
    address: string;
  }[];
  contact: { email: string; phone: string };
  privacyLabel: string;
  termsLabel: string;
  privacyHref: string;
  termsHref: string;
  copyright: string;
}

const sharedOffices = (locale: 'zh' | 'en') => {
  const sf = locale === 'zh' ? '美国三藩市' : 'San Francisco';
  const mel = locale === 'zh' ? '澳大利亚墨尔本' : 'Melbourne';
  const hk = locale === 'zh' ? '中国香港' : 'Hong Kong';
  const sz = locale === 'zh' ? '中国深圳办公地址' : '深圳办公地址';
  return [
    { title: sf, address: '600 California St 11th floor, San Francisco, CA 94108' },
    { title: mel, address: '262 Queen St, Melbourne VIC 3000' },
    { title: hk, address: '27/F China Resources Bldg 26, Harbour RD Wanchai' },
    { title: sz, address: '深圳市南山区望海路南海玫瑰花园二期4栋4C' },
  ];
};

export const footer: Localized<FooterStrings> = {
  zh: {
    links: [
      { label: '成为NGS伙伴', href: siteLinks.zh.cclr },
      { label: '成为NGS学生', href: siteLinks.zh.programs },
      { label: '课程与招生', href: siteLinks.zh.admissions },
      { label: '加入NGS全球社区', href: siteLinks.zh.ngsInspires },
    ],
    offices: sharedOffices('zh'),
    contact: { email: 'info@nextgenscholars.asia', phone: '电话：400-806-1815' },
    privacyLabel: '隐私政策',
    termsLabel: '服务协议',
    privacyHref: siteLinks.zh.privacy,
    termsHref: siteLinks.zh.terms,
    copyright: '深圳市千瞳空间文化艺术有限公司版权所有 © 2025',
  },
  en: {
    links: [
      { label: 'Partner with NGS', href: siteLinks.en.cclr },
      { label: 'Study with US', href: siteLinks.en.programs },
      { label: 'Admissions', href: siteLinks.en.admissions },
      { label: 'Join NGS Community', href: siteLinks.en.ngsInspires },
    ],
    offices: sharedOffices('en'),
    contact: { email: 'info@nextgenscholars.asia', phone: 'T: 400-806-1815' },
    privacyLabel: 'Privacy Policy',
    termsLabel: 'Terms of Service',
    privacyHref: siteLinks.en.privacy,
    termsHref: siteLinks.en.terms,
    copyright: '深圳市千瞳空间文化艺术有限公司版权所有 © 2025',
  },
};
