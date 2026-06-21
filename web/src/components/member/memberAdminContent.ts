/**
 * Sample content for the nine sidebar pages of the member portal, mirroring the
 * live LMS (ngs.classportal.online) feature-for-feature in the NGS theme.
 * FRONT-END ONLY: all rows/values are sample data (no real student names,
 * licence codes, or private emails). Replace once a backend exists.
 */
import type { Locale } from '@/i18n/types';
import type { AdminPage } from './memberContent';

export type AdminField = {
  label: string;
  hint?: string;
  value?: string;
  type: 'text' | 'select' | 'textarea' | 'file';
  options?: string[];
  full?: boolean;
};
export type AdminFieldGroup = { heading: string; fields: AdminField[] };

export type LicenceRow = { course: string; qty: number; used: number; code: string; date: string };
export type TeacherRow = { name: string; email: string; phone: string; classrooms: string[] };
export type AppliedLicenceRow = { course: string; code: string; date: string };

export type AdminContent = {
  pageTitles: Record<AdminPage, string>;
  common: { edit: string; delete: string; view: string; save: string; submit: string; search: string; reset: string; back: string };

  collegeManagement: { groups: AdminFieldGroup[]; save: string };
  licence: { tabs: [string, string]; intro: string; order: string; headers: string[]; rows: LicenceRow[]; copy: string };
  teachers: { add: string; headers: string[]; rows: TeacherRow[] };
  classrooms: { newPlaceholder: string; selectTeacher: string; teachers: string[]; rows: string[]; students: string; courses: string; resources: string };
  assignments: { perPage: string; headers: string[]; statuses: string[]; empty: string };
  resourceMgmt: { addHeading: string; fileName: string; fileNamePlaceholder: string; resourceType: string; types: string[]; fileLabel: string; add: string; tabs: string[]; empty: string };
  collegeInfo: { heading: string; email: string; phone: string; address: string; emailVal: string; phoneVal: string; addressVal: string; aboutHeading: string; about: string[]; servicesHeading: string; services: string[] };
  applyLicence: { intro: string; codeLabel: string; codePlaceholder: string; apply: string; headers: string[]; rows: AppliedLicenceRow[] };
  resources: { tabs: string[]; empty: string };
};

const SAMPLE_NOTE_EN = 'Sample data — connect a backend to manage real records.';

