'use client';

/**
 * Browser read access to the question bank via /api/question-bank. Mirrors the
 * courses client's admin-key handling. Returns null when there's no bank for the
 * given id (or the backend isn't configured) so the UI can simply hide.
 */

export type BankBookMeta = { book: string; title: string; chars: number };
export type BankSummary = {
  id: string; name: string; bookCount: number; missing: number[]; books: BankBookMeta[];
  published: boolean; cover: string | null; description: string | null; modules: { title: string }[]; updatedAt: string | null;
};
export type BankBook = { book: string; title: string; markdown: string };
export type BankListItem = { id: string; name: string; bookCount: number; published: boolean; cover: string | null; updatedAt: string | null };

const KEY_LS = 'ngs-admin-key';

function adminKeyHeaders(): Record<string, string> {
  try {
    const k = (typeof window !== 'undefined' && window.localStorage.getItem(KEY_LS)) || '';
    return k ? { 'x-admin-key': k } : {};
  } catch {
    return {};
  }
}

export async function fetchBanks(): Promise<BankListItem[]> {
  try {
    const res = await fetch('/api/question-bank', { headers: adminKeyHeaders() });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; banks?: BankListItem[] } | null;
    return data?.ok ? data.banks ?? [] : [];
  } catch {
    return [];
  }
}

export async function fetchBankSummary(id: string): Promise<BankSummary | null> {
  try {
    const res = await fetch(`/api/question-bank?id=${encodeURIComponent(id)}`, { headers: adminKeyHeaders() });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; bank?: BankSummary | null } | null;
    return data?.ok ? data.bank ?? null : null;
  } catch {
    return null;
  }
}

export async function fetchBankBook(id: string, book: string, skill?: string): Promise<BankBook | null> {
  try {
    const res = await fetch(
      `/api/question-bank?id=${encodeURIComponent(id)}&book=${encodeURIComponent(book)}${skill ? `&skill=${encodeURIComponent(skill)}` : ''}`,
      { headers: adminKeyHeaders() },
    );
    const data = (await res.json().catch(() => null)) as { ok?: boolean; book?: BankBook } | null;
    return data?.ok ? data.book ?? null : null;
  } catch {
    return null;
  }
}
