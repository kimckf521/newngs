/**
 * App auth API — the single entry point the UI calls.
 * ----------------------------------------------------------------------
 * Backed by Tencent CloudBase when NEXT_PUBLIC_CLOUDBASE_ENV_ID is set;
 * otherwise falls back to the front-end demo store (lib/demoAuth) so the UI
 * keeps working in local/preview builds. Components depend only on this file —
 * switching to real auth is purely an env + console-config change.
 */
import { getCloudBaseAuth, isCloudBaseConfigured, type CloudBaseAuth, type CloudBaseUser } from './cloudbase';
import { getDemoUser, setDemoUser, clearDemoUser } from './demoAuth';
import { getUserRole, setUserRole } from './userProfile';
import { DEFAULT_ROLE, normalizeRole, type Role } from './roles';
import { siteLinks } from './siteLinks';

export type AuthUser = { name: string; email: string; uid?: string; role: Role };
export type Provider = 'WeChat';

/** CloudBase OAuth identity-source IDs. WeChat Open Platform 网站应用 (web QR
 *  scan login) is registered under `wx_open` — NOT `wechat` (that's the 公众号
 *  /official-account source). Must match the 身份源 enabled in the console. */
const PROVIDER_ID: Record<Provider, string> = { WeChat: 'wx_open' };

/** True when real CloudBase auth is active (vs. the demo fallback). */
export function isRealAuth(): boolean {
  return isCloudBaseConfigured();
}

// ── "Remember me" session policy ───────────────────────────────────────────
// CloudBase persists the login state in localStorage (persistence 'local'), so
// it survives a browser restart — and the js-sdk has no 'session'
// (sessionStorage) mode. To honour a "remember me" opt-OUT we emulate
// session-scoped persistence on top of 'local': each login records the choice
// (REMEMBER_KEY) and tags the current browser session (SESSION_MARKER, in
// sessionStorage). On a NEW browser session (the marker is gone) a login that
// opted out is signed out; a plain reload keeps the marker, so it never logs
// the user out mid-session. A "remembered" session then lasts until the
// CloudBase refresh token expires (console → 身份认证 → Token 管理; default 30天).
const REMEMBER_KEY = 'ngs_auth_remember';
const SESSION_MARKER = 'ngs_auth_session';

/** Record the "remember me" choice and mark this browser session active.
 *  Browser-only, best-effort (storage may be blocked in private mode). */
export function setSessionRemember(remember: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
    window.sessionStorage.setItem(SESSION_MARKER, '1');
  } catch {
    /* storage unavailable — best-effort */
  }
}

/** Drop the remembered-choice flag (on logout) so it can't outlive the session. */
function clearSessionRemember(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* best-effort */
  }
}

let sessionPolicyPromise: Promise<void> | null = null;
/** On the first session read of a browser session, sign out a not-remembered
 *  login. Runs once per page load (concurrent callers share one promise). */
function enforceSessionPolicy(auth: CloudBaseAuth): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!sessionPolicyPromise) {
    sessionPolicyPromise = (async () => {
      try {
        if (window.sessionStorage.getItem(SESSION_MARKER)) return; // same session (a reload) — keep
        if (window.localStorage.getItem(REMEMBER_KEY) === '0') {
          await auth.signOut().catch(() => {});
        }
        window.sessionStorage.setItem(SESSION_MARKER, '1');
      } catch {
        /* best-effort */
      }
    })();
  }
  return sessionPolicyPromise;
}

function nameFromEmail(email: string): string {
  return email.includes('@') ? email.split('@')[0] : email || 'Member';
}

function toAuthUser(u: CloudBaseUser | null | undefined, fallbackEmail = ''): AuthUser | null {
  if (!u) return null;
  const email = u.email || fallbackEmail;
  const name = u.name || u.nickName || u.username || nameFromEmail(email);
  return { name, email, uid: u.uid, role: DEFAULT_ROLE };
}

