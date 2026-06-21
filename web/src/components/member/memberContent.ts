/**
 * Content + sample data for the member portal (/member, /member_en).
 * ----------------------------------------------------------------------
 * FRONT-END ONLY: there is no LMS backend yet. Everything below is sample
 * content so the student portal renders as a polished preview in the NGS
 * premium theme. Structure mirrors the live LMS (ngs.classportal.online):
 *   Dashboard · Account · My Course Progress · Visit Forums
 *   └ Course Progress → Course Detail (module list) → Lesson view
 * Replace these arrays with real data once a backend exists.
 */
import type { Locale } from '@/i18n/types';

export type TabKey = 'dashboard' | 'account' | 'progress' | 'forums';

/** The nine sidebar destinations (admin + "my college"), as in-portal views. */
export type AdminPage =
  | 'collegeManagement'
  | 'licence'
  | 'teachers'
  | 'classrooms'
  | 'assignments'
  | 'resourceMgmt'
  | 'collegeInfo'
  | 'applyLicence'
  | 'resources';

export type SidebarItem = { label: string; page?: AdminPage; action?: 'logout'; external?: string };

/** Per-module Multiple-Choice-Test control (mirrors the live LMS variants). */
export type McqButton = 'mcq' | 'retry' | 'none';

export type CourseModule = {
  title: string;
  /** 0–100 */
  progress: number;
  mcqButton: McqButton;
};

