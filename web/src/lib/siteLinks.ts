/**
 * Centralized URL constants. Mirrors Django urls.py.
 * Every internal href in the app should go through this object so the
 * language switcher and routing stay in sync.
 */

export const siteLinks = {
  en: {
    home: '/index_en',
    privacy: '/privacy_en',
    terms: '/termsofservice_en',
    cclr: '/cclr_programs_en',
    hybrid: '/hybrid_learning_en',
    dualTrack: '/dual_track_learning_en',
    onlineDiploma: '/online_diploma_program_en',
    programs: '/programs_en',
    collegeMentorship: '/college_mentorship_en',
    highschoolMapping: '/highschool_mapping_en',
    faculty: '/faculty_en',
    admissions: '/admissions_en',
    ngsInspires: '/ngs_inspires_en',
    ngsConnects: '/ngs_connects_en',
    inProgress: '/in_progress_en',
    yinghuaOnline: '/yinghua_online_en',
    ibHeros: '/ib_heros_en',
    login: '/login_en',
    register: '/register_en',
    forgotPassword: '/forgot-password_en',
    member: '/member_en',
    oauthCallback: '/auth/callback_en',
  },
  zh: {
    home: '/',
    privacy: '/privacy',
    terms: '/termsofservice',
    cclr: '/cclr_programs',
    hybrid: '/hybrid_learning',
    dualTrack: '/dual_track_learning',
    onlineDiploma: '/online_diploma_program',
    programs: '/programs',
    collegeMentorship: '/college_mentorship',
    highschoolMapping: '/highschool_mapping',
    faculty: '/faculty',
    admissions: '/admissions',
    ngsInspires: '/ngs_inspires',
    ngsConnects: '/ngs_connects',
    inProgress: '/in_progress',
    yinghuaOnline: '/yinghua_online',
    ibHeros: '/ib_heros',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    member: '/member',
    oauthCallback: '/auth/callback',
  },
} as const;

export const externalLinks = {
  customerServiceWeChat: 'https://work.weixin.qq.com/kfid/kfc86f854c023857983',
  xiaohongshu: 'https://xhslink.com/m/FqQfX14laH',
  linkedin: 'https://www.linkedin.com/company/nextgenscholarsasia',
} as const;

export type Locale = 'en' | 'zh';

type LinkKey = keyof typeof siteLinks.en;
const linkKeys = Object.keys(siteLinks.en) as LinkKey[];

/**
 * Map the current pathname to its equivalent page in the other locale.
 * Falls back to that locale's home if there is no 1:1 counterpart.
 * Used by the site-wide language switcher so switching language keeps
 * the visitor on the same page.
 */
export function counterpartPath(pathname: string, toLocale: Locale): string {
  const clean = pathname.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
  const fromLocale: Locale = toLocale === 'en' ? 'zh' : 'en';
  const key = linkKeys.find((k) => {
    const v = siteLinks[fromLocale][k];
    return v === clean || (v === '/' && clean === '/');
  });
  return key ? siteLinks[toLocale][key] : siteLinks[toLocale].home;
}
