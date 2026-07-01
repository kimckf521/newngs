'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, GradientButton } from '@/components/member/design-v1/parts';

/**
 * Admin panel (on the question-bank detail page) to authorise a bank for
 * students: either ALL students, or a whitelist picked from the members list.
 * Talks to /api/question-bank/access; the admin key is shared via localStorage
 * (`ngs-admin-key`, set in the Members console / editor).
 */
type Member = { uid: string; email: string; name: string; role: string };
type Mode = 'all' | 'whitelist';

const L = {
  zh: {
    title: '学生授权',
    sub: '控制哪些学生可以使用这个题库。',
    loading: '加载中…',
    notConfigured: '需要连接数据库后才能设置授权。',
    unauthorized: '请先在「成员」页填入管理密钥。',
    mode: { all: '全体学生可用', whitelist: '仅指定学生' } as Record<Mode, string>,
    searchPh: '搜索学生…',
    noStudents: '暂无学生(等学生注册/登录后会出现在这里)。',
    selectedFmt: (n: number) => `已选 ${n} 名学生`,
    save: '保存授权',
    saving: '保存中…',
    saved: '已保存 ✓',
    failed: '保存失败',
  },
  en: {
    title: 'Student access',
    sub: 'Control which students can use this bank.',
    loading: 'Loading…',
    notConfigured: 'Connect a database to set access.',
    unauthorized: 'Enter the admin key on the Members page first.',
    mode: { all: 'All students', whitelist: 'Specific students only' } as Record<Mode, string>,
    searchPh: 'Search students…',
    noStudents: 'No students yet (they appear here after they sign up / in).',
    selectedFmt: (n: number) => `${n} selected`,
    save: 'Save access',
    saving: 'Saving…',
    saved: 'Saved ✓',
    failed: 'Save failed',
  },
} as const;

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && localStorage.getItem('ngs-admin-key')) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

export function BankAccessPanel({ bankId, locale }: { bankId: string; locale: Locale }) {
  const l = L[locale];
  const [state, setState] = useState<'loading' | 'ok' | 'not_configured' | 'unauthorized'>('loading');
  const [mode, setMode] = useState<Mode>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [students, setStudents] = useState<Member[]>([]);
  const [q, setQ] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const accRes = await fetch(`/api/question-bank/access?id=${encodeURIComponent(bankId)}`, { headers: adminKeyHeaders() });
        if (accRes.status === 401) return active && setState('unauthorized');
        const acc = (await accRes.json().catch(() => null)) as { ok?: boolean; access?: { mode: Mode; students: string[] } } | null;
        if (!acc?.ok) return active && setState('not_configured');
        if (active) {
          setMode(acc.access?.mode === 'whitelist' ? 'whitelist' : 'all');
          setSelected(new Set(acc.access?.students || []));
        }
        const memRes = await fetch('/api/admin/members', { headers: adminKeyHeaders() });
        const mem = (await memRes.json().catch(() => null)) as { ok?: boolean; members?: Member[] } | null;
        if (active && mem?.ok) setStudents((mem.members || []).filter((m) => m.role === 'student'));
        if (active) setState('ok');
      } catch {
        if (active) setState('not_configured');
      }
    })();
    return () => {
      active = false;
    };
  }, [bankId]);

  const toggle = (uid: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(uid)) n.delete(uid);
      else n.add(uid);
      return n;
    });

  async function save() {
    setSaved('saving');
    let ok = false;
    try {
      const res = await fetch('/api/question-bank/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminKeyHeaders() },
        body: JSON.stringify({ id: bankId, mode, students: [...selected] }),
      });
      ok = !!((await res.json().catch(() => ({})))?.ok);
    } catch {
      /* ok stays false */
    }
    setSaved(ok ? 'ok' : 'fail');
    setTimeout(() => setSaved('idle'), 2000);
  }

  const filtered = students.filter((m) => !q || (m.name || '').toLowerCase().includes(q.toLowerCase()) || (m.email || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <Card className="p-5">
      <p className="mb-1 font-grotesk text-sm font-bold text-slate-900">{l.title}</p>
      <p className="mb-3 text-[12px] text-slate-400">{l.sub}</p>

      {state === 'loading' && <p className="text-xs text-slate-400">{l.loading}</p>}
      {state === 'not_configured' && <p className="text-xs text-slate-400">{l.notConfigured}</p>}
      {state === 'unauthorized' && <p className="text-xs text-slate-400">{l.unauthorized}</p>}

      {state === 'ok' && (
        <>
          <div className="space-y-2">
            {(['all', 'whitelist'] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input type="radio" name={`access-${bankId}`} checked={mode === m} onChange={() => setMode(m)} className="h-4 w-4 accent-[#8b2fd6]" />
                {l.mode[m]}
              </label>
            ))}
          </div>

          {mode === 'whitelist' && (
            <div className="mt-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={l.searchPh}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-ngs-violet/60"
              />
              <div className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {filtered.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400">{l.noStudents}</p>
                ) : (
                  filtered.map((m) => (
                    <label key={m.uid} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <input type="checkbox" checked={selected.has(m.uid)} onChange={() => toggle(m.uid)} className="h-4 w-4 accent-[#8b2fd6]" />
                      <span className="min-w-0 flex-1 truncate">{m.name || m.email || m.uid}</span>
                      {m.email && <span className="shrink-0 text-[11px] text-slate-400">{m.email}</span>}
                    </label>
                  ))
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">{l.selectedFmt(selected.size)}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <GradientButton onClick={save}>{saved === 'saving' ? l.saving : l.save}</GradientButton>
            {saved === 'ok' && <span className="text-xs font-medium text-emerald-500">{l.saved}</span>}
            {saved === 'fail' && <span className="text-xs font-medium text-rose-500">{l.failed}</span>}
          </div>
        </>
      )}
    </Card>
  );
}
