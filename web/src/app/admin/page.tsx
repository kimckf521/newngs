'use client';

import Link from 'next/link';
import { editablePages } from '@/lib/puck/manifest';

export default function AdminHome() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>Site editor</h1>
      <p style={{ color: '#666', marginTop: 8, fontSize: 15 }}>
        Pick a page to edit. Drag, edit, and reorder sections, then <strong>Publish</strong> to make changes live.
        Unpublished work is kept as a draft.
      </p>

      <Link
        href="/admin/inbox"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '11px 18px', border: '1px solid #e6e6e6', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#111', textDecoration: 'none' }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981', display: 'inline-block' }} aria-hidden />
        Live chat inbox →
      </Link>

      <ul style={{ marginTop: 20, display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
        {editablePages.map((p) => (
          <li
            key={`${p.route}_${p.locale}`}
            style={{ border: '1px solid #e6e6e6', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{p.label}</div>
              <a href={p.urlPath} target="_blank" rel="noreferrer" style={{ color: '#9333ea', fontSize: 13, textDecoration: 'none' }}>
                {p.urlPath} ↗
              </a>
            </div>
            <Link
              href={`/admin/editor/${p.route}/${p.locale}`}
              style={{ background: 'linear-gradient(115deg,#ec1c8b,#8b2fd6,#16c8e6)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '9px 18px', borderRadius: 999, textDecoration: 'none' }}
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
