'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/member/design-v1/parts';
import {
  type Block,
  type BlockType,
  type RichData,
  BLOCK_TYPE_KEYS,
  PAGE_TYPE_KEYS,
  emptyBlock,
  normaliseRichData,
} from '@/lib/ielts/contentTypes';
import { MODULE_TITLES } from '@/lib/ielts/builtinContent';
import { loadModuleContent, saveModuleContent, resetModuleContent, hasOverride, type SaveMode } from '@/lib/ielts/content';
import { VersionHistoryPanel } from '@/components/admin/VersionHistoryPanel';

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';
type EditorPage = { type: string | null; blocks: Block[] };

/* ── Labels ───────────────────────────────────────────────────────────────── */
const BLOCK_LABELS: Record<BlockType, { en: string; zh: string }> = {
  p: { en: 'Paragraph', zh: '段落' },
  h2: { en: 'Heading', zh: '标题' },
  h3: { en: 'Subheading', zh: '小标题' },
  ul: { en: 'Bullet list', zh: '无序列表' },
  ol: { en: 'Numbered list', zh: '有序列表' },
  img: { en: 'Image', zh: '图片' },
  vid: { en: 'Vimeo video', zh: 'Vimeo 视频' },
  yt: { en: 'YouTube video', zh: 'YouTube 视频' },
  audio: { en: 'Audio', zh: '音频' },
  link: { en: 'Link', zh: '链接' },
};

const PAGE_TYPE_LABEL: Record<string, { en: string; zh: string }> = {
  'Show Me': { en: 'Show Me', zh: '展示' },
  'Show Me More': { en: 'Show Me More', zh: '拓展' },
  'Tell Me': { en: 'Tell Me', zh: '讲解' },
  'Involve Me': { en: 'Involve Me', zh: '练习' },
  'Test Me': { en: 'Test Me', zh: '测验' },
  'Remind Me': { en: 'Remind Me', zh: '复习' },
  'Summary': { en: 'Summary', zh: '小结' },
};

const STR = {
  en: {
    back: 'Back to course', editModule: 'Edit content', module: 'Module', save: 'Save', saving: 'Saving…',
    savedCloud: 'Saved', savedLocal: 'Saved (this browser)', saveFailed: 'Save failed',
    reset: 'Reset to default', resetConfirm: 'Discard all customisations for this module and restore the original content?',
    preview: 'Preview', pages: 'Pages', addPage: 'Add page', deletePage: 'Delete page', deletePageConfirm: 'Delete this page?',
    duplicate: 'Duplicate', up: 'Move up', down: 'Move down', sectionType: 'Section badge', noType: 'No badge',
    sections: 'Sections', addSection: 'Add section', del: 'Delete', emptyPage: 'No sections on this page yet — add one below.',
    addItem: 'Add item', removeItem: 'Remove', label: 'Label (optional)', vimeoId: 'Vimeo video ID (e.g. 387654970)',
    ytId: 'YouTube video ID (e.g. j25CFx-4g0I)', imgUrl: 'Image URL', linkUrl: 'Link URL', size: 'Size',
    audioUrl: 'Audio file URL (.mp3 / .m4a / .ogg)',
    unsaved: 'Unsaved changes', loading: 'Loading…', customised: 'Customised', original: 'Default content',
    sizeFull: 'Full width', sizeMedium: 'Medium', sizeSmall: 'Small', noPages: 'This module has no pages. Add one to begin.',
    text: 'Text', items: 'Items', emptyTitle: '(untitled page)', cancel: 'Cancel', confirm: 'Delete', versions: 'History',
  },
  zh: {
    back: '返回课程', editModule: '编辑内容', module: '模块', save: '保存', saving: '保存中…',
    savedCloud: '已保存', savedLocal: '已保存（仅本浏览器）', saveFailed: '保存失败',
    reset: '恢复默认', resetConfirm: '放弃本模块的所有修改并恢复原始内容？',
    preview: '预览', pages: '页面', addPage: '添加页面', deletePage: '删除页面', deletePageConfirm: '删除此页面？',
    duplicate: '复制', up: '上移', down: '下移', sectionType: '页面标签', noType: '无标签',
    sections: '小节', addSection: '添加小节', del: '删除', emptyPage: '本页暂无小节——在下方添加。',
    addItem: '添加条目', removeItem: '删除', label: '标签（可选）', vimeoId: 'Vimeo 视频 ID（如 387654970）',
    ytId: 'YouTube 视频 ID（如 j25CFx-4g0I）', imgUrl: '图片 URL', linkUrl: '链接 URL', size: '尺寸',
    audioUrl: '音频文件 URL（.mp3 / .m4a / .ogg）',
    unsaved: '未保存的更改', loading: '加载中…', customised: '已自定义', original: '默认内容',
    sizeFull: '整宽', sizeMedium: '中等', sizeSmall: '小', noPages: '本模块暂无页面，请先添加。',
    text: '文本', items: '条目', emptyTitle: '（未命名页面）', cancel: '取消', confirm: '删除', versions: '历史版本',
  },
} as const;

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 dark:border-white/10 dark:bg-night-600 dark:text-slate-100 dark:placeholder:text-slate-500';
const miniBtn =
  'grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10';

