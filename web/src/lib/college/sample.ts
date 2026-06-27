import type { Locale } from '@/i18n/types';

/**
 * Multi-tenant "学院 (college)" domain — SCAFFOLD sample data.
 * ----------------------------------------------------------------------
 * NGS works with multiple partner schools/colleges. The platform side
 * (学院管理) manages all colleges, their authorizations, teachers, classes,
 * assignments and resources; each college sees only its own (我的学院).
 *
 * This file is sample data ONLY — the real backend (PostgreSQL tables + CRUD +
 * an authorization flow) is the next phase. `_sample` is exported so the UI can
 * badge itself as preview data.
 */
export const IS_SAMPLE = true;

/** active = licensed & live · pending = applied, awaiting approval · suspended = paused. */
export type CollegeStatus = 'active' | 'pending' | 'suspended';

export type College = {
  id: string;
  name: string;
  city: string;
  contactName: string;
  contactEmail: string;
  plan: string;
  status: CollegeStatus;
  seatsUsed: number;
  seatsLimit: number;
  teachers: number;
  students: number;
  joinedAt: string;
};

/** Authorization governs BOTH content access (which courses) AND account state
 *  (active/seats). */
export type Authorization = {
  id: string;
  collegeName: string;
  status: CollegeStatus;
  allowedCourses: string[];
  seatsUsed: number;
  seatsLimit: number;
  expiresAt: string;
  requestedAt?: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  classes: number;
  status: 'active' | 'invited';
};

export type SchoolClass = {
  id: string;
  name: string;
  collegeName: string;
  teacher: string;
  course: string;
  students: number;
};

export type Assignment = {
  id: string;
  title: string;
  className: string;
  course: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: 'open' | 'grading' | 'closed';
};

export type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'slide' | 'doc';
  access: string;
  size: string;
  updatedAt: string;
};

export type CollegeData = {
  colleges: College[];
  authorizations: Authorization[];
  teachers: Teacher[];
  classes: SchoolClass[];
  assignments: Assignment[];
  resources: Resource[];
};

