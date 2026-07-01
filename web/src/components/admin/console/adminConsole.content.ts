import type { Locale } from '@/i18n/types';

export type AdminSectionKey =
  | 'dashboard'
  | 'courses'
  | 'questionBank'
  | 'members'
  | 'colleges'
  | 'authorizations'
  | 'teachers'
  | 'classes'
  | 'assignments'
  | 'resources';

type Strings = {
  brandTag: string;
  search: string;
  role: string;
  navGroups: { main: string; college: string; more: string };
  nav: {
    dashboard: string;
    courses: string;
    questionBank: string;
    members: string;
    colleges: string;
    authorizations: string;
    teachers: string;
    classes: string;
    assignments: string;
    resources: string;
    siteEditor: string;
    liveChat: string;
    myCollege: string;
  };
  modeBadge: { cloud: string; local: string };
  dashboard: {
    greeting: (n: string) => string;
    sub: string;
    stats: { courses: string; published: string; members: string; manage: string };
    quickTitle: string;
    recent: string;
    none: string;
  };
  courses: {
    title: string;
    sub: string;
    create: string;
    empty: string;
    moduleCount: (n: number) => string;
    published: string;
    draft: string;
    edit: string;
    del: string;
    confirmDel: (name: string) => string;
    delFailed: string;
  };
  form: {
    newTitle: string;
    editTitle: string;
    name: string;
    namePh: string;
    description: string;
    descriptionPh: string;
    level: string;
    levelPh: string;
    track: string;
    trackPh: string;
    cover: string;
    publishedLabel: string;
    modules: string;
    modulePh: string;
    addModule: string;
    save: string;
    saving: string;
    cancel: string;
    savedCloud: string;
    savedLocal: string;
    saveFailed: string;
    nameRequired: string;
  };
  members: {
    title: string;
    sub: string;
    th: { member: string; login: string; contact: string; lastLogin: string; role: string };
    via: { wechat: string; email: string; phone: string; account: string; other: string };
    keyLabel: string;
    keyPh: string;
    keySet: string;
    loading: string;
    notConfigured: string;
    notConfiguredHint: string;
    unauthorized: string;
    you: string;
    updated: string;
    updateFailed: string;
    confirm: {
      title: string;
      body: (name: string, from: string, to: string) => string;
      adminWarn: string;
      confirm: string;
      cancel: string;
    };
  };
};

