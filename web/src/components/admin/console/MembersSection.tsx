'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card } from '@/components/member/design-v1/parts';
import { initials } from '@/lib/demoAuth';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles';
import { adminConsoleContent } from './adminConsole.content';

type LoginVia = 'wechat' | 'email' | 'phone' | 'account' | 'other';
type LinkedAccount = { uid: string; email: string; phone: string; loginVia: LoginVia };
type MemberRow = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  loginVia: LoginVia;
  lastLogin: string;
  linked?: LinkedAccount[];
};
type State = 'loading' | 'ok' | 'not_configured' | 'unauthorized';

/** WeChat stands out (emerald) since most CN users sign in with it. */
const viaCls = (v: LoginVia) => (v === 'wechat' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500');

export function MembersSection({ locale }: { locale: Locale }) {
  const t = adminConsoleContent[locale];
  const [key, setKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [state, setState] = useState<State>('loading');
  const [me, setMe] = useState<MemberRow | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  // A role change selected in the dropdown, awaiting double-confirmation.
  const [pending, setPending] = useState<{ uid: string; name: string; from: Role; to: Role } | null>(null);
  // Merge flow: rows ticked for merging, and the open merge dialog (with the
  // chosen primary uid).
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merge, setMerge] = useState<{ primaryUid: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const k = localStorage.getItem('ngs-admin-key') || '';
      setKey(k);
      setKeyInput(k);
    } catch {
      /* ignore */
    }
    void getCurrentUser().then((u) => {
      if (u) setMe({ uid: u.uid || '', email: u.email, name: u.name, phone: '', role: u.role, loginVia: u.email ? 'email' : 'other', lastLogin: '' });
    });
  }, []);

  const load = useCallback(async (k: string) => {
    setState('loading');
    try {
      const res = await fetch('/api/admin/members', { headers: k ? { 'x-admin-key': k } : {} });
      if (res.status === 401) return setState('unauthorized');
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setMembers(data.members || []);
        return setState('ok');
      }
      return setState('not_configured');
    } catch {
      setState('not_configured');
    }
  }, []);

  useEffect(() => {
    void load(key);
  }, [key, load]);

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2400);
  };

  async function changeRole(uid: string, role: Role) {
    const prev = members.find((m) => m.uid === uid)?.role;
    setMembers((ms) => ms.map((m) => (m.uid === uid ? { ...m, role } : m))); // optimistic
    let ok = false;
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'x-admin-key': key } : {}) },
        body: JSON.stringify({ uid, role }),
      });
      ok = !!(await res.json().catch(() => ({})))?.ok;
    } catch {
      /* ok stays false */
    }
    // Revert the optimistic change if the server didn't persist it.
    if (!ok && prev !== undefined) {
      setMembers((ms) => ms.map((m) => (m.uid === uid ? { ...m, role: prev } : m)));
    }
    flash(ok ? t.members.updated : t.members.updateFailed, ok);
  }

  /** Dropdown change → stage a pending change + open the confirm dialog. The
   *  select stays controlled by m.role, so it visually reverts until confirmed. */
  function requestRoleChange(m: MemberRow, role: Role) {
    if (role === m.role) return;
    setPending({ uid: m.uid, name: m.name || m.email || m.uid, from: m.role, to: role });
  }

  async function confirmPending() {
    if (!pending) return;
    const { uid, to } = pending;
    setPending(null);
    await changeRole(uid, to);
  }

  function toggleSelect(uid: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  const selectedRows = members.filter((m) => selected.has(m.uid));

  async function confirmMerge() {
    if (!merge || selectedRows.length < 2) return;
    const primaryUid = merge.primaryUid;
    const secondaryUids = selectedRows.map((m) => m.uid).filter((u) => u !== primaryUid);
    setMerge(null);
    setBusy(true);
    let ok = false;
    try {
      const res = await fetch('/api/admin/members/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'x-admin-key': key } : {}) },
        body: JSON.stringify({ primaryUid, secondaryUids }),
      });
      ok = !!(await res.json().catch(() => ({})))?.ok;
    } catch {
      /* ok stays false */
    }
    setBusy(false);
    flash(ok ? t.members.merge.done : t.members.merge.failed, ok);
    if (ok) {
      setSelected(new Set());
      await load(key);
    }
  }

  async function unlink(uid: string) {
    setBusy(true);
    let ok = false;
    try {
      const res = await fetch('/api/admin/members/link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'x-admin-key': key } : {}) },
        body: JSON.stringify({ uid }),
      });
      ok = !!(await res.json().catch(() => ({})))?.ok;
    } catch {
      /* ok stays false */
    }
    setBusy(false);
    flash(ok ? t.members.merge.unlinkDone : t.members.merge.failed, ok);
    if (ok) await load(key);
  }

  function saveKey() {
    try {
      localStorage.setItem('ngs-admin-key', keyInput);
    } catch {
      /* ignore */
    }
    setKey(keyInput);
  }

  const rows: MemberRow[] = state === 'ok' ? members : me ? [me] : [];
  const canMerge = state === 'ok';
  const colSpan = canMerge ? 6 : 5;

  const contactOf = (m: { email: string; phone: string }) => m.email || m.phone || '—';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-grotesk text-2xl font-bold text-slate-900">{t.members.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.members.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={t.members.keyPh}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-ngs-violet/60"
          />
          <button type="button" onClick={saveKey} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            {t.members.keySet}
          </button>
        </div>
      </div>

      {state === 'not_configured' && (
        <Card className="p-5">
          <p className="font-grotesk text-sm font-bold text-slate-900">{t.members.notConfigured}</p>
          <p className="mt-1.5 text-sm text-slate-500">{t.members.notConfiguredHint}</p>
        </Card>
      )}
      {state === 'unauthorized' && <Card className="p-5 text-sm text-slate-500">{t.members.unauthorized}</Card>}

      {/* Merge action bar — appears once 2+ rows are ticked. */}
      {canMerge && (
        <div className="flex min-h-[20px] items-center gap-3">
          {selected.size >= 1 ? (
            <>
              <span className="text-sm text-slate-500">{selected.size}</span>
              <button
                type="button"
                disabled={selected.size < 2 || busy}
                onClick={() => setMerge({ primaryUid: selectedRows[0]?.uid || '' })}
                className="rounded-xl bg-ngs-gradient px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(236,28,139,0.7)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.members.merge.action(selected.size)}
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="text-sm font-medium text-slate-400 hover:text-slate-600">
                {t.members.merge.cancel}
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400">{t.members.merge.hint}</p>
          )}
        </div>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[12px] uppercase tracking-wide text-slate-400">
              {canMerge && <th className="w-10 px-5 py-3" />}
              <th className="px-5 py-3 font-semibold">{t.members.th.member}</th>
              <th className="px-5 py-3 font-semibold">{t.members.th.login}</th>
              <th className="px-5 py-3 font-semibold">{t.members.th.contact}</th>
              <th className="hidden px-5 py-3 font-semibold md:table-cell">{t.members.th.lastLogin}</th>
              <th className="px-5 py-3 font-semibold">{t.members.th.role}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.uid || m.email} className="border-b border-slate-50 last:border-0">
                {canMerge && (
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(m.uid)}
                      onChange={() => toggleSelect(m.uid)}
                      aria-label="Select for merge"
                      className="h-4 w-4 rounded border-slate-300 text-ngs-violet focus:ring-ngs-violet/40"
                    />
                  </td>
                )}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ngs-gradient text-xs font-bold text-white">
                      {initials(m.name || m.email || '?')}
                    </span>
                    <span className="font-medium text-slate-900">
                      {m.name || '—'}
                      {me && m.uid === me.uid && <span className="ml-2 text-[11px] text-slate-400">({t.members.you})</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${viaCls(m.loginVia)}`}>{t.members.via[m.loginVia]}</span>
                    {m.linked?.map((l) => (
                      <span key={l.uid} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${viaCls(l.loginVia)}`}>
                        {t.members.via[l.loginVia]}
                        {canMerge && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => unlink(l.uid)}
                            title={t.members.merge.unlink}
                            className="-mr-0.5 grid h-3.5 w-3.5 place-items-center rounded-full text-current/70 hover:bg-black/10"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {contactOf(m)}
                  {m.linked?.filter((l) => l.email || l.phone).map((l) => (
                    <span key={l.uid} className="block text-[12px] text-slate-400">
                      {l.email || l.phone}
                    </span>
                  ))}
                </td>
                <td className="hidden px-5 py-3 text-xs text-slate-400 md:table-cell">{m.lastLogin || '—'}</td>
                <td className="px-5 py-3">
                  {state === 'ok' ? (
                    <select
                      value={m.role}
                      onChange={(e) => requestRoleChange(m, e.target.value as Role)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-ngs-violet/60"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[locale][r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-semibold text-slate-500">{ROLE_LABELS[locale][m.role]}</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-slate-400">
                  {state === 'loading' ? t.members.loading : '—'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {toast && <p className={`text-sm font-medium ${toast.ok ? 'text-emerald-600' : 'text-rose-500'}`}>{toast.msg}</p>}

      {/* Role-change confirmation. */}
      {pending && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPending(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <h2 className="font-grotesk text-lg font-bold text-slate-900">{t.members.confirm.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t.members.confirm.body(pending.name, ROLE_LABELS[locale][pending.from], ROLE_LABELS[locale][pending.to])}
            </p>
            {pending.to === 'admin' && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200">
                ⚠️ {t.members.confirm.adminWarn}
              </p>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t.members.confirm.cancel}
              </button>
              <button
                type="button"
                onClick={confirmPending}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${pending.to === 'admin' ? 'bg-rose-600' : 'bg-ngs-gradient'}`}
              >
                {t.members.confirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge confirmation — pick the primary, then link. */}
      {merge && selectedRows.length >= 2 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setMerge(null)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="font-grotesk text-lg font-bold text-slate-900">{t.members.merge.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.members.merge.body}</p>
            <div className="mt-4 space-y-2">
              {selectedRows.map((m) => (
                <label
                  key={m.uid}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                    merge.primaryUid === m.uid ? 'border-ngs-violet/60 bg-ngs-violet/5' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="mergePrimary"
                    checked={merge.primaryUid === m.uid}
                    onChange={() => setMerge({ primaryUid: m.uid })}
                    className="h-4 w-4 text-ngs-violet focus:ring-ngs-violet/40"
                  />
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ngs-gradient text-[11px] font-bold text-white">{initials(m.name || m.email || '?')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{m.name || contactOf(m)}</span>
                    <span className="block truncate text-[12px] text-slate-400">
                      {t.members.via[m.loginVia]} · {contactOf(m)}
                    </span>
                  </span>
                  {merge.primaryUid === m.uid && <span className="rounded-full bg-ngs-violet/10 px-2 py-0.5 text-[11px] font-semibold text-ngs-violet">{t.members.merge.primary}</span>}
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setMerge(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                {t.members.merge.cancel}
              </button>
              <button type="button" disabled={busy || !merge.primaryUid} onClick={confirmMerge} className="rounded-xl bg-ngs-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                {t.members.merge.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
