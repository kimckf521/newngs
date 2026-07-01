'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Make a floating panel draggable by a handle. Returns the live position and a
 *  pointer-down handler to wire onto the drag handle. Keeps the panel on screen. */
export function useDraggable(panelRef: RefObject<HTMLElement | null>, initial: { x: number; y: number }) {
  const [pos, setPos] = useState(initial);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onHandleDown = useCallback((e: React.PointerEvent) => {
    const rect = panelRef.current?.getBoundingClientRect();
    drag.current = { dx: e.clientX - (rect?.left ?? 0), dy: e.clientY - (rect?.top ?? 0) };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [panelRef]);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!drag.current) return;
      const w = panelRef.current?.offsetWidth ?? 320;
      const h = panelRef.current?.offsetHeight ?? 240;
      const x = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 40);
      const y = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 40);
      void w; void h;
      setPos({ x, y });
    }
    function up() { drag.current = null; }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [panelRef]);

  return { pos, setPos, onHandleDown };
}
