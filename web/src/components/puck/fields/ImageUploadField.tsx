'use client';

import { useState } from 'react';
import { getCloudBaseApp } from '@/lib/cloudbase';

/**
 * Puck custom-field UI: upload an image to CloudBase storage (or paste a URL).
 * In demo mode (no CloudBase app) it falls back to a local object URL so the
 * editor preview still works locally.
 */
export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleFile(file: File) {
    setBusy(true);
    setErr('');
    try {
      const app = await getCloudBaseApp();
      if (!app) {
        onChange(URL.createObjectURL(file)); // demo: ephemeral local preview
        return;
      }
      const safe = file.name.replace(/[^\w.\-]/g, '_');
      const cloudPath = `pages/uploads/${Date.now()}-${safe}`;
      const up = await app.uploadFile({ cloudPath, filePath: file });
      const urlRes = await app.getTempFileURL({ fileList: [up.fileID] });
      const url = urlRes?.fileList?.[0]?.tempFileURL;
      if (!url) throw new Error('no_url');
      onChange(url);
    } catch {
      setErr('Upload failed — paste a URL instead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--puck-color-grey-04, #555)' }}>{label}</span>}
      <input
        type="text"
        value={value || ''}
        placeholder="https://… (or upload below)"
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
      />
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) void handleFile(f);
        }}
        style={{ fontSize: 12 }}
      />
      {busy && <span style={{ fontSize: 12, color: '#888' }}>Uploading…</span>}
      {err && <span style={{ fontSize: 12, color: '#c0392b' }}>{err}</span>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 4 }} />
      )}
    </div>
  );
}
