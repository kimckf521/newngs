'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Locale } from '@/i18n/types';
import { Container, Display, Eyebrow } from './ui';

/* ------------------------------------------------------------------ *
 * Interactive "Global Network" — the Living Atlas.
 * Centered showcase: a large dark map card with glowing brand-gradient
 * continents, pulsing white hub markers and flowing connection arcs.
 * A calm 4.2s relay lights one hub at a time; a row of hub pills below
 * steers it and reveals each office. Keyboard operable, reduced-motion
 * safe, and the section feels alive on its own.
 * ------------------------------------------------------------------ */

const MAP_W = 1200;
const MAP_H = 784;

type HubKey = 'sf' | 'melbourne' | 'hk' | 'taiwan' | 'gba';

interface Hub {
  key: HubKey;
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  cluster?: 'asia';
  labelPos?: 'top' | 'bottom';
  en: { city: string; region: string; office: string | null };
  zh: { city: string; region: string; office: string | null };
}

const HUBS: Hub[] = [
  {
    key: 'sf', x: 15, y: 35.5, labelPos: 'top',
    en: { city: 'San Francisco', region: 'United States', office: '600 California St, 11th Floor, San Francisco' },
    zh: { city: '三藩市', region: '美国', office: '三藩市加利福尼亚街 600 号 11 楼' },
  },
  {
    key: 'melbourne', x: 90.5, y: 79, labelPos: 'top',
    en: { city: 'Melbourne', region: 'Australia', office: '262 Queen St, Melbourne VIC 3000' },
    zh: { city: '墨尔本', region: '澳大利亚', office: '墨尔本皇后街 262 号 VIC 3000' },
  },
  {
    key: 'hk', x: 82, y: 44, cluster: 'asia', labelPos: 'top',
    en: { city: 'Hong Kong', region: 'China', office: '27/F China Resources Bldg, 26 Harbour Rd, Wanchai' },
    zh: { city: '香港', region: '中国', office: '香港湾仔港湾道 26 号华润大厦 27 楼' },
  },
  {
    key: 'taiwan', x: 82, y: 44, dx: 3.4, dy: -1.4, cluster: 'asia', labelPos: 'top',
    en: { city: 'Taiwan', region: 'China', office: null },
    zh: { city: '台湾', region: '中国', office: null },
  },
  {
    key: 'gba', x: 82, y: 44, dx: -3, dy: 2.2, cluster: 'asia', labelPos: 'bottom',
    en: { city: 'Greater Bay Area', region: 'China', office: 'Nanhai Rose Garden Ph.2, Bldg 4-4C, Nanshan, Shenzhen' },
    zh: { city: '大湾区', region: '中国', office: '深圳市南山区望海路南海玫瑰花园二期 4 栋 4C' },
  },
];

const ARCS: [HubKey, HubKey][] = [
  ['sf', 'hk'], ['sf', 'melbourne'], ['hk', 'melbourne'],
  ['hk', 'taiwan'], ['hk', 'gba'], ['taiwan', 'gba'],
];

const content = {
  en: {
    eyebrow: 'Global Network',
    heading: (
      <>
        Five hubs. <span className="font-display italic">One global community.</span>
      </>
    ),
    sub: 'NextGen Scholars operates across key cities on three continents — connecting students, schools, and mentors worldwide.',
    listLabel: 'NextGen Scholars global hubs',
    mapAlt: "Map of NextGen Scholars' five global hubs",
    regional: 'Regional presence',
  },
  zh: {
    eyebrow: '全球网络',
    heading: (
      <>
        五大枢纽，<span className="font-display italic">一个全球社区。</span>
      </>
    ),
    sub: '未来学者遍布三大洲的核心城市 —— 连接世界各地的学生、学校与导师。',
    listLabel: '未来学者全球枢纽',
    mapAlt: '未来学者全球五大枢纽地图',
    regional: '区域联络',
  },
} as const;

