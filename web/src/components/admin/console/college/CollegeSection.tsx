'use client';

import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon, GradientButton, Bar } from '@/components/member/design-v1/parts';
import { collegeData, type CollegeStatus } from '@/lib/college/sample';
import { collegeContent } from './collegeContent';

export type CollegeSectionKey =
  | 'colleges'
  | 'authorizations'
  | 'teachers'
  | 'classes'
  | 'assignments'
  | 'resources';

const STATUS_CLS: Record<CollegeStatus, string> = {
  active: 'bg-emerald-100 text-emerald-600',
  pending: 'bg-amber-100 text-amber-600',
  suspended: 'bg-rose-100 text-rose-500',
};
const pill = 'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold';
const thCls = 'px-5 py-3 font-semibold';
const tdCls = 'px-5 py-3';

function Header({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-grotesk text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Banner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200">
      <Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function TableShell({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[12px] uppercase tracking-wide text-slate-400">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </Card>
  );
}

const rowCls = 'border-b border-slate-50 last:border-0';

export function CollegeSection({ locale, section }: { locale: Locale; section: CollegeSectionKey }) {
  const t = collegeContent[locale];
  const d = collegeData(locale);
  const sLabel = (s: CollegeStatus) => t.status[s];

  if (section === 'colleges') {
    return (
      <div className="space-y-5">
        <Header title={t.colleges.title} sub={t.colleges.sub} action={<GradientButton><Icon name="spark" className="h-4 w-4" />{t.colleges.add}</GradientButton>} />
        <Banner text={t.sampleBanner} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {d.colleges.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ngs-gradient text-white">
                    <Icon name="building" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-grotesk text-[15px] font-bold leading-snug text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.city} · {c.plan}</p>
                  </div>
                </div>
                <span className={`${pill} ${STATUS_CLS[c.status]}`}>{sLabel(c.status)}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t.colleges.th.seats}</span>
                  <span className="font-semibold text-slate-700">{c.seatsUsed}/{c.seatsLimit}</span>
                </div>
                <Bar value={c.seatsLimit ? Math.round((c.seatsUsed / c.seatsLimit) * 100) : 0} className="mt-1.5" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{c.teachers} 教师 · {c.students} 学生</span>
                <span className="truncate text-slate-400">{c.contactName}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'authorizations') {
    return (
      <div className="space-y-5">
        <Header title={t.authorizations.title} sub={t.authorizations.sub} />
        <Banner text={t.sampleBanner} />
        <TableShell
          head={
            <>
              <th className={thCls}>{t.authorizations.th.college}</th>
              <th className={thCls}>{t.authorizations.th.courses}</th>
              <th className={thCls}>{t.authorizations.th.seats}</th>
              <th className={thCls}>{t.authorizations.th.expires}</th>
              <th className={thCls}>{t.authorizations.th.status}</th>
              <th className={thCls} />
            </>
          }
        >
          {d.authorizations.map((a) => (
            <tr key={a.id} className={rowCls}>
              <td className={`${tdCls} font-medium text-slate-900`}>{a.collegeName}</td>
              <td className={tdCls}>
                <div className="flex flex-wrap gap-1">
                  {a.allowedCourses.map((c) => (
                    <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{c}</span>
                  ))}
                </div>
              </td>
              <td className={`${tdCls} text-slate-500`}>{a.seatsUsed}/{a.seatsLimit}</td>
              <td className={`${tdCls} text-slate-500`}>{a.expiresAt}</td>
              <td className={tdCls}><span className={`${pill} ${STATUS_CLS[a.status]}`}>{sLabel(a.status)}</span></td>
              <td className={tdCls}>
                {a.status === 'pending' && (
                  <button type="button" className="rounded-lg bg-ngs-gradient px-3 py-1.5 text-xs font-semibold text-white">{t.authorizations.approve}</button>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
      </div>
    );
  }

  if (section === 'teachers') {
    return (
      <div className="space-y-5">
        <Header title={t.teachers.title} sub={t.teachers.sub} action={<GradientButton><Icon name="spark" className="h-4 w-4" />{t.teachers.invite}</GradientButton>} />
        <Banner text={t.sampleBanner} />
        <TableShell
          head={
            <>
              <th className={thCls}>{t.teachers.th.name}</th>
              <th className={thCls}>{t.teachers.th.college}</th>
              <th className={thCls}>{t.teachers.th.classes}</th>
              <th className={thCls}>{t.teachers.th.status}</th>
            </>
          }
        >
          {d.teachers.map((tc) => (
            <tr key={tc.id} className={rowCls}>
              <td className={tdCls}>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ngs-gradient text-xs font-bold text-white"><Icon name="user" className="h-4 w-4" /></span>
                  <div>
                    <p className="font-medium text-slate-900">{tc.name}</p>
                    <p className="text-[11px] text-slate-400">{tc.email}</p>
                  </div>
                </div>
              </td>
              <td className={`${tdCls} text-slate-500`}>{tc.collegeName}</td>
              <td className={`${tdCls} text-slate-500`}>{tc.classes}</td>
              <td className={tdCls}>
                <span className={`${pill} ${tc.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {t.teacherStatus[tc.status]}
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      </div>
    );
  }

  if (section === 'classes') {
    return (
      <div className="space-y-5">
        <Header title={t.classes.title} sub={t.classes.sub} />
        <Banner text={t.sampleBanner} />
        <TableShell
          head={
            <>
              <th className={thCls}>{t.classes.th.name}</th>
              <th className={thCls}>{t.classes.th.college}</th>
              <th className={thCls}>{t.classes.th.teacher}</th>
              <th className={thCls}>{t.classes.th.course}</th>
              <th className={thCls}>{t.classes.th.students}</th>
            </>
          }
        >
          {d.classes.map((k) => (
            <tr key={k.id} className={rowCls}>
              <td className={`${tdCls} font-medium text-slate-900`}>{k.name}</td>
              <td className={`${tdCls} text-slate-500`}>{k.collegeName}</td>
              <td className={`${tdCls} text-slate-500`}>{k.teacher}</td>
              <td className={tdCls}><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{k.course}</span></td>
              <td className={`${tdCls} text-slate-500`}>{k.students}</td>
            </tr>
          ))}
        </TableShell>
      </div>
    );
  }

  if (section === 'assignments') {
    return (
      <div className="space-y-5">
        <Header title={t.assignments.title} sub={t.assignments.sub} />
        <Banner text={t.sampleBanner} />
        <TableShell
          head={
            <>
              <th className={thCls}>{t.assignments.th.title}</th>
              <th className={thCls}>{t.assignments.th.cls}</th>
              <th className={thCls}>{t.assignments.th.due}</th>
              <th className={thCls}>{t.assignments.th.progress}</th>
              <th className={thCls}>{t.assignments.th.status}</th>
            </>
          }
        >
          {d.assignments.map((g) => (
            <tr key={g.id} className={rowCls}>
              <td className={`${tdCls} font-medium text-slate-900`}>{g.title}</td>
              <td className={`${tdCls} text-slate-500`}>{g.className}</td>
              <td className={`${tdCls} text-slate-500`}>{g.dueDate}</td>
              <td className={tdCls}>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">{g.submitted}/{g.total}</span>
                  <span className="h-1.5 w-20"><Bar value={g.total ? Math.round((g.submitted / g.total) * 100) : 0} /></span>
                </div>
              </td>
              <td className={tdCls}>
                <span className={`${pill} ${g.status === 'closed' ? 'bg-slate-100 text-slate-500' : g.status === 'grading' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {t.agStatus[g.status]}
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      </div>
    );
  }

  // resources
  return (
    <div className="space-y-5">
      <Header title={t.resources.title} sub={t.resources.sub} action={<GradientButton><Icon name="spark" className="h-4 w-4" />{t.resources.add}</GradientButton>} />
      <Banner text={t.sampleBanner} />
      <TableShell
        head={
          <>
            <th className={thCls}>{t.resources.th.title}</th>
            <th className={thCls}>{t.resources.th.type}</th>
            <th className={thCls}>{t.resources.th.access}</th>
            <th className={thCls}>{t.resources.th.size}</th>
            <th className={thCls}>{t.resources.th.updated}</th>
          </>
        }
      >
        {d.resources.map((r) => (
          <tr key={r.id} className={rowCls}>
            <td className={tdCls}>
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name="folder" className="h-4 w-4" /></span>
                <span className="font-medium text-slate-900">{r.title}</span>
              </div>
            </td>
            <td className={tdCls}><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-500">{r.type}</span></td>
            <td className={`${tdCls} text-slate-500`}>{r.access}</td>
            <td className={`${tdCls} text-slate-500`}>{r.size}</td>
            <td className={`${tdCls} text-slate-500`}>{r.updatedAt}</td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}
