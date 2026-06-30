'use client';

import { useEffect, useState } from 'react';
import { listVersions, getVersionData, type VersionKind, type VersionMeta } from '@/lib/versions/client';

/**
 * Google-Docs-style version history drawer. Lists auto-saved snapshots (newest
 * first) with timestamp + author, and lets the user restore an older one.
 * Styled with light utility classes PLUS `dark:` variants so it renders
 * correctly both inside the console's `.dv1-dark` CSS scope (CourseEditPage)
 * and inside a Tailwind `.dark` wrapper (ModuleContentEditor).
 */

type Lang = 'en' | 'zh';

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Version history',
    current: 'Current',
    restore: 'Restore this version',
    restoring: 'Restoring…',
    empty: 'No saved versions yet. A version is backed up automatically every time you save.',
    note: 'Restoring keeps your history — it saves the old version as a new current one.',
    close: 'Close',
    loading: 'Loading…',
  },
  zh: {
    title: '版本历史',
    current: '当前版本',
    restore: '恢复此版本',
    restoring: '恢复中…',
    empty: '暂无历史版本。每次保存都会自动备份一个版本。',
    note: '恢复不会清除历史——它会把旧版本另存为新的当前版本。',
    close: '关闭',
    loading: '加载中…',
  },
};

function fmt(ms: number, lang: Lang): string {
  try {
    return new Date(ms).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function VersionHistoryPanel({
  kind,
  refId,
  lang,
  onRestore,
  onClose,
}: {
  kind: VersionKind;
  refId: string;
  lang: Lang;
  onRestore: (data: unknown) => void | Promise<void>;
  onClose: () => void;
}) {
  const t = T[lang];
  const [versions, setVersions] = useState<VersionMeta[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void listVersions(kind, refId).then((v) => { if (active) setVersions(v); });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { active = false; window.removeEventListener('keydown', onKey); };
  }, [kind, refId, onClose]);

  async function restore(id: string) {
    setBusy(id);
    try {
      const data = await getVersionData(kind, refId, id);
      if (data != null) await onRestore(data);
    } finally {
      setBusy(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-night-800"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="font-grotesk text-base font-bold text-slate-900 dark:text-white">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {versions === null ? (
            <p className="p-6 text-center text-sm text-slate-400">{t.loading}</p>
          ) : versions.length === 0 ? (
            <p className="p-6 text-center text-sm leading-relaxed text-slate-400 dark:text-slate-500">{t.empty}</p>
          ) : (
            <>
              <p className="mb-2 px-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">{t.note}</p>
              <ol className="space-y-1.5">
                {versions.map((v, i) => (
                  <li key={v.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmt(v.savedAt, lang)}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {t.current}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-ngs-violet/70" />
                      {v.savedBy || '—'}
                    </p>
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => restore(v.id)}
                        disabled={busy !== null}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-ngs-violet/50 hover:text-ngs-violet disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:text-ngs-violet"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /></svg>
                        {busy === v.id ? t.restoring : t.restore}
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
