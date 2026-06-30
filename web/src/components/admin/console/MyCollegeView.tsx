'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon, GradientButton, SoftButton, Bar } from '@/components/member/design-v1/parts';
import { siteLinks } from '@/lib/siteLinks';
import { logout } from '@/lib/auth';
import { collegeData, type CollegeStatus } from '@/lib/college/sample';

/**
 * School-side portal — "我的学院". The tenant view a partner college sees: its
 * own info, authorization requests, resources, and the user manual. SCAFFOLD
 * with sample data (it shows the first sample college); real per-tenant data +
 * role-gating is the next phase.
 */
type SK = 'info' | 'apply' | 'resources' | 'manual';

const STATUS_CLS: Record<CollegeStatus, string> = {
  active: 'bg-emerald-100 text-emerald-600',
  pending: 'bg-amber-100 text-amber-600',
  suspended: 'bg-rose-100 text-rose-500',
};

const C = {
  zh: {
    sample: '示例数据 —— 真实的「我的学院」会按登录的学校账号显示其专属数据',
    title: '我的学院',
    nav: { info: '学院信息', apply: '申请授权', resources: '资源', manual: '用户手册', logout: '退出登录' },
    status: { active: '已授权', pending: '待审批', suspended: '已停用' },
    info: { sub: '你的学院概况', plan: '套餐', seats: '席位', contact: '联系人', joined: '加入时间', teachers: '教师', students: '学生' },
    apply: { sub: '申请开通更多 NGS 课程', granted: '已授权课程', available: '可申请课程', apply: '申请', pending: '审批中' },
    resources: { sub: '你的学院可使用的教学资源' },
    manual: { sub: '快速上手与常见问题', items: ['如何添加教师与班级', '如何布置作业并查看提交', '如何申请课程授权', '联系 NGS 支持'] },
    allCourses: ['雅思全程', '学术写作', 'OTHM 商科 L4', 'OTHM 商科 L5', 'PTE 冲刺'],
    th: { title: '资源', type: '类型', size: '大小', updated: '更新' },
  },
  en: {
    sample: 'Sample data — the real "My College" shows each signed-in school its own data',
    title: 'My College',
    nav: { info: 'College info', apply: 'Apply for access', resources: 'Resources', manual: 'User manual', logout: 'Sign out' },
    status: { active: 'Authorized', pending: 'Pending', suspended: 'Suspended' },
    info: { sub: 'Your college overview', plan: 'Plan', seats: 'Seats', contact: 'Contact', joined: 'Joined', teachers: 'Teachers', students: 'Students' },
    apply: { sub: 'Request access to more NGS courses', granted: 'Granted courses', available: 'Available to request', apply: 'Request', pending: 'Pending' },
    resources: { sub: 'Teaching resources available to your college' },
    manual: { sub: 'Getting started & FAQs', items: ['Add teachers & classes', 'Set assignments & view submissions', 'Request course authorization', 'Contact NGS support'] },
    allCourses: ['IELTS Full', 'Academic Writing', 'OTHM Business L4', 'OTHM Business L5', 'PTE Sprint'],
    th: { title: 'Resource', type: 'Type', size: 'Size', updated: 'Updated' },
  },
} as const;

const navIconCls = (active?: boolean) =>
  `grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
    active ? 'bg-ngs-gradient text-white shadow-[0_6px_16px_-6px_rgba(139,47,214,0.7)]' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
  }`;
const navItemCls = (active?: boolean) =>
  `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? 'bg-gradient-to-r from-ngs-magenta/10 via-ngs-violet/10 to-ngs-cyan/10 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`;

