'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/member/design-v1/parts';
import type { Block, RichPage, RichData } from '@/lib/ielts/contentTypes';
import { BUILTIN_RICH, MODULE_TITLES, MODULE_IDS, moduleHasTest } from '@/lib/ielts/builtinContent';
import { loadModuleContent } from '@/lib/ielts/content';
import { getCloudBaseApp } from '@/lib/cloudbase';
import { isCorrect, stripCJK, hasCJK, cellKey } from '@/lib/ielts/tablefill';

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';
type ViewMode = 'paged' | 'scroll';

/* Page-type pedagogy labels (bilingual) + light/dark badge styling. */
const PAGE_TYPE_META: Record<string, { en: string; zh: string; badge: string }> = {
  'Show Me': { en: 'Show Me', zh: '展示', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  'Show Me More': { en: 'Show Me More', zh: '拓展', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  'Tell Me': { en: 'Tell Me', zh: '讲解', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  'Involve Me': { en: 'Involve Me', zh: '练习', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  'Test Me': { en: 'Test Me', zh: '测验', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  'Remind Me': { en: 'Remind Me', zh: '复习', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' },
  'Summary': { en: 'Summary', zh: '小结', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
};

/* ── i18n strings (UI chrome only — lesson content stays English) ──────────── */
interface Strings {
  backToCourse: string;
  module: string;
  page: string;
  of: string;
  previous: string;
  next: string;
  contents: string;
  jumpToPage: string;
  audioUnavailable: string;
  externalReading: string;
  moduleComplete: string;
  congrats: (m: string, t: string) => string;
  startPractice: string;
  backToList: string;
  reviewFromStart: string;
  pagedView: string;
  scrollView: string;
  noContent: string;
  viewed: (a: number, b: number) => string;
  clickEnlarge: string;
  toggleTheme: string;
  nextModule: string;
  editContent: string;
}

const STR: Record<Lang, Strings> = {
  en: {
    backToCourse: 'Back to course',
    module: 'Module',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    contents: 'Contents',
    jumpToPage: 'Jump to',
    audioUnavailable: 'Audio not available in this version',
    externalReading: 'External reading',
    moduleComplete: 'Module complete',
    congrats: (m, t) => `You've reached the end of Module ${m} — ${t}.`,
    startPractice: 'Start practice test',
    backToList: 'Back to course list',
    reviewFromStart: 'Review from start',
    pagedView: 'Paged',
    scrollView: 'Scroll',
    noContent: 'No lesson content available for this module.',
    viewed: (a, b) => `Viewed ${a} / ${b}`,
    clickEnlarge: 'Click to enlarge',
    toggleTheme: 'Toggle light / dark',
    nextModule: 'Next module',
    editContent: 'Edit content',
  },
  zh: {
    backToCourse: '返回课程',
    module: '模块',
    page: '第',
    of: '页 / 共',
    previous: '上一页',
    next: '下一页',
    contents: '目录',
    jumpToPage: '跳转',
    audioUnavailable: '本版本暂无音频',
    externalReading: '外部阅读',
    moduleComplete: '模块完成',
    congrats: (m, t) => `您已学完第 ${m} 模块 —— ${t}。`,
    startPractice: '开始练习测试',
    backToList: '返回课程列表',
    reviewFromStart: '从头复习',
    pagedView: '分页',
    scrollView: '滚动',
    noContent: '本模块暂无课程内容。',
    viewed: (a, b) => `已读 ${a} / ${b}`,
    clickEnlarge: '点击放大',
    toggleTheme: '切换浅色 / 深色',
    nextModule: '下一模块',
    editContent: '编辑内容',
  },
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const isAudioTask = (text: string) => /\blisten\b/i.test(text);

function linkInfo(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const segs = u.pathname.split('/').filter(Boolean);
    let last = segs.length ? segs[segs.length - 1] : '';
    const isPdf = /\.pdf$/i.test(last);
    last = last.replace(/\.(pdf|html?|aspx?|php)$/i, '');
    const title = last
      ? decodeURIComponent(last).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b[a-z]/gi, (c) => c.toUpperCase())
      : host;
    return { host, title, isPdf };
  } catch {
    return { host: url, title: url, isPdf: false };
  }
}

/* ── Media embeds (theme-aware) ───────────────────────────────────────────── */
function VimeoEmbed({ id }: { id: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      {loaded ? (
        <iframe
          src={`https://player.vimeo.com/video/${id}?h=0&color=8b2fd6&byline=0&portrait=0`}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group relative flex aspect-video w-full items-center justify-center bg-slate-900 transition hover:bg-slate-800"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30">
            <svg className="ml-1 h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">Vimeo</span>
        </button>
      )}
    </div>
  );
}

function YoutubeEmbed({ id, label }: { id: string; label?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      {loaded ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group relative flex aspect-video w-full items-center justify-center bg-red-950 transition hover:bg-red-900"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30">
            <svg className="ml-1 h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">{label || 'YouTube'}</span>
        </button>
      )}
    </div>
  );
}

/* ── Bilibili embed (click-to-load) ───────────────────────────────────────── */
function BilibiliEmbed({ id, label }: { id: string; label?: string }) {
  const [loaded, setLoaded] = useState(false);
  const bvid = id.match(/BV[0-9A-Za-z]+/)?.[0] || id; // accept a full URL or a bare BV id
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      {loaded ? (
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=0&danmaku=0&high_quality=1`}
          className="aspect-video w-full"
          scrolling="no"
          allow="fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group relative flex aspect-video w-full items-center justify-center bg-[#00a1d6] transition hover:brightness-110"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/25 transition group-hover:bg-white/35">
            <svg className="ml-1 h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80">{label || 'Bilibili'}</span>
        </button>
      )}
    </div>
  );
}

/* ── Uploaded video file (resolves a cloud:// handle to a temp URL) ────────── */
function VideoFile({ src }: { src: string }) {
  const [url, setUrl] = useState(src.startsWith('cloud://') ? '' : src);
  useEffect(() => {
    if (!src.startsWith('cloud://')) { setUrl(src); return; }
    let active = true;
    void (async () => {
      const app = await getCloudBaseApp();
      if (!app) return;
      try {
        const r = await app.getTempFileURL({ fileList: [src] });
        const u = r?.fileList?.[0]?.tempFileURL;
        if (active && u) setUrl(u);
      } catch {
        /* leave unresolved */
      }
    })();
    return () => { active = false; };
  }, [src]);
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      {url ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls preload="metadata" src={url} className="aspect-video w-full bg-black" />
      ) : (
        <div className="grid aspect-video place-items-center bg-slate-900 text-xs text-white/50">…</div>
      )}
    </div>
  );
}

/* ── Link card (replaces bare blue URLs) ──────────────────────────────────── */
function LinkCard({ url, label, lang }: { url: string; label?: string; lang: Lang }) {
  const info = linkInfo(url);
  const title = label && label !== url ? label : info.title;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group my-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-ngs-violet/40 hover:shadow-sm dark:border-white/10 dark:bg-night-600 dark:hover:border-ngs-violet/60"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ngs-gradient-soft text-ngs-violet dark:text-violet-300">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 5h5v5M19 5l-9 9M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
          {info.isPdf && (
            <span className="shrink-0 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">PDF</span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400 dark:text-slate-500">
          {STR[lang].externalReading} · {info.host}
        </span>
      </span>
      <svg className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-ngs-violet dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

/* ── Audio-unavailable notice ─────────────────────────────────────────────── */
function AudioNotice({ lang }: { lang: Lang }) {
  return (
    <div className="my-3 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
      <span className="text-base leading-none">🎧</span>
      {STR[lang].audioUnavailable}
    </div>
  );
}

/* ── Audio player (admin-attached audio) ──────────────────────────────────── */
function AudioPlayer({ src, label }: { src: string; label?: string }) {
  // CloudBase-uploaded audio is stored as a cloud:// fileID; resolve it to a
  // temporary playable URL (same pattern as VideoFile). Plain http(s) URLs and
  // app-relative paths pass straight through.
  const [url, setUrl] = useState(src.startsWith('cloud://') ? '' : src);
  useEffect(() => {
    if (!src.startsWith('cloud://')) { setUrl(src); return; }
    let active = true;
    void (async () => {
      const app = await getCloudBaseApp();
      if (!app) return;
      try {
        const r = await app.getTempFileURL({ fileList: [src] });
        const u = r?.fileList?.[0]?.tempFileURL;
        if (active && u) setUrl(u);
      } catch {
        /* leave unresolved */
      }
    })();
    return () => { active = false; };
  }, [src]);
  if (!src) return null;
  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className="text-base leading-none">🔊</span>
        {label || 'Audio'}
      </div>
      {url ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls preload="none" src={url} className="w-full" />
      ) : (
        <div className="grid h-12 place-items-center text-xs text-slate-400 dark:text-slate-500">…</div>
      )}
    </div>
  );
}

/* ── Fill-in table (TableFillCheck) ───────────────────────────────────────── */
type TFBlock = Extract<Block, { t: 'tablefill' }>;

const TF_STR = {
  en: {
    check: 'Check Answers', reset: 'Reset',
    score: 'Score', accuracy: 'Accuracy', wrongTitle: 'Review these',
    your: 'you', correct: 'answer', copy: 'Copy mistakes', copied: 'Copied', time: 'Time',
    cjkWarn: 'Please enter a number, fraction or English value with unit.',
    allCorrect: 'Perfect — every answer is correct! 🎉',
  },
  zh: {
    check: '核对答案', reset: '重置',
    score: '正确', accuracy: '正确率', wrongTitle: '需复习',
    your: '你的', correct: '正确', copy: '复制错题', copied: '已复制', time: '用时',
    cjkWarn: '请输入数字、分数或带单位英文数值',
    allCorrect: '全部正确，太棒了！🎉',
  },
} as const;

function rowLabel(r: TableFillRowLite): string {
  const g = (r.group || '').trim();
  return g ? `${r.indicator} (${g})` : r.indicator;
}
type TableFillRowLite = { indicator: string; group?: string };

function TableFillCheck({ block, lang }: { block: TFBlock; lang: Lang }) {
  const t = TF_STR[lang];
  const cols = block.cols ?? [];
  const rows = useMemo(() => block.rows ?? [], [block.rows]);
  const hasGroups = rows.some((r) => (r.group || '').trim());

  const [vals, setVals] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [warn, setWarn] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  /* Tick the timer while the student is working (stops once checked). */
  useEffect(() => {
    if (startedAt == null || checked) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, checked]);

  /* Every cell the student is meant to fill (has a standard answer). */
  const inputCells = useMemo(() => {
    const out: { r: number; c: number; answer: string }[] = [];
    rows.forEach((row, r) =>
      (row.cells || []).forEach((cell, c) => {
        if (cell && typeof cell.a === 'string' && cell.a.trim()) out.push({ r, c, answer: cell.a });
      }),
    );
    return out;
  }, [rows]);

  const onInput = (key: string, raw: string) => {
    const clean = stripCJK(raw);
    setWarn(hasCJK(raw)); // flag if Chinese was typed/pasted (and stripped)
    if (startedAt == null) setStartedAt(Date.now());
    setVals((v) => ({ ...v, [key]: clean }));
    if (checked) setChecked(false); // editing after a check clears the colours
  };

  const total = inputCells.length;
  const correctCount = checked
    ? inputCells.filter((ic) => isCorrect(vals[cellKey(ic.r, ic.c)] || '', ic.answer)).length
    : 0;
  const pct = total ? Math.round((correctCount / total) * 100) : 0;
  const wrong = checked
    ? inputCells.filter((ic) => !isCorrect(vals[cellKey(ic.r, ic.c)] || '', ic.answer))
    : [];

  const onReset = () => {
    setVals({});
    setChecked(false);
    setWarn(false);
    setStartedAt(null);
    setElapsed(0);
    setCopied(false);
  };

  const onCopy = () => {
    const text = wrong
      .map((ic) => `${rowLabel(rows[ic.r])} · ${cols[ic.c]}: ${t.correct} = ${ic.answer}`)
      .join('\n');
    try {
      void navigator.clipboard?.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  if (!cols.length || !rows.length) return null;

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-night-700">
      {/* Title bar + actions */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <span className="min-w-0 flex-1 font-grotesk text-sm font-bold text-slate-800 dark:text-slate-100">
          {block.title || ' '}
        </span>
        {startedAt != null && (
          <span className="hidden items-center gap-1 text-xs tabular-nums text-slate-400 dark:text-slate-500 sm:inline-flex">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {t.time} {mmss}
          </span>
        )}
        <button
          type="button"
          onClick={() => { setChecked(true); }}
          className="rounded-lg bg-[#1e40af] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1d4ed8] dark:bg-[#2563eb] dark:hover:bg-[#3b82f6]"
        >
          {t.check}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
        >
          {t.reset}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <th className="border border-slate-200 px-3 py-2 dark:border-white/10">{block.indicatorLabel || 'Indicator'}</th>
              {hasGroups && <th className="border border-slate-200 px-3 py-2 dark:border-white/10">{block.groupLabel || 'Group'}</th>}
              {cols.map((c, i) => (
                <th key={i} className="border border-slate-200 px-3 py-2 text-center dark:border-white/10">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => {
              const isStart = r === 0 || rows[r - 1].indicator !== row.indicator;
              let span = 1;
              if (isStart) { for (let j = r + 1; j < rows.length && rows[j].indicator === row.indicator; j++) span++; }
              const zh = row.indicatorZh && row.indicatorZh.trim() ? row.indicatorZh.trim() : '';
              return (
                <tr key={r} className="odd:bg-white even:bg-slate-50/70 dark:odd:bg-transparent dark:even:bg-white/[0.03]">
                  {isStart && (
                    <td
                      rowSpan={span}
                      title={zh || undefined}
                      className={`border border-slate-200 px-3 py-2 align-top font-medium text-slate-700 dark:border-white/10 dark:text-slate-200 ${zh ? 'cursor-help' : ''}`}
                    >
                      {row.indicator}
                      {zh && <span className="ml-1 align-middle text-[10px] text-slate-400 dark:text-slate-500">ⓘ</span>}
                    </td>
                  )}
                  {hasGroups && (
                    <td className="border border-slate-200 px-3 py-2 text-slate-500 dark:border-white/10 dark:text-slate-400">{row.group || ''}</td>
                  )}
                  {cols.map((_, c) => {
                    const cell = (row.cells || [])[c] ?? null;
                    const key = cellKey(r, c);
                    // Not-applicable cell (no input, no value)
                    if (!cell || (!cell.a && !cell.given)) {
                      return <td key={c} className="border border-slate-200 bg-slate-50/40 px-3 py-2 text-center text-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-500" aria-label="N/A">—</td>;
                    }
                    // Pre-given read-only value (shown, never graded)
                    if (cell.given && !cell.a) {
                      return <td key={c} className="border border-slate-200 px-3 py-2 text-center font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">{cell.given}</td>;
                    }
                    // Editable answer cell
                    const val = vals[key] || '';
                    const ok = isCorrect(val, cell.a as string);
                    const blank = !val.trim();
                    const tdBg = !checked
                      ? ''
                      : ok
                        ? 'bg-[#d9f7dd] dark:bg-emerald-500/15'
                        : blank
                          ? 'bg-slate-100 dark:bg-white/5'
                          : 'bg-[#ffe8e8] dark:bg-rose-500/15';
                    return (
                      <td key={c} className={`border border-slate-200 px-2 py-1.5 text-center align-top dark:border-white/10 ${tdBg}`}>
                        <input
                          value={val}
                          onChange={(e) => onInput(key, e.target.value)}
                          inputMode="text"
                          aria-label={`${rowLabel(row)} ${cols[c]}`}
                          className="w-full min-w-[3.5rem] rounded-sm border-b border-slate-300 bg-transparent py-0.5 text-center text-sm text-slate-800 outline-none transition focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/20 dark:text-slate-100 dark:focus:border-blue-400 dark:focus-visible:ring-blue-400"
                        />
                        {checked && !ok && (
                          <div className="mt-1 text-[11px] font-semibold text-[#c82423] dark:text-rose-300">{cell.a}</div>
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

      {/* CJK warning */}
      {warn && (
        <div role="alert" aria-live="assertive" className="border-t border-slate-100 px-4 py-2 text-xs font-medium text-[#c82423] dark:border-white/10 dark:text-rose-300">
          ⚠ {t.cjkWarn}
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <div role="status" aria-live="polite" className="border-t border-slate-100 px-4 py-3 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {t.score}: <span className="tabular-nums">{correctCount}/{total}</span>
            </span>
            <span className={`font-semibold tabular-nums ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {t.accuracy}: {pct}%
            </span>
            {startedAt != null && <span className="text-xs text-slate-400 dark:text-slate-500">{t.time}: {mmss}</span>}
            {wrong.length > 0 && (
              <button
                type="button"
                onClick={onCopy}
                className="ml-auto rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              >
                {copied ? t.copied : t.copy}
              </button>
            )}
          </div>
          {wrong.length === 0 ? (
            <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{t.allCorrect}</p>
          ) : (
            <div className="mt-2.5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t.wrongTitle}</p>
              <ul className="space-y-1">
                {wrong.map((ic) => {
                  const yv = (vals[cellKey(ic.r, ic.c)] || '').trim();
                  return (
                    <li key={`${ic.r}-${ic.c}`} className="flex flex-wrap items-baseline gap-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{rowLabel(rows[ic.r])}</span>
                      <span className="text-slate-400 dark:text-slate-500">· {cols[ic.c]}</span>
                      {yv && <span className="text-[#c82423] line-through dark:text-rose-300">{t.your}: {yv}</span>}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.correct}: {ic.answer}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Rich block renderer ──────────────────────────────────────────────────── */
function RichBlocks({
  blocks,
  lang,
  large,
  onZoom,
}: {
  blocks: Block[];
  lang: Lang;
  large: boolean;
  onZoom: (src: string) => void;
}) {
  // Skip blocks the admin has hidden — they stay in the lesson but are excluded
  // from the student view.
  const visible = blocks.filter((b) => !b.hidden);
  // If the page has real audio attached, don't show the "audio unavailable"
  // notice after its "listen" instructions.
  const hasAudio = visible.some((b) => b.t === 'audio');
  return (
    <div className={`space-y-3 text-slate-700 dark:text-slate-300 ${large ? 'text-[15px] leading-7' : 'text-sm leading-relaxed'}`}>
      {visible.map((block, i) => {
        if (block.t === 'img') {
          const sizeClass = block.size === 'full' ? 'w-full' : block.size === 'small' ? 'max-w-xs' : 'max-w-2xl';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onZoom(block.v)}
              title={STR[lang].clickEnlarge}
              className={`group relative my-4 block cursor-zoom-in ${sizeClass}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.v} alt="" loading="lazy" className="w-full rounded-xl border border-slate-200 shadow-sm transition group-hover:shadow-md dark:border-white/10" />
              <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4M11 8v6M8 11h6" /></svg>
              </span>
            </button>
          );
        }
        if (block.t === 'vid') return <VimeoEmbed key={i} id={block.v} />;
        if (block.t === 'yt') return <YoutubeEmbed key={i} id={block.v} label={block.label} />;
        if (block.t === 'bili') return <BilibiliEmbed key={i} id={block.v} label={block.label} />;
        if (block.t === 'video') return <VideoFile key={i} src={block.v} />;
        if (block.t === 'audio') return <AudioPlayer key={i} src={block.v} label={block.label} />;
        if (block.t === 'tablefill') return <TableFillCheck key={i} block={block} lang={lang} />;
        if (block.t === 'link') return <LinkCard key={i} url={block.v} label={block.label} lang={lang} />;
        if (block.t === 'h2') return <h2 key={i} className="mt-4 font-grotesk text-lg font-bold text-slate-900 dark:text-white">{block.v}</h2>;
        if (block.t === 'h3') return <h3 key={i} className="mt-3 font-grotesk text-sm font-bold text-slate-800 dark:text-slate-200">{block.v}</h3>;
        if (block.t === 'ul') {
          return (
            <ul key={i} className="space-y-1.5 pl-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-violet/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.t === 'ol') {
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-slate-400 dark:marker:text-slate-500">
              {block.items.map((item, j) => (
                <li key={j} className="pl-1">{item}</li>
              ))}
            </ol>
          );
        }
        if (block.t === 'p' && block.v) {
          return (
            <Fragment key={i}>
              <p>{block.v}</p>
              {isAudioTask(block.v) && !hasAudio && <AudioNotice lang={lang} />}
            </Fragment>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ── Page card (header badge + content) — exported for the editor's live preview. */
export function PageCard({
  page,
  pageType,
  totalPages,
  lang,
  onZoom,
}: {
  page: RichPage;
  pageType: string | null;
  totalPages: number;
  lang: Lang;
  onZoom: (src: string) => void;
}) {
  const meta = pageType && PAGE_TYPE_META[pageType] ? PAGE_TYPE_META[pageType] : null;
  const large = pageType === 'Involve Me' || pageType === 'Summary';
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-night-700">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
        {meta && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
            {lang === 'zh' ? `${meta.zh} · ${meta.en}` : meta.en}
          </span>
        )}
        <span className="font-grotesk text-xs font-semibold text-slate-400 dark:text-slate-500">
          {lang === 'zh' ? `${STR.zh.page} ${page.page} ${STR.zh.of} ${totalPages} 页` : `Page ${page.page} of ${totalPages}`}
        </span>
      </div>
      <div className="px-6 py-6">
        <RichBlocks blocks={page.blocks} lang={lang} large={large} onZoom={onZoom} />
      </div>
    </article>
  );
}

/* ── Completion card ──────────────────────────────────────────────────────── */
function CompletionCard({
  modId,
  title,
  lang,
  hasTest,
  nextModId,
  onRestart,
}: {
  modId: string;
  title: string;
  lang: Lang;
  hasTest: boolean;
  nextModId: string | null;
  onRestart: () => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm dark:border-white/10 dark:bg-night-700">
      <div className="h-1.5 w-full bg-ngs-gradient" />
      <div className="px-6 py-10">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-ngs-gradient text-white shadow-[0_10px_24px_-10px_rgba(236,28,139,0.7)]">
          <Icon name="check" className="h-8 w-8" stroke={2.2} />
        </div>
        <h2 className="font-grotesk text-2xl font-bold text-slate-900 dark:text-white">{STR[lang].moduleComplete} 🎉</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{STR[lang].congrats(modId, title)}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {hasTest && (
            <Link
              href={`/admin/ielts_training/module/${modId}/test`}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 font-grotesk text-sm font-bold text-white transition hover:bg-pink-600"
            >
              {STR[lang].startPractice}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
          {nextModId && (
            <Link
              href={`/admin/ielts_training/module/${nextModId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5"
            >
              {STR[lang].nextModule}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
          <Link
            href="/admin/ielts_training"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {STR[lang].backToList}
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /></svg>
            {STR[lang].reviewFromStart}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Table of contents (sidebar + mobile drawer share this) ───────────────── */
function Toc({
  pageTitles,
  pages,
  current,
  visited,
  lang,
  onSelect,
}: {
  pageTitles: (string | null)[];
  pages: RichPage[];
  current: number;
  visited: Set<number>;
  lang: Lang;
  onSelect: (i: number) => void;
}) {
  const viewedCount = pages.filter((p) => visited.has(p.page)).length;
  return (
    <nav>
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{STR[lang].contents}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <span className="block h-full rounded-full bg-ngs-gradient" style={{ width: `${pages.length ? (viewedCount / pages.length) * 100 : 0}%` }} />
          </div>
          <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">{viewedCount}/{pages.length}</span>
        </div>
      </div>
      <ol className="space-y-0.5">
        {pages.map((p, i) => {
          const active = i === current;
          const seen = visited.has(p.page);
          return (
            <li key={p.page}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  active
                    ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-night'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                    active
                      ? 'bg-white/20 text-white dark:bg-night/20 dark:text-night'
                      : seen
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                  }`}
                >
                  {seen && !active ? (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="line-clamp-2 leading-snug">{pageTitles[i] || `${STR[lang].page} ${p.page}`}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Main viewer ──────────────────────────────────────────────────────────── */
export function ModuleLessonViewer({ modId }: { modId: string }) {
  // Start from the shipped default (instant render), then overlay any admin
  // override loaded from the content store (DB or this-browser trial).
  const [richData, setRichData] = useState<RichData | null>(() => BUILTIN_RICH[modId] ?? null);
  useEffect(() => {
    setRichData(BUILTIN_RICH[modId] ?? null);
    let active = true;
    void loadModuleContent(modId).then((d) => { if (active) setRichData(d); });
    return () => { active = false; };
  }, [modId]);
  const pages = useMemo(() => richData?.pages ?? [], [richData]);
  const totalPages = pages.length;
  const hasTest = moduleHasTest(modId);
  const nextModId = MODULE_IDS.includes(modId as (typeof MODULE_IDS)[number])
    ? String(Number(modId) + 1)
    : null;
  const hasNextModule = nextModId !== null && MODULE_IDS.includes(nextModId as (typeof MODULE_IDS)[number]);

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<ViewMode>('paged');
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const pageRefs = useRef<(HTMLElement | null)[]>([]);

  const title = (MODULE_TITLES[modId] ? MODULE_TITLES[modId][lang] : null) ?? `Module ${modId}`;
  const typeOf = useCallback(
    (p: RichPage) => {
      const t = richData?.pageTypes?.[String(p.page)] ?? null;
      return t && t !== 'None' ? t : null;
    },
    [richData],
  );

  const pageTitles = useMemo(
    () =>
      pages.map((p) => {
        if (p.title && p.title.trim()) return p.title.trim();
        const h = p.blocks.find((b) => b.t === 'h2') ?? p.blocks.find((b) => b.t === 'h3');
        return h && 'v' in h ? h.v : null;
      }),
    [pages],
  );

  /* Load persisted prefs + visited set on mount (hydration-safe). */
  useEffect(() => {
    try {
      const t = localStorage.getItem('ielts:theme');
      if (t === 'dark' || t === 'light') setTheme(t);
      const l = localStorage.getItem('ielts:lang');
      if (l === 'en' || l === 'zh') setLang(l);
      const m = localStorage.getItem('ielts:viewmode');
      if (m === 'paged' || m === 'scroll') setMode(m);
      const v = localStorage.getItem(`ielts:visited:${modId}`);
      // Reset (not just conditionally set) so switching to a fresh module does
      // not inherit the previous module's visited pages.
      setVisited(v ? new Set<number>(JSON.parse(v)) : new Set<number>());
    } catch {
      /* ignore */
    }
    // The route reuses this component instance across /module/N navigations
    // (no React key), so reset the page index to the start of the new module.
    setIdx(0);
    setMounted(true);
  }, [modId]);

  /* Persist prefs. */
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:theme', theme); } catch {} }, [theme, mounted]);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:lang', lang); } catch {} }, [lang, mounted]);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:viewmode', mode); } catch {} }, [mode, mounted]);
  useEffect(() => {
    if (mounted) try { localStorage.setItem(`ielts:visited:${modId}`, JSON.stringify([...visited])); } catch {}
  }, [visited, mounted, modId]);

  /* Mark current page visited (paged mode). */
  useEffect(() => {
    if (!mounted || mode !== 'paged') return;
    const safe = totalPages ? Math.min(Math.max(0, idx), totalPages - 1) : 0;
    const pn = pages[safe]?.page;
    if (pn == null) return;
    setVisited((prev) => (prev.has(pn) ? prev : new Set(prev).add(pn)));
  }, [idx, mounted, mode, pages, totalPages]);

  /* Scroll mode: track current section + mark visited via IntersectionObserver. */
  useEffect(() => {
    if (!mounted || mode !== 'scroll') return;
    const els = pageRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.idx);
          ratios.set(i, e.intersectionRatio);
          // Mark visited at 40% coverage; but the final (often short) section
          // sits above the completion card and may never reach 40% on tall
          // viewports — accept any intersection for it so progress hits 100%.
          if (e.intersectionRatio > 0.4 || (i === pages.length - 1 && e.isIntersecting)) {
            const pn = pages[i]?.page;
            if (pn != null) setVisited((prev) => (prev.has(pn) ? prev : new Set(prev).add(pn)));
          }
        }
        let best = -1;
        let bestR = 0;
        ratios.forEach((r, i) => {
          if (r > bestR) { bestR = r; best = i; }
        });
        if (best >= 0) setIdx(best);
      },
      { threshold: [0, 0.25, 0.4, 0.6, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [mode, mounted, pages]);

  /* Escape closes lightbox / drawer; arrow keys page (paged mode). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setZoomSrc(null); setSidebarOpen(false); return; }
      if (mode !== 'paged') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(totalPages - 1, i + 1));
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, totalPages]);

  /* Lock body scroll while lightbox open. */
  useEffect(() => {
    if (zoomSrc) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [zoomSrc]);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, i));
      if (mode === 'scroll') {
        pageRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setIdx(clamped);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setSidebarOpen(false);
    },
    [mode, totalPages],
  );

  // Clamp the index for all derived rendering so a stale value (e.g. for the
  // one frame after a module switch, before the reset effect runs) can never
  // produce a blank content pane.
  const safeIdx = totalPages ? Math.min(Math.max(0, idx), totalPages - 1) : 0;
  const progressPct = totalPages ? Math.round(((safeIdx + 1) / totalPages) * 100) : 0;
  const t = STR[lang];

  const segBtn = (on: boolean) =>
    `grid h-7 w-7 place-items-center rounded-md transition ${
      on ? 'bg-slate-900 text-white dark:bg-white dark:text-night' : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200'
    }`;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-700 antialiased dark:bg-night dark:text-slate-300">
        {/* ── Top bar ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-night-800/95">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t.contents}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <Link href="/admin/ielts_training" className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white sm:flex">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
              <span className="hidden md:inline">{t.backToCourse}</span>
            </Link>
            <div className="hidden h-4 w-px bg-slate-200 dark:bg-white/10 sm:block" />

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {lang === 'zh' ? `${t.module} ${modId}` : `${t.module} ${modId}`}
              </p>
              <h1 className="truncate font-grotesk text-sm font-bold text-slate-900 dark:text-white">{title}</h1>
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-1.5">
              {/* Language */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
                {(['en', 'zh'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                      lang === l ? 'bg-slate-900 text-white dark:bg-white dark:text-night' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {l === 'en' ? 'EN' : '中'}
                  </button>
                ))}
              </div>

              {/* View mode */}
              <div className="hidden items-center rounded-lg border border-slate-200 p-0.5 dark:border-white/10 sm:flex">
                <button type="button" title={t.pagedView} onClick={() => setMode('paged')} className={segBtn(mode === 'paged')}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16" /></svg>
                </button>
                <button type="button" title={t.scrollView} onClick={() => setMode('scroll')} className={segBtn(mode === 'scroll')}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>

              {/* Theme */}
              <button
                type="button"
                onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
                aria-label={t.toggleTheme}
                title={t.toggleTheme}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>

              {/* Edit content (admin) */}
              <Link
                href={`/admin/ielts_training/module/${modId}/edit`}
                title={t.editContent}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <Icon name="edit" className="h-4 w-4" />
                <span className="hidden md:inline">{t.editContent}</span>
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-slate-100 dark:bg-white/5">
            <div className="h-full bg-ngs-gradient transition-[width] duration-300 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        </header>

        {/* ── Body: sidebar + content ──────────────────────────────── */}
        {totalPages === 0 ? (
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-white/15 dark:text-slate-500">
              {t.noContent}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-6xl gap-6 px-4">
            {/* Desktop sidebar */}
            <aside className="sticky top-[69px] hidden max-h-[calc(100vh-93px)] w-60 shrink-0 self-start overflow-y-auto py-6 pr-1 lg:block">
              <Toc pageTitles={pageTitles} pages={pages} current={safeIdx} visited={visited} lang={lang} onSelect={goTo} />
            </aside>

            {/* Main content */}
            <main className={`min-w-0 flex-1 py-6 ${mode === 'paged' ? 'pb-28' : 'pb-12'}`}>
              {mode === 'paged' ? (
                <>
                  {pages[safeIdx] && (
                    <PageCard page={pages[safeIdx]} pageType={typeOf(pages[safeIdx])} totalPages={totalPages} lang={lang} onZoom={setZoomSrc} />
                  )}
                  {safeIdx === totalPages - 1 && (
                    <CompletionCard modId={modId} title={title} lang={lang} hasTest={hasTest} nextModId={hasNextModule ? nextModId : null} onRestart={() => goTo(0)} />
                  )}
                </>
              ) : (
                <div className="space-y-8">
                  {pages.map((p, i) => (
                    <section
                      key={p.page}
                      data-idx={i}
                      ref={(el) => { pageRefs.current[i] = el; }}
                      className="scroll-mt-24"
                    >
                      <PageCard page={p} pageType={typeOf(p)} totalPages={totalPages} lang={lang} onZoom={setZoomSrc} />
                    </section>
                  ))}
                  <CompletionCard modId={modId} title={title} lang={lang} hasTest={hasTest} nextModId={hasNextModule ? nextModId : null} onRestart={() => goTo(0)} />
                </div>
              )}
            </main>
          </div>
        )}

        {/* ── Mobile TOC drawer ────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-xl dark:bg-night-800">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-grotesk text-sm font-bold text-slate-900 dark:text-white">{t.contents}</p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              <Toc pageTitles={pageTitles} pages={pages} current={safeIdx} visited={visited} lang={lang} onSelect={goTo} />
            </div>
          </div>
        )}

        {/* ── Sticky bottom nav (paged mode) ───────────────────────── */}
        {totalPages > 0 && mode === 'paged' && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-night-800/95">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => goTo(safeIdx - 1)}
                disabled={safeIdx === 0}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">{t.previous}</span>
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <span className="hidden shrink-0 text-xs text-slate-400 dark:text-slate-500 sm:inline">{t.jumpToPage}</span>
                <div className="relative min-w-0 max-w-[70%]">
                  <select
                    value={safeIdx}
                    onChange={(e) => goTo(Number(e.target.value))}
                    className="w-full truncate rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-ngs-violet/60 dark:border-white/10 dark:bg-night-600 dark:text-slate-200"
                  >
                    {pages.map((p, i) => (
                      <option key={p.page} value={i}>
                        {i + 1} · {pageTitles[i] || `${t.page} ${p.page}`}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>

              {safeIdx < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={() => goTo(safeIdx + 1)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-night dark:hover:bg-slate-200"
                >
                  <span className="hidden sm:inline">{t.next}</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : hasTest ? (
                <Link
                  href={`/admin/ielts_training/module/${modId}/test`}
                  className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-600"
                >
                  <span className="hidden sm:inline">{t.startPractice}</span>
                  <span className="sm:hidden">Test</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                </Link>
              ) : (
                <Link
                  href="/admin/ielts_training"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-night dark:hover:bg-slate-200"
                >
                  <span className="hidden sm:inline">{t.backToList}</span>
                  <span className="sm:hidden">Done</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Image lightbox ───────────────────────────────────────── */}
        {zoomSrc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setZoomSrc(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomSrc} alt="" className="max-h-[92vh] max-w-full rounded-lg shadow-2xl" />
            <button
              type="button"
              onClick={() => setZoomSrc(null)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
