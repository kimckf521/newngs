import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import {
  listAllQuestions,
  listPublishedQuestions,
  upsertQuestion,
  deleteQuestionById,
  listAllForms,
  listPublishedForms,
  getFormById,
  upsertForm,
  deleteFormById,
  getAttemptById,
  upsertAttempt,
  getProgress,
  upsertProgress,
} from '@/lib/sat/serverStore';
import type { SatQuestion, SatForm, SatAttempt, SatChoice } from '@/lib/sat/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SAT API (PostgreSQL-backed). Mirrors /api/courses.
 *  GET  ?resource=questions[&scope=published|&ids=a,b]  → list / public list
 *  GET  ?resource=forms[&scope=published|&id=X]         → list / public single
 *  GET  ?resource=runner&form=ID                        → {form, questions} bundle (public)
 *  GET  ?resource=attempts&id=X                         → one attempt (public)
 *  POST ?resource=questions|forms  {item}              → upsert (admin-gated)
 *  POST ?resource=attempts         {attempt}           → upsert (public — student run)
 *  DELETE ?resource=questions|forms&id=X               → delete (admin-gated)
 * Without DATABASE_URL: writes report not_configured (client → localStorage),
 * public reads return empty payloads (panel/runner hide or use the bundled demo).
 */

const unconfiguredRead = NextResponse.json({ ok: true, items: [] });
const badReq = NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
const unauth = NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
const notConfigured = NextResponse.json({ ok: false, error: 'not_configured' });
const unavailable = () => NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });

/* ------------------------------------------------------------- validation */

function parseChoices(v: unknown): SatChoice[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c): c is SatChoice => Boolean(c) && typeof (c as SatChoice).id === 'string')
    .map((c) => ({ id: (c as SatChoice).id, text: String((c as SatChoice).text ?? '') }));
}

function parseQuestion(body: unknown): SatQuestion | null {
  const q = body as Partial<SatQuestion> & Record<string, unknown>;
  if (!q || typeof q.id !== 'string' || !q.id) return null;
  if (q.section !== 'reading_writing' && q.section !== 'math') return null;
  if (typeof q.stem !== 'string') return null;
  // The union is wide; persist the whole object but coerce the obvious arrays.
  const out = { ...q } as Record<string, unknown>;
  if (Array.isArray(q.choices)) out.choices = parseChoices(q.choices);
  out.published = Boolean(q.published);
  return out as SatQuestion;
}

function parseForm(body: unknown): SatForm | null {
  const f = body as Partial<SatForm>;
  if (!f || typeof f.id !== 'string' || !f.id || typeof f.name !== 'string' || !f.name) return null;
  if (!f.modules || typeof f.modules !== 'object') return null;
  return { ...(f as SatForm), published: Boolean(f.published) };
}

function parseAttempt(body: unknown): SatAttempt | null {
  const a = body as Partial<SatAttempt>;
  if (!a || typeof a.id !== 'string' || !a.id || typeof a.formId !== 'string') return null;
  if (!Array.isArray(a.modules)) return null;
  return a as SatAttempt;
}