/** Enrich a signed-in user with their stored role (read-only). Best-effort:
 *  keeps the default role if there's no uid/email or the lookup fails. Passes
 *  the email so the server can honour the `admins` allowlist (email-keyed). */
async function withRole(user: AuthUser | null): Promise<AuthUser | null> {
  if (!user?.uid && !user?.email) return user;
  return { ...user, role: await getUserRole(user.uid || '', user.email) };
}

/** Login-moment enrich: ensure the user's `app_users` row exists (creating it as
 *  a student for first-time SMS/WeChat sign-ins; an existing role is preserved
 *  server-side), THEN read the authoritative role. Used on the paths that mint a
 *  fresh session; getCurrentUser stays read-only via withRole. */
async function syncRole(user: AuthUser | null): Promise<AuthUser | null> {
  if (!user?.uid) return user;
  await setUserRole(user.uid, DEFAULT_ROLE, { email: user.email, name: user.name });
  return { ...user, role: await getUserRole(user.uid, user.email) };
}

/** Where to land a user after sign-in, by role: admin → /admin console,
 *  parent → /parent hub, student (default) → the member/student portal. */
export function postLoginDest(user: AuthUser | null, memberLink: string): string {
  if (user?.role === 'admin') return '/admin';
  if (user?.role === 'parent') return '/parent';
  return memberLink;
}

/** CloudBase v3 methods resolve to a Supabase-style { data, error } object. */
function readError(res: unknown): string | null {
  const e = (res as { error?: { message?: string; error_description?: string; error?: string } } | null)?.error;
  if (!e) return null;
  return e.message || e.error_description || e.error || 'auth_error';
}

export async function login({
  email,
  password,
  remember = true,
}: {
  email: string;
  password: string;
  /** "Remember me": persist the session across browser restarts (default) vs.
   *  end it when the browser is fully closed. See setSessionRemember. */
  remember?: boolean;
}): Promise<AuthUser> {
  setSessionRemember(remember);
  const auth = await getCloudBaseAuth();
  if (!auth) {
    const user: AuthUser = { name: nameFromEmail(email), email, role: normalizeRole(getDemoUser()?.role) };
    setDemoUser(user);
    return user;
  }
  const res = await auth.signInWithPassword({ email, password });
  const err = readError(res);
  if (err) throw new Error(err);
  const state = await auth.getLoginState();
  const user = toAuthUser(state?.user, email);
  if (!user) throw new Error('login_failed');
  return (await syncRole(user)) ?? user;
}

/**
 * Email sign-up with a verification CODE (邮箱验证码注册) — step 1: collect the
 * details and email the code. Returns a session whose verify(code) completes
 * the sign-up and signs the user in (step 2). This matches the CloudBase
 * console when email-verification sign-up is enabled: signUp() emails the code
 * and resolves with a verifyOtp() closure (smart create-or-login). The demo
 * fallback resolves in-place so the preview keeps working.
 */
export async function requestEmailSignup({
  name,
  email,
  password,
  role = DEFAULT_ROLE,
}: {
  name: string;
  email: string;
  password: string;
  /** Self-selected role from the register form (student/parent). */
  role?: Role;
}): Promise<OtpSession> {
  const auth = await getCloudBaseAuth();
  if (!auth) {
    return {
      verify: async () => {
        const user: AuthUser = { name: name || nameFromEmail(email), email, role };
        setDemoUser(user);
        return user;
      },
    };
  }
  // NOTE: do NOT map the display name to CloudBase's `username` — that field
  // must match ^[a-z][0-9a-z_-]{5,24}$ (or be empty). We omit it so the account
  // is keyed by email; the display name falls back to the email handle.
  const res = await auth.signUp({ email, password });
  const sendErr = readError(res);
  if (sendErr) throw new Error(sendErr);
  const verifyOtp = res?.data?.verifyOtp;
  if (typeof verifyOtp !== 'function') throw new Error('signup_send_failed');
  return {
    verify: async (code: string) => {
      const vErr = readError(await verifyOtp({ token: code }));
      if (vErr) throw new Error(vErr);
      setSessionRemember(true); // a completed sign-up is a remembered session
      const state = await auth.getLoginState();
      const user = toAuthUser(state?.user, email) ?? { name: name || nameFromEmail(email), email, role };
      // Persist the chosen role to the `users` collection (best-effort).
      if (user.uid) await setUserRole(user.uid, role, { email: user.email, name: user.name });
      return { ...user, role };
    },
  };
}

