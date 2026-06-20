'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import type { Locale } from '@/i18n/types';

/**
 * Trial-mode override for the public page. When a page was "published" locally
 * (CloudBase not set up — see lib/puck/client.ts localStorage fallback), render
 * that published Puck data here instead of the hardcoded fallback. Per-browser
 * only. REAL (CloudBase) publishes render server-side and never reach this
 * component. Puck + config are dynamically imported, so visitors with no local
 * publish never download them.
 */
type RenderState = { Comp: ComponentType<any>; config: any; data: any };

export function LocalPublishedView({
  route,
  locale,
  children,
}: {
  route: string;
  locale: Locale;
  children: ReactNode;
}) {
  const [render, setRender] = useState<RenderState | null>(null);

  useEffect(() => {
    let active = true;
    let published: unknown = null;
    try {
      const raw = window.localStorage.getItem(`ngs-puck:${route}_${locale}`);
      published = raw ? JSON.parse(raw)?.published : null;
    } catch {
      published = null;
    }
    if (!published) return;
    void Promise.all([import('@measured/puck'), import('./config')]).then(([puck, cfg]) => {
      if (active) setRender({ Comp: puck.Render, config: cfg.puckConfig, data: published });
    });
    return () => {
      active = false;
    };
  }, [route, locale]);

  if (render) {
    const { Comp, config, data } = render;
    return <Comp config={config} data={data} metadata={{ locale }} />;
  }
  return <>{children}</>;
}