export function MyCollegeView({ locale }: { locale: Locale }) {
  const [lang, setLang] = useState<Locale>(locale);
  const changeLang = (nl: Locale) => { setLang(nl); try { localStorage.setItem('ielts:lang', nl); } catch {} };
  useEffect(() => { try { const s = localStorage.getItem('ielts:lang'); if (s === 'en' || s === 'zh') setLang(s as Locale); } catch {} }, []);
  const t = C[lang];
  const data = collegeData(lang);
  const college = data.colleges[0];
  const auth = data.authorizations.find((a) => a.collegeName === college.name);
  const granted = auth?.allowedCourses ?? [];
  const available = t.allCourses.filter((c) => !granted.includes(c));
  const resources = data.resources.filter((r) => r.access === college.name || /全部学院|All colleges/.test(r.access));
  const [section, setSection] = useState<SK>('info');

  const NAV: { key: SK; icon: string }[] = [
    { key: 'info', icon: 'building' },
    { key: 'apply', icon: 'key' },
    { key: 'resources', icon: 'folder' },
    { key: 'manual', icon: 'help' },
  ];

  return (
    <div className="dv1 dv1-dark min-h-screen font-sans antialiased">
      <div className="mx-auto flex max-w-[1200px]">
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-5 lg:flex">
          <div className="rounded-2xl bg-ngs-gradient p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{t.title}</p>
            <p className="mt-1 font-grotesk text-[15px] font-bold leading-snug">{college.name}</p>
          </div>
          <nav className="mt-5 flex-1 space-y-1">
            {NAV.map((n) => (
              <button key={n.key} type="button" onClick={() => setSection(n.key)} className={navItemCls(section === n.key)}>
                <span className={navIconCls(section === n.key)}>
                  <Icon name={n.icon} className="h-[18px] w-[18px]" />
                </span>
                {t.nav[n.key]}
              </button>
            ))}
          </nav>
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <Link href="/admin" className={navItemCls(false)}>
              <span className={navIconCls(false)}><Icon name="arrow" className="h-[18px] w-[18px] -scale-x-100" /></span>
              {lang === 'en' ? 'Back to admin' : '返回后台'}
            </Link>
            <button
              type="button"
              onClick={() => void logout().then(() => { window.location.href = siteLinks[lang].login; })}
              className={navItemCls(false)}
            >
              <span className={navIconCls(false)}><Icon name="logout" className="h-[18px] w-[18px]" /></span>
              {t.nav.logout}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-[var(--dv1-topbar)] px-5 py-3 backdrop-blur-xl sm:px-8">
            <Link href={siteLinks[lang].home} className="flex items-center gap-2 lg:hidden">
              <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={26} height={26} className="h-6 w-6 object-contain" />
            </Link>
            <p className="font-grotesk text-sm font-bold text-slate-900">{t.nav[section]}</p>
            <div className="ml-auto flex items-center gap-2">
              {auth && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLS[auth.status]}`}>{t.status[auth.status]}</span>}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
                {(['en', 'zh'] as const).map((ll) => (
                  <button key={ll} type="button" onClick={() => changeLang(ll)} className={`rounded-md px-2 py-1 text-xs font-bold transition ${lang === ll ? 'bg-ngs-gradient text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    {ll === 'en' ? 'EN' : '中'}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Mobile nav */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200/70 bg-white px-5 py-2.5 lg:hidden">
            {NAV.map((n) => (
              <button key={n.key} type="button" onClick={() => setSection(n.key)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${section === n.key ? 'bg-ngs-gradient text-white' : 'bg-slate-100 text-slate-500'}`}>
                {t.nav[n.key]}
              </button>
            ))}
          </div>

          <main className="space-y-5 px-5 py-7 sm:px-8">
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200">
              <Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t.sample}</span>
            </div>

            {section === 'info' && (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ngs-gradient text-white"><Icon name="building" className="h-6 w-6" /></span>
                    <div>
                      <h2 className="font-grotesk text-xl font-bold text-slate-900">{college.name}</h2>
                      <p className="text-sm text-slate-400">{college.city} · {t.info.plan}: {college.plan}</p>
                    </div>
                  </div>
                  {auth && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLS[auth.status]}`}>{t.status[auth.status]}</span>}
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t.info.seats}</span><span className="font-semibold text-slate-700">{college.seatsUsed}/{college.seatsLimit}</span>
                  </div>
                  <Bar value={college.seatsLimit ? Math.round((college.seatsUsed / college.seatsLimit) * 100) : 0} className="mt-1.5" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { k: t.info.teachers, v: college.teachers },
                    { k: t.info.students, v: college.students },
                    { k: t.info.contact, v: college.contactName },
                    { k: t.info.joined, v: college.joinedAt },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">{s.k}</p>
                      <p className="mt-0.5 truncate font-grotesk text-sm font-bold text-slate-900">{s.v}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {section === 'apply' && (
              <div className="space-y-5">
                <p className="text-sm text-slate-500">{t.apply.sub}</p>
                <Card className="p-5">
                  <p className="font-grotesk text-sm font-bold text-slate-900">{t.apply.granted}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {granted.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                        <Icon name="check" className="h-3.5 w-3.5" />{c}
                      </span>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <p className="font-grotesk text-sm font-bold text-slate-900">{t.apply.available}</p>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {available.map((c, i) => (
                      <li key={c} className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-slate-700">{c}</span>
                        {i === 0 ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">{t.apply.pending}</span>
                        ) : (
                          <SoftButton className="!px-3 !py-1.5 !text-xs">{t.apply.apply}</SoftButton>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {section === 'resources' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">{t.resources.sub}</p>
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[12px] uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3 font-semibold">{t.th.title}</th>
                        <th className="px-5 py-3 font-semibold">{t.th.type}</th>
                        <th className="px-5 py-3 font-semibold">{t.th.size}</th>
                        <th className="px-5 py-3 font-semibold">{t.th.updated}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r) => (
                        <tr key={r.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name="folder" className="h-4 w-4" /></span>
                              <span className="font-medium text-slate-900">{r.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-500">{r.type}</span></td>
                          <td className="px-5 py-3 text-slate-500">{r.size}</td>
                          <td className="px-5 py-3 text-slate-500">{r.updatedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {section === 'manual' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">{t.manual.sub}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {t.manual.items.map((m) => (
                    <Card key={m} className="flex items-center gap-3 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-ngs-violet"><Icon name="help" className="h-[18px] w-[18px]" /></span>
                      <span className="text-sm font-medium text-slate-800">{m}</span>
                      <Icon name="arrow" className="ml-auto h-4 w-4 text-slate-300" />
                    </Card>
                  ))}
                </div>
                <GradientButton className="mt-2">{lang === 'en' ? 'Contact NGS support' : '联系 NGS 支持'}</GradientButton>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