/* ── Per-block editor ─────────────────────────────────────────────────────── */
function BlockEditor({ block, lang, onChange }: { block: Block; lang: Lang; onChange: (b: Block) => void }) {
  const s = STR[lang];
  if (block.t === 'p' || block.t === 'h2' || block.t === 'h3') {
    return (
      <textarea
        value={block.v}
        onChange={(e) => onChange({ ...block, v: e.target.value })}
        rows={block.t === 'p' ? 3 : 1}
        placeholder={s.text}
        className={`${inputCls} resize-y ${block.t === 'h2' ? 'font-grotesk font-bold' : block.t === 'h3' ? 'font-grotesk font-semibold' : ''}`}
      />
    );
  }
  if (block.t === 'ul' || block.t === 'ol') {
    return (
      <div className="space-y-2">
        {block.items.map((item, j) => (
          <div key={j} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-center text-xs text-slate-400">{block.t === 'ol' ? `${j + 1}.` : '•'}</span>
            <input
              value={item}
              onChange={(e) => onChange({ ...block, items: block.items.map((it, k) => (k === j ? e.target.value : it)) })}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange({ ...block, items: block.items.filter((_, k) => k !== j) })}
              title={s.removeItem}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...block, items: [...block.items, ''] })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ngs-violet hover:underline"
        >
          <Icon name="spark" className="h-3.5 w-3.5" /> {s.addItem}
        </button>
      </div>
    );
  }
  if (block.t === 'img') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.imgUrl} className={inputCls} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{s.size}</span>
          <select
            value={block.size || 'medium'}
            onChange={(e) => onChange({ ...block, size: e.target.value as 'full' | 'medium' | 'small' })}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none dark:border-white/10 dark:bg-night-600 dark:text-slate-200"
          >
            <option value="full">{s.sizeFull}</option>
            <option value="medium">{s.sizeMedium}</option>
            <option value="small">{s.sizeSmall}</option>
          </select>
        </div>
        {block.v && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.v} alt="" className="max-h-40 rounded-lg border border-slate-200 object-contain dark:border-white/10" />
        )}
      </div>
    );
  }
  if (block.t === 'vid') {
    return <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.vimeoId} className={inputCls} />;
  }
  if (block.t === 'yt') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.ytId} className={inputCls} />
        <input value={block.label || ''} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder={s.label} className={inputCls} />
      </div>
    );
  }
  if (block.t === 'audio') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.audioUrl} className={inputCls} />
        <input value={block.label || ''} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder={s.label} className={inputCls} />
        {block.v && <audio controls src={block.v} className="mt-1 w-full" />}
      </div>
    );
  }
  if (block.t === 'link') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.linkUrl} className={inputCls} />
        <input value={block.label || ''} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder={s.label} className={inputCls} />
      </div>
    );
  }
  return null;
}

