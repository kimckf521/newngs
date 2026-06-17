import Link from 'next/link';
import type { ReactNode } from 'react';

/* ================================================================== *
 * "HERITAGE PRESTIGE" design kit (/design-v1)
 * A light, architectural, editorial direction: warm ivory paper, deep
 * navy ink, antique-gold hairline accents, high-contrast Playfair serif.
 * Entirely self-contained — shares nothing with the live site's design.
 *
 * Palette (used as arbitrary Tailwind values throughout):
 *   ink     #14253f   deep navy — headings, dark sections, buttons
 *   ink2    #0c1830   darkest navy — footer
 *   ivory   #f7f4ec   warm page paper
 *   band    #efe9dd   alternate warm band
 *   card    #fffdf9   raised card paper
 *   gold    #a8843a   antique gold accent
 *   goldlt  #c4a463   lighter gold (on dark)
 *   body    #3c4250   warm slate body text
 *   muted   #6f6a60   muted captions
 * ================================================================== */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-6 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

/** Small-caps, letter-spaced eyebrow with a short gold rule. */
export function Eyebrow({
  children,
  tone = 'dark',
  className = '',
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const color = tone === 'light' ? 'text-[#c4a463]' : 'text-[#a8843a]';
  const rule = tone === 'light' ? 'bg-[#c4a463]' : 'bg-[#a8843a]';
  return (
    <span className={`inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${color} ${className}`}>
      <span aria-hidden className={`h-px w-8 ${rule}`} />
      {children}
    </span>
  );
}

/** A thin gold hairline. */
export function GoldRule({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-12 bg-[#a8843a] ${className}`} />;
}

type Variant = 'solid' | 'ghost' | 'gold' | 'light';

export function Button({
  href,
  children,
  variant = 'solid',
  external = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}) {
  const styles: Record<Variant, string> = {
    solid: 'bg-[#14253f] text-[#f7f4ec] hover:bg-[#0c1830]',
    gold: 'bg-[#a8843a] text-[#fffdf9] hover:bg-[#94732f]',
    ghost: 'border border-[#14253f]/25 text-[#14253f] hover:border-[#14253f] hover:bg-[#14253f]/[0.03]',
    light: 'border border-[#f7f4ec]/30 text-[#f7f4ec] hover:border-[#c4a463] hover:text-[#c4a463]',
  };
  const cls = `inline-flex items-center justify-center gap-2.5 px-8 py-[14px] text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${styles[variant]} ${className}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

/** Text link with a gold underline-grow and arrow. */
export function ArrowLink({
  href,
  children,
  external = false,
  tone = 'dark',
  className = '',
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const color = tone === 'light' ? 'text-[#f7f4ec]' : 'text-[#14253f]';
  const inner = (
    <>
      <span className="bg-gradient-to-r from-[#a8843a] to-[#a8843a] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <Arrow className="text-[#a8843a] transition-transform duration-300 group-hover:translate-x-1" />
    </>
  );
  const cls = `group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] ${color} ${className}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden className={className}>
      <path d="M1 5h15M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Section eyebrow with an index numeral, e.g. "01 — Our promise". */
export function SectionLabel({ index, children, tone = 'dark' }: { index: string; children: ReactNode; tone?: 'dark' | 'light' }) {
  const num = tone === 'light' ? 'text-[#c4a463]' : 'text-[#a8843a]';
  const txt = tone === 'light' ? 'text-[#f7f4ec]/70' : 'text-[#6f6a60]';
  return (
    <span className="inline-flex items-baseline gap-3">
      <span className={`font-display-serif text-[15px] italic ${num}`}>{index}</span>
      <span aria-hidden className={`h-px w-6 self-center ${tone === 'light' ? 'bg-[#c4a463]/60' : 'bg-[#a8843a]/60'}`} />
      <span className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${txt}`}>{children}</span>
    </span>
  );
}
