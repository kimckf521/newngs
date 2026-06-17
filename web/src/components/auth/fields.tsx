'use client';

import { useState } from 'react';

/* Shared auth form fields. Styled to match the v1 contact form so the
   light/dark toggle re-themes them automatically (all classes are covered
   by the .v1-light override sheet). */

export const authInputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10 focus:ring-2 focus:ring-ngs-violet/30';
export const authLabelClass = 'mb-1.5 block text-[13px] font-medium text-white/70';

export function AuthField({
  id,
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className={authInputClass}
      />
    </div>
  );
}

export function PasswordField({
  id,
  label,
  name,
  placeholder,
  autoComplete,
  required = false,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  showLabel: string;
  hideLabel: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`${authInputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? hideLabel : showLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white/80"
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8" />
              <path d="M9.4 5.2A9.8 9.8 0 0112 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.9 3.5M6.1 6.2C3.8 7.6 2 10 2 12c0 1.7 4 7 10 7a9.7 9.7 0 003.9-.8" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
