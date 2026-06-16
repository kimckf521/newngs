'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { indexForm } from '@/content/forms';
import type { Locale } from '@/i18n/types';

/**
 * Contact form on the home page. POSTs to /api/partner_with_us. Replaces
 * IndexFormZh + IndexFormEn.
 */
export function IndexForm({ locale }: { locale: Locale }) {
  const t = indexForm[locale];
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fontClass = locale === 'zh' ? 'section-font-style_zh' : 'section-font-style';

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
    <section className={`index__section ${fontClass}`}>
      <div className="ngs-enquiry index__grid-cols-452f">
        <div className="index__style-9">
          <Image
            src="/static/img/studying.jpg"
            alt={t.imageAlt}
            width={800}
            height={600}
            className="index__rounded"
          />
        </div>
        <form className="ngs-form index__flex-col-621c" onSubmit={onSubmit}>
          <div className={`index__bg-dark ${fontClass}`}>
            <h3>{t.heading}</h3>
          </div>
          <div className="index__grid">
            <div>
              <label htmlFor="id_name" className={`index__style-10 ${fontClass}`}>
                <p>{t.fields.name}</p>
              </label>
              <input
                type="text"
                name="name"
                id="id_name"
                required
                placeholder={t.placeholders.name}
                className="index__rounded-7873"
              />
            </div>
            <div>
              <label htmlFor="id_school" className={`index__style-10 ${fontClass}`}>
                <p>{t.fields.school}</p>
              </label>
              <input
                type="text"
                name="school_name"
                id="id_school"
                required
                placeholder={t.placeholders.school}
                className="index__rounded-7873"
              />
            </div>
            <div>
              <label htmlFor="id_email" className={`index__style-10 ${fontClass}`}>
                <p>{t.fields.email}</p>
              </label>
              <input
                type="email"
                name="email"
                id="id_email"
                required
                placeholder={t.placeholders.email}
                className="index__rounded-7873"
              />
            </div>
            <div>
              <label htmlFor="id_mobile_or_wechat" className={`index__style-10 ${fontClass}`}>
                <p>{t.fields.contact}</p>
              </label>
              <input
                type="text"
                name="mobile_or_wechat"
                id="id_mobile_or_wechat"
                placeholder={t.placeholders.contact}
                className="index__rounded-7873"
              />
            </div>
            <div className="index__flex-col-d481">
              <label htmlFor="id_help_description" className={`index__style-10 ${fontClass}`}>
                <p>{t.fields.inquiry}</p>
              </label>
              <textarea
                rows={5}
                name="help_description"
                id="id_help_description"
                placeholder={t.placeholders.inquiry}
                className="index__rounded-f54a"
              ></textarea>
            </div>
          </div>

          {/* Honeypot — hidden from real users */}
          <div className="ngs-honeypot" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="index__style-11">
            <button
              type="submit"
              className="index__bg-dark-d1b8"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? t.submitting : t.submit}
            </button>
          </div>

          {status === 'ok' && (
            <p className="ngs-form-status ngs-form-status--ok">{t.successMsg}</p>
          )}
          {status === 'err' && (
            <p className="ngs-form-status ngs-form-status--err">{errorMsg}</p>
          )}
        </form>
      </div>
    </section>
  );
}
