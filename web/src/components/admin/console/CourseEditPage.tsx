'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/types';
import { Card, Icon, GradientButton } from '@/components/member/design-v1/parts';
import { ImageUploadField } from '@/components/puck/fields/ImageUploadField';
import { listCourses, saveCourse, deleteCourse } from '@/lib/courses/client';
import { slugify, uniqueSlug, type AdminCourse, type CourseModule } from '@/lib/courses/types';
import { adminConsoleContent } from './adminConsole.content';
import { CoverPreview } from './CoverPreview';
import { QuestionBankPanel } from './QuestionBankPanel';
import { CoursePreview } from './CoursePreview';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15';
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-slate-600';
const sectionTitle = 'font-grotesk text-sm font-bold text-slate-900';

/** Page-specific labels (the form-field strings come from t.form). */
const L = {
  zh: {
    back: '课程', editTitle: '编辑课程', newTitle: '新建课程', del: '删除', preview: '预览',
    basics: '基本信息', modulesT: '课程模块', moduleHint: '学生在课程页看到的章节,按顺序排列。',
    statusT: '发布状态', published: '已发布', draft: '草稿', publishedHint: '已发布的课程会出现在学员端;草稿仅你可见。',
    coverT: '封面图', infoT: '课程信息', slug: '课程 ID(slug)', created: '创建时间', updated: '更新时间', by: '最近修改', loading: '加载中…',
    notFound: '找不到这门课程。', action: '按钮', actions: { mcq: '测验 (MCQ)', retry: '重做', none: '无' },
    moduleTitlePh: '模块标题,如「Reading 阅读专项」', addModule: '添加模块', up: '上移', down: '下移', remove: '删除模块',
  },
  en: {
    back: 'Courses', editTitle: 'Edit course', newTitle: 'New course', del: 'Delete', preview: 'Preview',
    basics: 'Basics', modulesT: 'Modules', moduleHint: 'The chapters students see, in order.',
    statusT: 'Status', published: 'Published', draft: 'Draft', publishedHint: 'Published courses show to students; drafts are visible only to you.',
    coverT: 'Cover image', infoT: 'Course info', slug: 'Course ID (slug)', created: 'Created', updated: 'Updated', by: 'Last edited by', loading: 'Loading…',
    notFound: 'Course not found.', action: 'Button', actions: { mcq: 'Quiz (MCQ)', retry: 'Retry', none: 'None' },
    moduleTitlePh: 'Module title, e.g. "Reading practice"', addModule: 'Add module', up: 'Move up', down: 'Move down', remove: 'Remove module',
  },
} as const;

type ModuleRow = { title: string; mcqButton: NonNullable<CourseModule['mcqButton']> };
const fmtDate = (ms?: number) => (ms ? new Date(ms).toLocaleString() : '—');

