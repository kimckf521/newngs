'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { siteLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { requestSmsCode, postLoginDest, type SmsSession } from '@/lib/auth';
import { AuthField, authLabelClass } from './fields';
import { SubmitButton } from './parts';

const content = {
  en: {
    phone: 'Phone number',
    phonePh: '138 0000 0000',
    cnOnly: 'Mainland China (+86) mobile numbers only.',
    sendCode: 'Send code',
    sending: 'Sending…',
    sentTo: 'Code sent to',
    code: 'Verification code',
    codePh: '6-digit code',
    verify: 'Sign in',
    verifying: 'Signing in…',
    changeNumber: 'Use a different number',
    sendErr: 'Could not send the code. Check the number and try again.',
    verifyErr: 'Invalid or expired code. Please try again.',
  },
  zh: {
    phone: '手机号',
    phonePh: '138 0000 0000',
    cnOnly: '仅支持中国大陆（+86）手机号。',
    sendCode: '发送验证码',
    sending: '发送中…',
    sentTo: '验证码已发送至',
    code: '验证码',
    codePh: '6 位验证码',
    verify: '登录',
    verifying: '登录中…',
    changeNumber: '使用其他号码',
    sendErr: '验证码发送失败，请检查号码后重试。',
    verifyErr: '验证码无效或已过期，请重试。',
  },
} as const;

export function SmsLoginForm({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const router = useRouter();
  const [phase, setPhase] = useState<'phone' | 'code'>('phone');
  const [session, setSession] = useState<SmsSession | null>(null);
  const [sentPhone, setSentPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [error, setError] = useState('');

  async function onSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The input holds only the local digits; the +86 prefix is fixed in the UI.
    let local = String(new FormData(e.currentTarget).get('phone') || '').replace(/\D/g, '');
    if (local.startsWith('86')) local = local.slice(2); // tolerate a pasted country code
    if (!local) return;
    const phone = '+86' + local;
    setStatus('sending');
    setError('');
    try {
      const s = await requestSmsCode(phone);
      setSession(s);
      setSentPhone(phone);
      setPhase('code');
      setStatus('idle');
    } catch {
      setError(t.sendErr);
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
      const user = await session.verify(code);
      router.push(postLoginDest(user, links.member));
    } catch {
      setError(t.verifyErr);
      setStatus('err');
    }
  }

  function reset() {
    setPhase('phone');
    setSession(null);
    setStatus('idle');
    setError('');
  }

  if (phase === 'code') {
    return (
      <form onSubmit={onVerify} className="space-y-4">
        <p className="text-sm text-white/60">
          {t.sentTo} <span className="font-medium text-white/85">{sentPhone}</span>
        </p>
        <AuthField
          id="sms-code"
          name="code"
          label={t.code}
          placeholder={t.codePh}
          autoComplete="one-time-code"
          required
        />
        <SubmitButton loading={status === 'sending'} loadingLabel={t.verifying}>
          {t.verify}
        </SubmitButton>
        {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-white/55 transition-colors hover:text-white"
        >
          {t.changeNumber}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendCode} className="space-y-4">
      <div>
        <label htmlFor="sms-phone" className={authLabelClass}>{t.phone}</label>
        <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-white/5 transition focus-within:border-ngs-violet focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-ngs-violet/30">
          <span aria-hidden className="flex select-none items-center border-r border-white/10 px-4 text-[15px] font-medium text-white/55">+86</span>
          <input
            id="sms-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder={t.phonePh}
            autoComplete="tel-national"
            required
            className="w-full bg-transparent px-3.5 py-3 text-[15px] text-white outline-none placeholder:text-white/35"
          />
        </div>
        <p className="mt-1.5 text-xs text-white/45">{t.cnOnly}</p>
      </div>
      <SubmitButton loading={status === 'sending'} loadingLabel={t.sending}>
        {t.sendCode}
      </SubmitButton>
      {status === 'err' && <p className="text-sm text-rose-400">{error}</p>}
    </form>
  );
}
