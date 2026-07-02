'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card } from '@/components/member/design-v1/parts';

/**
 * 听力音频 — bulk listening-audio uploader for the IELTS bank.
 *
 * The user picks the folder(s) of Cambridge audio (one "IELTS N" folder per
 * book, four whole-test files inside). Files are mapped book+test from their
 * path/name, uploaded to CloudBase COS with a real per-file progress bar (XHR),
 * and can be removed mid-flight or deleted once stored. IELTS 12's files are
 * named test5–test8 but map to Test 1–4.
 */

const KEY_LS = 'ngs-admin-key';
function adminKey(): string {
  try { return (typeof window !== 'undefined' && localStorage.getItem(KEY_LS)) || ''; } catch { return ''; }
}

const BOOKS = Array.from({ length: 21 }, (_, i) => i + 1);
const TESTS = [1, 2, 3, 4];
const MP3_RE = /\.mp3$/i; // only MP3 is accepted
const LOOSE_AUDIO_RE = /\.(mp3|m4a|wav|aac|ogg|mp4|m4b|flac|wma)$/i; // for "skipped non-MP3" counting

type QState = 'pending' | 'uploading' | 'done' | 'error';
type QItem = { id: string; file: File; book: number; test: number; ext: string; name: string; progress: number; state: QState; error?: string };

/** Map one picked file to its book+test, or null if it doesn't fit the scheme. */
/** The path we key parsing off: folder-picker path, our drop-traversal path, or bare name. */
function relPathOf(f: File): string {
  const x = f as File & { _relPath?: string; webkitRelativePath?: string };
  return x._relPath || x.webkitRelativePath || f.name;
}

/** Recursively read a dropped FileSystemEntry tree into File[] tagged with `_relPath`. */
async function walkEntry(entry: FileSystemEntry, prefix: string, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File | null>((res) => (entry as FileSystemFileEntry).file(res, () => res(null)));
    if (file) { (file as File & { _relPath?: string })._relPath = prefix + entry.name; out.push(file); }
  } else if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: FileSystemEntry[] = [];
    // readEntries returns in batches; keep calling until it yields none.
    await new Promise<void>((resolve) => {
      const read = () => reader.readEntries((batch) => { if (!batch.length) return resolve(); all.push(...batch); read(); }, () => resolve());
      read();
    });
    for (const child of all) await walkEntry(child, `${prefix + entry.name}/`, out);
  }
}

/** Extract File[] from a drop — traverses dropped folders; falls back to plain files.
 *  Entries MUST be captured synchronously (done here before the first await). */
async function filesFromDrop(dt: DataTransfer): Promise<File[]> {
  const entries = Array.from(dt.items || [])
    .map((it) => (it.webkitGetAsEntry ? it.webkitGetAsEntry() : null))
    .filter((e): e is FileSystemEntry => !!e);
  if (!entries.length) return Array.from(dt.files || []);
  const out: File[] = [];
  await Promise.all(entries.map((e) => walkEntry(e, '', out)));
  return out;
}

function parseTarget(f: File): { book: number; test: number; ext: string } | null {
  const rel = relPathOf(f);
  if (!MP3_RE.test(rel)) return null;
  const segs = String(rel).split('/');
  let book = 0;
  for (const s of segs) { const m = s.match(/IELTS\s*0*(\d+)/i); if (m) book = Number(m[1]); }
  const base = segs[segs.length - 1];
  const sm = base.match(/test\s*0*(\d+)/i);
  if (!book || !sm) return null;
  const src = Number(sm[1]);
  const test = book === 12 ? src - 4 : src; // book 12 files are test5–test8 → Test 1–4
  const ext = (base.split('.').pop() || 'mp3').toLowerCase();
  if (book < 1 || book > 21 || test < 1 || test > 4) return null;
  return { book, test, ext };
}