const ZH: CollegeData = {
  colleges: [
    { id: 'c1', name: '北京新航道国际学校', city: '北京', contactName: '王老师', contactEmail: 'wang@bjxh.edu.cn', plan: '旗舰版', status: 'active', seatsUsed: 240, seatsLimit: 300, teachers: 18, students: 222, joinedAt: '2025-09-01' },
    { id: 'c2', name: '上海明德书院', city: '上海', contactName: '李主任', contactEmail: 'li@mingde.edu.cn', plan: '标准版', status: 'active', seatsUsed: 96, seatsLimit: 150, teachers: 9, students: 87, joinedAt: '2026-01-12' },
    { id: 'c3', name: '广州求知学堂', city: '广州', contactName: '陈校长', contactEmail: 'chen@qz.edu.cn', plan: '标准版', status: 'pending', seatsUsed: 0, seatsLimit: 100, teachers: 0, students: 0, joinedAt: '2026-06-20' },
    { id: 'c4', name: '深圳前海双语', city: '深圳', contactName: '赵老师', contactEmail: 'zhao@qh.edu.cn', plan: '试用版', status: 'suspended', seatsUsed: 30, seatsLimit: 30, teachers: 3, students: 27, joinedAt: '2025-11-05' },
  ],
  authorizations: [
    { id: 'a1', collegeName: '北京新航道国际学校', status: 'active', allowedCourses: ['雅思全程', '学术写作', 'OTHM 商科 L4'], seatsUsed: 240, seatsLimit: 300, expiresAt: '2026-08-31' },
    { id: 'a2', collegeName: '上海明德书院', status: 'active', allowedCourses: ['雅思全程', '学术写作'], seatsUsed: 96, seatsLimit: 150, expiresAt: '2027-01-11' },
    { id: 'a3', collegeName: '广州求知学堂', status: 'pending', allowedCourses: ['雅思全程'], seatsUsed: 0, seatsLimit: 100, expiresAt: '—', requestedAt: '2026-06-20' },
    { id: 'a4', collegeName: '深圳前海双语', status: 'suspended', allowedCourses: ['雅思全程'], seatsUsed: 30, seatsLimit: 30, expiresAt: '2026-05-04' },
  ],
  teachers: [
    { id: 't1', name: '王雅婷', email: 'wang.yt@bjxh.edu.cn', collegeName: '北京新航道国际学校', classes: 4, status: 'active' },
    { id: 't2', name: '李文博', email: 'li.wb@bjxh.edu.cn', collegeName: '北京新航道国际学校', classes: 3, status: 'active' },
    { id: 't3', name: '陈思远', email: 'chen.sy@mingde.edu.cn', collegeName: '上海明德书院', classes: 2, status: 'active' },
    { id: 't4', name: '周敏', email: 'zhou.m@mingde.edu.cn', collegeName: '上海明德书院', classes: 1, status: 'invited' },
  ],
  classes: [
    { id: 'k1', name: '雅思冲刺 A 班', collegeName: '北京新航道国际学校', teacher: '王雅婷', course: '雅思全程', students: 28 },
    { id: 'k2', name: '雅思冲刺 B 班', collegeName: '北京新航道国际学校', teacher: '李文博', course: '雅思全程', students: 26 },
    { id: 'k3', name: '学术写作进阶', collegeName: '上海明德书院', teacher: '陈思远', course: '学术写作', students: 22 },
    { id: 'k4', name: '商科预备班', collegeName: '北京新航道国际学校', teacher: '王雅婷', course: 'OTHM 商科 L4', students: 19 },
  ],
  assignments: [
    { id: 'g1', title: 'Reading Test 3 — 限时', className: '雅思冲刺 A 班', course: '雅思全程', dueDate: '2026-06-30', submitted: 24, total: 28, status: 'open' },
    { id: 'g2', title: 'Task 2 议论文', className: '学术写作进阶', course: '学术写作', dueDate: '2026-06-28', submitted: 22, total: 22, status: 'grading' },
    { id: 'g3', title: '商业案例分析', className: '商科预备班', course: 'OTHM 商科 L4', dueDate: '2026-06-22', submitted: 19, total: 19, status: 'closed' },
  ],
  resources: [
    { id: 'r1', title: '剑桥雅思 18 全套真题', type: 'pdf', access: '全部学院', size: '42 MB', updatedAt: '2026-06-10' },
    { id: 'r2', title: '学术写作范文精讲', type: 'video', access: '北京新航道国际学校', size: '1.2 GB', updatedAt: '2026-05-28' },
    { id: 'r3', title: 'OTHM L4 课件包', type: 'slide', access: '北京新航道国际学校', size: '88 MB', updatedAt: '2026-06-15' },
    { id: 'r4', title: '教师使用手册', type: 'doc', access: '全部学院', size: '6 MB', updatedAt: '2026-06-01' },
  ],
};

