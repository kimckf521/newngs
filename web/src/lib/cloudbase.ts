/**
 * CloudBase (腾讯云开发 / Tencent CloudBase) client — browser only.
 * ----------------------------------------------------------------------
 * Lazily initialises the @cloudbase/js-sdk auth client from env vars. Until
 * NEXT_PUBLIC_CLOUDBASE_ENV_ID is set, isCloudBaseConfigured() is false and the
 * app falls back to the front-end demo auth (see lib/auth.ts) so the UI keeps
 * working in local/preview builds.
 *
 * One-time console prerequisites (CloudBase 控制台 → 环境 → 登录授权 / 身份源列表):
 *   - Enable 邮箱登录 (email + password) for sign in / sign up.
 *   - Configure an email channel so password-reset mails can be sent.
 *
 * API surface follows the v2/v3 web SDK:
 *   https://docs.cloudbase.net/api-reference/webv3/authentication
 *
 * The SDK is loaded with a dynamic import so it never runs during SSR (it
 * touches `window`) and stays out of the server bundle.
 */

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const REGION = process.env.NEXT_PUBLIC_CLOUDBASE_REGION || 'ap-shanghai';

export function isCloudBaseConfigured(): boolean {
  return Boolean(ENV_ID);
}

/** Minimal shape of the CloudBase user we read, so app code never depends on
 *  the SDK's (partially external) type declarations. */
export interface CloudBaseUser {
  uid?: string;
  name?: string;
  username?: string;
  nickName?: string;
  email?: string;
}

/** Only the auth methods this app actually calls. */
export interface CloudBaseAuth {
  signInWithPassword(p: {
    email?: string;
    username?: string;
    phone?: string;
    password: string;
  }): Promise<unknown>;
  // Email sign-up with verification code: signUp() emails the code and
  // resolves with a verifyOtp() closure that completes the second step
  // (creates + signs the user in). Mirrors the phone-OTP flow.
  // Also handles OAuth registration: signUp({ provider_token }) creates a user
  // from a third-party identity (e.g. a first-time WeChat sign-in) and returns a
  // session — verifyOAuth() only signs in users that already exist.
  signUp(p: { email?: string; password?: string; username?: string; provider_token?: string; [k: string]: unknown }): Promise<{
    data?: {
      verifyOtp?: (q: { token: string; messageId?: string }) => Promise<{ data?: { user?: CloudBaseUser }; error?: unknown }>;
      user?: CloudBaseUser;
      session?: { user?: CloudBaseUser };
    };
    error?: unknown;
  }>;
  signOut(): Promise<unknown>;
  getLoginState(): Promise<{ user: CloudBaseUser } | null>;
  // Password reset is a verification-CODE flow (NOT a magic link): this emails
  // a code and resolves with an updateUser() closure that takes the code
  // (`nonce`) plus the new password, resets it, and signs the user in. Mirrors
  // the phone/email OTP flows above.
  resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{
    data?: { updateUser?: (q: { nonce: string; password: string }) => Promise<{ error?: unknown }> };
    error?: unknown;
  }>;
  // Third-party OAuth (WeChat). signInWithOAuth returns a { data: { url } } to
  // which the browser is redirected; verifyOAuth (awaited, on the callback
  // page) exchanges the returned ?code= for a session.
  signInWithOAuth(p: {
    provider: string;
    options?: { redirectTo?: string; state?: string; skipBrowserRedirect?: boolean };
  }): Promise<{ data?: { url?: string; provider?: string }; error?: unknown }>;
  // Resolves to { data, error } (it does NOT throw). data.user is the reliable
  // signed-in profile here; getLoginState().user is a controller that serialises
  // blank, so read the user from this result on the callback path.
  verifyOAuth(p?: { code?: string; state?: string; provider?: string }): Promise<{
    data?: { user?: CloudBaseUser; session?: { user?: CloudBaseUser } };
    error?: unknown;
  }>;
  // Phone/email one-time-code (OTP) login. signInWithOtp sends the code and
  // resolves with a verifyOtp() closure that completes the second step.
  // Phone OTP requires region 'ap-shanghai' (set in init).
  signInWithOtp(p: { phone?: string; email?: string }): Promise<{
    data?: { verifyOtp?: (q: { token: string }) => Promise<{ error?: unknown }> };
    error?: unknown;
  }>;
  // Escape hatch for other SDK methods.
  [k: string]: unknown;
}

/** Minimal shape of the initialised CloudBase app we use (auth + database +
 *  storage). The page builder reads/writes the `pages` collection and uploads
 *  images through this. */
export interface CloudBaseApp {
  auth: ((opts?: { persistence?: string }) => CloudBaseAuth) & CloudBaseAuth;
  database(config?: { instance?: string; database?: string }): {
    collection(name: string): {
      doc(id: string): {
        get(): Promise<{ data?: unknown[] }>;
        set(data: unknown): Promise<unknown>;
        update(data: unknown): Promise<unknown>;
        remove(): Promise<unknown>;
      };
      where(q: Record<string, unknown>): { get(): Promise<{ data?: unknown[] }> };
      add(data: unknown): Promise<unknown>;
      get(): Promise<{ data?: unknown[] }>;
      limit(n: number): { get(): Promise<{ data?: unknown[] }> };
    };
  };
  uploadFile(p: {
    cloudPath: string;
    filePath: File | Blob;
    onUploadProgress?: (e: unknown) => void;
  }): Promise<{ fileID: string; requestId?: string }>;
  getTempFileURL(p: { fileList: string[] }): Promise<{ fileList: { fileID: string; tempFileURL: string }[] }>;
  [k: string]: unknown;
}

let appPromise: Promise<CloudBaseApp | null> | null = null;
let authMemo: CloudBaseAuth | null = null;

/**
 * Returns the initialised CloudBase app (auth + database + storage), or null
 * when CloudBase is not configured / not in the browser. Memoised — auth,
 * database, and storage all share this single init.
 */
export function getCloudBaseApp(): Promise<CloudBaseApp | null> {
  if (typeof window === 'undefined' || !isCloudBaseConfigured()) {
    return Promise.resolve(null);
  }
  if (!appPromise) {
    appPromise = import('@cloudbase/js-sdk')
      .then((mod) => {
        const cloudbase: any = (mod as any).default ?? mod;
        // NOTE: we deliberately do NOT set auth.detectSessionInUrl. That flag
        // makes init() auto-exchange the OAuth ?code= in the background; the
        // callback page also calls verifyOAuth(), and since the WeChat code is
        // single-use, both firing would race over one code. We rely solely on
        // the explicit, awaited verifyOAuth() in completeOAuthLogin().
        return cloudbase.init({ env: ENV_ID, region: REGION }) as CloudBaseApp;
      })
      .catch((err) => {
        console.error('[cloudbase] init failed', err);
        appPromise = null;
        return null;
      });
  }
  return appPromise;
}

/**
 * Returns the initialised CloudBase auth instance, or null when CloudBase is
 * not configured / not running in the browser. Memoised after first init.
 */
export async function getCloudBaseAuth(): Promise<CloudBaseAuth | null> {
  const app = await getCloudBaseApp();
  if (!app) return null;
  if (!authMemo) {
    // app.auth is both callable (to set persistence) and the auth object.
    authMemo = (typeof app.auth === 'function' ? app.auth({ persistence: 'local' }) : app.auth) as CloudBaseAuth;
  }
  return authMemo;
}
