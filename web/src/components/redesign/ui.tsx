import Link from 'next/link';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ *
 * Shared primitives for the redesigned (premium-editorial) homepage.
 * Deep navy-ink + warm paper base, with the NGS magenta→cyan gradient
 * used as a restrained signature accent.
 * ------------------------------------------------------------------ */

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-page px-6 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode;
  /** `light` = sits on a light surface; `dark` = sits on a dark surface */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const color = tone === 'dark' ? 'text-white/70' : 'text-slate-mute';
  return (
    <span
      className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-eyebrow ${color} ${className}`}
    >
      <span className="h-px w-7 bg-ngs-gradient" aria-hidden />
      {children}
    </span>
  );
}

/** Big editorial heading. Pass a string; wrap an emphasis word with <Em>. */
export function Display({
  children,
  className = '',
  as: Tag = 'h2',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <Tag
      className={`font-display font-light tracking-[-0.01em] text-slate-ink ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Gradient emphasis for a word or two inside a heading. */
export function Em({ children }: { children: ReactNode }) {
  return (
    <span className="bg-ngs-gradient bg-clip-text italic text-transparent">
      {children}
    </span>
  );
}

type ButtonVariant = 'gradient' | 'dark' | 'light-ghost' | 'outline';

const buttonVariants: Record<ButtonVariant, string> = {
  gradient:
    'bg-ngs-gradient text-white shadow-[0_10px_30px_-8px_rgba(236,28,139,0.6)] hover:shadow-[0_16px_40px_-10px_rgba(139,47,214,0.7)] hover:-translate-y-0.5',
  dark: 'bg-canvas text-white hover:bg-canvas-soft hover:-translate-y-0.5',
  'light-ghost':
    'border border-white/30 text-white hover:bg-white/10 hover:border-white/60',
  outline:
    'border border-edge text-slate-ink hover:border-slate-ink hover:bg-white',
};

export function Button({
  href,
  children,
  variant = 'gradient',
  external = false,
  className = '',
  withArrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
  withArrow?: boolean;
}) {
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ngs-violet ${buttonVariants[variant]} ${className}`;
  const inner = (
    <>
      {children}
      {withArrow && <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** Text link with an animated arrow — used as a tertiary CTA on cards. */
export function ArrowLink({
  href,
  children,
  className = '',
  tone = 'light',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const color = tone === 'dark' ? 'text-white' : 'text-slate-ink';
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-semibold ${color} ${className}`}
    >
      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/* ── Icons (inline, no dependency) ───────────────────────────────── */

export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M1 8h13M9 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
