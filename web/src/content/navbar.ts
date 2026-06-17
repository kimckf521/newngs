import type { Localized } from '@/i18n/types';
import { siteLinks } from '@/lib/siteLinks';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string;
  items?: NavLink[];
}

export interface NavbarStrings {
  studyWithUs: NavGroup;
  partner: NavGroup;
  admissions: NavGroup;
  community: NavGroup;
  loginLabel: string;
  langSwitchLabel: string;
  langSwitchHref: string;
}

export const navbar: Localized<NavbarStrings> = {
  zh: {
    studyWithUs: {
      label: '成为NGS学生',
      href: siteLinks.zh.home,
      items: [
        { label: '国际课程', href: siteLinks.zh.programs },
        { label: '升学辅导课程', href: siteLinks.zh.collegeMentorship },
        { label: 'K12国际高中规划', href: siteLinks.zh.highschoolMapping },
        { label: '教学团队', href: siteLinks.zh.faculty },
      ],
    },
    partner: {
      label: '成为NGS伙伴',
      href: siteLinks.zh.home,
      items: [
        { label: '创始人故事', href: `${siteLinks.zh.home}#founder_zh` },
        { label: '升学探索课程', href: siteLinks.zh.cclr },
        { label: 'NGS 未来全域学习计划', href: siteLinks.zh.hybrid },
        { label: 'NGS 未来教育双轨计划', href: siteLinks.zh.dualTrack },
        { label: 'NGS 未来无界文凭课程', href: siteLinks.zh.onlineDiploma },
      ],
    },
    admissions: { label: '课程与招生', href: siteLinks.zh.admissions },
    community: {
      label: '加入NGS全球社区',
      href: siteLinks.zh.home,
      items: [
        { label: 'NGS Inspires', href: siteLinks.zh.ngsInspires },
        { label: 'NGS Connects', href: siteLinks.zh.ngsConnects },
        { label: '会员登录', href: siteLinks.zh.login },
      ],
    },
    loginLabel: '登陆',
    langSwitchLabel: 'EN',
    langSwitchHref: siteLinks.en.home,
  },
  en: {
    studyWithUs: {
      label: 'Study With Us',
      href: siteLinks.en.home,
      items: [
        { label: 'Programs', href: siteLinks.en.programs },
        { label: 'College Mentorship', href: siteLinks.en.collegeMentorship },
        { label: 'Highschool Mapping', href: siteLinks.en.highschoolMapping },
        { label: 'Faculty', href: siteLinks.en.faculty },
      ],
    },
    partner: {
      label: 'Partner With NGS',
      href: siteLinks.en.home,
      items: [
        { label: 'Founder Story', href: `${siteLinks.en.home}#founder` },
        { label: 'CCLR Program', href: siteLinks.en.cclr },
        { label: 'Hybrid Learning', href: siteLinks.en.hybrid },
        { label: 'Dual-track Learning', href: siteLinks.en.dualTrack },
        { label: 'Online Diploma Program', href: siteLinks.en.onlineDiploma },
      ],
    },
    admissions: { label: 'Admissions', href: siteLinks.en.admissions },
    community: {
      label: 'Join NGS Community',
      href: siteLinks.en.home,
      items: [
        { label: 'NGS Inspires', href: siteLinks.en.ngsInspires },
        { label: 'NGS Connects', href: siteLinks.en.ngsConnects },
        { label: 'Membership SignIn', href: siteLinks.en.login },
      ],
    },
    loginLabel: 'Log In',
    langSwitchLabel: '中',
    langSwitchHref: siteLinks.zh.home,
  },
};
