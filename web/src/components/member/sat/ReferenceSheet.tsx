'use client';

import { useRef } from 'react';
import { C, SERIF } from './shared';
import { useDraggable } from './useDraggable';

/** The Bluebook Math "Reference Sheet" — a floating, draggable, dismissible
 *  panel with the exact figures + formulas from the official directions. */
export function ReferenceSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pos, onHandleDown } = useDraggable(ref, { x: 120, y: 90 });

  return (
    <div ref={ref} className="fixed z-[78] w-[min(560px,94vw)] rounded-lg border bg-white shadow-2xl"
      style={{ left: pos.x, top: pos.y, borderColor: C.border }}>
      <div onPointerDown={onHandleDown} className="flex cursor-move items-center justify-between rounded-t-lg px-4 py-2" style={{ background: '#f3f4f7', borderBottom: `1px solid ${C.hairline}` }}>
        <span className="text-[14px] font-bold" style={{ color: C.ink }}>Reference Sheet</span>
        <button type="button" onClick={onClose} className="rounded p-1 text-[18px] leading-none hover:bg-black/5" style={{ color: C.muted }} aria-label="Close">×</button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-5" style={{ fontFamily: SERIF, color: C.ink }}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Figure label="Circle" formula="A = πr²" sub="C = 2πr">
            <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke={C.ink} /><line x1="28" y1="28" x2="48" y2="28" stroke={C.ink} /><text x="36" y="24" fontSize="9">r</text></svg>
          </Figure>
          <Figure label="Rectangle" formula="A = ℓw">
            <svg width="64" height="44" viewBox="0 0 64 44"><rect x="6" y="8" width="52" height="28" fill="none" stroke={C.ink} /><text x="30" y="6" fontSize="9">ℓ</text><text x="60" y="26" fontSize="9">w</text></svg>
          </Figure>
          <Figure label="Triangle" formula="A = ½bh">
            <svg width="60" height="48" viewBox="0 0 60 48"><path d="M8 40 L52 40 L34 8 Z" fill="none" stroke={C.ink} /><line x1="34" y1="8" x2="34" y2="40" stroke={C.ink} strokeDasharray="3 2" /><text x="36" y="28" fontSize="9">h</text><text x="28" y="47" fontSize="9">b</text></svg>
          </Figure>
          <Figure label="Right triangle" formula="c² = a² + b²">
            <svg width="60" height="48" viewBox="0 0 60 48"><path d="M10 40 L50 40 L10 8 Z" fill="none" stroke={C.ink} /><text x="2" y="26" fontSize="9">a</text><text x="28" y="47" fontSize="9">b</text><text x="34" y="20" fontSize="9">c</text></svg>
          </Figure>
          <Figure label="30°-60°-90°" formula="x, x√3, 2x">
            <svg width="64" height="48" viewBox="0 0 64 48"><path d="M10 40 L54 40 L10 10 Z" fill="none" stroke={C.ink} /><text x="2" y="28" fontSize="8">x</text><text x="28" y="47" fontSize="8">x√3</text><text x="32" y="20" fontSize="8">2x</text></svg>
          </Figure>
          <Figure label="45°-45°-90°" formula="s, s, s√2">
            <svg width="60" height="48" viewBox="0 0 60 48"><path d="M10 40 L50 40 L10 0 Z" fill="none" stroke={C.ink} /><text x="2" y="24" fontSize="8">s</text><text x="26" y="47" fontSize="8">s</text><text x="30" y="18" fontSize="8">s√2</text></svg>
          </Figure>
          <Figure label="Rectangular box" formula="V = ℓwh">
            <svg width="64" height="48" viewBox="0 0 64 48"><path d="M8 16 H44 V40 H8 Z" fill="none" stroke={C.ink} /><path d="M8 16 L20 6 H56 L44 16 M44 40 L56 30 V6" fill="none" stroke={C.ink} /></svg>
          </Figure>
          <Figure label="Cylinder" formula="V = πr²h">
            <svg width="50" height="56" viewBox="0 0 50 56"><ellipse cx="25" cy="12" rx="16" ry="6" fill="none" stroke={C.ink} /><path d="M9 12 V44 M41 12 V44" stroke={C.ink} /><path d="M9 44 a16 6 0 0 0 32 0" fill="none" stroke={C.ink} /></svg>
          </Figure>
          <Figure label="Sphere" formula="V = ⁴⁄₃πr³">
            <svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="20" fill="none" stroke={C.ink} /><ellipse cx="26" cy="26" rx="20" ry="6" fill="none" stroke={C.ink} strokeDasharray="3 2" /></svg>
          </Figure>
          <Figure label="Cone" formula="V = ⅓πr²h">
            <svg width="52" height="56" viewBox="0 0 52 56"><path d="M26 6 L8 46 a18 6 0 0 0 36 0 Z" fill="none" stroke={C.ink} /><ellipse cx="26" cy="46" rx="18" ry="6" fill="none" stroke={C.ink} /></svg>
          </Figure>
          <Figure label="Pyramid" formula="V = ⅓ℓwh">
            <svg width="56" height="52" viewBox="0 0 56 52"><path d="M28 6 L8 40 L40 40 Z M28 6 L48 30 L40 40 M8 40 L48 30" fill="none" stroke={C.ink} /></svg>
          </Figure>
        </div>

        <div className="mt-6 space-y-1.5 border-t pt-4 text-[13px]" style={{ borderColor: C.hairline, fontFamily: 'Inter, sans-serif', color: C.ink }}>
          <p>The number of degrees of arc in a circle is <b>360</b>.</p>
          <p>The number of radians of arc in a circle is <b>2π</b>.</p>
          <p>The sum of the measures in degrees of the angles of a triangle is <b>180</b>.</p>
        </div>
      </div>
    </div>
  );
}

function Figure({ label, formula, sub, children }: { label: string; formula: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid h-14 place-items-center">{children}</div>
      <div className="mt-1 text-[12px]" style={{ color: C.muted, fontFamily: 'Inter, sans-serif' }}>{label}</div>
      <div className="text-[14px] font-semibold">{formula}</div>
      {sub ? <div className="text-[14px] font-semibold">{sub}</div> : null}
    </div>
  );
}