const EN: CollegeData = {
  colleges: [
    { id: 'c1', name: 'Beijing NewChannel Intl School', city: 'Beijing', contactName: 'Ms. Wang', contactEmail: 'wang@bjxh.edu.cn', plan: 'Flagship', status: 'active', seatsUsed: 240, seatsLimit: 300, teachers: 18, students: 222, joinedAt: '2025-09-01' },
    { id: 'c2', name: 'Shanghai Mingde Academy', city: 'Shanghai', contactName: 'Director Li', contactEmail: 'li@mingde.edu.cn', plan: 'Standard', status: 'active', seatsUsed: 96, seatsLimit: 150, teachers: 9, students: 87, joinedAt: '2026-01-12' },
    { id: 'c3', name: 'Guangzhou Qiuzhi College', city: 'Guangzhou', contactName: 'Principal Chen', contactEmail: 'chen@qz.edu.cn', plan: 'Standard', status: 'pending', seatsUsed: 0, seatsLimit: 100, teachers: 0, students: 0, joinedAt: '2026-06-20' },
    { id: 'c4', name: 'Shenzhen Qianhai Bilingual', city: 'Shenzhen', contactName: 'Mr. Zhao', contactEmail: 'zhao@qh.edu.cn', plan: 'Trial', status: 'suspended', seatsUsed: 30, seatsLimit: 30, teachers: 3, students: 27, joinedAt: '2025-11-05' },
  ],
  authorizations: [
    { id: 'a1', collegeName: 'Beijing NewChannel Intl School', status: 'active', allowedCourses: ['IELTS Full', 'Academic Writing', 'OTHM Business L4'], seatsUsed: 240, seatsLimit: 300, expiresAt: '2026-08-31' },
    { id: 'a2', collegeName: 'Shanghai Mingde Academy', status: 'active', allowedCourses: ['IELTS Full', 'Academic Writing'], seatsUsed: 96, seatsLimit: 150, expiresAt: '2027-01-11' },
    { id: 'a3', collegeName: 'Guangzhou Qiuzhi College', status: 'pending', allowedCourses: ['IELTS Full'], seatsUsed: 0, seatsLimit: 100, expiresAt: '—', requestedAt: '2026-06-20' },
    { id: 'a4', collegeName: 'Shenzhen Qianhai Bilingual', status: 'suspended', allowedCourses: ['IELTS Full'], seatsUsed: 30, seatsLimit: 30, expiresAt: '2026-05-04' },
  ],
  teachers: [
    { id: 't1', name: 'Wang Yating', email: 'wang.yt@bjxh.edu.cn', collegeName: 'Beijing NewChannel Intl School', classes: 4, status: 'active' },
    { id: 't2', name: 'Li Wenbo', email: 'li.wb@bjxh.edu.cn', collegeName: 'Beijing NewChannel Intl School', classes: 3, status: 'active' },
    { id: 't3', name: 'Chen Siyuan', email: 'chen.sy@mingde.edu.cn', collegeName: 'Shanghai Mingde Academy', classes: 2, status: 'active' },
    { id: 't4', name: 'Zhou Min', email: 'zhou.m@mingde.edu.cn', collegeName: 'Shanghai Mingde Academy', classes: 1, status: 'invited' },
  ],
  classes: [
    { id: 'k1', name: 'IELTS Sprint A', collegeName: 'Beijing NewChannel Intl School', teacher: 'Wang Yating', course: 'IELTS Full', students: 28 },
    { id: 'k2', name: 'IELTS Sprint B', collegeName: 'Beijing NewChannel Intl School', teacher: 'Li Wenbo', course: 'IELTS Full', students: 26 },
    { id: 'k3', name: 'Academic Writing Adv.', collegeName: 'Shanghai Mingde Academy', teacher: 'Chen Siyuan', course: 'Academic Writing', students: 22 },
    { id: 'k4', name: 'Business Prep', collegeName: 'Beijing NewChannel Intl School', teacher: 'Wang Yating', course: 'OTHM Business L4', students: 19 },
  ],
  assignments: [
    { id: 'g1', title: 'Reading Test 3 — timed', className: 'IELTS Sprint A', course: 'IELTS Full', dueDate: '2026-06-30', submitted: 24, total: 28, status: 'open' },
    { id: 'g2', title: 'Task 2 Essay', className: 'Academic Writing Adv.', course: 'Academic Writing', dueDate: '2026-06-28', submitted: 22, total: 22, status: 'grading' },
    { id: 'g3', title: 'Business Case Analysis', className: 'Business Prep', course: 'OTHM Business L4', dueDate: '2026-06-22', submitted: 19, total: 19, status: 'closed' },
  ],
  resources: [
    { id: 'r1', title: 'Cambridge IELTS 18 — full set', type: 'pdf', access: 'All colleges', size: '42 MB', updatedAt: '2026-06-10' },
    { id: 'r2', title: 'Academic Writing model essays', type: 'video', access: 'Beijing NewChannel Intl School', size: '1.2 GB', updatedAt: '2026-05-28' },
    { id: 'r3', title: 'OTHM L4 slide deck', type: 'slide', access: 'Beijing NewChannel Intl School', size: '88 MB', updatedAt: '2026-06-15' },
    { id: 'r4', title: 'Teacher handbook', type: 'doc', access: 'All colleges', size: '6 MB', updatedAt: '2026-06-01' },
  ],
};

export function collegeData(locale: Locale): CollegeData {
  return locale === 'en' ? EN : ZH;
}
