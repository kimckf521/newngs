'use client';

import '@measured/puck/puck.css';
import { Puck } from '@measured/puck';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { puckConfig } from '@/components/puck/config';
import { defaultHomeData } from '@/components/puck/defaults/home';
import { loadPageDoc, saveDraft, publishPage } from '@/lib/puck/client';
import type { PuckData } from '@/lib/puck/types';

/** Per-route default seed (the live page's current content). */
const seeds: Record<string, (l: Locale) => PuckData> = { home: defaultHomeData };

export default function EditorPage() {
  const params = useParams() as { route: string; locale: string };
  const route = params.route;
  const locale: Locale = params.locale === 'en' ? 'en' : 'zh';

  const [data, setData] = useState<PuckData | null>(null);
  const [status, setStatus] = useState('');
  const latest = useRef<PuckData | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      let initial: PuckData | null = null;
      try {
        const doc = await loadPageDoc(route, locale);
        initial = doc?.draft ?? doc?.published ?? null;
      } catch {
        /* fall through to seed */
      }
      if (!initial) {
        const seed = seeds[route];
        initial = seed ? seed(locale) : { content: [], root: { props: {} } };
      }
      if (active) {
        latest.current = initial;
        setData(initial);
      }
    })();
    return () => {
      active = false;
    };
  }, [route, locale]);

  async function onSaveDraft() {
    if (!latest.current) return;
    setStatus('Saving…');
    try {
      await saveDraft(route, locale, latest.current);
      setStatus('Draft saved ✓');
    } catch {
      setStatus('Save failed — check CloudBase setup');
    }
  }

  if (!data) {
    return <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>Loading editor…</div>;
  }

  return (
    <Puck
      config={puckConfig}
      data={data as never}
      metadata={{ locale }}
      onChange={(d: PuckData) => {
        latest.current = d;
      }}
      onPublish={async (d: PuckData) => {
        setStatus('Publishing…');
        try {
          await publishPage(route, locale, d);
          setStatus('Published ✓ — live now');
        } catch {
          setStatus('Publish failed — check CloudBase setup');
        }
      }}
      overrides={{
        headerActions: ({ children }: { children: React.ReactNode }) => (
          <>
            <Link
              href="/admin"
              style={{ alignSelf: 'center', marginRight: 12, fontSize: 13, color: '#555', textDecoration: 'none' }}
            >
              ← Pages
            </Link>
            {status && (
              <span style={{ alignSelf: 'center', marginRight: 12, fontSize: 13, color: '#16a34a' }}>{status}</span>
            )}
            <button
              type="button"
              onClick={onSaveDraft}
              style={{ marginRight: 8, padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Save draft
            </button>
            {children}
          </>
        ),
      }}
    />
  );
}
