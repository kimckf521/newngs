import { externalLinks } from '@/lib/siteLinks';

/** Stripe checkout / WeChat URLs for admissions plans */

export const TRIAL_URL = 'https://buy.stripe.com/3cIbJ10mVaZw03y0Tb6EU0K';
export const EXAM_PREP_URL = 'https://buy.stripe.com/3cI9AT4Db3x48A49pH6EU0Q';

export const PACKAGE_LINKS: Record<string, string> = {
  '10': 'https://buy.stripe.com/7sYcN5c5Dc3A9E831j6EU0L',
  '20': 'https://buy.stripe.com/4gM4gz0mVc3AcQkfO56EU0N',
  '30-sync': 'https://buy.stripe.com/4gM4gz0mVc3AcQkfO56EU0N',
  '30-acc': 'https://buy.stripe.com/fZufZhb1z2t0g2wbxP6EU0O',
  '40': 'https://buy.stripe.com/7sY3cvd9H6Jg4jOgS96EU0P',
};

export const CONSULT_LINKS: Record<string, string> = {
  free: externalLinks.customerServiceWeChat,
  trial: 'https://buy.stripe.com/bJefZh3z75Fc7w0cBT6EU0R',
};

export const COLLEGE_LINKS: Record<string, string> = {
  annual: 'https://example.com/checkout/college-annual',
  '3yr': 'https://example.com/checkout/college-3yr',
  '4yr': 'https://example.com/checkout/college-4yr',
};

export const K12_LINKS: Record<string, string> = {
  '1': 'https://buy.stripe.com/7sI6pH8Pc4U013O3cv',
};
