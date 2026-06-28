import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import { getQuestionBankBook, getQuestionBankSummary, listQuestionBanks } from '@/lib/questionBank/serverStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Question-bank read API (PostgreSQL-backed), admin-gated like /api/courses.
 *  - GET (no id)              → list all banks (the 题库 section)
 *  - GET ?id=ielts            → light summary { name, books:[{book,title,chars}] }
 *  - GET ?id=ielts&book=15    → one book's markdown
 * Without DATABASE_URL it reports not_configured so the panel hides gracefully.
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id') || '';
  const book = req.nextUrl.searchParams.get('book');

  try {
    if (!id) {
      // No id → list all banks (the 题库 section).
      return NextResponse.json({ ok: true, banks: await listQuestionBanks() });
    }
    if (book) {
      const skill = req.nextUrl.searchParams.get('skill') || undefined;
      const data = await getQuestionBankBook(id, book, skill);
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, book: data });
    }
    const bank = await getQuestionBankSummary(id);
    return NextResponse.json({ ok: true, bank }); // bank may be null (no row) — panel hides
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
