'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  SatQuestion, SatForm, SatSection, SatDomain, SatSkill, SatDifficulty, SatChoiceKey, SatModule,
} from '@/lib/sat/types';
import {
  SECTION_LABEL, DIFFICULTY_LABEL, DOMAIN_LABEL, SKILL_LABEL,
  DOMAINS_BY_SECTION, SKILLS_BY_DOMAIN, slugify, uniqueSlug,
} from '@/lib/sat/types';
import {
  listQuestions, saveQuestion, deleteQuestion, listForms, saveForm, type SaveMode,
} from '@/lib/sat/client';
import sampleBundle from '@/components/member/sat/data/sampleForm.json';

const CHOICE_KEYS: SatChoiceKey[] = ['A', 'B', 'C', 'D'];
const SAMPLE = sampleBundle as unknown as { form: SatForm; questions: SatQuestion[] };

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

export function SatAdminPage() {
  const [tab, setTab] = useState<'questions' | 'forms'>('questions');
  const [questions, setQuestions] = useState<SatQuestion[]>([]);
  const [forms, setForms] = useState<SatForm[]>([]);
  const [mode, setMode] = useState<SaveMode>('local');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

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
      flash('Demo content imported.');
    } catch (e) {
      flash(`Import failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold">SAT Question Bank</h1>
            <p className="text-[12px] text-slate-500">
              Digital SAT items + forms · storage: <b className={mode === 'cloud' ? 'text-emerald-600' : 'text-amber-600'}>{mode === 'cloud' ? 'Cloud (Postgres)' : 'Local (trial)'}</b>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/member/sat" target="_blank" className="rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] font-semibold hover:bg-slate-50">Open runner ↗</a>
            <button type="button" disabled={busy} onClick={seedDemo} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50">Import demo content</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5 flex gap-2">
          {(['questions', 'forms'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize ${tab === t ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              {t} {t === 'questions' ? `(${questions.length})` : `(${forms.length})`}
            </button>
          ))}
        </div>

        {tab === 'questions'
          ? <QuestionsTab questions={questions} onSaved={refresh} flash={flash} />
          : <FormsTab forms={forms} questions={questions} onSaved={refresh} flash={flash} />}
      </div>

      {toast ? <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-lg">{toast}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- questions */

function QuestionsTab({ questions, onSaved, flash }: { questions: SatQuestion[]; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [editing, setEditing] = useState<SatQuestion | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-2 flex gap-2">
          <button type="button" onClick={() => setEditing(blank('reading_writing'))} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold hover:bg-slate-50">+ New R&amp;W</button>
          <button type="button" onClick={() => setEditing(blank('math'))} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold hover:bg-slate-50">+ New Math</button>
        </div>
        <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
          {questions.length === 0 ? <div className="p-4 text-[13px] text-slate-500">No questions yet. Create one or import the demo content.</div> : null}
          {questions.map((q) => (
            <button key={q.id} type="button" onClick={() => setEditing(q)}
              className={`block w-full px-4 py-2.5 text-left hover:bg-slate-50 ${editing?.id === q.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">{q.id}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${q.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{q.published ? 'live' : 'draft'}</span>
              </div>
              <div className="mt-0.5 truncate text-[12px] text-slate-500">{SECTION_LABEL[q.section]} · {DOMAIN_LABEL[q.domain]} · {q.difficulty}</div>
              <div className="truncate text-[12px] text-slate-400">{q.stem || '(no stem)'}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        {editing
          ? <QuestionEditor key={editing.id} initial={editing} existingIds={questions.map((q) => q.id)} onClose={() => setEditing(null)} onSaved={onSaved} flash={flash} />
          : <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 text-[13px] text-slate-400">Select a question to edit, or create a new one.</div>}
      </div>
    </div>
  );
}

function QuestionEditor({ initial, existingIds, onClose, onSaved, flash }: { initial: SatQuestion; existingIds: string[]; onClose: () => void; onSaved: () => Promise<void>; flash: (m: string) => void }) {
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
      flash(`Saved (${mode}).`);
      onClose();
    } catch (e) {
      flash(`Save failed: ${(e as Error).message}`);
    }
  }
  async function onDelete() {
    try { await deleteQuestion(q.id); await onSaved(); flash('Deleted.'); onClose(); }
    catch (e) { flash(`Delete failed: ${(e as Error).message}`); }
  }

  const choices = (q as { choices?: { id: SatChoiceKey; text: string }[] }).choices || [];
  const correct = (q as { correct?: SatChoiceKey }).correct;
  const accepted = (q as { answer?: { accepted: string[] } }).answer?.accepted?.join(', ') || '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{isNew ? 'New question' : `Edit ${q.id}`}</h3>
        <div className="flex gap-2">
          {!isNew ? <button type="button" onClick={onDelete} className="rounded-lg border border-red-300 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50">Delete</button> : null}
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700">Save</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Domain">
          <Select value={q.domain} onChange={(v) => { const d = v as SatDomain; patch({ domain: d, skill: SKILLS_BY_DOMAIN[d][0] } as Partial<SatQuestion>); }}
            options={domains.map((d) => [d, DOMAIN_LABEL[d]])} />
        </Field>
        <Field label="Skill">
          <Select value={q.skill} onChange={(v) => patch({ skill: v as SatSkill } as Partial<SatQuestion>)} options={skills.map((s) => [s, SKILL_LABEL[s]])} />
        </Field>
        <Field label="Difficulty">
          <Select value={q.difficulty} onChange={(v) => patch({ difficulty: v as SatDifficulty })} options={(['easy', 'medium', 'hard'] as SatDifficulty[]).map((d) => [d, DIFFICULTY_LABEL[d]])} />
        </Field>
        {section === 'math' ? (
          <Field label="Format">
            <Select value={isSpr ? 'spr' : 'mc'} onChange={(v) => {
              if (v === 'spr') patch({ format: 'spr', answer: { accepted: [] }, choices: undefined, correct: undefined } as unknown as Partial<SatQuestion>);
              else patch({ format: 'mc', choices: CHOICE_KEYS.map((id) => ({ id, text: '' })), correct: 'A', answer: undefined } as unknown as Partial<SatQuestion>);
            }} options={[['mc', 'Multiple choice'], ['spr', 'Student-produced response']]} />
          </Field>
        ) : <Field label="Format"><div className="px-1 py-2 text-[13px] text-slate-500">Multiple choice</div></Field>}
      </div>

      {section === 'reading_writing' ? (
        <Field label="Passage / stimulus">
          <textarea value={(q as { passage?: string }).passage || ''} onChange={(e) => patch({ passage: e.target.value } as Partial<SatQuestion>)} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" />
        </Field>
      ) : null}

      <Field label="Question stem">
        <textarea value={q.stem} onChange={(e) => patch({ stem: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" />
      </Field>

      {isSpr ? (
        <Field label="Accepted answers (comma-separated, e.g. 7/2, 3.5, 3.50)">
          <input value={accepted} onChange={(e) => patch({ answer: { accepted: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } } as unknown as Partial<SatQuestion>)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" />
        </Field>
      ) : (
        <Field label="Answer choices (select the correct one)">
          <div className="space-y-2">
            {choices.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <button type="button" onClick={() => patch({ correct: c.id } as Partial<SatQuestion>)}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${correct === c.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-600'}`}>{c.id}</button>
                <input value={c.text} onChange={(e) => setChoice(c.id, e.target.value)} placeholder={`Choice ${c.id}`} className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-[13px]" />
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field label="Explanation">
        <textarea value={q.explanation || ''} onChange={(e) => patch({ explanation: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source"><input value={q.source || ''} onChange={(e) => patch({ source: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" /></Field>
        <Field label="Published">
          <label className="flex items-center gap-2 py-2 text-[13px]"><input type="checkbox" checked={q.published} onChange={(e) => patch({ published: e.target.checked })} /> Visible to students</label>
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

const MODULE_SLOTS: { key: keyof SatForm['modules']; label: string; section: SatSection; index: 1 | 2; route: SatModule['difficultyForm'] }[] = [
  { key: 'rwM1', label: 'R&W · Module 1', section: 'reading_writing', index: 1, route: 'fixed' },
  { key: 'rwM2Upper', label: 'R&W · Module 2 (harder)', section: 'reading_writing', index: 2, route: 'upper' },
  { key: 'rwM2Lower', label: 'R&W · Module 2 (easier)', section: 'reading_writing', index: 2, route: 'lower' },
  { key: 'mathM1', label: 'Math · Module 1', section: 'math', index: 1, route: 'fixed' },
  { key: 'mathM2Upper', label: 'Math · Module 2 (harder)', section: 'math', index: 2, route: 'upper' },
  { key: 'mathM2Lower', label: 'Math · Module 2 (easier)', section: 'math', index: 2, route: 'lower' },
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

function FormsTab({ forms, questions, onSaved, flash }: { forms: SatForm[]; questions: SatQuestion[]; onSaved: () => Promise<void>; flash: (m: string) => void }) {
  const [editing, setEditing] = useState<SatForm | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <button type="button" onClick={() => setEditing(emptyForm())} className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold hover:bg-slate-50">+ New form</button>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {forms.length === 0 ? <div className="p-4 text-[13px] text-slate-500">No forms yet.</div> : null}
          {forms.map((f) => (
            <button key={f.id} type="button" onClick={() => setEditing(f)} className={`block w-full px-4 py-2.5 text-left hover:bg-slate-50 ${editing?.id === f.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">{f.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${f.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{f.published ? 'live' : 'draft'}</span>
              </div>
              <div className="text-[11px] text-slate-400">{f.id}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        {editing
          ? <FormEditor key={editing.id} initial={editing} existingIds={forms.map((f) => f.id)} questions={questions} onClose={() => setEditing(null)} onSaved={onSaved} flash={flash} />
          : <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 text-[13px] text-slate-400">Select a form to edit, or create a new one.</div>}
      </div>
    </div>
  );
}

function FormEditor({ initial, existingIds, questions, onClose, onSaved, flash }: { initial: SatForm; existingIds: string[]; questions: SatQuestion[]; onClose: () => void; onSaved: () => Promise<void>; flash: (m: string) => void }) {
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
    try { const mode = await saveForm({ ...form, id }); await onSaved(); flash(`Saved form (${mode}).`); onClose(); }
    catch (e) { flash(`Save failed: ${(e as Error).message}`); }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{isNew ? 'New form' : `Edit ${form.name}`}</h3>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700">Save</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" /></Field>
        <Field label="Published"><label className="flex items-center gap-2 py-2 text-[13px]"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} /> Visible to students</label></Field>
      </div>
      <Field label="Description"><textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]" /></Field>

      <div className="mt-3 space-y-4">
        {MODULE_SLOTS.map((slot) => {
          const mod = form.modules[slot.key];
          const pool = bySection[slot.section];
          return (
            <div key={slot.key} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 text-[13px] font-bold text-slate-700">{slot.label} <span className="font-normal text-slate-400">· {mod.questionIds.length} selected</span></div>
              <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                {pool.length === 0 ? <span className="text-[12px] text-slate-400">No {SECTION_LABEL[slot.section]} questions yet.</span> : null}
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
