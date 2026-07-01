import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import { getBankAccess, setBankAccess, type BankAccessMode } from '@/lib/questionBank/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Per-question-bank student access (admin only).
 *  - GET ?id=... → { mode, students }.
 *  - PUT {id, mode, students} → set who may use the bank.
 * Gated by ADMIN_API_KEY (x-admin-key) like the other admin write APIs.
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, access: await getBankAccess(id) });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: unknown; mode?: unknown; students?: unknown } | null;
  const id = String(body?.id ?? '');
  const mode: BankAccessMode = body?.mode === 'whitelist' ? 'whitelist' : 'all';
  const students = Array.isArray(body?.students) ? body!.students.map(String) : [];
  if (!id) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await setBankAccess(id, mode, students);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
