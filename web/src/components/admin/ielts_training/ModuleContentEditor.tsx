'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/member/design-v1/parts';
import { getCloudBaseApp } from '@/lib/cloudbase';
import {
  type Block,
  type BlockType,
  type RichData,
  type TableFillCell,
  BLOCK_TYPE_KEYS,
  PAGE_TYPE_KEYS,
  emptyBlock,
  normaliseRichData,
} from '@/lib/ielts/contentTypes';
import { MODULE_TITLES } from '@/lib/ielts/builtinContent';
import { loadModuleContent, saveModuleContent, resetModuleContent, hasOverride, type SaveMode } from '@/lib/ielts/content';
import { VersionHistoryPanel } from '@/components/admin/VersionHistoryPanel';
import { PageCard } from './ModuleLessonViewer';

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';
type EditorPage = { type: string | null; title?: string; blocks: Block[] };

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
  bili: { en: 'Bilibili video', zh: 'Bilibili 视频' },
  video: { en: 'Video (upload)', zh: '上传视频' },
  audio: { en: 'Audio', zh: '音频' },
  link: { en: 'Link', zh: '链接' },
  tablefill: { en: 'Fill-in table', zh: '填空表格' },
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
    biliUrl: 'Bilibili video URL or BV id (e.g. BV1xx411c7mD)',
    videoUrl: 'Video URL (.mp4 / .webm) — or upload a file below', chooseVideo: 'Choose video file',
    uploading: 'Uploading…', uploaded: '✓ Uploaded', uploadFailed: 'Upload failed — paste a URL instead.',
    unsaved: 'Unsaved changes', loading: 'Loading…', customised: 'Customised', original: 'Default content',
    sizeFull: 'Full width', sizeMedium: 'Medium', sizeSmall: 'Small', noPages: 'This module has no pages. Add one to begin.',
    text: 'Text', items: 'Items', emptyTitle: '(untitled page)', cancel: 'Cancel', confirm: 'Delete', versions: 'History',
    dragToReorder: 'Drag to reorder', hide: 'Hide from students', show: 'Show to students', hidden: 'Hidden',
    editMode: 'Edit', previewMode: 'Preview', renameHint: 'Double-click to rename', pageNamePh: 'Page name',
    tfTitle: 'Table title', tfIndicator: 'Indicator column label', tfGroup: 'Group column label',
    tfAddCol: '+ Column', tfAddRow: '+ Row', tfRemoveRow: 'Remove row', tfRemoveCol: 'Remove column',
    tfIndicatorPh: 'Indicator', tfGroupPh: 'Group (optional)', tfZhPh: '中文 (optional)', tfColPh: 'Header',
    tfHint: 'Type the standard answer in each cell. Leave a cell blank to make it a non-answer (—) cell.',
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
    biliUrl: 'Bilibili 视频链接或 BV 号（如 BV1xx411c7mD）',
    videoUrl: '视频 URL（.mp4 / .webm）——或在下方上传文件', chooseVideo: '选择视频文件',
    uploading: '上传中…', uploaded: '✓ 已上传', uploadFailed: '上传失败——请改为粘贴 URL。',
    unsaved: '未保存的更改', loading: '加载中…', customised: '已自定义', original: '默认内容',
    sizeFull: '整宽', sizeMedium: '中等', sizeSmall: '小', noPages: '本模块暂无页面，请先添加。',
    text: '文本', items: '条目', emptyTitle: '（未命名页面）', cancel: '取消', confirm: '删除', versions: '历史版本',
    dragToReorder: '拖动以重新排序', hide: '对学生隐藏', show: '对学生显示', hidden: '已隐藏',
    editMode: '编辑', previewMode: '预览', renameHint: '双击重命名', pageNamePh: '页面名称',
    tfTitle: '表格标题', tfIndicator: '指标列标题', tfGroup: '分组列标题',
    tfAddCol: '+ 列', tfAddRow: '+ 行', tfRemoveRow: '删除行', tfRemoveCol: '删除列',
    tfIndicatorPh: '指标', tfGroupPh: '分组（可选）', tfZhPh: '中文（可选）', tfColPh: '列标题',
    tfHint: '在每个单元格填入标准答案。留空的单元格将显示为非答题项（—）。',
  },
} as const;

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 dark:border-white/10 dark:bg-night-600 dark:text-slate-100 dark:placeholder:text-slate-500';
const miniBtn =
  'grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10';

