import 'server-only';

/**
 * Server-side account creation via the CloudBase management API
 * (@cloudbase/manager-node). CloudBase's new-gen auth owns the credential store,
 * so accounts can't be minted with raw SQL — the only server API that creates a
 * real, immediately-loginable account for this env is `user.createEndUser`,
 * which takes a USERNAME + PASSWORD (verified against the live env). The person
 * then signs in with that username + password (see loginWithUsername in auth.ts).
 *
 * Credentials come from the Tencent Cloud service key already in the env
 * (TENCENTCLOUD_SECRETID / TENCENTCLOUD_SECRETKEY) plus the CloudBase env id.
 */

const secretId = process.env.TENCENTCLOUD_SECRETID || process.env.CLOUDBASE_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRETKEY || process.env.CLOUDBASE_SECRET_KEY;
const envId = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || process.env.CLOUDBASE_ENV_ID || process.env.ENV_ID;

/** CloudBase end-user username policy: starts with a letter, 6–25 chars total,
 *  lowercase letters / digits / `_` / `-`. */
export const USERNAME_RE = /^[a-z][0-9a-z_-]{5,24}$/;

export function authAdminConfigured(): boolean {
  return Boolean(secretId && secretKey && envId);
}

// manager-node is CommonJS + Node-only; init once and reuse.
let appMemo: unknown = null;
async function getManager(): Promise<{ user: { createEndUser(o: { username: string; password: string }): Promise<{ User?: { UUId?: string } }> } } | null> {
  if (!authAdminConfigured()) return null;
  if (!appMemo) {
    const mod = await import('@cloudbase/manager-node');
    const CloudBase = ((mod as unknown as { default?: unknown }).default ?? mod) as {
      init(o: { secretId?: string; secretKey?: string; envId?: string }): unknown;
    };
    appMemo = CloudBase.init({ secretId, secretKey, envId });
  }
  return appMemo as never;
}

/**
 * Create a username + password end-user and return its uid. Throws with a
 * readable message (e.g. the API's "username already exists") so the caller can
 * surface it. The password policy is enforced by CloudBase; we validate shape
 * upstream in the route.
 */
export async function createUsernameAccount(username: string, password: string): Promise<{ uid: string }> {
  const app = await getManager();
  if (!app) throw new Error('auth_admin_not_configured');
  const res = await app.user.createEndUser({ username, password });
  const uid = res?.User?.UUId || '';
  if (!uid) throw new Error('create_no_uid');
  return { uid: String(uid) };
}
