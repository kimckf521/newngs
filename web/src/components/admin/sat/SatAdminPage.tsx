'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  SatQuestion, SatForm, SatSection, SatDomain, SatSkill, SatDifficulty, SatChoiceKey, SatModule,
} from '@/lib/sat/types';
import {
  DIFFICULTY_LABEL, DOMAIN_LABEL, SKILL_LABEL,
  DOMAINS_BY_SECTION, SKILLS_BY_DOMAIN, slugify, uniqueSlug,
} from '@/lib/sat/types';
import {
  listQuestions, saveQuestion, deleteQuestion, listForms, saveForm, type SaveMode,
} from '@/lib/sat/client';
import { secLabel, domLabel, diffLabel } from '@/components/member/sat/i18n';
import originalBundle from '@/components/member/sat/data/originalForm.json';

const CHOICE_KEYS: SatChoiceKey[] = ['A', 'B', 'C', 'D'];
// "Import" seeds the cloud DB with the 168 original NGS-authored items + the form.
const SAMPLE = originalBundle as unknown as { form: SatForm; questions: SatQuestion[] };

/* --------------------------------------------------------------- i18n
 * UI chrome is bilingual (EN / 简体中文). The official Digital SAT taxonomy
 * (section / domain / skill labels from lib/sat/types) stays in English — those
 * are College Board category names shared with the student runner. */
const L = {
  en: {
    back: 'Back',
    title: 'SAT Question Bank', subtitle: 'Digital SAT items + forms · storage:',
    cloud: 'Cloud (Postgres)', local: 'Local (trial)',
    preview: 'Preview as student', import: 'Import 168 original questions', importing: 'Importing…',
    tabQuestions: 'Questions', tabForms: 'Forms',
    newRW: '+ New R&W', newMath: '+ New Math',
    noQuestions: 'No questions yet. Create one or import the demo content.',
    selectQuestion: 'Select a question to edit, or create a new one.',
    live: 'live', draft: 'draft', noStem: '(no stem)',
    newQuestion: 'New question', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save',
    domain: 'Domain', skill: 'Skill', difficulty: 'Difficulty', format: 'Format',
    mc: 'Multiple choice', spr: 'Student-produced response',
    passage: 'Passage / stimulus', stem: 'Question stem',
    accepted: 'Accepted answers (comma-separated, e.g. 7/2, 3.5, 3.50)',
    choicesLabel: 'Answer choices (select the correct one)', choice: 'Choice',
    explanation: 'Explanation', source: 'Source', published: 'Published', visible: 'Visible to students',
    newForm: '+ New form', noForms: 'No forms yet.', selectForm: 'Select a form to edit, or create a new one.',
    newFormTitle: 'New form', name: 'Name', description: 'Description', selected: 'selected',
    noSecQ: 'No questions in this section yet.',
    mod: { rwM1: 'R&W · Module 1', rwM2Upper: 'R&W · Module 2 (harder)', rwM2Lower: 'R&W · Module 2 (easier)', mathM1: 'Math · Module 1', mathM2Upper: 'Math · Module 2 (harder)', mathM2Lower: 'Math · Module 2 (easier)' } as Record<keyof SatForm['modules'], string>,
    imported: (n: number) => `Imported ${n} original questions + 1 form.`,
    importFailed: (m: string) => `Import failed: ${m}`,
    savedMode: (m: string) => `Saved (${m}).`,
    saveFailed: (m: string) => `Save failed: ${m}`,
    deleted: 'Deleted.', deleteFailed: (m: string) => `Delete failed: ${m}`,
    savedForm: (m: string) => `Saved form (${m}).`,
  },
  zh: {
    back: '返回',
    title: 'SAT 题库', subtitle: '数字 SAT 题目与试卷 · 存储：',
    cloud: '云端 (Postgres)', local: '本地（试用）',
    preview: '学生视角预览', import: '导入 168 道原创题', importing: '导入中…',
    tabQuestions: '题目', tabForms: '试卷',
    newRW: '+ 新增 阅读写作', newMath: '+ 新增 数学',
    noQuestions: '暂无题目。请新建，或导入示例内容。',
    selectQuestion: '选择一道题进行编辑，或新建一道。',
    live: '已上线', draft: '草稿', noStem: '（无题干）',
    newQuestion: '新建题目', edit: '编辑', delete: '删除', cancel: '取消', save: '保存',
    domain: '领域', skill: '技能', difficulty: '难度', format: '题型',
    mc: '选择题', spr: '考生作答（填空）',
    passage: '文章 / 材料', stem: '题干',
    accepted: '可接受答案（英文逗号分隔，例：7/2, 3.5, 3.50）',
    choicesLabel: '选项（请选出正确答案）', choice: '选项',
    explanation: '解析', source: '来源', published: '发布', visible: '对学生可见',
    newForm: '+ 新建试卷', noForms: '暂无试卷。', selectForm: '选择一份试卷进行编辑，或新建一份。',
    newFormTitle: '新建试卷', name: '名称', description: '简介', selected: '已选',
    noSecQ: '此部分暂无题目。',
    mod: { rwM1: '阅读写作 · 模块 1', rwM2Upper: '阅读写作 · 模块 2（较难）', rwM2Lower: '阅读写作 · 模块 2（较易）', mathM1: '数学 · 模块 1', mathM2Upper: '数学 · 模块 2（较难）', mathM2Lower: '数学 · 模块 2（较易）' } as Record<keyof SatForm['modules'], string>,
    imported: (n: number) => `已导入 ${n} 道原创题 + 1 份试卷。`,
    importFailed: (m: string) => `导入失败：${m}`,
    savedMode: (m: string) => `已保存（${m}）。`,
    saveFailed: (m: string) => `保存失败：${m}`,
    deleted: '已删除。', deleteFailed: (m: string) => `删除失败：${m}`,
    savedForm: (m: string) => `已保存试卷（${m}）。`,
  },
};
type Lang = keyof typeof L;
type Dict = (typeof L)['en'];