const L = {
  zh: {
    title: '听力音频', desc: '上传每本书的四套听力音频（每个「IELTS N」文件夹含 4 个整套音频，对应 4 套 Test）。上传后即接入学生端听力练习。',
    choose: '选择文件夹', hint: '选择包含各「IELTS N」文件夹的上级目录，或单个书目文件夹。', queue: '待上传', uploadAll: '全部上传', clear: '清空',
    uploading: '上传中', done: '已完成', error: '失败', remove: '移除', uploaded: '已上传音频', del: '删除', none: '暂无', book: '书目', unmatched: '个文件无法识别（跳过）',
    needFolder: '未找到可识别的 MP3（文件名需包含 test1–4，文件夹名含 IELTS N）。',
    play: '试听', stop: '停止', part: '部分', upload: '上传', replace: '替换', onlyMp3: '仅支持 MP3', notMp3: '不是 MP3，已跳过', singleHint: '也可点表格里某套的 ↑ 单独上传一个 MP3。',
    dropHere: '把文件夹拖到这里上传', dropCell: '拖放 MP3 到此', processing: '上传至云端…',
    confirmTitle: '删除听力音频',
    confirmBodyOne: (book: number, tt: number) => `确定删除 IELTS ${book} · Test ${tt} 的听力音频吗？此操作无法撤销。`,
    confirmBodyMany: (n: number) => `确定删除选中的 ${n} 套听力音频吗？此操作无法撤销。`,
    cancel: '取消', deleting: '删除中…',
    select: '选择', selectAll: '全选', clearSelection: '取消选择', selectedCount: (n: number) => `已选 ${n} 项`, deleteSelected: '删除所选',
  },
  en: {
    title: 'Listening audio', desc: 'Upload each book’s four listening recordings (one "IELTS N" folder with 4 whole-test files → 4 Tests). Wired straight into student listening practice.',
    choose: 'Choose folders', hint: 'Pick the parent folder of the "IELTS N" folders, or a single book folder.', queue: 'Queue', uploadAll: 'Upload all', clear: 'Clear',
    uploading: 'Uploading', done: 'Done', error: 'Failed', remove: 'Remove', uploaded: 'Uploaded audio', del: 'Delete', none: 'None yet', book: 'Book', unmatched: 'file(s) not recognized (skipped)',
    needFolder: 'No MP3s found (files must contain test1–4, folders named IELTS N).',
    play: 'Play', stop: 'Stop', part: 'Part', upload: 'Upload', replace: 'Replace', onlyMp3: 'MP3 only', notMp3: 'not an MP3, skipped', singleHint: 'Or click a test’s ↑ in the table to upload one MP3.',
    dropHere: 'Drag a folder here to upload', dropCell: 'Drop MP3 here', processing: 'Uploading to cloud…',
    confirmTitle: 'Delete listening audio',
    confirmBodyOne: (book: number, tt: number) => `Delete the listening audio for IELTS ${book} · Test ${tt}? This can’t be undone.`,
    confirmBodyMany: (n: number) => `Delete the ${n} selected listening audio files? This can’t be undone.`,
    cancel: 'Cancel', deleting: 'Deleting…',
    select: 'Select', selectAll: 'Select all', clearSelection: 'Clear selection', selectedCount: (n: number) => `${n} selected`, deleteSelected: 'Delete selected',
  },
} as const;