/**
 * Social login (WeChat, and Google where reachable). This is a TWO-PHASE
 * REDIRECT flow: it navigates the browser to the provider's auth page and
 * therefore NEVER resolves on the real path — the session is finalised on the
 * /auth/callback[_en] page when the provider redirects back. The demo fallback
 * still resolves in-place so the preview keeps working.
 */
export async function loginWithProvider(provider: Provider): Promise<AuthUser> {
  const auth = await getCloudBaseAuth();
  if (!auth) {
    const user: AuthUser = { name: `${provider} User`, email: `${provider.toLowerCase()}@example.com`, role: DEFAULT_ROLE };
    setDemoUser(user);
    return user;
  }
  const providerId = PROVIDER_ID[provider];
  if (!providerId) throw new Error('social_login_not_configured');
  setSessionRemember(true); // WeChat sign-in is a remembered session (persists across the redirect)

  // Callback URL must live under the WeChat 授权回调域 AND the CloudBase Web
  // 安全域名. Keep the locale so the callback lands on /member vs /member_en.
  const isEn = window.location.pathname.includes('_en');
  const redirectTo = window.location.origin + (isEn ? siteLinks.en.oauthCallback : siteLinks.zh.oauthCallback);

  // skipBrowserRedirect: we own the redirect (the SDK would otherwise also
  // navigate), so there is exactly one deterministic redirect and the no-url
  // guard below is meaningful.
  const res = await auth.signInWithOAuth({
    provider: providerId,
    options: { redirectTo, state: `ngs_${providerId}_${Date.now()}`, skipBrowserRedirect: true },
  });
  const err = readError(res);
  if (err) throw new Error(err);
  const url = res?.data?.url;
  if (!url) throw new Error('social_login_no_url');

  // Navigate to the provider's authorization (QR) page. The current page
  // unloads here; nothing below runs on the real path.
  window.location.href = url;
  return new Promise<AuthUser>(() => {}); // satisfies the return type; never settles
}

/** A pending OTP step (SMS login code or email sign-up code): call verify(code) to finish. */
export type OtpSession = { verify: (code: string) => Promise<AuthUser> };
/** Back-compat alias used by the SMS login form. */
export type SmsSession = OtpSession;

/** Normalise a phone number to E.164; bare 11-digit CN mobiles get +86.
 *  Tolerates spaces, dashes, dots, parens by keeping only digits and a +. */
function normalizePhone(input: string): string {
  const p = input.replace(/[^\d+]/g, '');
  if (p.startsWith('+')) return p;
  if (/^1\d{10}$/.test(p)) return '+86' + p;
  return p;
}

/**
 * SMS (phone OTP) login — step 1: send the code. Returns a session whose
 * verify(code) completes the login (step 2). Demo fallback: any code works so
 * the preview keeps functioning. Real path uses CloudBase signInWithOtp +
 * verifyOtp; requires region ap-shanghai (set) and 手机号登录 enabled in the
 * console with an SMS channel.
 */
