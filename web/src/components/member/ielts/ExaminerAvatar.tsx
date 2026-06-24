'use client';

import { useEffect, useRef } from 'react';

/**
 * A small animated examiner "face" for the voice-only (transcript-hidden) view,
 * so it feels like talking to a real examiner. Pure inline SVG + CSS — no image
 * asset, works offline. It reacts to the conversation state: the mouth moves
 * while speaking, an attentive smile while listening, eyes glance up while
 * thinking, plus idle blinking and a gentle breathing bob throughout.
 */

export type AvatarState = 'speaking' | 'listening' | 'thinking' | 'idle';

const RING: Record<AvatarState, string> = {
  speaking: '#1565c0',
  listening: '#1b7a32',
  thinking: '#c98a00',
  idle: '#9aa3ad',
};

export function ExaminerAvatar({ state, size = 184, levelRef }: { state: AvatarState; size?: number; levelRef?: { current: number } }) {
  const ring = RING[state];
  const pupilDy = state === 'thinking' ? -4 : 0; // glance up while thinking
  const mouthRef = useRef<SVGEllipseElement | null>(null);

  // Lip-sync: while speaking, open the mouth from the live audio level (true sync
  // for iFlytek's analysed audio); if no real level is arriving (browser voice, or
  // analysis unavailable), fall back to a natural synthetic talking motion.
  useEffect(() => {
    if (state !== 'speaking') return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let shown = 0.25;
    const tick = () => {
      const raw = levelRef ? levelRef.current : 0;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const target = raw > 0.015 ? Math.min(1, raw) : Math.abs(0.5 * Math.sin(now * 0.013) + 0.3 * Math.sin(now * 0.03));
      shown += (target - shown) * 0.4;
      const el = mouthRef.current;
      if (el) el.style.transform = `scaleY(${(0.22 + Math.max(0, shown) * 1.5).toFixed(3)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [state, levelRef]);

  const css = `
    .exa-bob { animation: exaBob 4.2s ease-in-out infinite; }
    .exa-ring { animation: exaRing 2.4s ease-in-out infinite; transform-origin: 120px 120px; transform-box: view-box; }
    .exa-eye { animation: exaBlink 5.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
    @keyframes exaBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
    @keyframes exaRing { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
    @keyframes exaBlink { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(.08); } }
    @media (prefers-reduced-motion: reduce) { .exa-bob,.exa-ring,.exa-eye { animation: none; } }
  `;
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI examiner">
      <defs>
        <clipPath id="exaClip"><circle cx="120" cy="120" r="104" /></clipPath>
      </defs>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* status ring (colour = current state) */}
      <circle className="exa-ring" cx="120" cy="120" r="113" fill="none" stroke={ring} strokeWidth="5" />
      <circle cx="120" cy="120" r="106" fill="#ffffff" />
      <g clipPath="url(#exaClip)">
        {/* studio backdrop */}
        <rect x="14" y="14" width="212" height="212" fill="#e9eff5" />
        {/* shoulders / suit + collar + tie */}
        <path d="M44 240 q0-72 76-72 t76 72 z" fill="#2b3a55" />
        <path d="M96 176 L120 212 L144 176 L132 168 L120 190 L108 168 Z" fill="#ffffff" />
        <path d="M120 190 l-7 12 7 30 7-30 z" fill="#7c93b8" />
        <g className="exa-bob">
          {/* neck + head + ears */}
          <rect x="106" y="150" width="28" height="34" rx="12" fill="#dda87e" />
          <ellipse cx="73" cy="112" rx="9" ry="13" fill="#dfa884" />
          <ellipse cx="167" cy="112" rx="9" ry="13" fill="#dfa884" />
          <ellipse cx="120" cy="110" rx="48" ry="54" fill="#edb993" />
          {/* hair */}
          <path d="M71 98 q3-54 49-54 t49 54 q-11-24-49-24 t-49 24 z" fill="#46413e" />
          {/* eyebrows */}
          <rect x="92" y="93" width="22" height="5" rx="2.5" fill="#5a514c" />
          <rect x="126" y="93" width="22" height="5" rx="2.5" fill="#5a514c" />
          {/* eyes */}
          <g className="exa-eye">
            <ellipse cx="103" cy="107" rx="11" ry="8" fill="#ffffff" />
            <circle cx="103" cy={107 + pupilDy} r="4.6" fill="#37322f" />
          </g>
          <g className="exa-eye">
            <ellipse cx="137" cy="107" rx="11" ry="8" fill="#ffffff" />
            <circle cx="137" cy={107 + pupilDy} r="4.6" fill="#37322f" />
          </g>
          {/* glasses */}
          <g fill="none" stroke="#3a3a3a" strokeWidth="2.4" opacity=".8">
            <rect x="90" y="99" width="26" height="18" rx="7" />
            <rect x="124" y="99" width="26" height="18" rx="7" />
            <path d="M116 107 h8" />
            <path d="M90 105 l-12 -3" />
            <path d="M150 105 l12 -3" />
          </g>
          {/* nose */}
          <path d="M120 112 q-5 12 -2 16 q3 3 8 1" fill="none" stroke="#c98e6c" strokeWidth="2.4" strokeLinecap="round" />
          {/* mouth — reacts to state */}
          {state === 'speaking' ? (
            <ellipse ref={mouthRef} cx="120" cy="140" rx="13" ry="9" fill="#9a4a44" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          ) : state === 'thinking' ? (
            <circle cx="120" cy="140" r="4.5" fill="none" stroke="#9a4a44" strokeWidth="3" />
          ) : (
            <path d={state === 'listening' ? 'M103 136 q17 16 34 0' : 'M106 138 q14 11 28 0'} fill="none" stroke="#9a4a44" strokeWidth="3.4" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
}