/* -------------------------------------------------------------------- GET */

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const resource = p.get('resource') || 'questions';
  const scope = p.get('scope');

  // ---- runner bundle: a published form + the questions it references ----
  if (resource === 'runner') {
    const formId = p.get('form') || '';
    if (!dbConfigured()) return NextResponse.json({ ok: true, form: null, questions: [] });
    if (!formId) return badReq;
    try {
      const form = await getFormById(formId);
      if (!form || !form.published) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      const ids = new Set<string>();
      for (const m of Object.values(form.modules)) for (const id of m.questionIds) ids.add(id);
      const questions = (await listPublishedQuestions()).filter((q) => ids.has(q.id));
      return NextResponse.json({ ok: true, form, questions });
    } catch {
      return unavailable();
    }
  }

  // ---- attempts: single read by id ----
  if (resource === 'attempts') {
    const id = p.get('id') || '';
    if (!dbConfigured()) return NextResponse.json({ ok: true, attempt: null });
    if (!id) return badReq;
    try {
      return NextResponse.json({ ok: true, attempt: await getAttemptById(id) });
    } catch {
      return unavailable();
    }
  }

  // ---- progress: per-user learning state (keyed by client uid, like /api/profile) ----
  if (resource === 'progress') {
    const uid = p.get('uid') || '';
    if (!dbConfigured()) return NextResponse.json({ ok: true, data: null });
    if (!uid) return badReq;
    try {
      return NextResponse.json({ ok: true, data: await getProgress(uid) });
    } catch {
      return unavailable();
    }
  }

  // ---- public reads (published) ----
  if (scope === 'published') {
    if (!dbConfigured()) return unconfiguredRead;
    try {
      const items = resource === 'forms' ? await listPublishedForms() : await listPublishedQuestions();
      return NextResponse.json({ ok: true, items });
    } catch {
      return unavailable();
    }
  }

  // ---- forms single read by id (public if published) ----
  if (resource === 'forms' && p.get('id')) {
    const id = p.get('id') as string;
    if (!dbConfigured()) return NextResponse.json({ ok: true, item: null });
    try {
      const form = await getFormById(id);
      if (form && (form.published || authorizedAdmin(req))) return NextResponse.json({ ok: true, item: form });
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    } catch {
      return unavailable();
    }
  }

  // ---- admin lists (all) ----
  if (!dbConfigured()) return notConfigured;
  if (!authorizedAdmin(req)) return unauth;
  try {
    if (resource === 'forms') return NextResponse.json({ ok: true, items: await listAllForms() });
    if (p.get('ids')) {
      const ids = new Set((p.get('ids') as string).split(',').filter(Boolean));
      const items = (await listAllQuestions()).filter((q) => ids.has(q.id));
      return NextResponse.json({ ok: true, items });
    }
    return NextResponse.json({ ok: true, items: await listAllQuestions() });
  } catch {
    return unavailable();
  }
}

/* ------------------------------------------------------------------- POST */

export async function POST(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get('resource') || 'questions';
  if (!dbConfigured()) return notConfigured;

  const body = await req.json().catch(() => null);

  // Attempts are written by the (ungated) student runner — no admin key.
  if (resource === 'attempts') {
    const attempt = parseAttempt(body);
    if (!attempt) return badReq;
    try {
      return NextResponse.json({ ok: true, attempt: await upsertAttempt(attempt) });
    } catch {
      return unavailable();
    }
  }

  // Per-user progress — keyed by the client uid (same trust model as /api/profile).
  if (resource === 'progress') {
    const b = body as { uid?: unknown; data?: unknown } | null;
    const uid = String(b?.uid ?? '');
    if (!uid || !b?.data || typeof b.data !== 'object') return badReq;
    try {
      await upsertProgress(uid, b.data);
      return NextResponse.json({ ok: true });
    } catch {
      return unavailable();
    }
  }

  // Questions & forms are admin-gated.
  if (!authorizedAdmin(req)) return unauth;
  try {
    if (resource === 'forms') {
      const form = parseForm(body);
      if (!form) return badReq;
      return NextResponse.json({ ok: true, item: await upsertForm(form, form.updatedBy || 'admin') });
    }
    const q = parseQuestion(body);
    if (!q) return badReq;
    return NextResponse.json({ ok: true, item: await upsertQuestion(q, q.updatedBy || 'admin') });
  } catch {
    return unavailable();
  }
}

/* ----------------------------------------------------------------- DELETE */

export async function DELETE(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const resource = p.get('resource') || 'questions';
  if (!dbConfigured()) return notConfigured;
  if (!authorizedAdmin(req)) return unauth;
  const id = p.get('id') || '';
  if (!id) return badReq;
  try {
    if (resource === 'forms') await deleteFormById(id);
    else await deleteQuestionById(id);
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
