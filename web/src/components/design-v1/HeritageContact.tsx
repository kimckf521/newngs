'use client';

import { useState, type FormEvent } from 'react';
import { indexForm } from '@/content/forms';
import type { Locale } from '@/i18n/types';
import { Arrow } from './ui';

/* Heritage Prestige contact form. POSTs to /api/partner_with_us with the
 * same field names as the live site. Underlined inputs, gold focus. */

const inputClass =
  'w-full border-0 border-b border-[#14253f]/20 bg-transparent px-0 py-3 text-[15px] text-[#14253f] outline-none transition-colors placeholder:text-[#6f6a60]/70 focus:border-[#a8843a]';
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6a60]';

export function HeritageContact({ locale }: { locale: Locale }) {
  const form = indexForm[locale];
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
        setErrorMsg(json.error ?? form.errorMsgFallback);
        setStatus('err');
      }
    } catch {
      setErrorMsg(form.networkErrorMsg);
      setStatus('err');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="pr-name" className={labelClass}>{form.fields.name}</label>
          <input id="pr-name" type="text" name="name" required placeholder={form.placeholders.name} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pr-school" className={labelClass}>{form.fields.school}</label>
          <input id="pr-school" type="text" name="school_name" required placeholder={form.placeholders.school} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pr-email" className={labelClass}>{form.fields.email}</label>
          <input id="pr-email" type="email" name="email" required placeholder={form.placeholders.email} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pr-contact" className={labelClass}>{form.fields.contact}</label>
          <input id="pr-contact" type="text" name="mobile_or_wechat" placeholder={form.placeholders.contact} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="pr-inquiry" className={labelClass}>{form.fields.inquiry}</label>
        <textarea id="pr-inquiry" name="help_description" rows={3} placeholder={form.placeholders.inquiry} className={inputClass} />
      </div>

      {/* Honeypot */}
      <div className="ngs-honeypot" aria-hidden="true">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="group inline-flex items-center gap-2.5 bg-[#a8843a] px-9 py-[15px] text-[12px] font-semibold uppercase tracking-[0.18em] text-[#fffdf9] transition-colors duration-300 hover:bg-[#94732f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending' ? form.submitting : form.submit}
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        {status === 'ok' && <p className="text-[14px] text-[#14253f]">{form.successMsg}</p>}
        {status === 'err' && <p className="text-[14px] text-[#9b2c2c]">{errorMsg}</p>}
      </div>
    </form>
  );
}