export function GlobalNetwork({ locale }: { locale: Locale }) {
  const t = content[locale];

  const [activeIndex, setActiveIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [liveMsg, setLiveMsg] = useState('');

  const interactionSource = useRef<'auto' | 'user'>('auto');
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  const active = HUBS[activeIndex];

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const on = () => setReduced(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    setIsMobile(mql.matches);
    const on = () => setIsMobile(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const on = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  useEffect(() => {
    if (paused || reduced || !inView || tabHidden) return;
    const id = setInterval(() => {
      interactionSource.current = 'auto';
      setActiveIndex((i) => (i + 1) % HUBS.length);
    }, 4200);
    return () => clearInterval(id);
  }, [paused, reduced, inView, tabHidden]);

  const select = useCallback(
    (i: number, src: 'auto' | 'hover' | 'commit') => {
      interactionSource.current = src === 'auto' ? 'auto' : 'user';
      if (src === 'commit') {
        const h = HUBS[i][locale];
        setLiveMsg(`${h.city}, ${h.region}`);
      }
      setActiveIndex(i);
    },
    [locale],
  );

  const commit = useCallback(
    (i: number) => {
      setFocusIndex(i);
      select(i, 'commit');
    },
    [select],
  );

  const onPillKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    let ni: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (focusIndex + 1) % HUBS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (focusIndex + HUBS.length - 1) % HUBS.length;
    else if (e.key === 'Home') ni = 0;
    else if (e.key === 'End') ni = HUBS.length - 1;
    else if (e.key === 'Escape') { setPaused(false); return; }
    else return;
    e.preventDefault();
    pillRefs.current[ni]?.focus();
  };

  const scale = isMobile ? 1.35 : 1;
  const pos = (h: Hub) => ({ x: h.x + (h.dx ?? 0) * scale, y: h.y + (h.dy ?? 0) * scale });
  const hubByKey = (k: HubKey) => HUBS.find((h) => h.key === k)!;
  const toVB = (p: { x: number; y: number }) => ({ vx: (p.x / 100) * MAP_W, vy: (p.y / 100) * MAP_H });

  const arcPath = (a: Hub, b: Hub) => {
    const { vx: ax, vy: ay } = toVB(pos(a));
    const { vx: bx, vy: by } = toVB(pos(b));
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const dxv = bx - ax;
    const dyv = by - ay;
    const len = Math.hypot(dxv, dyv) || 1;
    let px = -dyv / len;
    let py = dxv / len;
    if (py > 0) { px = -px; py = -py; }
    const lift = len * 0.18;
    const cx = mx + px * lift;
    const cy = my + py * lift;
    return `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  };

  const hkAnchor = hubByKey('hk');
  const activeOffice = active[locale].office ?? t.regional;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="gn-heading"
      className="bg-paper-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <Container className="py-24 lg:py-28">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </div>
          <Display as="h2" className="mt-6 text-[2rem] leading-tight sm:text-[2.75rem]">
            <span id="gn-heading">{t.heading}</span>
          </Display>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-body">{t.sub}</p>
        </div>

        {/* Map stage */}
        <div className="relative mx-auto mt-12 w-full max-w-[820px]">
          <div aria-hidden className="absolute -inset-1 rounded-[32px] bg-ngs-gradient-soft opacity-60 blur-2xl" />
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-canvas shadow-lift"
            style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
          >
            {/* glowing colourful continents */}
            <div
              role="img"
              aria-label={t.mapAlt}
              className="absolute inset-0 bg-ngs-gradient opacity-90"
              style={{
                maskImage: 'url(/static/img/world-map.png)',
                WebkitMaskImage: 'url(/static/img/world-map.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />

            {/* arcs + tethers */}
            <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="ngsArc" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff5fb0" />
                  <stop offset="50%" stopColor="#b06bf0" />
                  <stop offset="100%" stopColor="#4fe0f5" />
                </linearGradient>
                <filter id="ngsArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>

              {HUBS.filter((h) => h.cluster === 'asia' && (h.dx || h.dy)).map((h) => {
                const o = toVB(pos(h));
                const a = toVB({ x: hkAnchor.x, y: hkAnchor.y });
                return <line key={`tether-${h.key}`} x1={o.vx} y1={o.vy} x2={a.vx} y2={a.vy} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />;
              })}

              {!reduced && ARCS.map(([ka, kb]) => {
                const a = hubByKey(ka); const b = hubByKey(kb);
                if (ka !== active.key && kb !== active.key) return null;
                return <path key={`glow-${ka}-${kb}`} d={arcPath(a, b)} fill="none" stroke="url(#ngsArc)" strokeWidth="4" strokeLinecap="round" opacity="0.5" filter="url(#ngsArcGlow)" />;
              })}

              {ARCS.map(([ka, kb]) => {
                const a = hubByKey(ka); const b = hubByKey(kb);
                const isActive = ka === active.key || kb === active.key;
                if (reduced) {
                  return <path key={`${ka}-${kb}`} d={arcPath(a, b)} fill="none" stroke="url(#ngsArc)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />;
                }
                return (
                  <path
                    key={`${ka}-${kb}`}
                    d={arcPath(a, b)}
                    fill="none"
                    stroke="url(#ngsArc)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    className={isActive ? 'motion-safe:animate-arc-flow' : ''}
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      strokeDasharray: isActive ? '10 14' : undefined,
                      transition: 'opacity 500ms ease',
                    }}
                  />
                );
              })}
            </svg>

            {/* markers */}
            <div className="absolute inset-0">
              {active.cluster === 'asia' && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ngs-gradient opacity-30 blur-md"
                  style={{ left: `${hkAnchor.x}%`, top: `${hkAnchor.y}%` }}
                />
              )}
              {HUBS.map((h, i) => {
                const isActive = i === activeIndex;
                const p = pos(h);
                return (
                  <button
                    key={h.key}
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onMouseEnter={() => select(i, 'hover')}
                    onClick={() => commit(i)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${h.cluster ? "before:absolute before:-inset-1.5 before:content-['']" : "before:absolute before:-inset-3 before:content-['']"}`}
                    style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: isActive ? 20 : 10 }}
                  >
                    {!reduced && (
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 motion-safe:animate-ping-soft ${isActive ? '' : 'opacity-30'}`}
                        style={isActive ? undefined : { animationDuration: '4s', animationDelay: `${i * 0.5}s` }}
                      />
                    )}
                    <span
                      className={`relative block h-2.5 w-2.5 rounded-full bg-white transition-all duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${isActive ? 'scale-150 shadow-[0_0_14px_rgba(255,255,255,0.85)]' : 'opacity-70'}`}
                    />
                    {isActive && (
                      <span
                        aria-hidden
                        className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-ink shadow-soft ${h.labelPos === 'bottom' ? 'top-full mt-2.5' : 'bottom-full mb-2.5'}`}
                      >
                        {h[locale].city}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hub selector pills */}
        <div role="group" aria-label={t.listLabel} className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {HUBS.map((h, i) => {
            const isActive = i === activeIndex;
            const info = h[locale];
            return (
              <button
                key={h.key}
                type="button"
                ref={(el) => { pillRefs.current[i] = el; }}
                tabIndex={i === focusIndex ? 0 : -1}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${info.city}, ${info.region} — ${info.office ?? t.regional}`}
                onMouseEnter={() => select(i, 'hover')}
                onFocus={() => commit(i)}
                onClick={() => commit(i)}
                onKeyDown={onPillKeyDown}
                className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ngs-violet ${
                  isActive
                    ? 'border-transparent bg-ngs-gradient text-white shadow-[0_8px_22px_-8px_rgba(139,47,214,0.6)]'
                    : 'border-edge bg-white text-slate-body hover:border-slate-ink/40 hover:text-slate-ink'
                }`}
              >
                <span className={`h-2 w-2 flex-none rounded-full ${isActive ? 'bg-white' : 'bg-ngs-gradient'}`} />
                {info.city}
              </button>
            );
          })}
        </div>

        {/* Active office caption */}
        <p className="mx-auto mt-5 flex min-h-[1.5rem] max-w-md items-center justify-center gap-2 text-center text-sm text-slate-mute">
          <span className="font-medium text-slate-body">{active[locale].region}</span>
          <span aria-hidden className="text-slate-mute/50">·</span>
          {activeOffice}
        </p>
      </Container>

      <span className="sr-only" role="status" aria-live="polite">{liveMsg}</span>
    </section>
  );
}