/* ── Direct video upload (browser → CloudBase storage, like ImageUploadField) ─ */
function VideoUploadField({ value, onChange, s }: { value: string; onChange: (v: string) => void; s: (typeof STR)[Lang] }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleFile(file: File) {
    setBusy(true);
    setErr('');
    try {
      const app = await getCloudBaseApp();
      if (!app) {
        // Demo / no CloudBase configured → ephemeral local preview.
        onChange(URL.createObjectURL(file));
        return;
      }
      const safe = file.name.replace(/[^\w.\-]/g, '_');
      const cloudPath = `ielts/videos/${Date.now()}-${safe}`;
      const up = await app.uploadFile({ cloudPath, filePath: file });
      if (!up?.fileID) throw new Error('no_file_id');
      onChange(up.fileID); // permanent cloud:// handle; viewer signs it at render
    } catch (e) {
      // Surface the real reason (e.g. not signed in / storage permission) so a
      // failed upload on the live site is diagnosable instead of silent.
      console.error('[ielts] video upload failed', e);
      const msg = e instanceof Error && e.message ? e.message : String(e);
      setErr(`${s.uploadFailed}${msg ? ` (${msg})` : ''}`);
    } finally {
      setBusy(false);
    }
  }

  const isCloud = value.startsWith('cloud://');
  return (
    <div className="space-y-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={s.videoUrl} className={inputCls} />
      <input
        type="file"
        accept="video/*"
        disabled={busy}
        onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) void handleFile(f); }}
        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 dark:text-slate-400 dark:file:bg-white/10 dark:file:text-slate-200"
      />
      {busy && <p className="text-xs text-slate-400">{s.uploading}</p>}
      {err && <p className="text-xs text-rose-500">{err}</p>}
      {isCloud && !busy && <p className="text-xs font-medium text-emerald-500">{s.uploaded}</p>}
      {value && !isCloud && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls src={value} className="mt-1 max-h-44 w-full rounded-lg bg-black" />
      )}
    </div>
  );
}

/* ── Fill-in table editor (rows / columns / answers) ──────────────────────── */
type TFBlockEdit = Extract<Block, { t: 'tablefill' }>;
const tfCellStr = (cell: TableFillCell): string => (cell && (cell.a ?? cell.given)) || '';

