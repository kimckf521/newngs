'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { sendPasswordReset, isRealAuth, type PasswordResetSession } from '@/lib/auth';
import { AuthShell } from './AuthShell';
import { AuthField, PasswordField } from './fields';
import { SubmitButton, DemoNote } from './parts';

const content = {
  en: {
    title: 'Reset your password',
    sub: 'Enter the email linked to your account and we’ll send you a verification code to reset your password.',
    email: 'Email',
    emailPh: 'you@example.com',
    send: 'Send reset code',
    sending: 'Sending…',
    backToLogin: 'Back to sign in',
    network: 'Could not send the code. Check your email and try again.',
    demo: 'Demo only — this is a front-end design. No email is actually sent; any code works.',
    // code + new password step
    codeTitle: 'Set a new password',
    codeSentTo: 'We sent a verification code to',
    code: 'Verification code',
    codePh: '6-digit code',
    password: 'New password',
    passwordPh: 'At least 8 characters',
    confirm: 'Confirm new password',
    confirmPh: 'Re-enter your new password',
    show: 'Show password',
    hide: 'Hide password',
    reset: 'Reset password',
    resetting: 'Resetting…',
    changeEmail: 'Use a different email',
    short: 'Password must be at least 8 characters.',
    mismatch: 'Passwords do not match.',
    codeError: 'Invalid or expired code. Please try again.',
  },
  zh: {
    title: '重置你的密码',
    sub: '输入与账户关联的邮箱，我们将向你发送用于重置密码的验证码。',
    email: '邮箱',
    emailPh: 'you@example.com',
    send: '发送验证码',
    sending: '发送中…',
    backToLogin: '返回登录',
    network: '验证码发送失败，请检查邮箱后重试。',
    demo: '仅为演示 —— 这是前端设计，不会真正发送邮件；任意验证码均可。',
    // code + new password step
    codeTitle: '设置新密码',
    codeSentTo: '我们已向以下邮箱发送验证码：',
    code: '验证码',
    codePh: '6 位验证码',
    password: '新密码',
    passwordPh: '至少 8 位字符',
    confirm: '确认新密码',
    confirmPh: '请再次输入新密码',
    show: '显示密码',
    hide: '隐藏密码',
    reset: '重置密码',
    resetting: '重置中…',
    changeEmail: '使用其他邮箱',
    short: '密码至少需要 8 位字符。',
    mismatch: '两次输入的密码不一致。',
    codeError: '验证码无效或已过期，请重试。',
  },
} as const;

export function ForgotPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const langHref = locale === 'en' ? siteLinks.zh.forgotPassword : siteLinks.en.forgotPassword;
  const router = useRouter();
  const [phase, setPhase] = useState<'email' | 'reset'>('email');
  const [session, setSession] = useState<PasswordResetSession | null>(null);
  const [sentEmail, setSentEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [error, setError] = useState('');

  async function onSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') || '');
    setStatus('sending');
    setError('');
    try {
      const s = await sendPasswordReset(email);
      setSession(s);
      setSentEmail(email);
      setPhase('reset');
      setStatus('idle');
    } catch {
      setError(t.network);
      setStatus('err');
    }
  }

  async function onReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    const data = new FormData(e.currentTarget);
    const code = String(data.get('code') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    if (password.length < 8) {
      setError(t.short);
      setStatus('err');
      return;
    }
    if (password !== confirm) {
      setError(t.mismatch);
      setStatus('err');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await session.complete(code, password);
      // The reset also signs the user in — land them in the member area.
      router.push(links.member);
    } catch {
      setError(t.codeError);
      setStatus('err');
    }
  }

  function changeEmail() {
    setPhase('email');
    setSession(null);
    setStatus('idle');
    setError('');
  }

  if (phase === 'reset') {
    return (
      <AuthShell locale={locale} langHref={langHref}>
        <div className="mb-8">
          <h1 className="font-grotesk text-[2rem] font-bold tracking-tight text-white">{t.codeTitle}</h1>
          <p className="mt-2 text-sm text-white/60">
            {t.codeSentTo} <span className="font-medium text-white/85">{sentEmail}</span>
          </p>
        </div>
        <form onSubmit={onReset} className="space-y-5">
          <AuthField id="reset-code" name="code" label={t.code} placeholder={t.codePh} autoComplete="one-time-code" required />
          <PasswordField id="reset-password" name="password" label={t.password} placeholder={t.passwordPh} autoComplete="new-password" required showLabel={t.show} hideLabel={t.hide} />
          <PasswordField id="reset-confirm" name="confirm" label={t.confirm} placeholder={t.confirmPh} autoComplete="new-password" required showLabel={t.show} hideLabel={t.hide} />
          <SubmitButton loading={status === 'sending'} loadingLabel={t.resetting}>{t.reset}</SubmitButton>
          {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
        </form>
        <button type="button" onClick={changeEmail} className="mt-6 text-sm font-medium text-white/55 transition-colors hover:text-white">
          {t.changeEmail}
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell locale={locale} langHref={langHref}>
      <div className="mb-8">
        <h1 className="font-grotesk text-[2rem] font-bold tracking-tight text-white">{t.title}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{t.sub}</p>
      </div>
      <form onSubmit={onSendCode} className="space-y-5">
        <AuthField id="forgot-email" name="email" type="email" label={t.email} placeholder={t.emailPh} autoComplete="email" required />
        <SubmitButton loading={status === 'sending'} loadingLabel={t.sending}>{t.send}</SubmitButton>
        {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
      </form>
      <Link href={links.login} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition-colors hover:text-white">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M15 8H2M7 3L2 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {t.backToLogin}
      </Link>
      {!isRealAuth() && <DemoNote>{t.demo}</DemoNote>}
    </AuthShell>
  );
}