export function CourseEditPage({ id, locale }: { id: string; locale: Locale }) {
  const t = adminConsoleContent[locale];
  const f = t.form;
  const l = L[locale];
  const router = useRouter();
  const isNew = id === 'new';
  const BACK = '/admin?section=courses'; // return to the console's Courses tab

  const [loaded, setLoaded] = useState(isNew);
  const [notFound, setNotFound] = useState(false);
  const [existing, setExisting] = useState<AdminCourse | null>(null);
  const [takenIds, setTakenIds] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [track, setTrack] = useState('');
  const [cover, setCover] = useState('');
  const [published, setPublished] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([{ title: '', mcqButton: 'mcq' }]);

  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const list = await listCourses();
      if (!active) return;
      setTakenIds(list.courses.map((c) => c.id));
      if (isNew) {
        setLoaded(true);
        return;
      }
      const c = list.courses.find((x) => x.id === id) || null;
      if (!c) {
        setNotFound(true);
        setLoaded(true);
        return;
      }
      setExisting(c);
      setName(c.name || '');
      setDescription(c.description || '');
      setLevel(c.level || '');
      setTrack(c.track || '');
      setCover(c.coverImage || '');
      setPublished(!!c.published);
      setModules(
        (c.modules?.length ? c.modules : [{ title: '' }]).map((m) => ({
          title: m.title || '',
          mcqButton: m.mcqButton || 'mcq',
        })),
      );
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [id, isNew]);

  function setModule(i: number, patch: Partial<ModuleRow>) {
    setModules((ms) => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }
  function moveModule(i: number, dir: -1 | 1) {
    setModules((ms) => {
      const j = i + dir;
      if (j < 0 || j >= ms.length) return ms;
      const copy = ms.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function onSave() {
    if (!name.trim()) {
      setStatus(f.nameRequired);
      return;
    }
    setSaving(true);
    setStatus('');
    const course: AdminCourse = {
      id: existing?.id || uniqueSlug(slugify(name), takenIds),
      name: name.trim(),
      description: description.trim() || undefined,
      level: level.trim() || undefined,
      track: track.trim() || undefined,
      coverImage: cover || undefined,
      published,
      createdAt: existing?.createdAt,
      modules: modules
        .map((m) => ({ title: m.title.trim(), progress: 0, mcqButton: m.mcqButton }))
        .filter((m) => m.title),
    };
    try {
      const mode = await saveCourse(course);
      setSaving(false);
      setStatus(mode === 'cloud' ? f.savedCloud : f.savedLocal);
      setTimeout(() => router.push(BACK), 650);
    } catch {
      setSaving(false);
      setStatus(f.saveFailed);
    }
  }

  async function onDelete() {
    if (!existing) return;
    if (!window.confirm(t.courses.confirmDel(existing.name))) return;
    try {
      await deleteCourse(existing.id);
      router.push(BACK);
    } catch {
      window.alert(t.courses.delFailed);
    }
  }

  const shell = (children: ReactNode) => (
    <div className="dv1 dv1-dark min-h-screen bg-[#0a0a12] font-sans antialiased">{children}</div>
  );

  if (!loaded) return shell(<div className="p-10 text-sm text-slate-400">{l.loading}</div>);
  if (notFound)
    return shell(
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-sm text-slate-400">{l.notFound}</p>
        <Link href={BACK} className="mt-3 inline-block text-sm font-semibold text-ngs-violet hover:underline">
          ← {l.back}
        </Link>
      </div>,
    );

  return shell(
    <>
      {/* ── Sticky top bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[var(--dv1-topbar)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-5 py-3 sm:px-8">
          <Link href={BACK} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <Icon name="arrow" className="h-4 w-4 -scale-x-100" />
            {l.back}
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="truncate font-grotesk text-sm font-bold text-slate-900">{isNew ? l.newTitle : name || l.editTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            {status && (
              <span className={`text-sm font-medium ${status === f.saveFailed ? 'text-rose-500' : 'text-emerald-500'}`}>{status}</span>
            )}
            <button
              type="button"
              onClick={() => setPreviewing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              👁 {l.preview}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10"
              >
                {l.del}
              </button>
            )}
            <GradientButton onClick={onSave}>{saving ? f.saving : f.save}</GradientButton>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <main className="mx-auto grid max-w-[1120px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-3">
        {/* Left / main */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <p className={sectionTitle}>{l.basics}</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>{f.name}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{f.description}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={f.descriptionPh} rows={3} className={inputCls} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{f.level}</label>
                  <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder={f.levelPh} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{f.track}</label>
                  <input value={track} onChange={(e) => setTrack(e.target.value)} placeholder={f.trackPh} className={inputCls} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={sectionTitle}>{l.modulesT}</p>
                <p className="mt-0.5 text-xs text-slate-400">{l.moduleHint}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">{modules.length}</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {modules.map((m, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ngs-gradient text-xs font-bold text-white">{i + 1}</span>
                  <input
                    value={m.title}
                    onChange={(e) => setModule(i, { title: e.target.value })}
                    placeholder={l.moduleTitlePh}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-ngs-violet/60"
                  />
                  <select
                    value={m.mcqButton}
                    onChange={(e) => setModule(i, { mcqButton: e.target.value as ModuleRow['mcqButton'] })}
                    title={l.action}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 outline-none focus:border-ngs-violet/60"
                  >
                    <option value="mcq">{l.actions.mcq}</option>
                    <option value="retry">{l.actions.retry}</option>
                    <option value="none">{l.actions.none}</option>
                  </select>
                  <div className="flex shrink-0 items-center">
                    <button type="button" onClick={() => moveModule(i, -1)} disabled={i === 0} title={l.up} className="grid h-8 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                      <Icon name="arrow" className="h-4 w-4 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => moveModule(i, 1)} disabled={i === modules.length - 1} title={l.down} className="grid h-8 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                      <Icon name="arrow" className="h-4 w-4 rotate-90" />
                    </button>
                    {modules.length > 1 && (
                      <button type="button" onClick={() => setModules((ms) => ms.filter((_, idx) => idx !== i))} title={l.remove} className="grid h-8 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModules((ms) => [...ms, { title: '', mcqButton: 'mcq' }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ngs-violet hover:underline"
            >
              <Icon name="spark" className="h-4 w-4" /> {l.addModule}
            </button>
          </Card>

          {/* Question bank linked to this course (by id) — present for e.g. `ielts`. */}
          {!isNew && existing && <QuestionBankPanel courseId={existing.id} locale={locale} />}
        </div>

        {/* Right / sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <p className={sectionTitle}>{l.statusT}</p>
            <button
              type="button"
              onClick={() => setPublished((v) => !v)}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-900">{published ? l.published : l.draft}</span>
              </span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${published ? 'bg-ngs-gradient' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${published ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
            </button>
            <p className="mt-2 text-xs text-slate-400">{l.publishedHint}</p>
          </Card>

          <Card className="overflow-hidden">
            <CoverPreview value={cover} />
            <div className="p-5">
              <p className={`${sectionTitle} mb-3`}>{l.coverT}</p>
              <ImageUploadField value={cover} onChange={setCover} label="" />
            </div>
          </Card>

          {!isNew && existing && (
            <Card className="p-5">
              <p className={`${sectionTitle} mb-3`}>{l.infoT}</p>
              <dl className="space-y-2 text-xs">
                {[
                  { k: l.slug, v: existing.id },
                  { k: l.created, v: fmtDate(existing.createdAt) },
                  { k: l.updated, v: fmtDate(existing.updatedAt) },
                  { k: l.by, v: existing.updatedBy || '—' },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">{row.k}</dt>
                    <dd className="truncate font-medium text-slate-600">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </div>
      </main>

      {previewing && (
        <CoursePreview
          name={name}
          modules={modules.map((m) => ({ title: m.title }))}
          locale={locale}
          onClose={() => setPreviewing(false)}
        />
      )}
    </>,
  );
}