function TableFillEditor({ block, lang, onChange }: { block: TFBlockEdit; lang: Lang; onChange: (b: Block) => void }) {
  const s = STR[lang];
  const cols = block.cols ?? [];
  const rows = block.rows ?? [];
  const tfInput = `${inputCls} px-2 py-1 text-xs`;

  const setColHeader = (c: number, v: string) => onChange({ ...block, cols: cols.map((h, i) => (i === c ? v : h)) });
  const addCol = () => onChange({ ...block, cols: [...cols, ''], rows: rows.map((r) => ({ ...r, cells: [...(r.cells ?? []), null] })) });
  const removeCol = (c: number) =>
    onChange({ ...block, cols: cols.filter((_, i) => i !== c), rows: rows.map((r) => ({ ...r, cells: (r.cells ?? []).filter((_, i) => i !== c) })) });

  const setRow = (r: number, patch: Partial<TFBlockEdit['rows'][number]>) =>
    onChange({ ...block, rows: rows.map((row, i) => (i === r ? { ...row, ...patch } : row)) });
  const setCell = (r: number, c: number, v: string) =>
    onChange({
      ...block,
      rows: rows.map((row, i) => {
        if (i !== r) return row;
        const cells = (row.cells ?? []).slice();
        while (cells.length < cols.length) cells.push(null);
        cells[c] = v.trim() ? { a: v } : null;
        return { ...row, cells };
      }),
    });
  const addRow = () => onChange({ ...block, rows: [...rows, { indicator: '', group: '', cells: cols.map(() => null) }] });
  const removeRow = (r: number) => onChange({ ...block, rows: rows.filter((_, i) => i !== r) });
  const moveRow = (r: number, dir: -1 | 1) => {
    const j = r + dir;
    if (j < 0 || j >= rows.length) return;
    const c = rows.slice();
    [c[r], c[j]] = [c[j], c[r]];
    onChange({ ...block, rows: c });
  };

  return (
    <div className="space-y-3">
      <input value={block.title || ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder={s.tfTitle} className={`${inputCls} font-semibold`} />
      <div className="grid grid-cols-2 gap-2">
        <input value={block.indicatorLabel || ''} onChange={(e) => onChange({ ...block, indicatorLabel: e.target.value })} placeholder={s.tfIndicator} className={tfInput} />
        <input value={block.groupLabel || ''} onChange={(e) => onChange({ ...block, groupLabel: e.target.value })} placeholder={s.tfGroup} className={tfInput} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5">
              <th className="border border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">{block.indicatorLabel || s.tfIndicatorPh}</th>
              <th className="border border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">{block.groupLabel || s.tfGroupPh}</th>
              {cols.map((h, c) => (
                <th key={c} className="border border-slate-200 px-2 py-1.5 dark:border-white/10">
                  <div className="flex items-center gap-1">
                    <input value={h} onChange={(e) => setColHeader(c, e.target.value)} placeholder={s.tfColPh} className={`${tfInput} min-w-[4rem] text-center`} />
                    <button type="button" onClick={() => removeCol(c)} disabled={cols.length <= 1} title={s.tfRemoveCol} className="shrink-0 rounded px-1 text-slate-400 transition hover:text-rose-500 disabled:opacity-30">✕</button>
                  </div>
                </th>
              ))}
              <th className="border border-slate-200 px-2 py-1.5 dark:border-white/10">
                <button type="button" onClick={addCol} className="whitespace-nowrap rounded-lg border border-dashed border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-ngs-violet/50 hover:text-ngs-violet dark:border-white/15">{s.tfAddCol}</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td className="border border-slate-200 px-2 py-1.5 align-top dark:border-white/10">
                  <input value={row.indicator} onChange={(e) => setRow(r, { indicator: e.target.value })} placeholder={s.tfIndicatorPh} className={tfInput} />
                  <input value={row.indicatorZh || ''} onChange={(e) => setRow(r, { indicatorZh: e.target.value })} placeholder={s.tfZhPh} className={`${tfInput} mt-1 text-slate-400`} />
                </td>
                <td className="border border-slate-200 px-2 py-1.5 align-top dark:border-white/10">
                  <input value={row.group || ''} onChange={(e) => setRow(r, { group: e.target.value })} placeholder={s.tfGroupPh} className={tfInput} />
                </td>
                {cols.map((_, c) => (
                  <td key={c} className="border border-slate-200 px-2 py-1.5 align-top dark:border-white/10">
                    <input value={tfCellStr((row.cells ?? [])[c] ?? null)} onChange={(e) => setCell(r, c, e.target.value)} className={`${tfInput} text-center`} />
                  </td>
                ))}
                <td className="border border-slate-200 px-1 py-1.5 align-top dark:border-white/10">
                  <div className="flex items-center">
                    <button type="button" onClick={() => moveRow(r, -1)} disabled={r === 0} title={s.up} className={miniBtn}><Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" /></button>
                    <button type="button" onClick={() => moveRow(r, 1)} disabled={r === rows.length - 1} title={s.down} className={miniBtn}><Icon name="arrow" className="h-3.5 w-3.5 rotate-90" /></button>
                    <button type="button" onClick={() => removeRow(r)} title={s.tfRemoveRow} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-ngs-violet/50 hover:text-ngs-violet dark:border-white/15">
          <Icon name="spark" className="h-3.5 w-3.5" /> {s.tfAddRow}
        </button>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.tfHint}</p>
      </div>
    </div>
  );
}

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
  if (block.t === 'bili') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.biliUrl} className={inputCls} />
        <input value={block.label || ''} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder={s.label} className={inputCls} />
      </div>
    );
  }
  if (block.t === 'video') {
    return <VideoUploadField value={block.v} onChange={(v) => onChange({ ...block, v })} s={s} />;
  }
  if (block.t === 'tablefill') {
    return <TableFillEditor block={block} lang={lang} onChange={onChange} />;
  }
  if (block.t === 'audio') {
    return (
      <div className="space-y-2">
        <input value={block.v} onChange={(e) => onChange({ ...block, v: e.target.value })} placeholder={s.audioUrl} className={inputCls} />
        <input value={block.label || ''} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder={s.label} className={inputCls} />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const draftStartRef = useRef('');

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
    setPages(data.pages.map((p) => ({ type: data.pageTypes?.[String(p.page)] ?? null, title: p.title, blocks: p.blocks })));
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
  const setPageTitle = (i: number, title: string) => mutate((ps) => ps.map((pg, idx) => (idx === i ? { ...pg, title } : pg)));
  /* Inline page rename (double-click). Pre-fills the current displayed name so
   *  it's obviously editable; only writes (and marks dirty) if actually changed. */
  const startRename = (i: number) => {
    const pg = pages[i];
    const h = pg?.blocks.find((b) => b.t === 'h2') ?? pg?.blocks.find((b) => b.t === 'h3');
    const current = (pg?.title && pg.title.trim()) || (h && 'v' in h ? h.v : '') || '';
    draftStartRef.current = current;
    setTitleDraft(current);
    setEditingTitle(i);
  };
  const commitRename = () => {
    if (editingTitle == null) return;
    if (titleDraft !== draftStartRef.current) setPageTitle(editingTitle, titleDraft.trim());
    setEditingTitle(null);
  };

  /* Block ops (within selected page) */
  const setBlock = (i: number, b: Block) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: pg.blocks.map((bb, j) => (j === i ? b : bb)) } : pg)));
  const addBlock = (t: BlockType) => { mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: [...pg.blocks, emptyBlock(t)] } : pg))); setAddOpen(false); };
  const delBlock = (i: number) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: pg.blocks.filter((_, j) => j !== i) } : pg)));
  const toggleHidden = (i: number) => mutate((ps) => ps.map((pg, idx) => (idx === sel ? { ...pg, blocks: pg.blocks.map((bb, j) => (j === i ? { ...bb, hidden: !bb.hidden } : bb)) } : pg)));
  const moveBlock = (i: number, dir: -1 | 1) => mutate((ps) => ps.map((pg, idx) => {
    if (idx !== sel) return pg;
    const j = i + dir;
    if (j < 0 || j >= pg.blocks.length) return pg;
    const c = pg.blocks.slice(); [c[i], c[j]] = [c[j], c[i]];
    return { ...pg, blocks: c };
  }));
  /* Drag-and-drop reorder: move block `from` → `to` within the current page. */
  const moveBlockTo = (from: number, to: number) => {
    if (from === to) return;
    mutate((ps) => ps.map((pg, idx) => {
      if (idx !== sel) return pg;
      const arr = pg.blocks.slice();
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...pg, blocks: arr };
    }));
  };
  const onBlockDrop = (to: number) => {
    if (dragIdx !== null && dragIdx !== to) moveBlockTo(dragIdx, to);
    setDragIdx(null);
    setOverIdx(null);
  };

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
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSel(i)}
                          onDoubleClick={() => startRename(i)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setSel(i); if (e.key === 'F2') startRename(i); }}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 text-left"
                        >
                          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-bold ${i === sel ? 'bg-white/20 text-white dark:bg-white/20' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{i + 1}</span>
                          {editingTitle === i ? (
                            <input
                              autoFocus
                              value={titleDraft}
                              placeholder={pageTitle(p)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) => setTitleDraft(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                                else if (e.key === 'Escape') { e.preventDefault(); setEditingTitle(null); }
                              }}
                              className="min-w-0 flex-1 rounded border border-ngs-violet/60 bg-white px-1.5 py-0.5 text-xs text-slate-800 outline-none dark:bg-night-600 dark:text-slate-100"
                            />
                          ) : (
                            <span title={s.renameHint} className={`truncate text-xs ${i === sel ? 'font-semibold text-white' : 'text-slate-600 dark:text-slate-300'}`}>{p.title?.trim() || pageTitle(p)}</span>
                          )}
                        </div>
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
                    <div className="ml-auto flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
                        {([false, true] as const).map((pv) => (
                          <button
                            key={String(pv)}
                            type="button"
                            onClick={() => setPreview(pv)}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${preview === pv ? 'bg-slate-900 text-white dark:bg-white dark:text-night' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                          >
                            {pv ? s.previewMode : s.editMode}
                          </button>
                        ))}
                      </div>
                      <span className="hidden text-xs text-slate-400 sm:inline">{s.pages} {sel + 1} / {pages.length}</span>
                    </div>
                  </div>

                  {/* Live student preview of the current page (hidden blocks excluded). */}
                  {preview ? (
                    <PageCard page={{ page: sel + 1, title: cur.title, blocks: cur.blocks }} pageType={cur.type} totalPages={pages.length} lang={lang} onZoom={() => {}} />
                  ) : (
                  <>
                  {/* Blocks */}
                  {cur.blocks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400 dark:border-white/15">{s.emptyPage}</div>
                  ) : (
                    cur.blocks.map((b, i) => (
                      <div
                        key={i}
                        data-block-card
                        onDragOver={(e) => { if (dragIdx !== null) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (overIdx !== i) setOverIdx(i); } }}
                        onDrop={(e) => { e.preventDefault(); onBlockDrop(i); }}
                        className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-night-700 ${
                          dragIdx === i ? 'opacity-40' : b.hidden ? 'opacity-60' : ''
                        } ${
                          overIdx === i && dragIdx !== null && dragIdx !== i
                            ? 'border-ngs-violet ring-2 ring-ngs-violet/40'
                            : 'border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className="mb-2.5 flex items-center gap-2">
                          <span
                            draggable
                            onDragStart={(e) => {
                              setDragIdx(i);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', String(i));
                              const card = (e.currentTarget as HTMLElement).closest('[data-block-card]');
                              if (card) e.dataTransfer.setDragImage(card as Element, 12, 12);
                            }}
                            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                            title={s.dragToReorder}
                            aria-label={s.dragToReorder}
                            className="grid h-7 w-5 shrink-0 cursor-grab place-items-center rounded text-slate-300 transition hover:text-slate-500 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{lang === 'zh' ? BLOCK_LABELS[b.t].zh : BLOCK_LABELS[b.t].en}</span>
                          {b.hidden && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{s.hidden}</span>
                          )}
                          <div className="ml-auto flex items-center">
                            <button
                              type="button"
                              onClick={() => toggleHidden(i)}
                              title={b.hidden ? s.show : s.hide}
                              aria-label={b.hidden ? s.show : s.hide}
                              className={`grid h-7 w-7 place-items-center rounded-lg transition ${b.hidden ? 'text-amber-500 hover:bg-amber-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            >
                              {b.hidden ? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 4.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.3 4.3" /><path d="M6.6 6.6A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4-.8" /></svg>
                              ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
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
                  </>
                  )}
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
