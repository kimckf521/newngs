import Link from 'next/link';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ *
 * UI kit for the BOLD "v1" alternate design.
 * Dark near-black (night) base, aurora gradient glows, geometric
 * Space Grotesk display type, and glass surfaces. The NGS magenta→violet
 * →cyan gradient is used boldly (text, buttons, glows, borders).
 * ------------------------------------------------------------------ */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-page px-6 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

/** Gradient clip-text for emphasis words. */
export function GradientText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`bg-ngs-gradient bg-clip-text text-transparent ${className}`}>{children}</span>;
}

/** Small uppercase section label with a gradient dot. */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/55 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-ngs-gradient" aria-hidden />
      {children}
    </span>
  );
}

/** Glass pill badge (e.g. hero eyebrow). */
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-white/85 backdrop-blur ${className}`}>
      <span className="h-2 w-2 rounded-full bg-ngs-gradient" aria-hidden />
      {children}
    </span>
  );
}

/** Glass surface card. */
export function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur ${
        hover ? 'transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

type ButtonVariant = 'gradient' | 'glass' | 'light';

const buttonVariants: Record<ButtonVariant, string> = {
  gradient:
    'bg-ngs-gradient text-white shadow-[0_10px_40px_-10px_rgba(236,28,139,0.7)] hover:shadow-[0_16px_50px_-12px_rgba(139,47,214,0.8)] hover:-translate-y-0.5',
  glass: 'border border-white/20 bg-white/[0.06] text-white backdrop-blur hover:bg-white/[0.12] hover:border-white/40',
  light: 'bg-white text-night hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(255,255,255,0.25)]',
};

export function Button({
  href,
  children,
  variant = 'gradient',
  external = false,
  withArrow = true,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  withArrow?: boolean;
  className?: string;
}) {
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-night focus-visible:ring-ngs-violet ${buttonVariants[variant]} ${className}`;
  const inner = (
    <>
      {children}
      {withArrow && <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

export function ArrowLink({ href, children, className = '', external = false }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  const cls = `group inline-flex items-center gap-2 text-sm font-semibold text-white ${className}`;
  const inner = (
    <>
      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Decorative aurora glow blobs for dark section backgrounds. */
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -left-32 -top-24 h-[460px] w-[460px] rounded-full bg-ngs-magenta/20 blur-[150px]" />
      <div className="absolute -right-32 top-1/3 h-[460px] w-[460px] rounded-full bg-ngs-cyan/20 blur-[150px]" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-ngs-violet/20 blur-[150px]" />
    </div>
  );
}
