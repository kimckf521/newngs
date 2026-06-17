'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from '@/components/redesign-v1/ui';

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function WeChatButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#09B83E" aria-hidden>
        <path d="M9 4C4.9 4 1.5 6.8 1.5 10.2c0 1.9 1.1 3.6 2.8 4.8L3.5 17l2.4-1.2c.9.3 1.9.4 2.9.4h.6a5.3 5.3 0 01-.2-1.5c0-3.2 3.1-5.7 6.9-5.7h.6C16.3 5.9 13 4 9 4zm-2.6 3.2a1 1 0 110 2 1 1 0 010-2zm5.2 0a1 1 0 110 2 1 1 0 010-2z" />
        <path d="M22.5 14.1c0-2.7-2.7-4.9-6-4.9s-6 2.2-6 4.9 2.7 4.9 6 4.9c.7 0 1.4-.1 2-.3l1.9 1-.5-1.6c1.6-.9 2.6-2.3 2.6-4zm-8-1a.8.8 0 110 1.6.8.8 0 010-1.6zm4 0a.8.8 0 110 1.6.8.8 0 010-1.6z" />
      </svg>
      {label}
    </button>
  );
}

export function SubmitButton({ loading, children, loadingLabel }: { loading: boolean; children: ReactNode; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ngs-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(236,28,139,0.7)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingLabel : children}
      {!loading && <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />}
    </button>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/45">
      {children}
    </p>
  );
}
