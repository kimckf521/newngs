import type { Locale } from '@/i18n/types';

/** zh/en strings for the platform-side 学院管理 (college) sections. */
type Strings = {
  sampleBanner: string;
  status: { active: string; pending: string; suspended: string };
  teacherStatus: { active: string; invited: string };
  agStatus: { open: string; grading: string; closed: string };
  colleges: { title: string; sub: string; add: string; th: { name: string; contact: string; plan: string; seats: string; status: string } };
  authorizations: { title: string; sub: string; th: { college: string; courses: string; seats: string; expires: string; status: string }; approve: string };
  teachers: { title: string; sub: string; invite: string; th: { name: string; college: string; classes: string; status: string } };
  classes: { title: string; sub: string; th: { name: string; college: string; teacher: string; course: string; students: string } };
  assignments: { title: string; sub: string; th: { title: string; cls: string; due: string; progress: string; status: string } };
  resources: { title: string; sub: string; add: string; th: { title: string; type: string; access: string; size: string; updated: string } };
};

export const collegeContent: Record<Locale, Strings> = {
  zh: {
    sampleBanner: '以下为示例数据 —— 下一轮接入真实数据库（学院 / 教师 / 班级 / 作业 / 资源 + 授权流程）',
    status: { active: '已授权', pending: '待审批', suspended: '已停用' },
    teacherStatus: { active: '在职', invited: '待接受' },
    agStatus: { open: '进行中', grading: '批改中', closed: '已结束' },
    colleges: { title: '学院管理', sub: '管理所有合作学校与机构', add: '添加学院', th: { name: '学院', contact: '联系人', plan: '套餐', seats: '席位', status: '状态' } },
    authorizations: { title: '授权管理', sub: '控制每个学校可访问的课程，以及席位与有效期', th: { college: '学院', courses: '可用课程', seats: '席位', expires: '到期', status: '状态' }, approve: '通过申请' },
    teachers: { title: '教师', sub: '所有学院的教师账号', invite: '邀请教师', th: { name: '教师', college: '学院', classes: '班级数', status: '状态' } },
    classes: { title: '班级', sub: '各学院的班级', th: { name: '班级', college: '学院', teacher: '教师', course: '课程', students: '学生数' } },
    assignments: { title: '作业', sub: '班级作业与提交情况', th: { title: '作业', cls: '班级', due: '截止', progress: '提交', status: '状态' } },
    resources: { title: '资源管理', sub: '课件、真题、手册等教学资源', add: '上传资源', th: { title: '资源', type: '类型', access: '可见范围', size: '大小', updated: '更新' } },
  },
  en: {
    sampleBanner: 'Sample data — real database (colleges / teachers / classes / assignments / resources + authorization flow) lands next round',
    status: { active: 'Authorized', pending: 'Pending', suspended: 'Suspended' },
    teacherStatus: { active: 'Active', invited: 'Invited' },
    agStatus: { open: 'Open', grading: 'Grading', closed: 'Closed' },
    colleges: { title: 'Colleges', sub: 'Manage all partner schools & institutions', add: 'Add college', th: { name: 'College', contact: 'Contact', plan: 'Plan', seats: 'Seats', status: 'Status' } },
    authorizations: { title: 'Authorizations', sub: 'Control each school’s course access, seats and validity', th: { college: 'College', courses: 'Courses', seats: 'Seats', expires: 'Expires', status: 'Status' }, approve: 'Approve' },
    teachers: { title: 'Teachers', sub: 'Teacher accounts across all colleges', invite: 'Invite teacher', th: { name: 'Teacher', college: 'College', classes: 'Classes', status: 'Status' } },
    classes: { title: 'Classes', sub: 'Classes across colleges', th: { name: 'Class', college: 'College', teacher: 'Teacher', course: 'Course', students: 'Students' } },
    assignments: { title: 'Assignments', sub: 'Class assignments & submissions', th: { title: 'Assignment', cls: 'Class', due: 'Due', progress: 'Submitted', status: 'Status' } },
    resources: { title: 'Resources', sub: 'Slides, past papers, handbooks & more', add: 'Upload resource', th: { title: 'Resource', type: 'Type', access: 'Visible to', size: 'Size', updated: 'Updated' } },
  },
};
