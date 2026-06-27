'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon, GradientButton, SoftButton } from '@/components/member/design-v1/parts';
import { ImageUploadField } from '@/components/puck/fields/ImageUploadField';
import { getCloudBaseApp } from '@/lib/cloudbase';
import { listCourses, saveCourse, deleteCourse, type SaveMode } from '@/lib/courses/client';
import { slugify, uniqueSlug, type AdminCourse } from '@/lib/courses/types';
import { adminConsoleContent } from './adminConsole.content';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15';
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-slate-600';

/** Resolve a cloud:// handle (or pass a plain URL/blob through) for display. */
function CoverPreview({ value }: { value?: string }) {
  const [url, setUrl] = useState<string | undefined>(value && !value.startsWith('cloud://') ? value : undefined);
  useEffect(() => {
    if (!value) return setUrl(undefined);
    if (!value.startsWith('cloud://')) return setUrl(value);
    let active = true;
    void (async () => {
      const app = await getCloudBaseApp();
      if (!app) return;
      try {
        const r = await app.getTempFileURL({ fileList: [value] });
        const u = r?.fileList?.[0]?.tempFileURL;
        if (active && u) setUrl(u);
      } catch {
        /* leave placeholder */
      }
    })();
    return () => {
      active = false;
    };
  }, [value]);
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ngs-gradient-soft">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center text-ngs-violet">
          <Icon name="book" className="h-8 w-8" />
        </span>
      )}
    </div>
  );
}

export function CoursesSection({ locale, onMode }: { locale: Locale; onMode?: (m: SaveMode) => void }) {
  const t = adminConsoleContent[locale];
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCourse | 'new' | null>(null);

  async function refresh() {
    setLoading(true);
    const res = await listCourses();
    setCourses(res.courses.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    onMode?.(res.mode);
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(c: AdminCourse) {
    if (!window.confirm(t.courses.confirmDel(c.name))) return;
    try {
      await deleteCourse(c.id);
    } catch {
      window.alert(t.courses.delFailed);
      return;
    }
    void refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-grotesk text-2xl font-bold text-slate-900">{t.courses.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.courses.sub}</p>
        </div>
        <GradientButton onClick={() => setEditing('new')}>
          <Icon name="spark" className="h-4 w-4" />
          {t.courses.create}
        </GradientButton>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">…</Card>
      ) : courses.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">{t.courses.empty}</Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CoverPreview value={c.coverImage} />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {c.published ? t.courses.published : t.courses.draft}
                  </span>
                  {c.level && <span className="text-[11px] text-slate-400">{c.level}</span>}
                </div>
                <h3 className="mt-2 font-grotesk text-base font-bold leading-snug text-slate-900">{c.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{t.courses.moduleCount(c.modules?.length || 0)}</p>
                <div className="mt-4 flex gap-2">
                  <SoftButton onClick={() => setEditing(c)} className="!px-3 !py-1.5 !text-xs">
                    <Icon name="edit" className="h-3.5 w-3.5" />
                    {t.courses.edit}
                  </SoftButton>
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    {t.courses.del}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <CourseForm
          locale={locale}
          initial={editing === 'new' ? null : editing}
          existingIds={courses.map((c) => c.id)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
          }}
        />
      )}
    </div>
  );
}

function CourseForm({
  locale,
  initial,
  existingIds,
  onClose,
  onSaved,
}: {
  locale: Locale;
  initial: AdminCourse | null;
  existingIds: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = adminConsoleContent[locale];
  const f = t.form;
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [level, setLevel] = useState(initial?.level || '');
  const [track, setTrack] = useState(initial?.track || '');
  const [cover, setCover] = useState(initial?.coverImage || '');
  const [published, setPublished] = useState<boolean>(initial?.published ?? false);
  const [modules, setModules] = useState<string[]>(initial?.modules?.map((m) => m.title) || ['']);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function setModule(i: number, v: string) {
    setModules((m) => m.map((x, idx) => (idx === i ? v : x)));
  }

  async function onSubmit() {
    if (!name.trim()) {
      setStatus(f.nameRequired);
      return;
    }
    setSaving(true);
    setStatus('');
    const course: AdminCourse = {
      // On create, ensure the slug id is unique so we never overwrite another course.
      id: initial?.id || uniqueSlug(slugify(name), existingIds),
      name: name.trim(),
      description: description.trim() || undefined,
      level: level.trim() || undefined,
      track: track.trim() || undefined,
      coverImage: cover || undefined,
      published,
      createdAt: initial?.createdAt,
      modules: modules
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) => ({ title, progress: 0, mcqButton: 'mcq' as const })),
    };
    let mode: SaveMode;
    try {
      mode = await saveCourse(course);
    } catch {
      setSaving(false);
      setStatus(f.saveFailed);
      return;
    }
    setSaving(false);
    setStatus(mode === 'cloud' ? f.savedCloud : f.savedLocal);
    setTimeout(onSaved, 500);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4 sm:place-items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-grotesk text-lg font-bold text-slate-900">{initial ? f.editTitle : f.newTitle}</h2>
          <button type="button" onClick={onClose} aria-label={f.cancel} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>{f.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{f.description}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={f.descriptionPh} rows={3} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{f.level}</label>
              <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder={f.levelPh} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{f.track}</label>
              <input value={track} onChange={(e) => setTrack(e.target.value)} placeholder={f.trackPh} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{f.cover}</label>
            <ImageUploadField value={cover} onChange={setCover} label="" />
          </div>
          <div>
            <label className={labelCls}>{f.modules}</label>
            <div className="space-y-2">
              {modules.map((mod, i) => (
                <div key={i} className="flex gap-2">
                  <input value={mod} onChange={(e) => setModule(i, e.target.value)} placeholder={f.modulePh} className={inputCls} />
                  {modules.length > 1 && (
                    <button type="button" onClick={() => setModules((m) => m.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl border border-slate-200 px-3 text-slate-400 hover:bg-slate-100" aria-label="Remove">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setModules((m) => [...m, ''])} className="text-sm font-semibold text-ngs-violet hover:underline">
                + {f.addModule}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded accent-[#8b2fd6]" />
            {f.publishedLabel}
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {status && <span className="mr-auto text-sm font-medium text-emerald-600">{status}</span>}
          <SoftButton onClick={onClose}>{f.cancel}</SoftButton>
          <GradientButton onClick={onSubmit}>{saving ? f.saving : f.save}</GradientButton>
        </div>
      </div>
    </div>
  );
}
