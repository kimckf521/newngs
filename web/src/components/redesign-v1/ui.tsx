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

/* ================================================================== *
 * INNER-PAGE KIT
 * Shared building blocks so every page in the site reads as one
 * coherent, high-class dark design. Server-safe (no hooks) unless noted.
 * ================================================================== */

/** A faint masked grid texture for hero/section backgrounds. */
export function FaintGrid({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 opacity-[0.06] ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(circle at 50% 30%, #000 0%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 30%, #000 0%, transparent 75%)',
      }}
    />
  );
}

type Glow = 'none' | 'violet' | 'cyan' | 'magenta';
const glowColor: Record<Exclude<Glow, 'none'>, string> = {
  violet: 'bg-ngs-violet/15',
  cyan: 'bg-ngs-cyan/15',
  magenta: 'bg-ngs-magenta/15',
};

/**
 * Standard page section: consistent vertical rhythm + dark surface.
 * `tone` alternates the background so stacked sections separate cleanly.
 */
export function Section({
  children,
  id,
  tone = 'night',
  glow = 'none',
  glowPosition = 'right',
  className = '',
  containerClassName = '',
}: {
  children: ReactNode;
  id?: string;
  tone?: 'night' | 'night-800' | 'night-700';
  glow?: Glow;
  glowPosition?: 'left' | 'right' | 'center';
  className?: string;
  containerClassName?: string;
}) {
  const toneClass = tone === 'night' ? 'bg-night' : tone === 'night-800' ? 'bg-night-800' : 'bg-night-700';
  const pos =
    glowPosition === 'left'
      ? '-left-40 top-1/4'
      : glowPosition === 'center'
      ? 'left-1/3 top-0'
      : '-right-40 top-1/4';
  return (
    <section id={id} className={`relative overflow-hidden ${toneClass} ${id ? 'scroll-mt-24' : ''} ${className}`}>
      {glow !== 'none' && (
        <div
          aria-hidden
          className={`pointer-events-none absolute ${pos} h-[460px] w-[460px] rounded-full ${glowColor[glow]} blur-[150px]`}
        />
      )}
      <Container className={`relative py-20 lg:py-28 ${containerClassName}`}>{children}</Container>
    </section>
  );
}

/** Kicker + heading + optional sub, the standard section header. */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'left',
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const alignCls = align === 'center' ? 'mx-auto text-center items-center' : '';
  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      {eyebrow && <Kicker>{eyebrow}</Kicker>}
      <h2 className="mt-5 max-w-3xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.6rem]">
        {title}
      </h2>
      {sub && <p className={`mt-5 max-w-2xl text-lg leading-relaxed text-white/60 ${align === 'center' ? 'mx-auto' : ''}`}>{sub}</p>}
    </div>
  );
}

