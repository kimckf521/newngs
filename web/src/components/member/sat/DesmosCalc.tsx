'use client';

import { useEffect, useRef, useState } from 'react';
import { C } from './shared';
import { useSatLang } from './i18n';
import { useDraggable } from './useDraggable';

/**
 * The Bluebook Math built-in calculator — the genuine embedded Desmos, in a
 * floating, draggable, resizable window with a Graphing/Scientific toggle.
 * Loads the Desmos API script on first open (College Board ships Desmos in
 * Bluebook). The demo apiKey below is Desmos's public sandbox key; swap in your
 * own from desmos.com/api for production.
 */

const DESMOS_SRC = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

type DesmosNS = {
  GraphingCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => { destroy: () => void };
  ScientificCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => { destroy: () => void };
};
declare global {
  interface Window { Desmos?: DesmosNS }
}

let scriptPromise: Promise<void> | null = null;
function loadDesmos(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.Desmos) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = DESMOS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('desmos_load_failed')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function DesmosCalc({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<{ destroy: () => void } | null>(null);
  const [mode, setMode] = useState<'graphing' | 'scientific'>('graphing');
  const [size, setSize] = useState({ w: 420, h: 520 });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const { lang } = useSatLang();
  const { pos, onHandleDown } = useDraggable(panelRef, { x: Math.max(20, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 460), y: 80 });

  // (Re)build the Desmos instance whenever the mode changes.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadDesmos()
      .then(() => {
        if (cancelled || !mountRef.current || !window.Desmos) return;
        calcRef.current?.destroy();
        mountRef.current.innerHTML = '';
        calcRef.current =
          mode === 'graphing'
            ? window.Desmos.GraphingCalculator(mountRef.current, { keypad: true, expressions: true, settingsMenu: true, zoomButtons: true })
            : window.Desmos.ScientificCalculator(mountRef.current, {});
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; calcRef.current?.destroy(); calcRef.current = null; };
  }, [mode]);

  // edge resize (bottom-right handle)
  const resizing = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    function move(e: PointerEvent) {
      if (!resizing.current) return;
      setSize({
        w: Math.max(320, resizing.current.w + (e.clientX - resizing.current.x)),
        h: Math.max(360, resizing.current.h + (e.clientY - resizing.current.y)),
      });
    }
    function up() { resizing.current = null; }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  return (
    <div ref={panelRef} className="fixed z-[79] flex flex-col overflow-hidden rounded-lg border shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h, background: C.panel, borderColor: C.border }}>
      <div onPointerDown={onHandleDown} className="flex cursor-move items-center justify-between px-3 py-2" style={{ background: C.panel2, borderBottom: `1px solid ${C.hairline}` }}>
        <div className="flex items-center gap-1 rounded-md p-0.5" style={{ background: C.panel2 }}>
          {(['graphing', 'scientific'] as const).map((m) => (
            <button key={m} type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMode(m)}
              className="rounded px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: mode === m ? C.panel : 'transparent', color: mode === m ? C.blue : C.muted }}>
              {m === 'graphing' ? (lang === 'zh' ? '图形' : 'Graphing') : (lang === 'zh' ? '科学' : 'Scientific')}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 text-[18px] leading-none hover:bg-black/5" style={{ color: C.muted }} aria-label={lang === 'zh' ? '关闭计算器' : 'Close calculator'}>×</button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={mountRef} className="h-full w-full" />
        {status !== 'ready' ? (
          <div className="absolute inset-0 grid place-items-center text-[13px]" style={{ color: C.muted, background: C.panel }}>
            {status === 'loading'
              ? (lang === 'zh' ? '正在加载计算器…' : 'Loading calculator…')
              : (lang === 'zh' ? '计算器不可用（离线）。真实考试会在此嵌入 Desmos。' : 'Calculator unavailable (offline). The real test embeds Desmos here.')}
          </div>
        ) : null}
      </div>

      <div onPointerDown={(e) => { resizing.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }; }}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize" title="Resize"
        style={{ background: `linear-gradient(135deg, transparent 50%, ${C.border} 50%)` }} />
    </div>
  );
}
