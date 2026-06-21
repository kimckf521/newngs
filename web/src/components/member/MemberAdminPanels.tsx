'use client';

import { useState, type ReactNode } from 'react';
import { GlassCard, GradientText } from '@/components/redesign-v1/ui';
import { MemberSidebar } from './MemberPanels';
import type { MemberContent, AdminPage } from './memberContent';
import type { AdminContent, AdminField } from './memberAdminContent';

/* ------------------------------------------------------------------ *
 * The nine sidebar pages, mirroring the live LMS, in the NGS theme.
 * All data is sample (see memberAdminContent). Presentational only.
 * ------------------------------------------------------------------ */

const primaryBtn = 'rounded-full bg-ngs-gradient px-4 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5';
const glassBtn = 'rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white';
const dangerBtn = 'rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20';

function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{children}</h1>;
}

function TabBar({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(i)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            i === active ? 'bg-ngs-gradient text-white' : 'border border-white/15 bg-white/[0.04] text-white/70 hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ---- College Management (settings form) --------------------------- */
function FieldControl({ f }: { f: AdminField }) {
  const base = 'w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10';
  return (
    <label className={`block ${f.full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-xs font-medium text-white/55">{f.label}</span>
      {f.type === 'select' ? (
        <select className={`${base} appearance-none`} defaultValue={f.value}>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o} className="bg-night text-white">{o}</option>
          ))}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea rows={3} className={`${base} resize-y`} defaultValue={f.value} />
      ) : f.type === 'file' ? (
        <span className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white">Choose file</span>
          <span className="truncate text-white/55">{f.value || '—'}</span>
        </span>
      ) : (
        <input type="text" className={base} defaultValue={f.value} placeholder={f.label} />
      )}
      {f.hint && <span className="mt-1 block text-[11px] leading-snug text-white/40">{f.hint}</span>}
    </label>
  );
}

function CollegeManagementPage({ a }: { a: AdminContent }) {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <PageTitle>{a.pageTitles.collegeManagement}</PageTitle>
      <div className="mt-6 space-y-5">
        {a.collegeManagement.groups.map((g) => (
          <GlassCard key={g.heading} className="p-6">
            <h2 className="font-grotesk text-base font-bold text-white">{g.heading}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.fields.map((f) => (
                <FieldControl key={f.label} f={f} />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={() => setSaved(true)} className="rounded-xl bg-ngs-gradient px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">
          {a.collegeManagement.save}
        </button>
        {saved && <span className="text-xs text-ngs-cyan">{a.common.save} ✓ (demo)</span>}
      </div>
    </div>
  );
}

/* ---- Licence Management ------------------------------------------- */
function LicencePage({ a }: { a: AdminContent }) {
  const [tab, setTab] = useState(0);
  const L = a.licence;
  return (
    <div>
      <div className="mb-5"><TabBar tabs={L.tabs} active={tab} onSelect={setTab} /></div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>{a.pageTitles.licence}</PageTitle>
        <button type="button" className={primaryBtn}>{L.order}</button>
      </div>
      <p className="mt-2 text-sm text-white/55">{L.intro}</p>
      {tab === 0 ? (
        <GlassCard className="mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.1em] text-white/45">
                  {L.headers.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {L.rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-4 text-white/85">{r.course}</td>
                    <td className="px-5 py-4 text-white/70">{r.qty}</td>
                    <td className="px-5 py-4 text-white/70">{r.used}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-white/85">{r.code}</span>
                      <button type="button" className="mt-0.5 block text-[11px] text-ngs-cyan hover:opacity-80">{L.copy}</button>
                    </td>
                    <td className="px-5 py-4 text-white/60">{r.date}</td>
                    <td className="px-5 py-4 text-right"><button type="button" className={glassBtn}>{a.common.view}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="mt-5 flex items-center gap-4 p-8">
          <span className="font-grotesk text-4xl font-bold"><GradientText>46</GradientText></span>
          <span className="text-sm text-white/60">{L.tabs[1]}</span>
        </GlassCard>
      )}
    </div>
  );
}

/* ---- Teachers ----------------------------------------------------- */
function TeachersPage({ a }: { a: AdminContent }) {
  const T = a.teachers;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>{a.pageTitles.teachers}</PageTitle>
        <button type="button" className={primaryBtn}>{T.add}</button>
      </div>
      <GlassCard className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.1em] text-white/45">
                {T.headers.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {T.rows.map((r, i) => (
                <tr key={i} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 font-semibold text-white">{r.name}</td>
                  <td className="px-5 py-4 text-white/70">{r.email}</td>
                  <td className="px-5 py-4 text-white/60">{r.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {r.classrooms.length === 0 ? <span className="text-white/30">—</span> : r.classrooms.map((c) => (
                        <span key={c} className="rounded-full bg-ngs-gradient-soft px-2.5 py-0.5 text-[11px] text-white ring-1 ring-white/10">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={glassBtn}>{a.common.edit}</button>
                      <button type="button" className={dangerBtn}>{a.common.delete}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ---- Classrooms --------------------------------------------------- */
function ClassroomsPage({ a }: { a: AdminContent }) {
  const C = a.classrooms;
  return (
    <div>
      <PageTitle>{a.pageTitles.classrooms}</PageTitle>
      <GlassCard className="mt-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10" placeholder={C.newPlaceholder} />
          <select defaultValue="" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm text-white outline-none focus:border-ngs-violet sm:w-56">
            <option value="" disabled className="bg-night">{C.selectTeacher}</option>
            {C.teachers.map((tch) => <option key={tch} className="bg-night">{tch}</option>)}
          </select>
          <button type="button" className="h-11 shrink-0 rounded-xl bg-ngs-gradient px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">{a.common.submit}</button>
        </div>
      </GlassCard>
      <div className="mt-5 space-y-3">
        {C.rows.map((name) => (
          <GlassCard key={name} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-grotesk font-semibold text-white">{name}</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={glassBtn}>{a.common.edit}</button>
              <button type="button" className={glassBtn}>{C.students}</button>
              <button type="button" className={glassBtn}>{C.courses}</button>
              <button type="button" className={glassBtn}>{C.resources}</button>
              <button type="button" className={dangerBtn}>{a.common.delete}</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ---- Assignments -------------------------------------------------- */
function AssignmentsPage({ a }: { a: AdminContent }) {
  const A = a.assignments;
  const inputCls = 'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ngs-violet';
  return (
    <div>
      <PageTitle>{a.pageTitles.assignments}</PageTitle>
      <GlassCard className="mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-white/60">
            {A.perPage}
            <select className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white focus:border-ngs-violet">
              <option className="bg-night">10</option><option className="bg-night">20</option><option className="bg-night">50</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button type="button" className={glassBtn}>{a.common.reset}</button>
            <button type="button" className={primaryBtn}>{a.common.search}</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.1em] text-white/45">
                {A.headers.map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 w-20"><input className={inputCls} /></td>
                <td className="px-2 py-2"><input className={inputCls} /></td>
                <td className="px-2 py-2"><input className={inputCls} /></td>
                <td className="px-2 py-2"><input className={inputCls} /></td>
                <td className="px-2 py-2 w-40">
                  <select className={inputCls}>
                    {A.statuses.map((s) => <option key={s} className="bg-night">{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-center text-sm text-white/40">{A.empty}</p>
      </GlassCard>
    </div>
  );
}

/* ---- Resource panels (Resource Management + Resources) ------------ */
function ResourceTabs({ tabs, empty }: { tabs: string[]; empty: string }) {
  const [tab, setTab] = useState(0);
  return (
    <GlassCard className="mt-5 p-5">
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <p className="mt-8 text-center text-sm text-white/40">{empty}</p>
    </GlassCard>
  );
}

function ResourceMgmtPage({ a }: { a: AdminContent }) {
  const R = a.resourceMgmt;
  const base = 'w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10';
  return (
    <div>
      <PageTitle>{a.pageTitles.resourceMgmt}</PageTitle>
      <GlassCard className="mt-5 p-6">
        <h2 className="font-grotesk text-base font-bold text-white">{R.addHeading}</h2>
        <div className="mt-4 grid gap-4 sm:max-w-lg">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/55">{R.fileName}</span>
            <input className={base} placeholder={R.fileNamePlaceholder} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/55">{R.resourceType}</span>
            <select className={`${base} appearance-none`}>{R.types.map((t) => <option key={t} className="bg-night">{t}</option>)}</select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/55">{R.fileLabel}</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-white/55">
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white">Choose file</span>—
            </span>
          </label>
          <div><button type="button" className="rounded-xl bg-ngs-gradient px-7 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">{R.add}</button></div>
        </div>
      </GlassCard>
      <ResourceTabs tabs={R.tabs} empty={R.empty} />
    </div>
  );
}

function ResourcesPage({ a }: { a: AdminContent }) {
  return (
    <div>
      <PageTitle>{a.pageTitles.resources}</PageTitle>
      <ResourceTabs tabs={a.resources.tabs} empty={a.resources.empty} />
    </div>
  );
}

/* ---- College Info (read-only) ------------------------------------- */
function CollegeInfoPage({ a }: { a: AdminContent }) {
  const I = a.collegeInfo;
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] py-4 last:border-0 sm:flex-row sm:gap-6">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-white/45">{label}</span>
      <span className="text-sm text-white/85">{value}</span>
    </div>
  );
  return (
    <div>
      <PageTitle>{I.heading}</PageTitle>
      <GlassCard className="mt-5 px-6 py-2">
        <Row label={I.email} value={I.emailVal} />
        <Row label={I.phone} value={I.phoneVal} />
        <Row label={I.address} value={I.addressVal} />
      </GlassCard>
      <GlassCard className="mt-5 p-6">
        <h2 className="font-grotesk text-base font-bold text-white">{I.aboutHeading}</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">
          {I.about.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <h2 className="mt-6 font-grotesk text-base font-bold text-white">{I.servicesHeading}</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-white/70">
          {I.services.map((s) => (
            <li key={s} className="flex items-start gap-2.5"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />{s}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

/* ---- Apply Licence ------------------------------------------------ */
function ApplyLicencePage({ a }: { a: AdminContent }) {
  const P = a.applyLicence;
  const [code, setCode] = useState('');
  return (
    <div>
      <PageTitle>{a.pageTitles.applyLicence}</PageTitle>
      <p className="mt-2 text-sm text-white/55">{P.intro}</p>
      <GlassCard className="mt-5 p-6">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/55">{P.codeLabel}</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={P.codePlaceholder} className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10" />
        </label>
        <div className="mt-4 flex justify-end">
          <button type="button" className="rounded-xl bg-ngs-gradient px-7 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">{P.apply}</button>
        </div>
      </GlassCard>
      <GlassCard className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.1em] text-white/45">
                {P.headers.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {P.rows.map((r, i) => (
                <tr key={i} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 text-white/85">{r.course}</td>
                  <td className="px-5 py-4 font-mono text-white/70">{r.code}</td>
                  <td className="px-5 py-4 text-white/60">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ================================================================== *
 * Wrapper: sidebar + the active page
 * ================================================================== */
export function AdminPanel({
  t,
  a,
  page,
  onNavigate,
  onLogout,
}: {
  t: MemberContent;
  a: AdminContent;
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
}) {
  let inner: ReactNode;
  switch (page) {
    case 'collegeManagement': inner = <CollegeManagementPage a={a} />; break;
    case 'licence': inner = <LicencePage a={a} />; break;
    case 'teachers': inner = <TeachersPage a={a} />; break;
    case 'classrooms': inner = <ClassroomsPage a={a} />; break;
    case 'assignments': inner = <AssignmentsPage a={a} />; break;
    case 'resourceMgmt': inner = <ResourceMgmtPage a={a} />; break;
    case 'collegeInfo': inner = <CollegeInfoPage a={a} />; break;
    case 'applyLicence': inner = <ApplyLicencePage a={a} />; break;
    case 'resources': inner = <ResourcesPage a={a} />; break;
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[clamp(220px,22vw,272px)_1fr]">
      <MemberSidebar t={t} onNavigate={onNavigate} onLogout={onLogout} activePage={page} />
      <div className="min-w-0">{inner}</div>
    </div>
  );
}
