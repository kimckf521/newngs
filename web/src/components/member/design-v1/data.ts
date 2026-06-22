/**
 * Content for the ALTERNATE member-portal design (/member/design-v1).
 * A modern, light "app dashboard" take — student-focused (no admin tools).
 * Course/note data is reused from memberContent; this holds the design's own
 * UI strings + a little extra sample data so sections feel complete.
 */
import type { Locale } from '@/i18n/types';

export type SectionKey = 'dashboard' | 'courses' | 'account' | 'forums';

export type UpcomingItem = { title: string; meta: string; when: string; tone: 'live' | 'task' | 'class' };
export type PrefItem = { label: string; desc: string; on: boolean };
export type Board = { name: string; desc: string; topics: number; replies: number; last: string };

export type Dv1Content = {
  brandTag: string;
  role: string;
  sampleName: string;
  sampleEmail: string;
  nav: { dashboard: string; courses: string; account: string; forums: string; resources: string; help: string };
  navGroups: { main: string; more: string };
  search: string;
  signedInAs: string;
  logout: string;
  helpCardTitle: string;
  helpCardBody: string;
  helpCardCta: string;

  greeting: (n: string) => string;
  greetingSub: string;
  continueLearning: string;
  resume: string;
  module: string;
  overall: string;
  coursesInProgress: (n: number) => string;
  stats: { label: string; value: string }[];
  upcoming: string;
  upcomingItems: UpcomingItem[];
  myCourses: string;
  viewAll: string;
  continue: string;
  modulesWord: string;
  completeWord: string;
  recentNotes: string;
  seeMore: string;

  coursesTitle: string;
  coursesSub: string;
  filters: string[];
  viewModules: string;

  accountTitle: string;
  accountSub: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  mobilePlaceholder: string;
  dob: string;
  notSet: string;
  memberSince: string;
  memberSinceVal: string;
  changePassword: string;
  currentPw: string;
  newPw: string;
  confirmPw: string;
  save: string;
  saved: string;
  prefsTitle: string;
  prefs: PrefItem[];

  forumsTitle: string;
  forumsSub: string;
  forumSearch: string;
  newTopic: string;
  boards: Board[];
  topics: string;
  replies: string;
  latest: string;
};