const blank = (section: SatSection): SatQuestion => {
  const domain = DOMAINS_BY_SECTION[section][0];
  const skill = SKILLS_BY_DOMAIN[domain][0];
  const base = {
    id: `${section === 'math' ? 'math' : 'rw'}-${Date.now().toString(36)}`,
    section, domain, skill, difficulty: 'medium' as SatDifficulty,
    stem: '', explanation: '', source: 'NGS', published: false,
  };
  if (section === 'reading_writing') {
    return { ...base, domain: domain as never, skill: skill as never, format: 'mc', passage: '', choices: CHOICE_KEYS.map((id) => ({ id, text: '' })), correct: 'A' } as SatQuestion;
  }
  return { ...base, domain: domain as never, skill: skill as never, format: 'mc', choices: CHOICE_KEYS.map((id) => ({ id, text: '' })), correct: 'A' } as SatQuestion;
};

function SunMoon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" /></svg>
  );
}

export function SatAdminPage() {
  const [tab, setTab] = useState<'questions' | 'forms'>('questions');
  const [questions, setQuestions] = useState<SatQuestion[]>([]);
  const [forms, setForms] = useState<SatForm[]>([]);
  const [mode, setMode] = useState<SaveMode>('local');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [dark, setDark] = useState(true);
  const l = L[lang];
  const router = useRouter();

  const changeLang = (nl: Lang) => { setLang(nl); try { localStorage.setItem('sat:lang', nl); } catch {} };
  const toggleTheme = () => setDark((v) => { const n = !v; try { localStorage.setItem('qbank:dark', n ? '1' : '0'); } catch {} return n; });

  useEffect(() => {
    try { const s = localStorage.getItem('sat:lang'); if (s === 'en' || s === 'zh') setLang(s); } catch {}
    try { const d = localStorage.getItem('qbank:dark'); if (d === '0' || d === '1') setDark(d === '1'); } catch {}
  }, []);

  async function refresh() {
    const [q, f] = await Promise.all([listQuestions(), listForms()]);
    setQuestions(q.items);
    setForms(f.items);
    setMode(q.mode);
  }
  useEffect(() => { void refresh(); }, []);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2200); }

  async function seedDemo() {
    setBusy(true);
    try {
      for (const q of SAMPLE.questions) await saveQuestion({ ...q, published: true });
      await saveForm({ ...SAMPLE.form, published: true });
      await refresh();
      flash(l.imported(SAMPLE.questions.length));
    } catch (e) {
      flash(l.importFailed((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`dv1 ${dark ? 'dv1-dark' : ''} min-h-screen`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[var(--dv1-topbar)] px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button type="button" onClick={() => router.back()} aria-label={l.back} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
              {l.back}
            </button>
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold text-slate-900">{l.title}</h1>
              <p className="text-[12px] text-slate-500">
                {l.subtitle} <b className={mode === 'cloud' ? 'text-emerald-600' : 'text-amber-600'}>{mode === 'cloud' ? l.cloud : l.local}</b>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href="/student/sat" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-ngs-gradient px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">{l.preview} ↗</a>
            <button type="button" disabled={busy} onClick={seedDemo} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50">{busy ? l.importing : l.import}</button>
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"><SunMoon dark={dark} /></button>
            <div className="flex items-center rounded-lg border border-slate-300 p-0.5">
              {(['en', 'zh'] as const).map((ll) => (
                <button key={ll} type="button" onClick={() => changeLang(ll)} className={`rounded-md px-2 py-1 text-[12px] font-bold transition ${lang === ll ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {ll === 'en' ? 'EN' : '中'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5 flex gap-2">
          {(['questions', 'forms'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${tab === t ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              {t === 'questions' ? `${l.tabQuestions} (${questions.length})` : `${l.tabForms} (${forms.length})`}
            </button>
          ))}
        </div>

        {tab === 'questions'
          ? <QuestionsTab l={l} lang={lang} questions={questions} onSaved={refresh} flash={flash} />
          : <FormsTab l={l} forms={forms} questions={questions} onSaved={refresh} flash={flash} />}
      </div>

      {toast ? <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-lg">{toast}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- questions */

// Compact, colour-coded section chip so Math vs Reading & Writing is obvious at
// a glance. RW = indigo, Math = amber (distinct from the emerald "published" badge).
function sectionChipClass(section: SatSection): string {
  return section === 'math' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700';
}
function sectionShort(section: SatSection, lang: Lang): string {
  if (lang === 'zh') return section === 'math' ? '数学' : '阅读写作';
  return section === 'math' ? 'Math' : 'R&W';
}

function QuestionsTab({ l, lang, questions, onSaved, flash }: { l: Dict; lang: Lang; questions: SatQuestion[]; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [editing, setEditing] = useState<SatQuestion | null>(null);
  const [sec, setSec] = useState<SatSection | 'all'>('all');

  const rwCount = useMemo(() => questions.filter((q) => q.section === 'reading_writing').length, [questions]);
  const mathCount = useMemo(() => questions.filter((q) => q.section === 'math').length, [questions]);
  const shown = sec === 'all' ? questions : questions.filter((q) => q.section === sec);

  const filters: { key: SatSection | 'all'; label: string; n: number; active: string }[] = [
    { key: 'all', label: lang === 'zh' ? '全部' : 'All', n: questions.length, active: 'bg-slate-900 text-white border-slate-900' },
    { key: 'reading_writing', label: sectionShort('reading_writing', lang), n: rwCount, active: 'bg-indigo-600 text-white border-indigo-600' },
    { key: 'math', label: sectionShort('math', lang), n: mathCount, active: 'bg-amber-500 text-white border-amber-500' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-2 flex gap-2">
          <button type="button" onClick={() => setEditing(blank('reading_writing'))} className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 text-[13px] font-semibold text-indigo-700 hover:bg-indigo-50">{l.newRW}</button>
          <button type="button" onClick={() => setEditing(blank('math'))} className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-[13px] font-semibold text-amber-700 hover:bg-amber-50">{l.newMath}</button>
        </div>
        {/* section filter — makes the Math / R&W split explicit */}
        <div className="mb-2 flex gap-1.5">
          {filters.map((f) => (
            <button key={f.key} type="button" onClick={() => setSec(f.key)}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${sec === f.key ? f.active : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {f.label} <span className="tabular-nums opacity-80">{f.n}</span>
            </button>
          ))}
        </div>
        <div className="max-h-[66vh] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {shown.length === 0 ? <div className="p-4 text-[13px] text-slate-500">{l.noQuestions}</div> : null}
          {shown.map((q) => (
            <button key={q.id} type="button" onClick={() => setEditing(q)}
              className={`block w-full px-4 py-2.5 text-left hover:bg-slate-50 ${editing?.id === q.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${sectionChipClass(q.section)}`}>{sectionShort(q.section, lang)}</span>
                  <span className="truncate text-[13px] font-semibold text-slate-900">{q.id}</span>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${q.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{q.published ? l.live : l.draft}</span>
              </div>
              <div className="mt-0.5 truncate text-[12px] text-slate-500">{domLabel(q.domain, lang)} · {diffLabel(q.difficulty, lang)}</div>
              <div className="truncate text-[12px] text-slate-400">{q.stem || l.noStem}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        {editing
          ? <QuestionEditor key={editing.id} l={l} initial={editing} existingIds={questions.map((q) => q.id)} onClose={() => setEditing(null)} onSaved={onSaved} flash={flash} />
          : <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 text-[13px] text-slate-400">{l.selectQuestion}</div>}
      </div>
    </div>
  );
}

function QuestionEditor({ l, initial, existingIds, onClose, onSaved, flash }: { l: Dict; initial: SatQuestion; existingIds: string[]; onClose: () => void; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [q, setQ] = useState<SatQuestion>(initial);
  const isNew = !existingIds.includes(initial.id);
  const section = q.section;
  const domains = DOMAINS_BY_SECTION[section];
  const skills = SKILLS_BY_DOMAIN[q.domain];
  const isSpr = (q as { format?: string }).format === 'spr';

  function patch(p: Partial<SatQuestion>) { setQ((cur) => ({ ...cur, ...p } as SatQuestion)); }
  function setChoice(id: SatChoiceKey, text: string) {
    setQ((cur) => ({ ...cur, choices: ((cur as { choices?: { id: SatChoiceKey; text: string }[] }).choices || []).map((c) => (c.id === id ? { ...c, text } : c)) } as SatQuestion));
  }

  async function onSave() {
    const id = isNew ? uniqueSlug(slugify(q.id), existingIds) : q.id;
    try {
      const mode = await saveQuestion({ ...q, id });
      await onSaved();
      flash(l.savedMode(mode));
      onClose();
    } catch (e) {
      flash(l.saveFailed((e as Error).message));
    }
  }
  async function onDelete() {
    try { await deleteQuestion(q.id); await onSaved(); flash(l.deleted); onClose(); }
    catch (e) { flash(l.deleteFailed((e as Error).message)); }
  }

  const choices = (q as { choices?: { id: SatChoiceKey; text: string }[] }).choices || [];
  const correct = (q as { correct?: SatChoiceKey }).correct;
  const accepted = (q as { answer?: { accepted: string[] } }).answer?.accepted?.join(', ') || '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-slate-900">{isNew ? l.newQuestion : `${l.edit} ${q.id}`}</h3>
        <div className="flex gap-2">
          {!isNew ? <button type="button" onClick={onDelete} className="rounded-lg border border-red-300 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50">{l.delete}</button> : null}
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">{l.cancel}</button>
          <button type="button" onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700">{l.save}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={l.domain}>
          <Select value={q.domain} onChange={(v) => { const d = v as SatDomain; patch({ domain: d, skill: SKILLS_BY_DOMAIN[d][0] } as Partial<SatQuestion>); }}
            options={domains.map((d) => [d, DOMAIN_LABEL[d]])} />
        </Field>
        <Field label={l.skill}>
          <Select value={q.skill} onChange={(v) => patch({ skill: v as SatSkill } as Partial<SatQuestion>)} options={skills.map((s) => [s, SKILL_LABEL[s]])} />
        </Field>
        <Field label={l.difficulty}>
          <Select value={q.difficulty} onChange={(v) => patch({ difficulty: v as SatDifficulty })} options={(['easy', 'medium', 'hard'] as SatDifficulty[]).map((d) => [d, DIFFICULTY_LABEL[d]])} />
        </Field>
        {section === 'math' ? (
          <Field label={l.format}>
            <Select value={isSpr ? 'spr' : 'mc'} onChange={(v) => {
              if (v === 'spr') patch({ format: 'spr', answer: { accepted: [] }, choices: undefined, correct: undefined } as unknown as Partial<SatQuestion>);
              else patch({ format: 'mc', choices: CHOICE_KEYS.map((id) => ({ id, text: '' })), correct: 'A', answer: undefined } as unknown as Partial<SatQuestion>);
            }} options={[['mc', l.mc], ['spr', l.spr]]} />
          </Field>
        ) : <Field label={l.format}><div className="px-1 py-2 text-[13px] text-slate-500">{l.mc}</div></Field>}
      </div>

      {section === 'reading_writing' ? (
        <Field label={l.passage}>
          <textarea value={(q as { passage?: string }).passage || ''} onChange={(e) => patch({ passage: e.target.value } as Partial<SatQuestion>)} rows={4} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" />
        </Field>
      ) : null}

      <Field label={l.stem}>
        <textarea value={q.stem} onChange={(e) => patch({ stem: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" />
      </Field>

      {isSpr ? (
        <Field label={l.accepted}>
          <input value={accepted} onChange={(e) => patch({ answer: { accepted: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } } as unknown as Partial<SatQuestion>)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" />
        </Field>
      ) : (
        <Field label={l.choicesLabel}>
          <div className="space-y-2">
            {choices.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <button type="button" onClick={() => patch({ correct: c.id } as Partial<SatQuestion>)}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${correct === c.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-600'}`}>{c.id}</button>
                <input value={c.text} onChange={(e) => setChoice(c.id, e.target.value)} placeholder={`${l.choice} ${c.id}`} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[13px] text-slate-900" />
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field label={l.explanation}>
        <textarea value={q.explanation || ''} onChange={(e) => patch({ explanation: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={l.source}><input value={q.source || ''} onChange={(e) => patch({ source: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" /></Field>
        <Field label={l.published}>
          <label className="flex items-center gap-2 py-2 text-[13px] text-slate-700"><input type="checkbox" checked={q.published} onChange={(e) => patch({ published: e.target.checked })} /> {l.visible}</label>
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

const MODULE_SLOTS: { key: keyof SatForm['modules']; section: SatSection; index: 1 | 2; route: SatModule['difficultyForm'] }[] = [
  { key: 'rwM1', section: 'reading_writing', index: 1, route: 'fixed' },
  { key: 'rwM2Upper', section: 'reading_writing', index: 2, route: 'upper' },
  { key: 'rwM2Lower', section: 'reading_writing', index: 2, route: 'lower' },
  { key: 'mathM1', section: 'math', index: 1, route: 'fixed' },
  { key: 'mathM2Upper', section: 'math', index: 2, route: 'upper' },
  { key: 'mathM2Lower', section: 'math', index: 2, route: 'lower' },
];

function emptyForm(): SatForm {
  const mk = (slot: typeof MODULE_SLOTS[number]): SatModule => ({
    id: slot.key, section: slot.section, index: slot.index, difficultyForm: slot.route,
    questionIds: [], timeLimitSec: slot.section === 'math' ? 2100 : 1920,
  });
  return {
    id: `form-${Date.now().toString(36)}`, name: 'New Practice Form', description: '', published: false,
    modules: {
      rwM1: mk(MODULE_SLOTS[0]), rwM2Upper: mk(MODULE_SLOTS[1]), rwM2Lower: mk(MODULE_SLOTS[2]),
      mathM1: mk(MODULE_SLOTS[3]), mathM2Upper: mk(MODULE_SLOTS[4]), mathM2Lower: mk(MODULE_SLOTS[5]),
    },
  };
}

function FormsTab({ l, forms, questions, onSaved, flash }: { l: Dict; forms: SatForm[]; questions: SatQuestion[]; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [editing, setEditing] = useState<SatForm | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <button type="button" onClick={() => setEditing(emptyForm())} className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">{l.newForm}</button>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {forms.length === 0 ? <div className="p-4 text-[13px] text-slate-500">{l.noForms}</div> : null}
          {forms.map((f) => (
            <button key={f.id} type="button" onClick={() => setEditing(f)} className={`block w-full px-4 py-2.5 text-left hover:bg-slate-50 ${editing?.id === f.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-900">{f.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${f.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{f.published ? l.live : l.draft}</span>
              </div>
              <div className="text-[11px] text-slate-400">{f.id}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        {editing
          ? <FormEditor key={editing.id} l={l} initial={editing} existingIds={forms.map((f) => f.id)} questions={questions} onClose={() => setEditing(null)} onSaved={onSaved} flash={flash} />
          : <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 text-[13px] text-slate-400">{l.selectForm}</div>}
      </div>
    </div>
  );
}

function FormEditor({ l, initial, existingIds, questions, onClose, onSaved, flash }: { l: Dict; initial: SatForm; existingIds: string[]; questions: SatQuestion[]; onClose: () => void; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [form, setForm] = useState<SatForm>(initial);
  const isNew = !existingIds.includes(initial.id);
  const bySection = useMemo(() => ({
    reading_writing: questions.filter((q) => q.section === 'reading_writing'),
    math: questions.filter((q) => q.section === 'math'),
  }), [questions]);

  function toggle(slotKey: keyof SatForm['modules'], qid: string) {
    setForm((f) => {
      const mod = f.modules[slotKey];
      const has = mod.questionIds.includes(qid);
      const ids = has ? mod.questionIds.filter((x) => x !== qid) : [...mod.questionIds, qid];
      return { ...f, modules: { ...f.modules, [slotKey]: { ...mod, questionIds: ids } } };
    });
  }

  async function onSave() {
    const id = isNew ? uniqueSlug(slugify(form.name) || form.id, existingIds) : form.id;
    try { const mode = await saveForm({ ...form, id }); await onSaved(); flash(l.savedForm(mode)); onClose(); }
    catch (e) { flash(l.saveFailed((e as Error).message)); }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-slate-900">{isNew ? l.newFormTitle : `${l.edit} ${form.name}`}</h3>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">{l.cancel}</button>
          <button type="button" onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700">{l.save}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={l.name}><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" /></Field>
        <Field label={l.published}><label className="flex items-center gap-2 py-2 text-[13px] text-slate-700"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} /> {l.visible}</label></Field>
      </div>
      <Field label={l.description}><textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900" /></Field>

      <div className="mt-3 space-y-4">
        {MODULE_SLOTS.map((slot) => {
          const mod = form.modules[slot.key];
          const pool = bySection[slot.section];
          return (
            <div key={slot.key} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 text-[13px] font-bold text-slate-700">{l.mod[slot.key]} <span className="font-normal text-slate-400">· {mod.questionIds.length} {l.selected}</span></div>
              <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                {pool.length === 0 ? <span className="text-[12px] text-slate-400">{l.noSecQ}</span> : null}
                {pool.map((q) => {
                  const on = mod.questionIds.includes(q.id);
                  const order = mod.questionIds.indexOf(q.id) + 1;
                  return (
                    <button key={q.id} type="button" onClick={() => toggle(slot.key, q.id)} title={q.stem}
                      className={`rounded-md border px-2 py-1 text-[11px] font-medium ${on ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                      {on ? `${order}. ` : ''}{q.id}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- ui */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-[12px] font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900">
      {options.map(([v, la]) => <option key={v} value={v}>{la}</option>)}
    </select>
  );
}