export const adminConsoleContent: Record<Locale, Strings> = {
  en: {
    brandTag: 'Admin',
    search: 'Search courses, members…',
    role: 'Administrator',
    navGroups: { main: 'Manage', college: 'Colleges', more: 'Tools' },
    nav: {
      dashboard: 'Dashboard', courses: 'Courses', questionBank: 'Question bank', members: 'Members',
      colleges: 'Colleges', authorizations: 'Authorizations', teachers: 'Teachers',
      classes: 'Classes', assignments: 'Assignments', resources: 'Resources',
      siteEditor: 'Site Editor', liveChat: 'Live Chat', myCollege: 'My College',
    },
    modeBadge: { cloud: 'Saved to cloud', local: 'Local trial' },
    dashboard: {
      greeting: (n) => `Welcome, ${n}`,
      sub: 'Create courses and manage members from one place.',
      stats: { courses: 'Total courses', published: 'Published', members: 'Members', manage: 'Manage →' },
      quickTitle: 'Quick actions',
      recent: 'Recent courses',
      none: 'No courses yet — create your first one.',
    },
    courses: {
      title: 'Courses',
      sub: 'Create and manage the courses students study.',
      create: 'New course',
      empty: 'No courses yet. Click “New course” to create one.',
      moduleCount: (n) => `${n} module${n === 1 ? '' : 's'}`,
      published: 'Published',
      draft: 'Draft',
      edit: 'Edit',
      del: 'Delete',
      confirmDel: (name) => `Delete “${name}”? This cannot be undone.`,
      delFailed: 'Delete failed — check the admin key',
    },
    form: {
      newTitle: 'New course',
      editTitle: 'Edit course',
      name: 'Course name',
      namePh: 'e.g. English Language Course (IELTS Training)',
      description: 'Description',
      descriptionPh: 'What students will learn…',
      level: 'Level',
      levelPh: 'e.g. OTHM Level 4',
      track: 'Track',
      trackPh: 'e.g. IELTS / Business',
      cover: 'Cover image',
      publishedLabel: 'Published (visible to students)',
      modules: 'Modules',
      modulePh: 'Module title',
      addModule: 'Add module',
      save: 'Save course',
      saving: 'Saving…',
      cancel: 'Cancel',
      savedCloud: 'Saved ✓',
      savedLocal: 'Saved locally ✓ (trial)',
      saveFailed: 'Save failed — check the admin key',
      nameRequired: 'Please enter a course name.',
    },
    members: {
      title: 'Members',
      sub: 'Manage all members, including admins.',
      th: { member: 'Member', login: 'Login', contact: 'Contact', lastLogin: 'Last login', role: 'Role' },
      via: { wechat: 'WeChat', email: 'Email', phone: 'Phone', account: 'Account', other: 'Other' },
      keyLabel: 'Admin key',
      keyPh: 'Enter ADMIN_API_KEY',
      keySet: 'Set',
      loading: 'Loading members…',
      notConfigured: 'Member management needs server setup',
      notConfiguredHint:
        'Set CLOUDBASE_SECRET_ID / CLOUDBASE_SECRET_KEY (server env) so the server can list and update members. Until then, only your own account is shown.',
      unauthorized: 'Enter the admin key to manage members.',
      you: 'You',
      updated: 'Role updated ✓',
      updateFailed: 'Update failed',
      confirm: {
        title: 'Confirm role change',
        body: (name, from, to) => `Change ${name}'s role from "${from}" to "${to}"?`,
        adminWarn:
          'Admins get full access to this console — courses, members, and the site editor. Only grant this to people you trust.',
        confirm: 'Yes, change role',
        cancel: 'Cancel',
      },
    },
  },
  zh: {
    brandTag: '管理后台',
    search: '搜索课程、成员…',
    role: '管理员',
    navGroups: { main: '管理', college: '学院', more: '工具' },
    nav: {
      dashboard: '仪表盘', courses: '课程', questionBank: '题库', members: '成员',
      colleges: '学院管理', authorizations: '授权管理', teachers: '教师',
      classes: '班级', assignments: '作业', resources: '资源管理',
      siteEditor: '网站编辑器', liveChat: '在线客服', myCollege: '我的学院',
    },
    modeBadge: { cloud: '已保存到云端', local: '本地试用' },
    dashboard: {
      greeting: (n) => `欢迎，${n}`,
      sub: '在一个地方创建课程并管理成员。',
      stats: { courses: '课程总数', published: '已发布', members: '成员', manage: '管理 →' },
      quickTitle: '快捷操作',
      recent: '最近的课程',
      none: '还没有课程 —— 创建第一个吧。',
    },
    courses: {
      title: '课程',
      sub: '创建并管理供学生学习的课程。',
      create: '新建课程',
      empty: '还没有课程。点击「新建课程」创建一个。',
      moduleCount: (n) => `${n} 个模块`,
      published: '已发布',
      draft: '草稿',
      edit: '编辑',
      del: '删除',
      confirmDel: (name) => `确定删除「${name}」？此操作无法撤销。`,
      delFailed: '删除失败 —— 请检查管理密钥',
    },
    form: {
      newTitle: '新建课程',
      editTitle: '编辑课程',
      name: '课程名称',
      namePh: '例如：英语语言课程（雅思培训）',
      description: '课程简介',
      descriptionPh: '学生将学到什么…',
      level: '级别',
      levelPh: '例如：OTHM 四级',
      track: '类别',
      trackPh: '例如：雅思 / 商务',
      cover: '封面图片',
      publishedLabel: '发布（对学生可见）',
      modules: '课程模块',
      modulePh: '模块标题',
      addModule: '添加模块',
      save: '保存课程',
      saving: '保存中…',
      cancel: '取消',
      savedCloud: '已保存 ✓',
      savedLocal: '已本地保存 ✓（试用）',
      saveFailed: '保存失败 —— 请检查管理密钥',
      nameRequired: '请输入课程名称。',
    },
    members: {
      title: '成员',
      sub: '管理所有成员，包括管理员。',
      th: { member: '成员', login: '登录方式', contact: '联系方式', lastLogin: '最后登录', role: '角色' },
      via: { wechat: '微信', email: '邮箱', phone: '手机', account: '账号', other: '其他' },
      keyLabel: '管理密钥',
      keyPh: '输入 ADMIN_API_KEY',
      keySet: '确定',
      loading: '正在加载成员…',
      notConfigured: '成员管理需要服务器配置',
      notConfiguredHint:
        '请设置 CLOUDBASE_SECRET_ID / CLOUDBASE_SECRET_KEY（服务器环境变量），服务器才能列出并更新成员。在此之前，仅显示你自己的账户。',
      unauthorized: '请输入管理密钥以管理成员。',
      you: '你',
      updated: '角色已更新 ✓',
      updateFailed: '更新失败',
      confirm: {
        title: '确认修改角色',
        body: (name, from, to) => `确定将 ${name} 的角色从「${from}」改为「${to}」吗?`,
        adminWarn: '管理员拥有后台的完整权限——课程、成员、网站编辑器都能操作。请只授予你信任的人。',
        confirm: '确认修改',
        cancel: '取消',
      },
    },
  },
};
