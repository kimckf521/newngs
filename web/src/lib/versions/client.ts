'use client';

/**
 * Browser access to version history. Talks to the PostgreSQL-backed
 * /api/versions; when no database is configured it falls back to a localStorage
 * TRIAL history (per browser). The DB history is written automatically by the
 * server on every save; the local history is written by {@link pushLocalVersion}
 * from the client save paths so trial mode also gets auto-backups.
 */

export type VersionKind = 'course' | 'ielts_module';
export type VersionMeta = { id: string; savedBy: string | null; savedAt: number; label: string | null };

const KEY_LS = 'ngs-admin-key';
const KEEP = 50;

type LocalVersion = VersionMeta & { data: unknown };

function lsKey(kind: VersionKind, refId: string) {
  return `ngs:versions:${kind}:${refId}`;
}

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

function readLocal(kind: VersionKind, refId: string): LocalVersion[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(lsKey(kind, refId)) : null;
    return raw ? (JSON.parse(raw) as LocalVersion[]) : [];
  } catch {
    return [];
  }
}

/** Append a local snapshot (newest first). Called from client save paths when
 *  persisting to the localStorage trial store. `nowMs` is passed in by the
 *  caller so this stays free of Date.now() at module scope. */
export function pushLocalVersion(
  kind: VersionKind,
  refId: string,
  data: unknown,
  savedBy: string | null,
  nowMs: number,
): void {
  try {
    const list = readLocal(kind, refId);
    list.unshift({ id: `L${nowMs}`, savedAt: nowMs, savedBy, label: null, data });
    window.localStorage.setItem(lsKey(kind, refId), JSON.stringify(list.slice(0, KEEP)));
  } catch {
    /* ignore quota/availability */
  }
}

export async function listVersions(kind: VersionKind, refId: string): Promise<VersionMeta[]> {
  try {
    const res = await fetch(`/api/versions?kind=${encodeURIComponent(kind)}&refId=${encodeURIComponent(refId)}`, {
      headers: adminKeyHeaders(),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; configured?: boolean; versions?: VersionMeta[] }
      | null;
    if (data?.ok && data.configured) return data.versions || [];
  } catch {
    /* fall through to local */
  }
  return readLocal(kind, refId).map(({ id, savedAt, savedBy, label }) => ({ id, savedAt, savedBy, label }));
}

export async function getVersionData(kind: VersionKind, refId: string, id: string): Promise<unknown | null> {
  // Local snapshots are prefixed 'L'; DB snapshots are numeric.
  if (id.startsWith('L')) {
    return readLocal(kind, refId).find((v) => v.id === id)?.data ?? null;
  }
  try {
    const res = await fetch(`/api/versions?id=${encodeURIComponent(id)}`, {
      headers: adminKeyHeaders(),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; data?: unknown } | null;
    if (data?.ok) return data.data ?? null;
  } catch {
    /* fall through */
  }
  return readLocal(kind, refId).find((v) => v.id === id)?.data ?? null;
}
