import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured, query, queryOne } from '@/lib/db/pg';
import { DEFAULT_ROLE, normalizeRole, SELECTABLE_ROLES, type SelectableRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Per-user profile (role) in `app_users`, keyed by auth uid. Called by the
 * browser auth layer (lib/userProfile) on sign-up / login.
 *
 * - GET ?uid=...&email=... → { ok, role }. An email in the `admins` allowlist
 *   resolves to 'admin' (even before the user's first login); otherwise the
 *   app_users.role (DEFAULT_ROLE when no row). not_configured w/o DB.
 * - POST {uid,email,name,role} → upsert. `role` is limited to the SELF-SELECTABLE
 *   roles (student/parent); admin is assigned only via the secret-gated members
 *   route. On an existing row we refresh email/name but NEVER overwrite the role,
 *   so a login can't silently demote an admin.
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const uid = req.nextUrl.searchParams.get('uid') || '';
  const email = req.nextUrl.searchParams.get('email') || '';
  if (!uid && !email) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    // The admins allowlist (email-keyed) is the source of truth for admin status.
    if (email) {
      const a = await queryOne<{ x: number }>('SELECT 1 AS x FROM admins WHERE email = $1', [email]);
      if (a) return NextResponse.json({ ok: true, role: 'admin' });
    }
    const row = uid
      ? await queryOne<{ role: string }>('SELECT role FROM app_users WHERE uid = $1', [uid])
      : null;
    return NextResponse.json({ ok: true, role: row ? normalizeRole(row.role) : DEFAULT_ROLE });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const body = (await req.json().catch(() => null)) as
    | { uid?: unknown; email?: unknown; name?: unknown; role?: unknown }
    | null;
  const uid = String(body?.uid ?? '');
  if (!uid) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  const email = body?.email ? String(body.email) : null;
  const name = body?.name ? String(body.name) : null;
  const role: SelectableRole = (SELECTABLE_ROLES as readonly string[]).includes(String(body?.role))
    ? (body!.role as SelectableRole)
    : 'student';
  try {
    await query(
      `INSERT INTO app_users (uid, email, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (uid) DO UPDATE
         SET email = COALESCE(EXCLUDED.email, app_users.email),
             name  = COALESCE(EXCLUDED.name,  app_users.name),
             updated_at = now()`,
      [uid, email, name, role],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
