'use client';

import '@measured/puck/puck.css';
import { Puck } from '@measured/puck';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { puckConfig } from '@/components/puck/config';
import { defaultHomeData } from '@/components/puck/defaults/home';
import { loadPageDoc, saveDraft, publishPage, type SaveMode } from '@/lib/puck/client';
import type { PageDoc, PuckData } from '@/lib/puck/types';

/** Per-route default seed (the live page's current content). */
const seeds: Record<string, (l: Locale) => PuckData> = { home: defaultHomeData };

const ADMIN_KEY_LS = 'ngs-admin-key';

export default function EditorPage() {
  const params = useParams() as { route: string; locale: string };
  const route = params.route;
  const locale: Locale = params.locale === 'en' ? 'en' : 'zh';

  const [data, setData] = useState<PuckData | null>(null);
  const [status, setStatus] = useState('');
  // Load failed against a CONFIGURED backend (auth/unavailable). We then refuse
  // to render the editor at all, so a stale seed can't be published over the
  // live page.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const latest = useRef<PuckData | null>(null);

  useEffect(() => {
    try {
      setAdminKey(localStorage.getItem(ADMIN_KEY_LS) || '');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      let doc: PageDoc | null;
      try {
        doc = await loadPageDoc(route, locale);
      } catch {
        // Configured backend rejected/failed the load — do NOT seed+allow save.
        if (active) setLoadError('无法加载页面（数据库不可用或管理密钥错误）。已停用保存以防覆盖线上内容。');
        return;
      }
      let initial: PuckData | null = doc?.draft ?? doc?.published ?? null;
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

  function persistKey(k: string) {
    setAdminKey(k);
    try {
      localStorage.setItem(ADMIN_KEY_LS, k);
    } catch {
      /* ignore */
    }
  }

  /** Map a SaveMode to a status line — 'local' must never read as "live". */
  function modeStatus(mode: SaveMode, live: boolean): string {
    if (mode === 'cloud') return live ? 'Published ✓ — live now' : 'Draft saved ✓';
    return live ? 'Saved locally (trial — NOT public)' : 'Saved locally (trial)';
  }

  async function onSaveDraft() {
    if (!latest.current) return;
    setStatus('Saving…');
    try {
      setStatus(modeStatus(await saveDraft(route, locale, latest.current), false));
    } catch {
      setStatus('Save failed — check DATABASE_URL / admin key');
    }
  }

  if (loadError) {
    return (
      <div style={{ padding: 24, maxWidth: 560, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c' }}>无法打开编辑器</h2>
        <p style={{ marginTop: 8, fontSize: 14, color: '#444', lineHeight: 1.6 }}>{loadError}</p>
        <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
          请确认服务端 <code>DATABASE_URL</code> 可用，并在下方填入正确的管理密钥（ADMIN_API_KEY）后重试。
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            value={adminKey}
            onChange={(e) => persistKey(e.target.value)}
            placeholder="ADMIN_API_KEY"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          />
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              setData(null);
              // re-run the load effect by nudging state; simplest is a reload.
              window.location.reload();
            }}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            重试
          </button>
        </div>
        <Link href="/admin/page-list" style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: '#555' }}>
          ← Site editor
        </Link>
      </div>
    );
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
          // publishPage triggers on-demand revalidation (/api/revalidate) on a
          // real cloud publish, so the change is live on the next request.
          setStatus(modeStatus(await publishPage(route, locale, d), true));
        } catch {
          setStatus('Publish failed — check DATABASE_URL / admin key');
        }
      }}
      overrides={{
        headerActions: ({ children }: { children: React.ReactNode }) => (
          <>
            <Link
              href="/admin/page-list"
              style={{ alignSelf: 'center', marginRight: 12, fontSize: 13, color: '#555', textDecoration: 'none' }}
            >
              ← Site editor
            </Link>
            <input
              value={adminKey}
              onChange={(e) => persistKey(e.target.value)}
              placeholder="ADMIN_API_KEY"
              title="管理密钥 — 生产环境发布时需要，与 ADMIN_API_KEY 一致"
              style={{ alignSelf: 'center', marginRight: 8, width: 140, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 12 }}
            />
            {status && (
              <span style={{ alignSelf: 'center', marginRight: 12, fontSize: 13, color: status.includes('failed') || status.includes('NOT') ? '#dc2626' : '#16a34a' }}>{status}</span>
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
