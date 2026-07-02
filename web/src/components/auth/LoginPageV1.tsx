'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { login, loginWithUsername, loginWithProvider, isRealAuth, postLoginDest } from '@/lib/auth';
import { AuthShell } from './AuthShell';
import { AuthField, PasswordField } from './fields';
import { OrDivider, WeChatButton, SubmitButton, DemoNote } from './parts';
import { SmsLoginForm } from './SmsLoginForm';

const content = {
  en: {
    title: 'Welcome back',
    sub: 'New to NextGen Scholars?',
    register: 'Create an account',
    wechat: 'WeChat',
    orSms: 'or with SMS code',
    or: 'or sign in with email',
    email: 'Email',
    emailPh: 'you@example.com',
    password: 'Password',
    passwordPh: '••••••••',
    show: 'Show password',
    hide: 'Hide password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    orAccount: 'or with an account',
    username: 'Username',
    usernamePh: 'your username',
    error: 'Unable to sign in. Please try again.',
    network: 'Network error. Please try again.',
    demo: 'Demo only — this is a front-end design. Any email and password (or a social button) will sign you in.',
  },
  zh: {
    title: '欢迎回来',
    sub: '还不是 NGS 会员？',
    register: '创建账户',
    wechat: '微信',
    orSms: '或使用短信验证码',
    or: '或使用邮箱登录',
    email: '邮箱',
    emailPh: 'you@example.com',
    password: '密码',
    passwordPh: '••••••••',
    show: '显示密码',
    hide: '隐藏密码',
    remember: '记住我',
    forgot: '忘记密码？',
    signIn: '登录',
    signingIn: '登录中…',
    orAccount: '或使用账号登录',
    username: '账号',
    usernamePh: '你的账号',
    error: '登录失败，请重试。',
    network: '网络错误，请重试。',
    demo: '仅为演示 —— 这是前端设计，任意邮箱与密码（或社交登录按钮）均可登录。',
  },
} as const;

export function LoginPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const langHref = locale === 'en' ? siteLinks.zh.login : siteLinks.en.login;
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [error, setError] = useState('');
  // Separate state for the username (account) login form so its button/error
  // don't bleed into the email form above.
  const [uStatus, setUStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [uError, setUError] = useState('');

  async function signIn(email: string, password: string, remember: boolean) {
    setStatus('sending');
    setError('');
    try {
      const user = await login({ email, password, remember });
      router.push(postLoginDest(user, links.member));
    } catch {
      setError(t.error);
      setStatus('err');
    }
  }

  async function signInWithWeChat() {
    setStatus('sending');
    setError('');
    try {
      await loginWithProvider('WeChat');
      router.push(links.member);
    } catch {
      setError(t.error);
      setStatus('err');
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    const remember = data.get('remember') === 'on';
    void signIn(email, password, remember);
  }

  async function signInAccount(username: string, password: string) {
    setUStatus('sending');
    setUError('');
    try {
      const user = await loginWithUsername({ username, password });
      router.push(postLoginDest(user, links.member));
    } catch {
      setUError(t.error);
      setUStatus('err');
    }
  }

  function onSubmitAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void signInAccount(String(data.get('username') || ''), String(data.get('password') || ''));
  }

  return (
    <AuthShell locale={locale} langHref={langHref}>
      <div className="mb-8">
        <h1 className="font-grotesk text-[2rem] font-bold tracking-tight text-white">{t.title}</h1>
        <p className="mt-2 text-sm text-white/60">
          {t.sub}{' '}
          <Link href={links.register} className="font-semibold text-white underline-offset-4 hover:underline">
            {t.register}
          </Link>
        </p>
      </div>

      <WeChatButton label={t.wechat} onClick={() => void signInWithWeChat()} />
      <OrDivider label={t.orSms} />
      <SmsLoginForm locale={locale} />
      <OrDivider label={t.or} />

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="login-email" name="email" type="email" label={t.email} placeholder={t.emailPh} autoComplete="email" required />
        <PasswordField id="login-password" name="password" label={t.password} placeholder={t.passwordPh} autoComplete="current-password" required showLabel={t.show} hideLabel={t.hide} />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-white/65">
            <input type="checkbox" name="remember" className="h-4 w-4 rounded border-white/25 bg-white/5 accent-[#8b2fd6]" />
            {t.remember}
          </label>
          <Link href={links.forgotPassword} className="text-sm font-medium text-white/65 transition-colors hover:text-white">
            {t.forgot}
          </Link>
        </div>

        <SubmitButton loading={status === 'sending'} loadingLabel={t.signingIn}>{t.signIn}</SubmitButton>
        {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
      </form>

      <OrDivider label={t.orAccount} />
      <form onSubmit={onSubmitAccount} className="space-y-5">
        <AuthField id="login-username" name="username" type="text" label={t.username} placeholder={t.usernamePh} autoComplete="username" required />
        <PasswordField id="login-username-password" name="password" label={t.password} placeholder={t.passwordPh} autoComplete="current-password" required showLabel={t.show} hideLabel={t.hide} />
        <SubmitButton loading={uStatus === 'sending'} loadingLabel={t.signingIn}>{t.signIn}</SubmitButton>
        {uStatus === 'err' && <p className="text-sm text-rose-400">{uError}</p>}
      </form>

      {!isRealAuth() && <DemoNote>{t.demo}</DemoNote>}
    </AuthShell>
  );
}
