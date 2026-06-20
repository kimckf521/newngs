/**
 * Content + sample data for the member portal (/member, /member_en).
 * ----------------------------------------------------------------------
 * FRONT-END ONLY: there is no LMS backend yet (no courses/progress/forums/
 * orders data model). Everything below is sample content so the four-tab
 * student portal renders as a polished, realistic preview in the NGS premium
 * theme. Replace these arrays with real data once a backend exists.
 */
import type { Locale } from '@/i18n/types';

export type TabKey = 'dashboard' | 'account' | 'progress' | 'forums';

export type SidebarItem = { label: string; href?: string; action?: 'logout' };

export type MemberCourse = {
  name: string;
  /** 0–100 */
  progress: number;
  /** Optional extra action buttons shown beside "Click to Learn". */
  extras: ('assignments' | 'webinars')[];
};

export type MemberNote = { title: string; body: string; date: string };

export type MemberContent = {
  tabs: Record<TabKey, string>;
  signOut: string;
  demo: string;

  // Dashboard
  hello: (name: string) => string;
  dashIntro: string;
  cards: { profile: string; profileSub: string; courses: string; coursesSub: string; orders: string; ordersSub: string };
  bookmarks: { title: string; empty: string };
  notes: { title: string; seeMore: string; items: MemberNote[] };

  // Shared sidebar
  sidebar: {
    adminTitle: string;
    adminItems: SidebarItem[];
    collegeTitle: string;
    collegeItems: SidebarItem[];
    topicsTitle: string;
    topicsEmpty: string;
  };

  // Account
  account: {
    title: string;
    infoHeading: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    mobilePlaceholder: string;
    dob: string;
    sampleDob: { d: string; m: string; y: string };
    changePassword: string;
    currentPw: string;
    newPw: string;
    confirmPw: string;
    save: string;
    saved: string;
    editPhoto: string;
  };

  // Progress
  progress: {
    title: string;
    intro: string;
    learn: string;
    assignments: string;
    webinars: string;
    isNew: string;
    yourProgress: string;
    courses: MemberCourse[];
  };

  // Forums
  forums: {
    title: string;
    searchPlaceholder: string;
    groupTitle: string;
    lessonDiscussions: string;
    forums: string;
    users: string;
    activity: string;
    lastTopic: string;
    forumsCount: string;
    empty: string;
  };
};

