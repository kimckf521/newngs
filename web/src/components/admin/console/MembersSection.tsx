'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card } from '@/components/member/design-v1/parts';
import { initials } from '@/lib/demoAuth';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles';
import { adminConsoleContent } from './adminConsole.content';

type MemberRow = { uid: string; email: string; name: string; role: Role };
type State = 'loading' | 'ok' | 'not_configured' | 'unauthorized';

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

  useEffect(() => {
    try {
      const k = localStorage.getItem('ngs-admin-key') || '';
      setKey(k);
      setKeyInput(k);
    } catch {
      /* ignore */
    }
    void getCurrentUser().then((u) => {
      if (u) setMe({ uid: u.uid || '', email: u.email, name: u.name, role: u.role });
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
    setToast({ msg: ok ? t.members.updated : t.members.updateFailed, ok });
    setTimeout(() => setToast(null), 2200);
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

  function saveKey() {
    try {
      localStorage.setItem('ngs-admin-key', keyInput);
    } catch {
      /* ignore */
    }
    setKey(keyInput);
  }

  const rows: MemberRow[] = state === 'ok' ? members : me ? [me] : [];

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

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-semibold">{t.members.th.member}</th>
              <th className="px-5 py-3 font-semibold">{t.members.th.email}</th>
              <th className="px-5 py-3 font-semibold">{t.members.th.role}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.uid || m.email} className="border-b border-slate-50 last:border-0">
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
                <td className="px-5 py-3 text-slate-500">{m.email || '—'}</td>
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
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">
                  {state === 'loading' ? t.members.loading : '—'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {toast && <p className={`text-sm font-medium ${toast.ok ? 'text-emerald-600' : 'text-rose-500'}`}>{toast.msg}</p>}

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
    </div>
  );
}