/**
 * Full-bleed page hero for inner pages. Aurora + grid, generous top
 * padding to clear the fixed header. Optional breadcrumb, eyebrow,
 * lead, CTA buttons and a side media slot.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  align = 'center',
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  primary?: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
  align?: 'center' | 'left';
  children?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <section className="relative isolate overflow-hidden bg-night">
      <Aurora />
      <FaintGrid />
      <Container className={`relative z-10 flex min-h-[58vh] flex-col justify-center pb-16 pt-36 sm:pt-40 ${centered ? 'items-center text-center' : 'items-start'}`}>
        {eyebrow && <div className="animate-fade-up"><Badge>{eyebrow}</Badge></div>}
        <h1 className={`mt-7 max-w-4xl font-grotesk text-[2.4rem] font-bold leading-[1.05] tracking-[-0.02em] text-white animate-fade-up sm:text-5xl lg:text-[3.9rem] ${centered ? 'mx-auto' : ''}`}>
          {title}
        </h1>
        {lead && (
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed text-white/70 animate-fade-up ${centered ? 'mx-auto' : ''}`}>
            {lead}
          </p>
        )}
        {(primary || secondary) && (
          <div className={`mt-9 flex flex-col gap-3 animate-fade-up sm:flex-row ${centered ? 'justify-center' : ''}`}>
            {primary && (
              <Button href={primary.href} external={primary.external} variant="gradient">
                {primary.label}
              </Button>
            )}
            {secondary && (
              <Button href={secondary.href} external={secondary.external} variant="glass" withArrow={false}>
                {secondary.label}
              </Button>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

/** A small gradient-tinted icon tile (use with the Icon* set below). */
export function IconTile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ngs-gradient-soft text-white ring-1 ring-white/10 ${className}`}>
      {children}
    </span>
  );
}

/**
 * Glass feature card. Provide either an `icon`, a `number`, or neither.
 * Optional `items` bullet list and a `href` (turns the whole card into a link).
 */
export function FeatureCard({
  icon,
  number,
  title,
  description,
  items,
  href,
  external = false,
  cta,
  className = '',
}: {
  icon?: ReactNode;
  number?: number | string;
  title: ReactNode;
  description?: ReactNode;
  items?: readonly string[];
  href?: string;
  external?: boolean;
  cta?: string;
  className?: string;
}) {
  const body = (
    <GlassCard hover={!!href} className={`flex h-full flex-col p-7 ${href ? 'transition duration-300 group-hover:-translate-y-1.5' : ''} ${className}`}>
      {icon && <IconTile className="mb-5">{icon}</IconTile>}
      {number !== undefined && (
        <>
          <GradientText className="font-grotesk text-2xl font-bold">
            {typeof number === 'number' ? String(number).padStart(2, '0') : number}
          </GradientText>
          <span aria-hidden className="mt-4 block h-px w-8 bg-ngs-gradient" />
        </>
      )}
      <h3 className={`font-grotesk text-lg font-bold tracking-tight text-white ${icon || number !== undefined ? 'mt-4' : ''}`}>
        {title}
      </h3>
      {description && <p className="mt-3 text-sm leading-relaxed text-white/60">{description}</p>}
      {items && items.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/65">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {cta && href && (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-white">
          <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
            {cta}
          </span>
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      )}
    </GlassCard>
  );
  if (!href) return body;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">{body}</a>
  ) : (
    <Link href={href} className="group block">{body}</Link>
  );
}

/** Gradient-dot checklist for feature/benefit lists. */
export function CheckList({ items, className = '', columns = 1 }: { items: readonly ReactNode[]; className?: string; columns?: 1 | 2 }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 ${columns === 2 ? 'sm:grid-cols-2' : ''} ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-white/75">
          <CheckIcon className="mt-1 shrink-0 text-ngs-cyan" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Big gradient stat with a label. */
export function Stat({ value, label, className = '' }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="font-grotesk text-4xl font-bold sm:text-5xl">
        <GradientText>{value}</GradientText>
      </div>
      <div className="mt-2 text-sm leading-snug text-white/55">{label}</div>
    </div>
  );
}

/** A row/band of stats. `placeholder` shows a subtle "sample" note. */
export function StatBand({
  stats,
  placeholder = false,
  placeholderNote,
}: {
  stats: readonly { value: ReactNode; label: ReactNode }[];
  placeholder?: boolean;
  placeholderNote?: string;
}) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i}>
            <dt className="font-grotesk text-4xl font-bold sm:text-5xl">
              <GradientText>{s.value}</GradientText>
            </dt>
            <dd className="mt-2 text-sm leading-snug text-white/55">{s.label}</dd>
          </div>
        ))}
      </dl>
      {placeholder && (
        <p className="mt-8 text-xs italic text-white/35">{placeholderNote ?? 'Sample figures — replace with your verified numbers.'}</p>
      )}
    </div>
  );
}

/** Numbered process / "how it works" steps with a connecting gradient spine. */
export function Steps({ steps }: { steps: readonly { title: string; description: string }[] }) {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title}>
          <GlassCard hover className="flex h-full flex-col p-7">
            <span className="font-grotesk text-sm font-semibold text-white/40">{String(i + 1).padStart(2, '0')}</span>
            <span aria-hidden className="mt-3 block h-px w-10 bg-ngs-gradient" />
            <h3 className="mt-4 font-grotesk text-lg font-bold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{step.description}</p>
          </GlassCard>
        </li>
      ))}
    </ol>
  );
}

/** No-JS accordion FAQ (native <details>). */
export function FAQ({ items }: { items: readonly { q: string; a: ReactNode }[] }) {
  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      {items.map((item, i) => (
        <details key={i} className="group px-6 py-1 sm:px-8 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-grotesk text-base font-semibold text-white sm:text-lg">
            {item.q}
            <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-white/70 transition-transform duration-300 group-open:rotate-45">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </span>
          </summary>
          <div className="pb-6 pr-10 text-[15px] leading-relaxed text-white/60">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/**
 * Testimonial / quote cards. Intended for social proof; pass
 * `placeholder` so a subtle "sample" note renders for content owners.
 */
export function Testimonials({
  quotes,
  placeholder = false,
  placeholderNote,
}: {
  quotes: readonly { quote: string; name: string; role: string }[];
  placeholder?: boolean;
  placeholderNote?: string;
}) {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(quotes ?? []).map((t, i) => (
          <GlassCard key={i} className="flex h-full flex-col p-7">
            <span aria-hidden className="font-grotesk text-4xl leading-none text-ngs-violet/70">&ldquo;</span>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/80">{t.quote}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-ngs-gradient font-grotesk text-sm font-bold text-white">
                {(t.name ?? '').trim().charAt(0) || '?'}
              </span>
              <span className="leading-tight">
                <span className="block font-grotesk text-sm font-semibold text-white">{t.name}</span>
                <span className="block text-xs text-white/50">{t.role}</span>
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
      {placeholder && (
        <p className="mt-8 text-xs italic text-white/35">{placeholderNote ?? 'Sample testimonials — replace with real, attributed quotes before launch.'}</p>
      )}
    </div>
  );
}

/** Closing call-to-action panel with a gradient hairline + glow. */
export function CTASection({
  eyebrow,
  title,
  sub,
  primary,
  secondary,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  primary: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section className="bg-night-800">
      <Container className="py-20 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-night p-10 text-center sm:p-16">
          <div aria-hidden className="pointer-events-none absolute -inset-x-10 -top-24 h-72 bg-ngs-gradient-soft opacity-70 blur-[120px]" />
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ngs-gradient" />
          <div className="relative">
            {eyebrow && <div className="flex justify-center"><Kicker>{eyebrow}</Kicker></div>}
            <h2 className="mx-auto mt-5 max-w-2xl font-grotesk text-[2rem] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[2.7rem]">
              {title}
            </h2>
            {sub && <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/65">{sub}</p>}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={primary.href} external={primary.external} variant="gradient">{primary.label}</Button>
              {secondary && (
                <Button href={secondary.href} external={secondary.external} variant="glass" withArrow={false}>{secondary.label}</Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Long-form prose styled for the dark theme (privacy/terms etc.). */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-prose text-[15px] leading-relaxed text-white/70 [&_a]:text-ngs-cyan [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:font-grotesk [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-8 [&_h3]:font-grotesk [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_strong]:text-white [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---- Icon set (24×24 stroke, inherit currentColor) ----------------- */
type IconProps = { className?: string };
function IconBase({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}
export function CheckIcon({ className = '' }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export const IconShield = ({ className }: IconProps) => <IconBase className={className}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 11.5l2 2 4-4" /></IconBase>;
export const IconGlobe = ({ className }: IconProps) => <IconBase className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></IconBase>;
export const IconCompass = ({ className }: IconProps) => <IconBase className={className}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></IconBase>;
export const IconSpark = ({ className }: IconProps) => <IconBase className={className}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" /></IconBase>;
export const IconCap = ({ className }: IconProps) => <IconBase className={className}><path d="M12 4l9 4-9 4-9-4 9-4z" /><path d="M6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4" /></IconBase>;
export const IconUsers = ({ className }: IconProps) => <IconBase className={className}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.5a3 3 0 010 6M17 14.5a5.5 5.5 0 013.5 4.5" /></IconBase>;
export const IconChat = ({ className }: IconProps) => <IconBase className={className}><path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3.5V6a1 1 0 011-1z" /></IconBase>;
export const IconStar = ({ className }: IconProps) => <IconBase className={className}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z" /></IconBase>;
export const IconBook = ({ className }: IconProps) => <IconBase className={className}><path d="M4 5.5A1.5 1.5 0 015.5 4H12v15H5.5A1.5 1.5 0 014 17.5v-12z" /><path d="M20 5.5A1.5 1.5 0 0018.5 4H12v15h6.5a1.5 1.5 0 001.5-1.5v-12z" /></IconBase>;
export const IconRoute = ({ className }: IconProps) => <IconBase className={className}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M6 8.5V13a4 4 0 004 4h4" /></IconBase>;