export const memberContent: Record<Locale, MemberContent> = {
  en: {
    tabs: {
      dashboard: 'Dashboard',
      account: 'Account Information',
      progress: 'My Course Progress',
      forums: 'Visit Forums',
    },
    signOut: 'Sign out',
    demo: 'Demo member area — the data shown below is sample content for the front-end design.',

    hello: (name) => `Hello, ${name.split(' ')[0]}!`,
    dashIntro:
      'From your dashboard you get a snapshot of your recent account activity. Open “My Courses” below to jump back into your learning.',
    cards: {
      profile: 'My Profile',
      profileSub: 'View & edit your details',
      courses: 'My Courses',
      coursesSub: 'Continue learning',
      orders: 'My Orders',
      ordersSub: 'Purchases & receipts',
    },
    bookmarks: { title: 'My Bookmarks', empty: 'No bookmarks currently saved.' },
    notes: {
      title: 'My Notes',
      seeMore: 'See more',
      items: [
        { title: 'IELTS Writing — Task 2', body: 'Remember to paraphrase the question in the introduction and plan before writing.', date: 'Today' },
        { title: 'Business Management — Unit 1', body: 'Review the difference between mission and vision statements.', date: 'Yesterday' },
      ],
    },

    sidebar: {
      adminTitle: 'College Administration',
      adminItems: [
        { label: 'College Management', href: '#' },
        { label: 'Licence Management', href: '#' },
        { label: 'Teachers', href: '#' },
        { label: 'Classrooms', href: '#' },
        { label: 'Assignments', href: '#' },
        { label: 'Resource Management', href: '#' },
      ],
      collegeTitle: 'My College',
      collegeItems: [
        { label: 'College Info', href: '#' },
        { label: 'Apply Licence', href: '#' },
        { label: 'Resources', href: '#' },
        { label: 'User Manual', href: '#' },
        { label: 'Logout', action: 'logout' },
      ],
      topicsTitle: 'My Topics',
      topicsEmpty: 'You have not posted any topics yet.',
    },

    account: {
      title: 'Account information',
      infoHeading: 'Account Information',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      mobile: 'Mobile number',
      mobilePlaceholder: 'Enter your mobile no.',
      dob: 'Date of birth',
      sampleDob: { d: '26', m: '02', y: '2026' },
      changePassword: 'Change Password',
      currentPw: 'Enter current password',
      newPw: 'Enter new password',
      confirmPw: 'Confirm new password',
      save: 'Save',
      saved: 'Saved (demo) — connect a backend to persist changes.',
      editPhoto: 'Change photo',
    },

    progress: {
      title: 'Your Courses',
      intro:
        'Below are the courses you have access to. Click “Click to Learn” to open the material, or track your latest progress on the right.',
      learn: 'Click to Learn',
      assignments: 'Assignments',
      webinars: 'View Webinars',
      isNew: 'NEW',
      yourProgress: 'Your Progress',
      courses: [
        { name: 'English Language Course (IELTS Training)', progress: 10, extras: [] },
        { name: 'OTHM Level 4 Diploma in Business Management', progress: 0, extras: ['assignments', 'webinars'] },
      ],
    },

    forums: {
      title: 'All Forum Subjects',
      searchPlaceholder: 'Search forums…',
      groupTitle: 'My Courses',
      lessonDiscussions: 'Lesson Discussions',
      forums: 'Forums',
      users: 'Users',
      activity: 'Activity',
      lastTopic: 'Last Topic',
      forumsCount: '2',
      empty: '——————',
    },
  },

  zh: {
    tabs: {
      dashboard: '仪表盘',
      account: '账户信息',
      progress: '我的课程进度',
      forums: '论坛',
    },
    signOut: '退出登录',
    demo: '演示会员中心 —— 以下数据为前端设计的示例内容。',

    hello: (name) => `您好，${name.split(' ')[0]}！`,
    dashIntro:
      '在仪表盘，您可以快速查看账户的近期动态。点击下方“我的课程”即可继续学习。',
    cards: {
      profile: '我的资料',
      profileSub: '查看并编辑您的信息',
      courses: '我的课程',
      coursesSub: '继续学习',
      orders: '我的订单',
      ordersSub: '购买记录与收据',
    },
    bookmarks: { title: '我的收藏', empty: '暂无收藏内容。' },
    notes: {
      title: '我的笔记',
      seeMore: '查看更多',
      items: [
        { title: '雅思写作 —— Task 2', body: '记得在引言中改写题目，并在动笔前先列提纲。', date: '今天' },
        { title: '商务管理 —— 单元一', body: '复习使命（mission）与愿景（vision）陈述的区别。', date: '昨天' },
      ],
    },

    sidebar: {
      adminTitle: '学院管理',
      adminItems: [
        { label: '学院管理', href: '#' },
        { label: '授权管理', href: '#' },
        { label: '教师', href: '#' },
        { label: '班级', href: '#' },
        { label: '作业', href: '#' },
        { label: '资源管理', href: '#' },
      ],
      collegeTitle: '我的学院',
      collegeItems: [
        { label: '学院信息', href: '#' },
        { label: '申请授权', href: '#' },
        { label: '资源', href: '#' },
        { label: '用户手册', href: '#' },
        { label: '退出登录', action: 'logout' },
      ],
      topicsTitle: '我的话题',
      topicsEmpty: '您还没有发布任何话题。',
    },

    account: {
      title: '账户信息',
      infoHeading: '账户信息',
      firstName: '名',
      lastName: '姓',
      email: '邮箱',
      mobile: '手机号',
      mobilePlaceholder: '请输入手机号',
      dob: '出生日期',
      sampleDob: { d: '26', m: '02', y: '2026' },
      changePassword: '修改密码',
      currentPw: '请输入当前密码',
      newPw: '请输入新密码',
      confirmPw: '确认新密码',
      save: '保存',
      saved: '已保存（演示）—— 接入后端后即可永久保存。',
      editPhoto: '更换头像',
    },

    progress: {
      title: '我的课程',
      intro:
        '以下是您可学习的课程。点击“开始学习”查看课程内容，或在右侧查看最新学习进度。',
      learn: '开始学习',
      assignments: '作业',
      webinars: '查看直播课',
      isNew: '新',
      yourProgress: '学习进度',
      courses: [
        { name: '英语语言课程（雅思培训）', progress: 10, extras: [] },
        { name: 'OTHM 四级商务管理文凭', progress: 0, extras: ['assignments', 'webinars'] },
      ],
    },

    forums: {
      title: '全部论坛版块',
      searchPlaceholder: '搜索论坛…',
      groupTitle: '我的课程',
      lessonDiscussions: '课程讨论',
      forums: '版块',
      users: '成员',
      activity: '活跃度',
      lastTopic: '最新话题',
      forumsCount: '2',
      empty: '——————',
    },
  },
};
