'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { requestEmailSignup, loginWithProvider, isRealAuth, type OtpSession } from '@/lib/auth';
import { SELECTABLE_ROLES, ROLE_LABELS, type SelectableRole } from '@/lib/roles';
import { AuthShell } from './AuthShell';
import { AuthField, PasswordField, authLabelClass } from './fields';
import { OrDivider, WeChatButton, SubmitButton, DemoNote } from './parts';
import { SmsLoginForm } from './SmsLoginForm';

const content = {
  en: {
    title: 'Create your account',
    sub: 'Already a member?',
    login: 'Sign in',
    wechat: 'WeChat',
    orSms: 'or with SMS code',
    or: 'or sign up with email',
    role: 'I am a',
    name: 'Full name',
    namePh: 'Your name',
    email: 'Email',
    emailPh: 'you@example.com',
    password: 'Password',
    passwordPh: 'At least 8 characters',
    confirm: 'Confirm password',
    confirmPh: 'Re-enter your password',
    show: 'Show password',
    hide: 'Hide password',
    agreePre: 'I agree to the ',
    tosLabel: 'Terms of Service',
    agreeMid: ' and ',
    privacyLabel: 'Privacy Policy',
    create: 'Create account',
    sendingCode: 'Sending code…',
    mismatch: 'Passwords do not match.',
    short: 'Password must be at least 8 characters.',
    termsError: 'Please accept the terms to continue.',
    sendError: 'Could not send the code. Check your email and try again.',
    demo: 'Demo only — this is a front-end design. No real account is created; submitting takes you to the member area.',
    // verification step
    codeTitle: 'Verify your email',
    codeSentTo: 'We sent a verification code to',
    code: 'Verification code',
    codePh: '6-digit code',
    verify: 'Verify & create account',
    verifying: 'Verifying…',
    changeEmail: 'Use a different email',
    codeError: 'Invalid or expired code. Please try again.',
  },
  zh: {
    title: '创建你的账户',
    sub: '已经是会员？',
    login: '登录',
    wechat: '微信',
    orSms: '或使用短信验证码',
    or: '或使用邮箱注册',
    role: '我的身份',
    name: '姓名',
    namePh: '请输入你的姓名',
    email: '邮箱',
    emailPh: 'you@example.com',
    password: '密码',
    passwordPh: '至少 8 位字符',
    confirm: '确认密码',
    confirmPh: '请再次输入密码',
    show: '显示密码',
    hide: '隐藏密码',
    agreePre: '我已阅读并同意',
    tosLabel: '《服务协议》',
    agreeMid: '与',
    privacyLabel: '《隐私政策》',
    create: '创建账户',
    sendingCode: '发送验证码中…',
    mismatch: '两次输入的密码不一致。',
    short: '密码至少需要 8 位字符。',
    termsError: '请先同意相关条款。',
    sendError: '验证码发送失败，请检查邮箱后重试。',
    demo: '仅为演示 —— 这是前端设计，不会创建真实账户；提交后将进入会员中心。',
    // verification step
    codeTitle: '验证你的邮箱',
    codeSentTo: '我们已向以下邮箱发送验证码：',
    code: '验证码',
    codePh: '6 位验证码',
    verify: '验证并创建账户',
    verifying: '验证中…',
    changeEmail: '使用其他邮箱',
    codeError: '验证码无效或已过期，请重试。',
  },
} as const;