export function AudioUploadPanel({ locale }: { bankId: string; locale: Locale }) {
  const t = L[locale];
  const [queue, setQueue] = useState<QItem[]>([]);
  const [status, setStatus] = useState<Record<string, Record<string, number>>>({});
  const [busy, setBusy] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [player, setPlayer] = useState<{ book: number; test: number; urls: string[]; idx: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const singleRef = useRef<HTMLInputElement>(null);
  const singleTarget = useRef<{ book: number; test: number } | null>(null);
  const xhrs = useRef<Record<string, XMLHttpRequest>>({});

  // webkitdirectory isn't a standard React attribute — set it on the element.
  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.setAttribute('webkitdirectory', ''); el.setAttribute('directory', ''); }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ielts/audio/status', { headers: adminKey() ? { 'x-admin-key': adminKey() } : {} });
      const d = (await res.json().catch(() => null)) as { ok?: boolean; books?: Record<string, Record<string, number>> } | null;
      if (d?.ok) setStatus(d.books || {});
    } catch { /* leave as-is */ }
  }, []);
  useEffect(() => { void loadStatus(); }, [loadStatus]);

  // Parse a batch of files (from the picker or a drop) into the queue.
  const ingest = useCallback((files: File[]) => {
    let skip = 0;
    const parsed: QItem[] = [];
    for (const f of files) {
      const tgt = parseTarget(f);
      if (!tgt) { if (LOOSE_AUDIO_RE.test(relPathOf(f))) skip += 1; continue; }
      parsed.push({ id: `${tgt.book}|${tgt.test}`, file: f, book: tgt.book, test: tgt.test, ext: tgt.ext, name: f.name, progress: 0, state: 'pending' });
    }
    setSkipped(skip);
    // Dedupe by book|test (newest pick wins); merge with any existing pending items.
    setQueue((prev) => {
      const byId = new Map<string, QItem>();
      for (const it of prev) if (it.state !== 'done') byId.set(it.id, it);
      for (const it of parsed) byId.set(it.id, it);
      return Array.from(byId.values()).sort((a, b) => a.book - b.book || a.test - b.test);
    });
  }, []);
  const onPick = useCallback((files: FileList | null) => { if (files) ingest(Array.from(files)); }, [ingest]);

  const [dragOver, setDragOver] = useState(false);
  const [dragCell, setDragCell] = useState<string | null>(null);
  const onZoneDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    ingest(await filesFromDrop(e.dataTransfer));
  }, [ingest]);

  const patch = useCallback((id: string, p: Partial<QItem>) => {
    setQueue((q) => q.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  const uploadOne = useCallback((item: QItem) => new Promise<void>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhrs.current[item.id] = xhr;
    xhr.open('POST', `/api/ielts/audio/upload?book=${item.book}&test=${item.test}&ext=${encodeURIComponent(item.ext)}`);
    const k = adminKey();
    if (k) xhr.setRequestHeader('x-admin-key', k);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) patch(item.id, { progress: Math.round((e.loaded / e.total) * 100) }); };
    xhr.onload = () => {
      delete xhrs.current[item.id];
      if (xhr.status >= 200 && xhr.status < 300) {
        patch(item.id, { state: 'done', progress: 100 });
        // Reflect it on the grid immediately (this panel only ever stores a
        // single whole-test file per test) — don't wait on a second round-trip
        // that could be slow/stale; loadStatus() still runs to reconcile.
        setStatus((prev) => ({ ...prev, [String(item.book)]: { ...(prev[String(item.book)] || {}), [String(item.test)]: 1 } }));
        void loadStatus();
      } else {
        patch(item.id, { state: 'error', error: `HTTP ${xhr.status}` });
      }
      resolve();
    };
    xhr.onerror = () => { delete xhrs.current[item.id]; patch(item.id, { state: 'error', error: 'network' }); resolve(); };
    xhr.onabort = () => { delete xhrs.current[item.id]; resolve(); };
    patch(item.id, { state: 'uploading', progress: 0, error: undefined });
    xhr.send(item.file);
  }), [patch, loadStatus]);

  const uploadAll = useCallback(async () => {
    setBusy(true);
    const pending = queue.filter((it) => it.state === 'pending' || it.state === 'error');
    const LIMIT = 3;
    let i = 0;
    const worker = async () => { while (i < pending.length) { const it = pending[i++]; await uploadOne(it); } };
    await Promise.all(Array.from({ length: Math.min(LIMIT, pending.length) }, worker));
    setBusy(false);
  }, [queue, uploadOne]);

  const removeItem = useCallback((id: string) => {
    const xhr = xhrs.current[id];
    if (xhr) { try { xhr.abort(); } catch { /* noop */ } delete xhrs.current[id]; }
    setQueue((q) => q.filter((it) => it.id !== id));
  }, []);

  const [confirmTargets, setConfirmTargets] = useState<{ book: number; test: number }[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const cellKey = (book: number, test: number) => `${book}|${test}`;

  const toggleCell = useCallback((book: number, test: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = cellKey(book, test);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);

  const toggleBookRow = useCallback((book: number) => {
    const keys = TESTS.filter((tt) => status[String(book)]?.[String(tt)]).map((tt) => cellKey(book, tt));
    if (!keys.length) return;
    setSelected((prev) => {
      const allSelected = keys.every((k) => prev.has(k));
      const next = new Set(prev);
      for (const k of keys) { if (allSelected) next.delete(k); else next.add(k); }
      return next;
    });
  }, [status]);

  const selectAll = useCallback(() => {
    const keys: string[] = [];
    for (const book of BOOKS) for (const tt of TESTS) if (status[String(book)]?.[String(tt)]) keys.push(cellKey(book, tt));
    setSelected(new Set(keys));
  }, [status]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const doDelete = useCallback(async (targets: { book: number; test: number }[]) => {
    setDeleting(true);
    await Promise.all(targets.map(async ({ book, test }) => {
      try {
        await fetch('/api/ielts/audio/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(adminKey() ? { 'x-admin-key': adminKey() } : {}) },
          body: JSON.stringify({ book, test }),
        });
        // Reflect the removal immediately, same reasoning as the upload path.
        setStatus((prev) => {
          const bookEntry = { ...(prev[String(book)] || {}) };
          delete bookEntry[String(test)];
          return { ...prev, [String(book)]: bookEntry };
        });
        if (player && player.book === book && player.test === test) setPlayer(null);
      } catch { /* ignore — loadStatus() below reconciles */ }
    }));
    setDeleting(false);
    setConfirmTargets(null);
    setSelected((prev) => {
      const next = new Set(prev);
      for (const { book, test } of targets) next.delete(cellKey(book, test));
      return next;
    });
    void loadStatus();
  }, [loadStatus, player]);

  // Preview: fetch the signed URLs for one test and play its parts in sequence.
  const playTest = useCallback(async (book: number, test: number) => {
    if (player && player.book === book && player.test === test) { setPlayer(null); return; }
    try {
      const res = await fetch(`/api/ielts/audio?book=${book}&test=${test}`);
      const d = (await res.json().catch(() => null)) as { ok?: boolean; parts?: Record<string, string> } | null;
      if (!d?.ok || !d.parts) return;
      const parts = d.parts;
      const keys = Object.keys(parts);
      const ordered = keys.includes('whole') ? ['whole'] : keys.filter((k) => parts[k]).sort((a, b) => Number(a) - Number(b));
      const urls = ordered.map((k) => parts[k]).filter(Boolean);
      if (urls.length) setPlayer({ book, test, urls, idx: 0 });
    } catch { /* ignore */ }
  }, [player]);

  // Upload one MP3 to a specific book+test (from the per-cell ↑ button).
  const uploadSingle = useCallback((book: number, test: number, file: File) => {
    const item: QItem = { id: `${book}|${test}`, file, book, test, ext: 'mp3', name: file.name, progress: 0, state: 'pending' };
    setQueue((prev) => {
      const byId = new Map<string, QItem>();
      for (const it of prev) if (it.state !== 'done') byId.set(it.id, it);
      byId.set(item.id, item);
      return Array.from(byId.values()).sort((a, b) => a.book - b.book || a.test - b.test);
    });
    void uploadOne(item);
  }, [uploadOne]);

  const pickSingle = useCallback((book: number, test: number) => {
    singleTarget.current = { book, test };
    singleRef.current?.click();
  }, []);

  const onSingle = useCallback((files: FileList | null) => {
    const tgt = singleTarget.current;
    singleTarget.current = null;
    const f = files?.[0];
    if (!tgt || !f) return;
    if (!MP3_RE.test(f.name)) { setSkipped(1); return; }
    setSkipped(0);
    uploadSingle(tgt.book, tgt.test, f);
  }, [uploadSingle]);

  // Drop one MP3 onto a specific book+test cell.
  const onCellDrop = useCallback(async (book: number, test: number, e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragCell(null);
    const files = await filesFromDrop(e.dataTransfer);
    const mp3 = files.find((f) => MP3_RE.test(relPathOf(f)));
    if (!mp3) { setSkipped(1); return; }
    setSkipped(0);
    uploadSingle(book, test, mp3);
  }, [uploadSingle]);

  const pendingCount = queue.filter((it) => it.state === 'pending' || it.state === 'error').length;
  const byBook = new Map<number, QItem[]>();
  for (const it of queue) { const a = byBook.get(it.book) || []; a.push(it); byBook.set(it.book, a); }

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => setCollapsed((v) => { if (!v) setPlayer(null); return !v; })}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <span className={`text-[11px] text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}>▼</span>
          <span className="font-grotesk text-sm font-bold text-slate-900">{t.title}</span>
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">MP3</span>
      </button>

      {collapsed ? null : (
      <div className="mt-3">
      <p className="mb-4 text-[13px] leading-relaxed text-slate-500">{t.desc}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-ngs-gradient px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5"
        >
          {t.choose}
        </button>
        {pendingCount > 0 && (
          <>
            <button type="button" disabled={busy} onClick={() => void uploadAll()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
              {t.uploadAll} ({pendingCount})
            </button>
            <button type="button" disabled={busy} onClick={() => setQueue((q) => q.filter((it) => it.state === 'done'))} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40">
              {t.clear}
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={(e) => { onPick(e.target.files); e.currentTarget.value = ''; }}
        />
        {/* single-file input, reused by every per-cell ↑ button */}
        <input
          ref={singleRef}
          type="file"
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={(e) => { onSingle(e.target.files); e.currentTarget.value = ''; }}
        />
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => void onZoneDrop(e)}
        className={`mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center text-[12px] font-semibold transition-colors ${dragOver ? 'border-ngs-violet bg-ngs-violet/5 text-ngs-violet' : 'border-slate-200 text-slate-400'}`}
      >
        <span aria-hidden>⬇</span> {t.dropHere}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{t.hint} {t.singleHint}</p>
      {skipped > 0 && <p className="mt-1 text-[11px] text-amber-600">{skipped} {t.unmatched}</p>}

      {/* upload queue, grouped by book */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-3">
          {Array.from(byBook.keys()).sort((a, b) => a - b).map((book) => (
            <div key={book} className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-xs font-bold text-slate-700">IELTS {book}</p>
              <ul className="space-y-1.5">
                {byBook.get(book)!.sort((a, b) => a.test - b.test).map((it) => (
                  <li key={it.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-14 shrink-0 font-semibold text-slate-500">Test {it.test}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-600" title={it.name}>{it.name}</span>
                    <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${it.state === 'error' ? 'bg-rose-500' : it.state === 'done' ? 'bg-emerald-500' : it.state === 'uploading' && it.progress >= 100 ? 'animate-pulse bg-ngs-gradient' : 'bg-ngs-gradient'}`}
                        style={{ width: `${it.state === 'done' ? 100 : it.progress}%`, transition: 'width 120ms linear' }}
                      />
                    </div>
                    <span className={`w-28 shrink-0 text-right text-[11px] font-semibold ${it.state === 'error' ? 'text-rose-600' : it.state === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {it.state === 'uploading' ? (it.progress >= 100 ? t.processing : `${it.progress}%`) : it.state === 'done' ? t.done : it.state === 'error' ? t.error : '—'}
                    </span>
                    <button type="button" onClick={() => removeItem(it.id)} aria-label={t.remove} className="shrink-0 rounded px-1 text-slate-400 hover:text-rose-600">✕</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* uploaded overview grid — preview, delete, or multi-select any stored test */}
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold text-slate-700">{t.uploaded}</p>
          <button type="button" onClick={selected.size ? clearSelection : selectAll} className="text-[11px] font-semibold text-ngs-violet hover:underline">
            {selected.size ? t.clearSelection : t.selectAll}
          </button>
          {selected.size > 0 && (
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">{t.selectedCount(selected.size)}</span>
              <button
                type="button"
                onClick={() => setConfirmTargets([...selected].map((k) => { const [b, tt] = k.split('|').map(Number); return { book: b, test: tt }; }))}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
              >
                {t.deleteSelected}
              </button>
            </span>
          )}
        </div>
        {player && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <span className="shrink-0 text-[12px] font-bold text-slate-700">
              IELTS {player.book} · Test {player.test}{player.urls.length > 1 ? ` · ${t.part} ${player.idx + 1}/${player.urls.length}` : ''}
            </span>
            <audio
              key={`${player.book}-${player.test}-${player.idx}`}
              src={player.urls[player.idx]}
              autoPlay
              controls
              className="h-8 min-w-0 flex-1"
              onEnded={() => setPlayer((p) => (p && p.idx < p.urls.length - 1 ? { ...p, idx: p.idx + 1 } : null))}
            />
            <button type="button" onClick={() => setPlayer(null)} aria-label={t.stop} title={t.stop} className="shrink-0 rounded px-1 text-slate-400 hover:text-rose-600">✕</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="text-slate-400">
                <th className="p-1 text-left font-semibold">{t.book}</th>
                {TESTS.map((tt) => <th key={tt} className="p-1 text-center font-semibold">Test {tt}</th>)}
              </tr>
            </thead>
            <tbody>
              {BOOKS.map((book) => {
                const rowHasAudio = TESTS.some((tt) => status[String(book)]?.[String(tt)]);
                return (
                <tr key={book} className="border-t border-slate-100">
                  <td className="p-1 font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      {rowHasAudio && (
                        <input
                          type="checkbox"
                          checked={TESTS.filter((tt) => status[String(book)]?.[String(tt)]).every((tt) => selected.has(cellKey(book, tt)))}
                          onChange={() => toggleBookRow(book)}
                          aria-label={`${t.select} IELTS ${book}`}
                          className="h-3 w-3 accent-rose-600"
                        />
                      )}
                      IELTS {book}
                    </span>
                  </td>
                  {TESTS.map((tt) => {
                    const has = status[String(book)]?.[String(tt)];
                    const cellId = cellKey(book, tt);
                    const isSelected = selected.has(cellId);
                    return (
                      <td
                        key={tt}
                        onDragOver={(e) => { e.preventDefault(); setDragCell(cellId); }}
                        onDragLeave={() => setDragCell((c) => (c === cellId ? null : c))}
                        onDrop={(e) => void onCellDrop(book, tt, e)}
                        title={t.dropCell}
                        className={`p-1 text-center ${dragCell === cellId ? 'rounded bg-ngs-violet/10 ring-1 ring-ngs-violet/40' : isSelected ? 'rounded bg-rose-50' : ''}`}
                      >
                        {has ? (
                          <span className="inline-flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCell(book, tt)}
                              aria-label={`${t.select} IELTS ${book} Test ${tt}`}
                              className="h-3 w-3 accent-rose-600"
                            />
                            <button
                              type="button"
                              onClick={() => void playTest(book, tt)}
                              aria-label={t.play}
                              title={`${t.play} · ${has} ${t.part}`}
                              className={`${player?.book === book && player?.test === tt ? 'text-ngs-violet' : 'text-emerald-600'} hover:text-ngs-violet`}
                            >
                              {player?.book === book && player?.test === tt ? '❚❚' : '▶'}
                            </button>
                            <button type="button" onClick={() => pickSingle(book, tt)} aria-label={t.replace} title={t.replace} className="text-slate-300 hover:text-ngs-violet">↑</button>
                            <button type="button" onClick={() => setConfirmTargets([{ book, test: tt }])} aria-label={t.del} title={t.del} className="text-slate-300 hover:text-rose-600">🗑</button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => pickSingle(book, tt)} aria-label={t.upload} title={t.upload} className="text-slate-300 hover:text-ngs-violet">↑</button>
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      {confirmTargets && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => !deleting && setConfirmTargets(null)}>
          <div className="w-[360px] rounded-xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-grotesk text-sm font-bold text-slate-900">{t.confirmTitle}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              {confirmTargets.length === 1 ? t.confirmBodyOne(confirmTargets[0].book, confirmTargets[0].test) : t.confirmBodyMany(confirmTargets.length)}
            </p>
            {confirmTargets.length > 1 && confirmTargets.length <= 12 && (
              <div className="mt-2 max-h-32 space-y-0.5 overflow-y-auto rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500">
                {confirmTargets.map((x) => <div key={cellKey(x.book, x.test)}>IELTS {x.book} · Test {x.test}</div>)}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmTargets(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void doDelete(confirmTargets)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? t.deleting : t.del}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
