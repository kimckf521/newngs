import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ *
 * Primitives for the gamified "Learning Hub" design (design-v2).
 * Friendly light theme: white rounded-3xl cards, soft shadows, vibrant
 * brand-gradient + colorful accents.
 * ------------------------------------------------------------------ */

export const CARD = 'rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_44px_-22px_rgba(16,24,40,0.20)]';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD} ${className}`}>{children}</div>;
}

const PATHS: Record<string, ReactNode> = {
  flame: <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.6-2.7 1.3-3.6C9 10 10 9 10 7c1.2.8 2 2 2 3 .8-1 .9-2.4 0-7z" />,
  bolt: <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" /></>,
  trophy: <><path d="M7 4h10v3a5 5 0 0 1-10 0V4z" /><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 14h6M10 17h4M9 20h6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  play: <path d="M7 5l11 7-11 7V5z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 6M17.5 19a5 5 0 0 0-2.5-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20V4.5z" /><path d="M9 8h6M9 11h4" /></>,
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V6a1 1 0 0 1 1-1z" />,
  sparkles: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />,
};

export function Icon({ name, className = '', stroke = 1.8 }: { name: keyof typeof PATHS | string; className?: string; stroke?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[name] ?? null}
    </svg>
  );
}

/** Circular progress ring with a centered slot. */
export function Ring({ value, size = 120, stroke = 11, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const id = `dv2ring-${size}-${stroke}`;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ec1c8b" />
            <stop offset="50%" stopColor="#8b2fd6" />
            <stop offset="100%" stopColor="#16c8e6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dv2-ring-track, #eef0f5)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ value, className = '', tall = false }: { value: number; className?: string; tall?: boolean }) {
  return (
    <div className={`${tall ? 'h-2.5' : 'h-2'} w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <span className="block h-full rounded-full bg-ngs-gradient transition-[width] duration-500 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}

export function GradientButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-ngs-gradient px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(236,28,139,0.75)] transition-transform hover:-translate-y-0.5 active:translate-y-0 ${className}`}>
      {children}
    </button>
  );
}