export function RegisterPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const langHref = locale === 'en' ? siteLinks.zh.register : siteLinks.en.register;
  const router = useRouter();
  const [phase, setPhase] = useState<'details' | 'code'>('details');
  const [role, setRole] = useState<SelectableRole>('student');
  const [session, setSession] = useState<OtpSession | null>(null);
  const [sentEmail, setSentEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [error, setError] = useState('');

  async function registerWithWeChat() {
    setStatus('sending');
    setError('');
    try {
      await loginWithProvider('WeChat');
      router.push(links.member);
    } catch {
      setError(t.sendError);
      setStatus('err');
    }
  }

  async function onDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '');
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    if (password !== confirm) {
      setError(t.mismatch);
      setStatus('err');
      return;
    }
    if (password.length < 8) {
      setError(t.short);
      setStatus('err');
      return;
    }
    if (!data.get('terms')) {
      setError(t.termsError);
      setStatus('err');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const s = await requestEmailSignup({ name, email, password, role });
      setSession(s);
      setSentEmail(email);
      setPhase('code');
      setStatus('idle');
    } catch {
      setError(t.sendError);
      setStatus('err');
    }
  }

  async function onVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    const code = String(new FormData(e.currentTarget).get('code') || '').trim();
    setStatus('sending');
    setError('');
    try {
      await session.verify(code);
      router.push(links.member);
    } catch {
      setError(t.codeError);
      setStatus('err');
    }
  }

  function changeEmail() {
    setPhase('details');
    setSession(null);
    setStatus('idle');
    setError('');
  }

  if (phase === 'code') {
    return (
      <AuthShell locale={locale} langHref={langHref}>
        <div className="mb-8">
          <h1 className="font-grotesk text-[2rem] font-bold tracking-tight text-white">{t.codeTitle}</h1>
          <p className="mt-2 text-sm text-white/60">
            {t.codeSentTo} <span className="font-medium text-white/85">{sentEmail}</span>
          </p>
        </div>
        <form onSubmit={onVerify} className="space-y-5">
          <AuthField id="reg-code" name="code" label={t.code} placeholder={t.codePh} autoComplete="one-time-code" required />
          <SubmitButton loading={status === 'sending'} loadingLabel={t.verifying}>{t.verify}</SubmitButton>
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
        <p className="mt-2 text-sm text-white/60">
          {t.sub}{' '}
          <Link href={links.login} className="font-semibold text-white underline-offset-4 hover:underline">
            {t.login}
          </Link>
        </p>
      </div>

      <WeChatButton label={t.wechat} onClick={() => void registerWithWeChat()} />
      <OrDivider label={t.orSms} />
      <SmsLoginForm locale={locale} />
      <OrDivider label={t.or} />

      <form onSubmit={onDetails} className="space-y-5">
        <div>
          <span className={authLabelClass}>{t.role}</span>
          <div className="grid grid-cols-2 gap-2.5">
            {SELECTABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === r
                    ? 'border-ngs-violet bg-white/10 text-white ring-2 ring-ngs-violet/30'
                    : 'border-white/15 bg-white/5 text-white/65 hover:border-white/30 hover:text-white'
                }`}
              >
                {ROLE_LABELS[locale][r]}
              </button>
            ))}
          </div>
        </div>
        <AuthField id="reg-name" name="name" label={t.name} placeholder={t.namePh} autoComplete="name" required />
        <AuthField id="reg-email" name="email" type="email" label={t.email} placeholder={t.emailPh} autoComplete="email" required />
        <PasswordField id="reg-password" name="password" label={t.password} placeholder={t.passwordPh} autoComplete="new-password" required showLabel={t.show} hideLabel={t.hide} />
        <PasswordField id="reg-confirm" name="confirm" label={t.confirm} placeholder={t.confirmPh} autoComplete="new-password" required showLabel={t.show} hideLabel={t.hide} />

        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-white/65">
          <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-white/5 accent-[#8b2fd6]" />
          <span>
            {t.agreePre}
            <Link href={links.terms} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-medium text-white underline underline-offset-2 transition-colors hover:text-ngs-cyan">
              {t.tosLabel}
            </Link>
            {t.agreeMid}
            <Link href={links.privacy} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-medium text-white underline underline-offset-2 transition-colors hover:text-ngs-cyan">
              {t.privacyLabel}
            </Link>
          </span>
        </label>

        <SubmitButton loading={status === 'sending'} loadingLabel={t.sendingCode}>{t.create}</SubmitButton>
        {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
      </form>

      {!isRealAuth() && <DemoNote>{t.demo}</DemoNote>}
    </AuthShell>
  );
}