export async function requestSmsCode(phone: string): Promise<SmsSession> {
  const e164 = normalizePhone(phone);
  const auth = await getCloudBaseAuth();
  if (!auth) {
    return {
      verify: async () => {
        // No profile name for a phone-only login; use a clean label rather than
        // echoing the raw number into the greeting/avatar.
        const user: AuthUser = { name: 'Member', email: '', role: DEFAULT_ROLE };
        setDemoUser(user);
        return user;
      },
    };
  }
  const res = await auth.signInWithOtp({ phone: e164 });
  const sendErr = readError(res);
  if (sendErr) throw new Error(sendErr);
  const verifyOtp = res?.data?.verifyOtp;
  if (typeof verifyOtp !== 'function') throw new Error('sms_send_failed');
  return {
    verify: async (code: string) => {
      const vErr = readError(await verifyOtp({ token: code }));
      if (vErr) throw new Error(vErr);
      setSessionRemember(true); // a completed SMS login is a remembered session
      const state = await auth.getLoginState();
      const user = toAuthUser(state?.user, '');
      return (await syncRole(user)) ?? { name: 'Member', email: '', role: DEFAULT_ROLE };
    },
  };
}

/**
 * Temporarily wraps window.fetch to capture the one-time `provider_token` that
 * CloudBase returns from /auth/v1/provider/token during verifyOAuth(). We need
 * it to REGISTER a brand-new WeChat identity (signUp({ provider_token })):
 * verifyOAuth() hides the token, and the OAuth `code` is single-use (already
 * consumed by verifyOAuth), so it can't be re-derived. Returns a restore fn.
 */
function installProviderTokenSniffer(onToken: (t: string) => void): () => void {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return () => {};
  const orig = window.fetch.bind(window);
  const wrapped = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const res = await orig(...args);
    try {
      const input = args[0];
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request)?.url ?? '';
      if (/provider\/token/.test(url)) {
        const body = await res.clone().json().catch(() => null);
        if (body && typeof body.provider_token === 'string' && body.provider_token) onToken(body.provider_token);
      }
    } catch (e) {
      // Sniffing must never break the real request — but log so a malformed
      // /provider/token response (which would block new-user registration) is
      // debuggable rather than silently swallowed.
      console.warn('[auth] provider_token sniff failed', e);
    }
    return res;
  };
  window.fetch = wrapped as typeof window.fetch;
  return () => {
    window.fetch = orig;
  };
}

/**
 * Completes a social (WeChat) login on the /auth/callback[_en] page — signing in
 * an existing user OR registering a brand-new one.
 *
 * verifyOAuth() exchanges the ?code=&state= for a session, but only for users
 * that ALREADY exist; a first-time WeChat identity comes back with "does not
 * match any profile on server". In that case we register it with
 * signUp({ provider_token }) — reusing the provider_token sniffed off the
 * /auth/v1/provider/token call (the `code` is single-use). The signed-in profile
 * is read from verifyOAuth()/signUp() `data.user` directly — getLoginState().user
 * is a controller that serialises blank, so it's not used on this path.
 * verifyOAuth resolves to { data, error } (it never throws); a benign
 * "already-verified / code required" error when a session already exists is only
 * surfaced if no user results.
 */
