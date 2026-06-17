/**
 * App auth API — the single entry point the UI calls.
 * ----------------------------------------------------------------------
 * Backed by Tencent CloudBase when NEXT_PUBLIC_CLOUDBASE_ENV_ID is set;
 * otherwise falls back to the front-end demo store (lib/demoAuth) so the UI
 * keeps working in local/preview builds. Components depend only on this file —
 * switching to real auth is purely an env + console-config change.
 */
import { getCloudBaseAuth, isCloudBaseConfigured, type CloudBaseUser } from './cloudbase';
import { getDemoUser, setDemoUser, clearDemoUser } from './demoAuth';
import { getUserRole, setUserRole } from './userProfile';
import { DEFAULT_ROLE, normalizeRole, type Role } from './roles';
import { siteLinks } from './siteLinks';

export type AuthUser = { name: string; email: string; uid?: string; role: Role };
export type Provider = 'WeChat';

/** CloudBase built-in OAuth provider identifiers (fixed string literals). */
const PROVIDER_ID: Record<Provider, string> = { WeChat: 'wechat' };

/** True when real CloudBase auth is active (vs. the demo fallback). */
export function isRealAuth(): boolean {
  return isCloudBaseConfigured();
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

/** Enrich a signed-in user with their stored role from the `users` collection.
 *  Best-effort: keeps the default role if there's no uid or the lookup fails. */
async function withRole(user: AuthUser | null): Promise<AuthUser | null> {
  if (!user?.uid) return user;
  return { ...user, role: await getUserRole(user.uid) };
}

/** CloudBase v3 methods resolve to a Supabase-style { data, error } object. */
function readError(res: unknown): string | null {
  const e = (res as { error?: { message?: string; error_description?: string; error?: string } } | null)?.error;
  if (!e) return null;
  return e.message || e.error_description || e.error || 'auth_error';
}

export async function login({ email, password }: { email: string; password: string }): Promise<AuthUser> {
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
  return (await withRole(user)) ?? user;
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
      const state = await auth.getLoginState();
      const user = toAuthUser(state?.user, '');
      return (await withRole(user)) ?? { name: 'Member', email: '', role: DEFAULT_ROLE };
    },
  };
}

/**
 * Completes a social (WeChat) login on the /auth/callback[_en] page. Exchanges
 * the OAuth ?code=&state= in the URL for a session via a single awaited
 * verifyOAuth(), then resolves the user. verifyOAuth resolves to { data, error }
 * (it does not throw); a "code required" / already-verified error is benign when
 * a session already exists, so we only surface it if no user results.
 */
export async function completeOAuthLogin(): Promise<AuthUser | null> {
  const auth = await getCloudBaseAuth();
  if (!auth) return getCurrentUser(); // demo: nothing to exchange (maps role)
  const err = readError(await auth.verifyOAuth());
  const user = await getCurrentUser();
  if (!user && err) throw new Error(err);
  return user;
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
      // updateUser signs the user in on success; read the resulting session.
      const state = await auth.getLoginState();
      return toAuthUser(state?.user, email);
    },
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const auth = await getCloudBaseAuth();
  if (!auth) {
    const d = getDemoUser();
    return d ? { name: d.name, email: d.email, role: normalizeRole(d.role) } : null;
  }
  try {
    const state = await auth.getLoginState();
    return await withRole(toAuthUser(state?.user));
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const auth = await getCloudBaseAuth();
  clearDemoUser(); // always clear the demo store
  if (auth) {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('[auth] signOut failed', e);
    }
  }
}
