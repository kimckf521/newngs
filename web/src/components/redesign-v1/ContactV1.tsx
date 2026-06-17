'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { indexForm } from '@/content/forms';
import { externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Container, GlassCard, Kicker } from './ui';

/* ------------------------------------------------------------------ *
 * Contact section for the BOLD "v1" homepage. Glass form on a dark
 * surface. POSTs to /api/partner_with_us (same endpoint as the legacy
 * IndexForm) with the exact same field names.
 * ------------------------------------------------------------------ */

const content = {
  en: {
    kicker: 'Get in touch',
    lead:
      'Tell us about your school, your student, or your goals — our team will get back to you within two business days.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
  },
  zh: {
    kicker: '联系我们',
    lead: '告诉我们您的学校、学生或目标 —— 我们的团队将在两个工作日内与您联系。',
    emailLabel: '邮箱',
    phoneLabel: '电话',
  },
} as const;

const socials = [
  { href: externalLinks.customerServiceWeChat, src: '/static/img/media_icons/WeChat.png', alt: 'WeChat' },
  { href: externalLinks.xiaohongshu, src: '/static/img/media_icons/RedNote.png', alt: 'RedNote' },
  { href: externalLinks.linkedin, src: '/static/img/media_icons/LinkedIn.png', alt: 'LinkedIn' },
];

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10 focus:ring-2 focus:ring-ngs-violet/30';
const labelClass = 'mb-1.5 block text-sm font-medium text-white/70';

export function ContactV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const form = indexForm[locale];
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    // Capture the form element BEFORE awaiting: React nulls the SyntheticEvent's
    // currentTarget after synchronous dispatch, so e.currentTarget would be null
    // after `await` and .reset() would throw (masking success as a network error).
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    try {
      const res = await fetch('/api/partner_with_us', { method: 'POST', body: data });
      if (res.ok) {
        setStatus('ok');
        formEl.reset();
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(json.error ?? form.errorMsgFallback);
        setStatus('err');
      }
    } catch {
      setErrorMsg(form.networkErrorMsg);
      setStatus('err');
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-night-800">
      <Container className="py-20 sm:py-28">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-5">
            <Kicker>{t.kicker}</Kicker>
            <h2 className="mt-5 font-grotesk text-[2rem] font-bold text-white sm:text-[2.6rem]">
              {form.heading}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">{t.lead}</p>

            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  {t.emailLabel}
                </dt>
                <dd className="mt-1.5">
                  <a
                    href="mailto:info@nextgenscholars.asia"
                    className="text-white transition hover:text-ngs-cyan"
                  >
                    info@nextgenscholars.asia
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  {t.phoneLabel}
                </dt>
                <dd className="mt-1.5 text-white">400-806-1815</dd>
              </div>
            </dl>

            <div className="mt-10 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.alt}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.alt}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-white/30 hover:bg-white/10"
                >
                  <Image src={s.src} alt={s.alt} width={20} height={20} className="h-5 w-5 object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7">
            <GlassCard className="p-7 sm:p-9">
              <form onSubmit={onSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ngs-v1-name" className={labelClass}>
                      {form.fields.name}
                    </label>
                    <input
                      type="text"
                      id="ngs-v1-name"
                      name="name"
                      required
                      placeholder={form.placeholders.name}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="ngs-v1-school" className={labelClass}>
                      {form.fields.school}
                    </label>
                    <input
                      type="text"
                      id="ngs-v1-school"
                      name="school_name"
                      required
                      placeholder={form.placeholders.school}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="ngs-v1-email" className={labelClass}>
                      {form.fields.email}
                    </label>
                    <input
                      type="email"
                      id="ngs-v1-email"
                      name="email"
                      required
                      placeholder={form.placeholders.email}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="ngs-v1-contact" className={labelClass}>
                      {form.fields.contact}
                    </label>
                    <input
                      type="text"
                      id="ngs-v1-contact"
                      name="mobile_or_wechat"
                      placeholder={form.placeholders.contact}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ngs-v1-inquiry" className={labelClass}>
                      {form.fields.inquiry}
                    </label>
                    <textarea
                      id="ngs-v1-inquiry"
                      name="help_description"
                      rows={4}
                      placeholder={form.placeholders.inquiry}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Honeypot — hidden from real users */}
                <div className="ngs-honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-ngs-gradient px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'sending' ? form.submitting : form.submit}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                  {status === 'ok' && <p className="text-sm text-emerald-400">{form.successMsg}</p>}
                  {status === 'err' && <p className="text-sm text-rose-400">{errorMsg}</p>}
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </Container>
    </section>
  );
}