/* ── Confirm dialog (replaces native window.confirm) ──────────────────────── */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-night-700"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="font-grotesk text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            {message && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main editor ──────────────────────────────────────────────────────────── */
export function ModuleContentEditor({ modId }: { modId: string }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('en');

  const [loaded, setLoaded] = useState(false);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [sel, setSel] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [dialog, setDialog] = useState<null | { title: string; message?: string; confirmLabel: string; onConfirm: () => void }>(null);
  const [showVersions, setShowVersions] = useState(false);

  const s = STR[lang];
  const title = (MODULE_TITLES[modId] ? MODULE_TITLES[modId][lang] : null) ?? `Module ${modId}`;

  /* Theme / language follow the viewer's persisted prefs. */
  useEffect(() => {
    try {
      const th = localStorage.getItem('ielts:theme');
      if (th === 'dark' || th === 'light') setTheme(th);
      const l = localStorage.getItem('ielts:lang');
      if (l === 'en' || l === 'zh') setLang(l);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:theme', theme); } catch {} }, [theme, mounted]);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:lang', lang); } catch {} }, [lang, mounted]);

  const loadInto = useCallback((data: RichData) => {
    setPages(data.pages.map((p) => ({ type: data.pageTypes?.[String(p.page)] ?? null, blocks: p.blocks })));
    setSel(0);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const data = await loadModuleContent(modId);
      if (!active) return;
      loadInto(data);
      setOverridden(await hasOverride(modId));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [modId, loadInto]);

  /* Warn before leaving with unsaved changes. */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const mutate = useCallback((fn: (p: EditorPage[]) => EditorPage[]) => {
    setPages((p) => fn(p));
    setDirty(true);
    setStatus('');
  }, []);

  /* Page ops */
  const addPage = () => { mutate((ps) => [...ps, { type: null, blocks: [] }]); setSel(pages.length); };
  const delPage = (i: number) => {
    setDialog({
      title: s.deletePage,
      message: s.deletePageConfirm,
      confirmLabel: s.confirm,
      onConfirm: () => {
        mutate((ps) => ps.filter((_, idx) => idx !== i));
        setSel((c) => Math.max(0, Math.min(c, pages.length - 2)));
      },
    });
  };
  const dupPage = (i: number) => { mutate((ps) => [...ps.slice(0, i + 1), { ...ps[i], blocks: ps[i].blocks.map((b) => ({ ...b })) }, ...ps.slice(i + 1)]); };
  const movePage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= pages.length) return;
    mutate((ps) => { const c = ps.slice(); [c[i], c[j]] = [c[j], c[i]]; return c; });
    setSel(j);
  };
  const setPageType = (t: string | null) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, type: t } : pg)));

  /* Block ops (within selected page) */
  const setBlock = (i: number, b: Block) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: pg.blocks.map((bb, j) => (j === i ? b : bb)) } : pg)));
  const addBlock = (t: BlockType) => { mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: [...pg.blocks, emptyBlock(t)] } : pg))); setAddOpen(false); };
  const delBlock = (i: number) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: pg.blocks.filter((_, j) => j !== i) } : pg)));
  const moveBlock = (i: number, dir: -1 | 1) => mutate((ps) => ps.map((pg, idx) => {
    if (idx !== sel) return pg;
    const j = i + dir;
    if (j < 0 || j >= pg.blocks.length) return pg;
    const c = pg.blocks.slice(); [c[i], c[j]] = [c[j], c[i]];
    return { ...pg, blocks: c };
  }));

  async function onSave() {
    setSaving(true);
    setStatus('');
    try {
      const mode: SaveMode = await saveModuleContent(modId, normaliseRichData(pages));
      setDirty(false);
      setOverridden(true);
      setStatus(mode === 'cloud' ? s.savedCloud : s.savedLocal);
    } catch {
      setStatus(s.saveFailed);
    }
    setSaving(false);
  }

  function onReset() {
    setDialog({ title: s.reset, message: s.resetConfirm, confirmLabel: s.reset, onConfirm: () => void doReset() });
  }
  async function doReset() {
    try {
      await resetModuleContent(modId);
    } catch {
      /* even if remote reset fails, fall through to reload */
    }
    const data = await loadModuleContent(modId);
    loadInto(data);
    setDirty(false);
    setOverridden(await hasOverride(modId));
    setStatus('');
  }

  /* Restore a snapshot from version history → load it in and save as current. */
  async function restoreVersion(data: unknown) {
    const d = data as RichData;
    if (!d || !Array.isArray(d.pages)) return;
    loadInto(d);
    setDirty(false);
    try {
      const mode = await saveModuleContent(modId, d);
      setOverridden(true);
      setStatus(mode === 'cloud' ? s.savedCloud : s.savedLocal);
    } catch {
      setStatus(s.saveFailed);
    }
  }

  const pageTitle = (p: EditorPage): string => {
    const h = p.blocks.find((b) => b.t === 'h2') ?? p.blocks.find((b) => b.t === 'h3');
    return h && 'v' in h && h.v ? h.v : s.emptyTitle;
  };

  const cur = pages[sel];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-700 antialiased dark:bg-night dark:text-slate-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-night-800/95">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/admin/ielts_training" className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
              <span className="hidden sm:inline">{s.back}</span>
            </Link>
            <div className="hidden h-4 w-px bg-slate-200 dark:bg-white/10 sm:block" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {s.editModule} · {s.module} {modId}
                {overridden && <span className="ml-2 rounded-full bg-ngs-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-ngs-violet">{s.customised}</span>}
              </p>
              <h1 className="truncate font-grotesk text-sm font-bold text-slate-900 dark:text-white">{title}</h1>
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-1.5">
              {dirty && <span className="hidden text-xs font-medium text-amber-500 sm:inline">● {s.unsaved}</span>}
              {status && <span className={`hidden text-xs font-semibold sm:inline ${status === s.saveFailed ? 'text-rose-500' : 'text-emerald-500'}`}>{status}</span>}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
                {(['en', 'zh'] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-md px-2 py-1 text-xs font-bold transition ${lang === l ? 'bg-slate-900 text-white dark:bg-white dark:text-night' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                    {l === 'en' ? 'EN' : '中'}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))} aria-label="theme" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white">
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowVersions(true)}
                title={s.versions}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <Icon name="clock" className="h-4 w-4" />
                <span className="hidden md:inline">{s.versions}</span>
              </button>
              <Link href={`/admin/ielts_training/module/${modId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                👁 <span className="hidden sm:inline">{s.preview}</span>
              </Link>
              <button type="button" onClick={onSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-ngs-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                {saving ? s.saving : s.save}
              </button>
            </div>
          </div>
        </header>

        {!loaded ? (
          <div className="p-12 text-center text-sm text-slate-400">{s.loading}</div>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
            {/* Pages sidebar */}
            <aside className="lg:w-64 lg:shrink-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-night-700">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{s.pages}</p>
                  <span className="text-[11px] font-medium text-slate-400">{pages.length}</span>
                </div>
                <ol className="space-y-1">
                  {pages.map((p, i) => (
                    <li key={i}>
                      <div className={`group flex items-center gap-1 rounded-lg px-1 ${i === sel ? 'bg-slate-900 dark:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                        <button type="button" onClick={() => setSel(i)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
                          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-bold ${i === sel ? 'bg-white/20 text-white dark:bg-white/20' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{i + 1}</span>
                          <span className={`truncate text-xs ${i === sel ? 'font-semibold text-white' : 'text-slate-600 dark:text-slate-300'}`}>{pageTitle(p)}</span>
                        </button>
                        <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                          <button type="button" onClick={() => movePage(i, -1)} disabled={i === 0} title={s.up} className={miniBtn}><Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" /></button>
                          <button type="button" onClick={() => movePage(i, 1)} disabled={i === pages.length - 1} title={s.down} className={miniBtn}><Icon name="arrow" className="h-3.5 w-3.5 rotate-90" /></button>
                          <button type="button" onClick={() => dupPage(i)} title={s.duplicate} className={miniBtn}>⧉</button>
                          <button type="button" onClick={() => delPage(i)} title={s.deletePage} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500">✕</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <button type="button" onClick={addPage} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-500 transition hover:border-ngs-violet/50 hover:text-ngs-violet dark:border-white/15">
                  <Icon name="spark" className="h-3.5 w-3.5" /> {s.addPage}
                </button>
              </div>
              <button type="button" onClick={onReset} className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5">
                ↺ {s.reset}
              </button>
            </aside>

            {/* Page editor */}
            <main className="min-w-0 flex-1">
              {!cur ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400 dark:border-white/15">{s.noPages}</div>
              ) : (
                <div className="space-y-4">
                  {/* Page type */}
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-white/10 dark:bg-night-700">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.sectionType}</span>
                    <select
                      value={cur.type || ''}
                      onChange={(e) => setPageType(e.target.value || null)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-white/10 dark:bg-night-600 dark:text-slate-200"
                    >
                      <option value="">{s.noType}</option>
                      {PAGE_TYPE_KEYS.map((k) => (
                        <option key={k} value={k}>{lang === 'zh' ? `${PAGE_TYPE_LABEL[k].zh} · ${k}` : k}</option>
                      ))}
                    </select>
                    <span className="ml-auto text-xs text-slate-400">{s.pages} {sel + 1} / {pages.length}</span>
                  </div>

                  {/* Blocks */}
                  {cur.blocks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400 dark:border-white/15">{s.emptyPage}</div>
                  ) : (
                    cur.blocks.map((b, i) => (
                      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-night-700">
                        <div className="mb-2.5 flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{lang === 'zh' ? BLOCK_LABELS[b.t].zh : BLOCK_LABELS[b.t].en}</span>
                          <div className="ml-auto flex items-center">
                            <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} title={s.up} className={miniBtn}><Icon name="arrow" className="h-4 w-4 -rotate-90" /></button>
                            <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === cur.blocks.length - 1} title={s.down} className={miniBtn}><Icon name="arrow" className="h-4 w-4 rotate-90" /></button>
                            <button type="button" onClick={() => delBlock(i)} title={s.del} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500">✕</button>
                          </div>
                        </div>
                        <BlockEditor block={b} lang={lang} onChange={(nb) => setBlock(i, nb)} />
                      </div>
                    ))
                  )}

                  {/* Add block */}
                  <div className="relative">
                    <button type="button" onClick={() => setAddOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-ngs-violet/50 hover:text-ngs-violet dark:border-white/15">
                      <Icon name="spark" className="h-4 w-4" /> {s.addSection}
                    </button>
                    {addOpen && (
                      <div className="absolute left-0 z-10 mt-2 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-night-700">
                        {BLOCK_TYPE_KEYS.map((t) => (
                          <button key={t} type="button" onClick={() => addBlock(t)} className="rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                            {lang === 'zh' ? BLOCK_LABELS[t].zh : BLOCK_LABELS[t].en}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {dialog && (
          <ConfirmDialog
            title={dialog.title}
            message={dialog.message}
            confirmLabel={dialog.confirmLabel}
            cancelLabel={s.cancel}
            onConfirm={() => { dialog.onConfirm(); setDialog(null); }}
            onCancel={() => setDialog(null)}
          />
        )}

        {showVersions && (
          <VersionHistoryPanel
            kind="ielts_module"
            refId={modId}
            lang={lang}
            onRestore={restoreVersion}
            onClose={() => setShowVersions(false)}
          />
        )}
      </div>
    </div>
  );
}
