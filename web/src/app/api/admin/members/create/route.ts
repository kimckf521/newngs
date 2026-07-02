import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { authAdminConfigured, createUsernameAccount, USERNAME_RE } from '@/lib/admin/authAdmin';
import { query } from '@/lib/db/pg';
import { DEFAULT_ROLE, isRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Create a username + password member account, gated by ADMIN_API_KEY
 * (x-admin-key). Creates the CloudBase end-user (see lib/admin/authAdmin) then
 * records the name + role in `app_users` (username accounts have no email, so
 * admin status lives on app_users.role, which the gate honours). The person
 * signs in with the username + password.
 *
 * POST { username, password, name?, role? } → { ok, uid, username } | { ok:false, error, detail? }
 */
export async function POST(req: NextRequest) {
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!authAdminConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });

  const body = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown; name?: unknown; role?: unknown } | null;
  const username = String(body?.username ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');
  const name = body?.name ? String(body.name).trim().slice(0, 200) : '';
  const role = isRole(body?.role) ? body!.role : DEFAULT_ROLE;

  if (!USERNAME_RE.test(username)) return NextResponse.json({ ok: false, error: 'bad_username' }, { status: 400 });
  if (password.length < 8 || password.length > 64) return NextResponse.json({ ok: false, error: 'bad_password' }, { status: 400 });

  let uid: string;
  try {
    ({ uid } = await createUsernameAccount(username, password));
  } catch (e) {
    // Surface the API's message (e.g. username already exists) so it's diagnosable.
    const detail = e instanceof Error ? e.message : 'create_failed';
    return NextResponse.json({ ok: false, error: 'create_failed', detail }, { status: 502 });
  }

  try {
    await query(
      `INSERT INTO app_users (uid, name, role) VALUES ($1, $2, $3)
       ON CONFLICT (uid) DO UPDATE
         SET name = COALESCE(NULLIF(EXCLUDED.name, ''), app_users.name),
             role = EXCLUDED.role, updated_at = now()`,
      [uid, name || null, role],
    );
  } catch {
    // The auth account exists but the role write failed — report partial success
    // so the admin can retry the role from the list rather than re-create.
    return NextResponse.json({ ok: true, uid, username, warning: 'role_not_saved' });
  }
  return NextResponse.json({ ok: true, uid, username });
}
