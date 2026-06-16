'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { indexForm } from '@/content/forms';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowRight } from './ui';

const copy = {
  en: {
    eyebrow: 'Get in touch',
    lead: 'Tell us about your school, your student, or your goals — our team will get back to you within two business days.',
    phone: '400-806-1815',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
  },
  zh: {
    eyebrow: '联系我们',
    lead: '告诉我们您的学校、学生或目标 —— 我们的团队将在两个工作日内与您联系。',
    phone: '400-806-1815',
    phoneLabel: '电话',
    emailLabel: '邮箱',
  },
} as const;

const socials = [
  { src: '/static/img/media_icons/WeChat.png', alt: 'WeChat', href: externalLinks.customerServiceWeChat },
  { src: '/static/img/media_icons/WeClass.png', alt: 'WeClass', href: externalLinks.customerServiceWeChat },
  { src: '/static/img/media_icons/RedNote.png', alt: 'RedNote', href: externalLinks.xiaohongshu },
  { src: '/static/img/media_icons/LinkedIn.png', alt: 'LinkedIn', href: externalLinks.linkedin },
];

const inputClass =
  'w-full rounded-xl border border-edge bg-paper px-4 py-3 text-[15px] text-slate-ink outline-none transition placeholder:text-slate-mute focus:border-ngs-violet focus:bg-white focus:ring-2 focus:ring-ngs-violet/20';

export function ContactCTA({ locale }: { locale: Locale }) {
  const t = indexForm[locale];
  const c = copy[locale];
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/partner_with_us', { method: 'POST', body: data });
      if (res.ok) {
        setStatus('ok');
        e.currentTarget.reset();
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(json.error ?? t.errorMsgFallback);
        setStatus('err');
      }
    } catch {
      setErrorMsg(t.networkErrorMsg);
      setStatus('err');
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-canvas text-white">
      <div className="mx-auto w-full max-w-page px-6 py-24 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          {/* Left: invitation + contact details */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-eyebrow text-white/70">
              <span className="h-px w-7 bg-ngs-gradient" aria-hidden />
              {c.eyebrow}
            </span>
            <h2 className="mt-6 font-display text-[2rem] font-light leading-tight tracking-[-0.01em] sm:text-[2.6rem]">
              {t.heading}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">{c.lead}</p>

            <dl className="mt-10 space-y-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-eyebrow text-white/50">
                  {c.emailLabel}
                </dt>
                <dd className="mt-1">
                  <a
                    href="mailto:info@nextgenscholars.asia"
                    className="text-lg text-white transition-colors hover:text-ngs-cyan"
                  >
                    info@nextgenscholars.asia
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-eyebrow text-white/50">
                  {c.phoneLabel}
                </dt>
                <dd className="mt-1 text-lg text-white">{c.phone}</dd>
              </div>
            </dl>

            <div className="mt-8 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.alt}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.alt}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <Image src={s.src} alt={s.alt} width={22} height={22} className="h-5 w-5 object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={onSubmit}
              className="rounded-3xl border border-white/10 bg-white p-7 shadow-lift sm:p-9"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t.fields.name}>
                  <input type="text" name="name" required placeholder={t.placeholders.name} className={inputClass} />
                </Field>
                <Field label={t.fields.school}>
                  <input type="text" name="school_name" required placeholder={t.placeholders.school} className={inputClass} />
                </Field>
                <Field label={t.fields.email}>
                  <input type="email" name="email" required placeholder={t.placeholders.email} className={inputClass} />
                </Field>
                <Field label={t.fields.contact}>
                  <input type="text" name="mobile_or_wechat" placeholder={t.placeholders.contact} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={t.fields.inquiry}>
                    <textarea
                      name="help_description"
                      rows={4}
                      placeholder={t.placeholders.inquiry}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* Honeypot */}
              <div className="ngs-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ngs-gradient px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(139,47,214,0.7)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {status === 'sending' ? t.submitting : t.submit}
                {status !== 'sending' && (
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
              </button>

              {status === 'ok' && (
                <p className="mt-4 text-sm font-medium text-emerald-600">{t.successMsg}</p>
              )}
              {status === 'err' && (
                <p className="mt-4 text-sm font-medium text-rose-600">{errorMsg}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-body">{label}</span>
      {children}
    </label>
  );
}