export type MemberCourse = {
  id: string;
  name: string;
  /** Overall course progress 0–100 (as shown on the Course Progress tab). */
  progress: number;
  /** Extra action buttons beside "Click to Learn". */
  extras: ('assignments' | 'webinars')[];
  /** Modules shown on the Course Detail page. */
  modules: CourseModule[];
  /** Course Overview counters. */
  complete: number;
  assessmentsComplete: number;
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

  // Course Progress (course list)
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

  // Course Detail (module list, behind "Click to Learn")
  courseDetail: {
    intro: string;
    overview: string;
    modules: string;
    complete: string;
    assessmentsComplete: string;
    statusKey: string;
    todo: string;
    passed: string;
    failed: string;
    learn: string;
    mcq: string;
    retry: string;
    back: string;
  };

  // Lesson view (behind "Learn")
  lesson: {
    yourLessons: string;
    moduleProgress: string;
    viewAllModules: string;
    learningOutcomes: string;
    introduction: string;
    readMore: string;
    readLess: string;
    firstLesson: string;
    outcomes: string[];
    introParas: string[];
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
        { label: 'College Management', page: 'collegeManagement' },
        { label: 'Licence Management', page: 'licence' },
        { label: 'Teachers', page: 'teachers' },
        { label: 'Classrooms', page: 'classrooms' },
        { label: 'Assignments', page: 'assignments' },
        { label: 'Resource Management', page: 'resourceMgmt' },
      ],
      collegeTitle: 'My College',
      collegeItems: [
        { label: 'College Info', page: 'collegeInfo' },
        { label: 'Apply Licence', page: 'applyLicence' },
        { label: 'Resources', page: 'resources' },
        { label: 'User Manual', external: 'https://learn.onlinebusinessschool.com/manuals/CollegesAdminManual.pdf' },
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
        'Below is a list of courses for which you have purchased modules. Click “Click to Learn” to read the material, or track your latest progress on the right.',
      learn: 'Click to Learn',
      assignments: 'Assignments',
      webinars: 'View Webinars',
      isNew: 'NEW',
      yourProgress: 'Your Progress',
      courses: [
        {
          id: 'ielts',
          name: 'English Language Course (IELTS Training)',
          progress: 10,
          extras: [],
          complete: 0,
          assessmentsComplete: 0,
          modules: [
            { title: 'Module 1: Home, Family & Daily Life', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 2: Politics and Socio-Cultural Issues', progress: 0, mcqButton: 'retry' },
            { title: 'Module 3: Work and Professions', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 4: Health and Fitness', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 5: Citizenship & Politics', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 6: Crime and Punishment', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 7: The Environment', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 8: Technology and Social Networking', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 9: Science and Education', progress: 0, mcqButton: 'mcq' },
            { title: 'Module 10: The IELTS Exam', progress: 0, mcqButton: 'none' },
          ],
        },
        {
          id: 'othm-l4-bm',
          name: 'OTHM Level 4 Diploma in Business Management',
          progress: 0,
          extras: ['assignments', 'webinars'],
          complete: 0,
          assessmentsComplete: 0,
          modules: [
            { title: '(Level 4) Academic Writing and Research Skills', progress: 0, mcqButton: 'mcq' },
            { title: '(Level 4) Business Operations', progress: 0, mcqButton: 'mcq' },
            { title: '(Level 4) Communication in Business', progress: 0, mcqButton: 'mcq' },
            { title: '(Level 4) Finance and Accounting', progress: 0, mcqButton: 'mcq' },
            { title: '(Level 4) Leading and Managing Teams', progress: 0, mcqButton: 'mcq' },
            { title: '(Level 4) Operating in a Global Context', progress: 0, mcqButton: 'mcq' },
          ],
        },
      ],
    },

    courseDetail: {
      intro: 'Below is a list of all the modules you have purchased for this course.',
      overview: 'Course Overview',
      modules: 'Modules',
      complete: 'Complete',
      assessmentsComplete: 'Assessments complete',
      statusKey: 'Multiple Choice Test status',
      todo: 'To do',
      passed: 'Passed',
      failed: 'Failed',
      learn: 'Learn',
      mcq: 'Multiple Choice Test',
      retry: 'Retry Assessment',
      back: 'Back to courses',
    },

    lesson: {
      yourLessons: 'Your Lessons',
      moduleProgress: 'Module Progress',
      viewAllModules: 'View all modules',
      learningOutcomes: 'Learning outcomes',
      introduction: 'Introduction',
      readMore: 'Read More',
      readLess: 'Read Less',
      firstLesson: 'First Lesson',
      outcomes: [
        'Speaking to communicate: giving detailed information clearly, offering ideas and opinions, and adapting your speech to suit the listener, medium, purpose and situation.',
        'Engaging in discussion with one or more people in a variety of situations, making clear and effective contributions relevant to the purpose and topic.',
      ],
      introParas: [
        'This course is most suited to you if you are already able to hold conversations confidently, read and understand a variety of texts, and write clearly and accurately. It is ideal if you are considering sitting a General or Academic IELTS examination.',
        'You will become more confident dealing with complex and unfamiliar situations — listening to extended conversations, following detailed instructions, and adapting your responses. You will build fluency in discussions, get more practice with reading materials of varying length and detail, and learn to communicate your ideas in writing and speech using a style appropriate to the audience.',
        'As you complete each module you will develop a clearer understanding of what is required when preparing for the IELTS examination.',
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
        { label: '学院管理', page: 'collegeManagement' },
        { label: '授权管理', page: 'licence' },
        { label: '教师', page: 'teachers' },
        { label: '班级', page: 'classrooms' },
        { label: '作业', page: 'assignments' },
        { label: '资源管理', page: 'resourceMgmt' },
      ],
      collegeTitle: '我的学院',
      collegeItems: [
        { label: '学院信息', page: 'collegeInfo' },
        { label: '申请授权', page: 'applyLicence' },
        { label: '资源', page: 'resources' },
        { label: '用户手册', external: 'https://learn.onlinebusinessschool.com/manuals/CollegesAdminManual.pdf' },
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
        '以下是您已购买模块的课程列表。点击“开始学习”查看课程内容，或在右侧查看最新学习进度。',
      learn: '开始学习',
      assignments: '作业',
      webinars: '查看直播课',
      isNew: '新',
      yourProgress: '学习进度',
      courses: [
        {
          id: 'ielts',
          name: '英语语言课程（雅思培训）',
          progress: 10,
          extras: [],
          complete: 0,
          assessmentsComplete: 0,
          modules: [
            { title: '模块一：家庭、亲属与日常生活', progress: 0, mcqButton: 'mcq' },
            { title: '模块二：政治与社会文化议题', progress: 0, mcqButton: 'retry' },
            { title: '模块三：工作与职业', progress: 0, mcqButton: 'mcq' },
            { title: '模块四：健康与健身', progress: 0, mcqButton: 'mcq' },
            { title: '模块五：公民与政治', progress: 0, mcqButton: 'mcq' },
            { title: '模块六：犯罪与刑罚', progress: 0, mcqButton: 'mcq' },
            { title: '模块七：环境', progress: 0, mcqButton: 'mcq' },
            { title: '模块八：科技与社交网络', progress: 0, mcqButton: 'mcq' },
            { title: '模块九：科学与教育', progress: 0, mcqButton: 'mcq' },
            { title: '模块十：雅思考试', progress: 0, mcqButton: 'none' },
          ],
        },
        {
          id: 'othm-l4-bm',
          name: 'OTHM 四级商务管理文凭',
          progress: 0,
          extras: ['assignments', 'webinars'],
          complete: 0,
          assessmentsComplete: 0,
          modules: [
            { title: '（四级）学术写作与研究技能', progress: 0, mcqButton: 'mcq' },
            { title: '（四级）业务运营', progress: 0, mcqButton: 'mcq' },
            { title: '（四级）商务沟通', progress: 0, mcqButton: 'mcq' },
            { title: '（四级）财务与会计', progress: 0, mcqButton: 'mcq' },
            { title: '（四级）团队领导与管理', progress: 0, mcqButton: 'mcq' },
            { title: '（四级）全球化经营环境', progress: 0, mcqButton: 'mcq' },
          ],
        },
      ],
    },

    courseDetail: {
      intro: '以下是您已购买该课程的全部模块。',
      overview: '课程概览',
      modules: '模块',
      complete: '已完成',
      assessmentsComplete: '已完成测评',
      statusKey: '选择题测验状态',
      todo: '待完成',
      passed: '已通过',
      failed: '未通过',
      learn: '学习',
      mcq: '选择题测验',
      retry: '重新测评',
      back: '返回课程列表',
    },

    lesson: {
      yourLessons: '我的课时',
      moduleProgress: '模块进度',
      viewAllModules: '查看全部模块',
      learningOutcomes: '学习目标',
      introduction: '简介',
      readMore: '展开全部',
      readLess: '收起',
      firstLesson: '第一课',
      outcomes: [
        '用于交流的口语表达：清晰地给出详细信息，提出想法与观点，并根据听者、媒介、目的与情境调整表达。',
        '与一人或多人就多种情境展开讨论，做出清晰有效的贡献，达成与目的和话题相关的结果。',
      ],
      introParas: [
        '本课程最适合已能自信对话、读懂多种文本并清晰准确写作的学员。如果您打算参加普通类或学术类雅思考试，本课程尤为合适。',
        '您将更从容地应对复杂与陌生的情境 —— 听懂较长的对话、理解详细的指示，并据此调整回应；在讨论中提升流利度，接触篇幅与难度各异的阅读材料，并学会用契合受众的风格进行书面与口头表达。',
        '随着每个模块的完成，您将更清晰地了解雅思备考所需的要点。',
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
