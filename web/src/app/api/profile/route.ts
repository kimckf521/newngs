import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured, query, queryOne } from '@/lib/db/pg';
import { canonicalUid } from '@/lib/admin/accountLinks';
import { applyInvite } from '@/lib/admin/invites';
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
 * - POST {uid,email,name,role} → upsert, CREATE-IF-ABSENT for role: a new row
 *   gets the picked (student/parent) role, but an existing row's role is NEVER
 *   changed here (email/name are refreshed). This route is unauthenticated, so
 *   it must not let a caller re-assign anyone's role — role/admin changes go
 *   through the secret-gated members route. Emails are normalised (trim+lower)
 *   and matched case-insensitively so reads/writes/allowlist agree.
 */
export async function GET(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  const rawUid = req.nextUrl.searchParams.get('uid') || '';
  const email = req.nextUrl.searchParams.get('email') || '';
  if (!rawUid && !email) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    // Merged accounts: resolve any linked (secondary) uid to its canonical
    // (primary) uid, so every one of a person's logins — WeChat / phone / email —
    // reads the SAME role. No-op for un-linked accounts.
    const uid = rawUid ? await canonicalUid(rawUid) : '';
    // The admins allowlist (email-keyed) is the source of truth for admin status.
    if (email) {
      const a = await queryOne<{ x: number }>('SELECT 1 AS x FROM admins WHERE lower(email) = lower($1)', [email]);
      if (a) return NextResponse.json({ ok: true, role: 'admin' });
    }
    let row = uid
      ? await queryOne<{ role: string }>('SELECT role FROM app_users WHERE uid = $1', [uid])
      : null;
    // Fallback: a blank/unstable uid from the auth controller would miss the
    // uid-keyed row and misread a parent as student — so resolve by email too.
    if (!row && email) {
      // Case-insensitive, and prefer the most-privileged row if an email somehow
      // has duplicates, so a stale 'student' row can't mask a 'parent'/'admin'.
      row = await queryOne<{ role: string }>(
        `SELECT role FROM app_users WHERE lower(email) = lower($1)
         ORDER BY (role = 'admin') DESC, (role = 'parent') DESC, updated_at DESC LIMIT 1`,
        [email],
      );
    }
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
  // Normalise + bound the free-text fields: email is trimmed/lowered and must
  // look like an email (else dropped to null so garbage/oversized values can't
  // corrupt the row); name is trimmed and length-capped.
  const rawEmail = body?.email ? String(body.email).trim().toLowerCase() : '';
  const email = rawEmail && rawEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null;
  const name = body?.name ? String(body.name).trim().slice(0, 200) || null : null;
  const role: SelectableRole = (SELECTABLE_ROLES as readonly string[]).includes(String(body?.role))
    ? (body!.role as SelectableRole)
    : 'student';
  try {
    // CREATE-IF-ABSENT for role: a new row gets the picked role; an existing
    // row's role is NEVER changed here. This route is unauthenticated, so it must
    // not let any caller re-assign another user's role — role changes go through
    // the secret-gated members route. email/name are refreshed on conflict.
    await query(
      `INSERT INTO app_users (uid, email, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (uid) DO UPDATE
         SET email = COALESCE(EXCLUDED.email, app_users.email),
             name  = COALESCE(EXCLUDED.name,  app_users.name),
             updated_at = now()`,
      [uid, email, name, role],
    );
    // Apply a pending admin invite for this email (upgrades a default student to
    // parent, then consumes it). Best-effort — never blocks sign-in.
    if (email) await applyInvite(uid, email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