export const adminContent: Record<Locale, AdminContent> = {
  en: {
    pageTitles: {
      collegeManagement: 'College Management',
      licence: 'Licence Management',
      teachers: 'Teachers',
      classrooms: 'Classrooms',
      assignments: 'Assignments',
      resourceMgmt: 'College Resource Management',
      collegeInfo: 'Your College',
      applyLicence: 'Apply Licence',
      resources: 'Resources',
    },
    common: { edit: 'Edit', delete: 'Delete', view: 'View', save: 'Save', submit: 'Create', search: 'Search', reset: 'Reset Filter', back: 'Back' },

    collegeManagement: {
      save: 'Save',
      groups: [
        {
          heading: 'General',
          fields: [
            { label: 'Name', value: 'NextGen Scholars International Academy', hint: 'The exact name of the college — used on certificates and throughout the portal.', type: 'text', full: true },
            { label: 'Enable customers to configure their orders with VAT', value: 'No', options: ['No', 'Yes'], type: 'select', full: true },
            { label: 'Address', value: 'www.nextgenscholars.asia', hint: 'Address of the college.', type: 'textarea', full: true },
            { label: 'Show “Try For Free” button', value: 'Yes', options: ['Yes', 'No'], type: 'select', full: true },
          ],
        },
        {
          heading: 'Contacts',
          fields: [
            { label: 'Phone', value: '400-806-1815', hint: 'Telephone for admissions and students.', type: 'text' },
            { label: 'Contact name', value: 'Course Enquiry', hint: 'Student support contact name.', type: 'text' },
            { label: 'Contact email', value: 'info@nextgenscholars.asia', hint: 'The address students receive automated emails from.', type: 'text' },
            { label: 'Support title', value: 'Technical Support', hint: 'Technical support email title.', type: 'text' },
            { label: 'Support email', value: 'support@nextgenscholars.asia', hint: 'Technical support email address.', type: 'text' },
            { label: 'Enable reCAPTCHA on Contact Us', value: 'No', options: ['No', 'Yes'], type: 'select' },
          ],
        },
        {
          heading: 'Design',
          fields: [
            { label: 'Primary colour', value: '', hint: 'Leave empty to use the default.', type: 'text' },
            { label: 'Secondary colour', value: '', hint: 'Leave empty to use the default.', type: 'text' },
            { label: 'Tertiary colour', value: '', hint: 'Leave empty to use the default.', type: 'text' },
            { label: 'Default meta title', value: '', type: 'text' },
            { label: 'Default meta description', value: '', type: 'text' },
            { label: 'Default meta keywords', value: '', type: 'text' },
            { label: 'College favicon image', value: 'NextGenScholars-Logo.png', type: 'file' },
            { label: 'College logo', value: 'NextGenScholars-Logo.png', type: 'file' },
          ],
        },
        {
          heading: 'Content',
          fields: [
            { label: 'About college', value: 'NextGen Scholars connects ambitious students with mentors from the world’s leading universities, offering globally recognised online diplomas, personalised tutoring and end-to-end university admissions support.', type: 'textarea', full: true },
            { label: 'Customer services', value: 'Admissions: admissions@nextgenscholars.asia · 400-806-1815', type: 'textarea', full: true },
            { label: 'Privacy policy', value: 'Effective date: 1 May 2025. We collect the information you provide and technical data when you use our site, use it to deliver and improve our services, never sell it, and keep it secure. You may access, correct or delete your data at any time.', type: 'textarea', full: true },
            { label: 'Principal full name', value: '', hint: 'Displayed on module certificates.', type: 'text' },
            { label: 'Principal title', value: '', hint: 'Displayed on module certificates.', type: 'text' },
            { label: 'Signature scanned image', value: '', type: 'file' },
            { label: 'Watermark image', value: 'NGS-watermark.png', hint: 'Displayed on downloaded lessons.', type: 'file' },
          ],
        },
      ],
    },

    licence: {
      tabs: ['Licence Management', 'Credits (46)'],
      intro: 'Below is a list of licences associated with your account.',
      order: 'Order Licence',
      headers: ['Course', 'Quantity', 'Used', 'Code', 'Date'],
      copy: 'Click to copy',
      rows: [
        { course: 'English Language Course (IELTS Training)', qty: 1, used: 1, code: 'IELTS-7K2P-9QXM', date: '25 March 2026' },
        { course: 'English Language Course (IELTS Training)', qty: 1, used: 1, code: 'IELTS-3F8D-LB42', date: '16 March 2026' },
        { course: 'English Language Course (IELTS Training)', qty: 1, used: 1, code: 'IELTS-A1G5-1BUX', date: '15 March 2026' },
        { course: 'English Language Course (IELTS Training)', qty: 1, used: 1, code: 'IELTS-WZP2-U5HF', date: '10 March 2026' },
        { course: 'English Language Course (IELTS Training)', qty: 2, used: 2, code: 'IELTS-UPJP-MT5X', date: '7 March 2026' },
      ],
    },

    teachers: {
      add: 'Add New Teacher',
      headers: ['Name', 'E-Mail', 'Telephone', 'Classrooms'],
      rows: [
        { name: 'Grace Lin', email: 'grace.lin@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'David Park', email: 'david.park@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'Sophia Wu', email: 'sophia.wu@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'Daniel Ng', email: 'daniel.ng@nextgenscholars.asia', phone: '139 2285 0281', classrooms: ['IELTS Class A · 2026', 'IELTS Class B · 2026', 'IELTS Evening · 2026'] },
      ],
    },

    classrooms: {
      newPlaceholder: 'New classroom name',
      selectTeacher: 'Select teacher',
      teachers: ['Grace Lin', 'David Park', 'Sophia Wu', 'Daniel Ng'],
      rows: ['IELTS Class A · 2026', 'IELTS Class B · 2026', 'IELTS Evening · 2026', 'IELTS Intensive · 2026', 'IELTS Weekend · 2026'],
      students: 'Students',
      courses: 'Courses',
      resources: 'Resources',
    },

    assignments: {
      perPage: 'Show per page',
      headers: ['ID', 'Course', 'Assignment', 'Student', 'Status'],
      statuses: ['All', 'Distinction', 'Merit', 'Pass', 'Fail', 'Pending'],
      empty: 'No assignments match your filters.',
    },

    resourceMgmt: {
      addHeading: 'Add New Resource',
      fileName: 'File Name',
      fileNamePlaceholder: 'Resource name',
      resourceType: 'Resource Type',
      types: ['File Resource', 'Video Resource'],
      fileLabel: 'File Resource (max 50 MB)',
      add: 'Add Resource',
      tabs: ['All Resources', 'Files', 'Video'],
      empty: 'Resources not found.',
    },

    collegeInfo: {
      heading: 'Your College',
      email: 'Email',
      phone: 'Telephone',
      address: 'Address',
      emailVal: 'info@nextgenscholars.asia',
      phoneVal: '400-806-1815',
      addressVal: 'www.nextgenscholars.asia',
      aboutHeading: 'About Us',
      about: [
        'NextGen Scholars believes that high-quality university-preparation education and globally recognised qualifications should be within everyone’s reach. Built on a robust online learning system, we combine flexible self-paced study, strong value for money, and an end-to-end pathway that covers online diplomas, personalised tutoring and full university-application support — so learners can unlock their potential without juggling multiple agencies.',
        'Our offering spans online diploma & language courses (IELTS, A-Level, Level 3–7 diplomas, IGCSE), one-to-one tutoring for IB / A-Level / AP and SAT / IELTS / TOEFL, and end-to-end university admissions guidance for the UK, US and Australia — including scholarship support with partner universities.',
      ],
      servicesHeading: 'Customer Services',
      services: ['Admissions email: admissions@nextgenscholars.asia', 'Admissions phone: 400-806-1815'],
    },

    applyLicence: {
      intro: 'To apply a licence to your account, enter your code below and click Apply.',
      codeLabel: 'Licence Code',
      codePlaceholder: 'Enter your licence code',
      apply: 'Apply',
      headers: ['Course', 'Code', 'Date'],
      rows: [
        { course: 'English Language Course (IELTS Training)', code: 'IELTS-WZP2-U5HF', date: '15 March 2026' },
        { course: 'English Language Course (IELTS Training)', code: 'IELTS-UPJP-MT5X', date: '7 March 2026' },
      ],
    },

    resources: { tabs: ['All Resources', 'Files', 'Video'], empty: 'Resources not found.' },
  },

  zh: {
    pageTitles: {
      collegeManagement: '学院管理',
      licence: '授权管理',
      teachers: '教师',
      classrooms: '班级',
      assignments: '作业',
      resourceMgmt: '学院资源管理',
      collegeInfo: '我的学院',
      applyLicence: '申请授权',
      resources: '资源',
    },
    common: { edit: '编辑', delete: '删除', view: '查看', save: '保存', submit: '创建', search: '搜索', reset: '重置筛选', back: '返回' },

    collegeManagement: {
      save: '保存',
      groups: [
        {
          heading: '基本信息',
          fields: [
            { label: '学院名称', value: 'NGS 国际预科学院', hint: '学院的正式名称 —— 用于证书及整个平台。', type: 'text', full: true },
            { label: '允许客户为订单配置增值税（VAT）', value: '否', options: ['否', '是'], type: 'select', full: true },
            { label: '地址', value: 'www.nextgenscholars.asia', hint: '学院地址。', type: 'textarea', full: true },
            { label: '显示“免费试用”按钮', value: '是', options: ['是', '否'], type: 'select', full: true },
          ],
        },
        {
          heading: '联系方式',
          fields: [
            { label: '电话', value: '400-806-1815', hint: '招生与学生咨询电话。', type: 'text' },
            { label: '联系人', value: '课程咨询', hint: '学生支持联系人。', type: 'text' },
            { label: '联系邮箱', value: 'info@nextgenscholars.asia', hint: '学生收到自动邮件的发件地址。', type: 'text' },
            { label: '技术支持标题', value: '技术支持', hint: '技术支持邮件标题。', type: 'text' },
            { label: '技术支持邮箱', value: 'support@nextgenscholars.asia', hint: '技术支持邮箱地址。', type: 'text' },
            { label: '在“联系我们”启用 reCAPTCHA', value: '否', options: ['否', '是'], type: 'select' },
          ],
        },
        {
          heading: '设计',
          fields: [
            { label: '主色', value: '', hint: '留空则使用默认值。', type: 'text' },
            { label: '辅助色', value: '', hint: '留空则使用默认值。', type: 'text' },
            { label: '第三色', value: '', hint: '留空则使用默认值。', type: 'text' },
            { label: '默认 Meta 标题', value: '', type: 'text' },
            { label: '默认 Meta 描述', value: '', type: 'text' },
            { label: '默认 Meta 关键词', value: '', type: 'text' },
            { label: '学院 Favicon 图标', value: 'NextGenScholars-Logo.png', type: 'file' },
            { label: '学院 Logo', value: 'NextGenScholars-Logo.png', type: 'file' },
          ],
        },
        {
          heading: '内容',
          fields: [
            { label: '关于学院', value: 'NGS 连接有志学生与世界顶尖大学导师，提供全球认可的在线文凭、个性化辅导以及全流程海外大学申请支持。', type: 'textarea', full: true },
            { label: '客户服务', value: '报名邮箱：admissions@nextgenscholars.asia · 报名电话：400-806-1815', type: 'textarea', full: true },
            { label: '隐私政策', value: '生效日期：2025年5月1日。我们收集您主动提供的信息及使用网站时的技术信息，仅用于提供与改进服务，绝不出售，并妥善保护。您可随时访问、更正或删除您的数据。', type: 'textarea', full: true },
            { label: '校长全名', value: '', hint: '显示在模块证书上。', type: 'text' },
            { label: '校长头衔', value: '', hint: '显示在模块证书上。', type: 'text' },
            { label: '签名扫描图片', value: '', type: 'file' },
            { label: '水印图片', value: 'NGS-watermark.png', hint: '显示在下载的课程材料上。', type: 'file' },
          ],
        },
      ],
    },

    licence: {
      tabs: ['授权管理', '额度 (46)'],
      intro: '以下是与您账户关联的授权列表。',
      order: '订购授权',
      headers: ['课程', '数量', '已用', '授权码', '日期'],
      copy: '点击复制',
      rows: [
        { course: '英语语言课程（雅思培训）', qty: 1, used: 1, code: 'IELTS-7K2P-9QXM', date: '2026年3月25日' },
        { course: '英语语言课程（雅思培训）', qty: 1, used: 1, code: 'IELTS-3F8D-LB42', date: '2026年3月16日' },
        { course: '英语语言课程（雅思培训）', qty: 1, used: 1, code: 'IELTS-A1G5-1BUX', date: '2026年3月15日' },
        { course: '英语语言课程（雅思培训）', qty: 1, used: 1, code: 'IELTS-WZP2-U5HF', date: '2026年3月10日' },
        { course: '英语语言课程（雅思培训）', qty: 2, used: 2, code: 'IELTS-UPJP-MT5X', date: '2026年3月7日' },
      ],
    },

    teachers: {
      add: '新增教师',
      headers: ['姓名', '邮箱', '电话', '班级'],
      rows: [
        { name: 'Grace Lin', email: 'grace.lin@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'David Park', email: 'david.park@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'Sophia Wu', email: 'sophia.wu@nextgenscholars.asia', phone: '', classrooms: [] },
        { name: 'Daniel Ng', email: 'daniel.ng@nextgenscholars.asia', phone: '139 2285 0281', classrooms: ['雅思 A 班 · 2026', '雅思 B 班 · 2026', '雅思晚班 · 2026'] },
      ],
    },

    classrooms: {
      newPlaceholder: '新班级名称',
      selectTeacher: '选择教师',
      teachers: ['Grace Lin', 'David Park', 'Sophia Wu', 'Daniel Ng'],
      rows: ['雅思 A 班 · 2026', '雅思 B 班 · 2026', '雅思晚班 · 2026', '雅思强化班 · 2026', '雅思周末班 · 2026'],
      students: '学生',
      courses: '课程',
      resources: '资源',
    },

    assignments: {
      perPage: '每页显示',
      headers: ['编号', '课程', '作业', '学生', '状态'],
      statuses: ['全部', '优秀', '良好', '通过', '未通过', '待批改'],
      empty: '没有符合筛选条件的作业。',
    },

    resourceMgmt: {
      addHeading: '新增资源',
      fileName: '文件名称',
      fileNamePlaceholder: '资源名称',
      resourceType: '资源类型',
      types: ['文件资源', '视频资源'],
      fileLabel: '文件资源（最大 50 MB）',
      add: '添加资源',
      tabs: ['全部资源', '文件', '视频'],
      empty: '暂无资源。',
    },

    collegeInfo: {
      heading: '我的学院',
      email: '邮箱',
      phone: '电话',
      address: '地址',
      emailVal: 'info@nextgenscholars.asia',
      phoneVal: '400-806-1815',
      addressVal: 'www.nextgenscholars.asia',
      aboutHeading: '关于我们',
      about: [
        'NGS 国际预科学院秉持“人人享有高质量大学预备教育与全球认可学历”的理念，依托优质线上学习系统，打造三大核心优势：极致灵活的自主学习、高性价比，以及覆盖在线文凭、个性化辅导与海外大学申请的一站式闭环服务 —— 助力各类学习者解锁潜能、实现目标。',
        '我们提供在线文凭与语言课程（雅思、A-Level、Level 3–7 文凭、IGCSE）、面向 IB / A-Level / AP 与 SAT / 雅思 / 托福的 1 对 1 辅导，以及覆盖英、美、澳的全流程大学申请指导，并对接合作院校的奖学金申请。',
      ],
      servicesHeading: '客户服务',
      services: ['报名邮箱：admissions@nextgenscholars.asia', '报名电话：400-806-1815'],
    },

    applyLicence: {
      intro: '如需为账户应用授权，请在下方输入授权码并点击“应用”。',
      codeLabel: '授权码',
      codePlaceholder: '请输入您的授权码',
      apply: '应用',
      headers: ['课程', '授权码', '日期'],
      rows: [
        { course: '英语语言课程（雅思培训）', code: 'IELTS-WZP2-U5HF', date: '2026年3月15日' },
        { course: '英语语言课程（雅思培训）', code: 'IELTS-UPJP-MT5X', date: '2026年3月7日' },
      ],
    },

    resources: { tabs: ['全部资源', '文件', '视频'], empty: '暂无资源。' },
  },
};

export { SAMPLE_NOTE_EN };