export const dv1: Record<Locale, Dv1Content> = {
  en: {
    brandTag: 'Student Portal',
    role: 'Student',
    sampleName: 'Jamie Lin',
    sampleEmail: 'student@nextgenscholars.asia',
    nav: { dashboard: 'Dashboard', courses: 'My Courses', account: 'Account', forums: 'Forums', resources: 'Resources', help: 'Help & Support' },
    navGroups: { main: 'Menu', more: 'More' },
    search: 'Search courses, lessons, notes…',
    signedInAs: 'Signed in as',
    logout: 'Sign out',
    helpCardTitle: 'Need a hand?',
    helpCardBody: 'Talk to your NGS advisor about courses, deadlines or admissions.',
    helpCardCta: 'Contact advisor',

    greeting: (n) => `Welcome back, ${n}`,
    greetingSub: 'Here’s your learning at a glance.',
    continueLearning: 'Continue learning',
    resume: 'Resume',
    module: 'Module 1 · Home, Family & Daily Life',
    overall: 'Overall progress',
    coursesInProgress: (n) => `${n} courses in progress`,
    stats: [
      { label: 'Active courses', value: '2' },
      { label: 'Modules done', value: '1/16' },
      { label: 'Tasks due', value: '3' },
      { label: 'Study streak', value: '5 days' },
    ],
    upcoming: 'Upcoming',
    upcomingItems: [
      { title: 'IELTS Speaking clinic', meta: 'with Daniel Ng', when: 'Tomorrow · 18:00', tone: 'live' },
      { title: 'Business Mgmt — Unit 1 quiz', meta: 'OTHM Level 4', when: 'Fri · 23:59', tone: 'task' },
      { title: 'Writing Task 2 review', meta: 'IELTS Training', when: 'Mon · 20:00', tone: 'class' },
    ],
    myCourses: 'My courses',
    viewAll: 'View all',
    continue: 'Continue',
    modulesWord: 'modules',
    completeWord: 'complete',
    recentNotes: 'Recent notes',
    seeMore: 'See all notes',

    coursesTitle: 'My Courses',
    coursesSub: 'Pick up where you left off, or jump into a module.',
    filters: ['All', 'In progress', 'Completed'],
    viewModules: 'View modules',

    accountTitle: 'Account',
    accountSub: 'Manage your profile and preferences.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    mobile: 'Mobile number',
    mobilePlaceholder: 'Add your mobile number',
    dob: 'Date of birth',
    notSet: 'Not set',
    memberSince: 'Member since',
    memberSinceVal: 'March 2026',
    changePassword: 'Change password',
    currentPw: 'Current password',
    newPw: 'New password',
    confirmPw: 'Confirm new password',
    save: 'Save changes',
    saved: 'Saved (demo)',
    prefsTitle: 'Preferences',
    prefs: [
      { label: 'Email notifications', desc: 'Course updates & reminders', on: true },
      { label: 'Forum mentions', desc: 'When someone replies to you', on: true },
      { label: 'Weekly progress digest', desc: 'Every Monday morning', on: false },
    ],

    forumsTitle: 'Forums',
    forumsSub: 'Discuss lessons, ask questions and share tips.',
    forumSearch: 'Search forums…',
    newTopic: 'New topic',
    boards: [
      { name: 'IELTS Training — Lesson Discussions', desc: 'Ask questions and share tips on each module.', topics: 24, replies: 112, last: '2h ago' },
      { name: 'OTHM Business Management', desc: 'Discuss units, assignments and webinars.', topics: 8, replies: 31, last: '1d ago' },
      { name: 'University Applications', desc: 'Personal statements, interviews and offers.', topics: 15, replies: 67, last: '3h ago' },
    ],
    topics: 'Topics',
    replies: 'Replies',
    latest: 'Latest',
  },

  zh: {
    brandTag: '学生中心',
    role: '学生',
    sampleName: '林佳',
    sampleEmail: 'student@nextgenscholars.asia',
    nav: { dashboard: '仪表盘', courses: '我的课程', account: '账户信息', forums: '论坛', resources: '学习资源', help: '帮助与支持' },
    navGroups: { main: '菜单', more: '更多' },
    search: '搜索课程、课时、笔记…',
    signedInAs: '当前登录',
    logout: '退出登录',
    helpCardTitle: '需要帮助？',
    helpCardBody: '就课程、截止日期或升学问题，随时联系您的 NGS 顾问。',
    helpCardCta: '联系顾问',

    greeting: (n) => `欢迎回来，${n}`,
    greetingSub: '一眼掌握您的学习进度。',
    continueLearning: '继续学习',
    resume: '继续',
    module: '模块一 · 家庭、亲属与日常生活',
    overall: '总体进度',
    coursesInProgress: (n) => `${n} 门课程进行中`,
    stats: [
      { label: '在读课程', value: '2' },
      { label: '已学模块', value: '1/16' },
      { label: '待办任务', value: '3' },
      { label: '连续学习', value: '5 天' },
    ],
    upcoming: '即将开始',
    upcomingItems: [
      { title: '雅思口语训练营', meta: '导师 Daniel Ng', when: '明天 · 18:00', tone: 'live' },
      { title: '商务管理 — 单元一测验', meta: 'OTHM 四级', when: '周五 · 23:59', tone: 'task' },
      { title: '写作 Task 2 评阅', meta: '雅思培训', when: '周一 · 20:00', tone: 'class' },
    ],
    myCourses: '我的课程',
    viewAll: '查看全部',
    continue: '继续',
    modulesWord: '个模块',
    completeWord: '已完成',
    recentNotes: '最近笔记',
    seeMore: '查看全部笔记',

    coursesTitle: '我的课程',
    coursesSub: '从上次的进度继续，或直接进入某个模块。',
    filters: ['全部', '进行中', '已完成'],
    viewModules: '查看模块',

    accountTitle: '账户信息',
    accountSub: '管理您的资料与偏好设置。',
    firstName: '名',
    lastName: '姓',
    email: '邮箱',
    mobile: '手机号',
    mobilePlaceholder: '添加您的手机号',
    dob: '出生日期',
    notSet: '未设置',
    memberSince: '注册于',
    memberSinceVal: '2026年3月',
    changePassword: '修改密码',
    currentPw: '当前密码',
    newPw: '新密码',
    confirmPw: '确认新密码',
    save: '保存更改',
    saved: '已保存（演示）',
    prefsTitle: '偏好设置',
    prefs: [
      { label: '邮件通知', desc: '课程更新与提醒', on: true },
      { label: '论坛提及', desc: '有人回复你时通知', on: true },
      { label: '每周进度摘要', desc: '每周一上午发送', on: false },
    ],

    forumsTitle: '论坛',
    forumsSub: '讨论课程、提出问题、分享技巧。',
    forumSearch: '搜索论坛…',
    newTopic: '发起话题',
    boards: [
      { name: '雅思培训 —— 课程讨论', desc: '就每个模块提问、分享技巧。', topics: 24, replies: 112, last: '2 小时前' },
      { name: 'OTHM 商务管理', desc: '讨论单元、作业与直播课。', topics: 8, replies: 31, last: '1 天前' },
      { name: '大学申请', desc: '文书、面试与录取经验交流。', topics: 15, replies: 67, last: '3 小时前' },
    ],
    topics: '主题',
    replies: '回复',
    latest: '最新',
  },
};