export async function completeOAuthLogin(): Promise<AuthUser | null> {
  const auth = await getCloudBaseAuth();
  if (!auth) return getCurrentUser(); // demo: nothing to exchange (maps role)

  // Only act on a real OAuth callback (?code=); otherwise just read the session.
  if (typeof window !== 'undefined' && !new URLSearchParams(window.location.search).get('code')) {
    return getCurrentUser();
  }

  let providerToken: string | null = null;
  const restoreFetch = installProviderTokenSniffer((t) => {
    providerToken = t;
  });
  try {
    const verify = await auth.verifyOAuth();
    const vErr = readError(verify);
    let user = toAuthUser(verify?.data?.user ?? verify?.data?.session?.user);

    if (!user && vErr) {
      if (providerToken) {
        // verifyOAuth captured a provider_token but matched no existing profile
        // → a first-time WeChat identity. Register it (creates the CloudBase
        // user + a session). Token-driven, NOT gated on the exact error string:
        // CloudBase's "does not match any profile" wording can change/localise,
        // and silently dropping that would turn away every new user. Surface
        // signUp's error only if it ALSO yields no session.
        const signUp = await auth.signUp({ provider_token: providerToken });
        user = toAuthUser(signUp?.data?.user ?? signUp?.data?.session?.user);
        if (!user) {
          const sErr = readError(signUp);
          user = await getCurrentUser();
          if (!user) throw new Error(sErr || vErr);
        }
      } else {
        // No token captured → benign "already-verified / code required" case
        // (a session may already exist); only surface a genuine failure.
        user = await getCurrentUser();
        if (!user) throw new Error(vErr);
      }
    }

    if (!user) user = await getCurrentUser();
    if (user) setSessionRemember(true); // a completed WeChat sign-in is remembered
    // First WeChat sign-in has no app_users row yet — create it (as a student;
    // an existing role is preserved server-side) and return the real role.
    return user?.uid ? await syncRole(user) : user;
  } finally {
    restoreFetch();
  }
}

/** A pending password reset: call complete(code, newPassword) to finish. */
export type PasswordResetSession = {
  complete: (code: string, newPassword: string) => Promise<AuthUser | null>;
};

/**
 * Password reset — step 1: email a verification code. CloudBase's reset is a
 * CODE flow, not a magic link: resetPasswordForEmail() sends a one-time code and
 * resolves with an updateUser({ nonce, password }) closure. We return a session
 * whose complete(code, newPassword) runs that closure — which verifies the code,
 * sets the new password, AND signs the user in (step 2). The demo fallback
 * resolves in-place so the preview keeps working.
 */
export async function sendPasswordReset(email: string): Promise<PasswordResetSession> {
  const auth = await getCloudBaseAuth();
  if (!auth) {
    return {
      complete: async () => {
        const user: AuthUser = { name: nameFromEmail(email), email, role: normalizeRole(getDemoUser()?.role) };
        setDemoUser(user);
        return user;
      },
    };
  }
  const res = await auth.resetPasswordForEmail(email);
  const sendErr = readError(res);
  if (sendErr) throw new Error(sendErr);
  const updateUser = res?.data?.updateUser;
  if (typeof updateUser !== 'function') throw new Error('reset_send_failed');
  return {
    complete: async (code: string, newPassword: string) => {
      const vErr = readError(await updateUser({ nonce: code, password: newPassword }));
      if (vErr) throw new Error(vErr);
      setSessionRemember(true); // reset + sign-in via password reset is remembered
      // updateUser signs the user in on success; read the resulting session.
      const state = await auth.getLoginState();
      return toAuthUser(state?.user, email);
    },
  };
}

/** uids already profile-synced in this JS context — so an active session
 *  upserts its app_users row at most once per page load (not on every call). */
const syncedUids = new Set<string>();

export async function getCurrentUser(): Promise<AuthUser | null> {
  const auth = await getCloudBaseAuth();
  if (!auth) {
    const d = getDemoUser();
    return d ? { name: d.name, email: d.email, role: normalizeRole(d.role) } : null;
  }
  try {
    await enforceSessionPolicy(auth);
    const state = await auth.getLoginState();
    const user = await withRole(toAuthUser(state?.user));
    // Ensure a row exists for an already-signed-in user (created as a student;
    // an existing role is preserved server-side) so they appear in the members
    // list without having to log in again. Fire-and-forget — never blocks reads.
    if (user?.uid && !syncedUids.has(user.uid)) {
      syncedUids.add(user.uid);
      void setUserRole(user.uid, DEFAULT_ROLE, { email: user.email, name: user.name });
    }
    return user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const auth = await getCloudBaseAuth();
  clearDemoUser(); // always clear the demo store
  clearSessionRemember();
  if (auth) {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('[auth] signOut failed', e);
    }
  }
}
