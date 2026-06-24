import type { NextRequest } from 'next/server';
import { saveSession, storeConfigured, type AudioClip } from '@/lib/ielts/cloudbaseStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Best-effort: persists a finished speaking session. Always 200 so the client
// never treats a storage hiccup as a user-facing error.
export async function POST(req: NextRequest) {
  if (!storeConfigured()) return Response.json({ ok: false, error: 'not_configured' });
  let body: { history?: unknown; bands?: unknown; durationSec?: number; audio?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_request' });
  }
  // Answer recordings are optional (typed-only sessions have none) — keep only
  // well-formed clips; saveSession caps/uploads them best-effort.
  const audio: AudioClip[] | undefined = Array.isArray(body.audio)
    ? (body.audio as unknown[]).filter(
        (a): a is AudioClip => !!a && typeof a === 'object' && typeof (a as { wavB64?: unknown }).wavB64 === 'string',
      )
    : undefined;
  const result = await saveSession(
    {
      app: 'ielts-speaking',
      transcript: body.history ?? [],
      bands: body.bands ?? null,
      durationSec: body.durationSec ?? null,
    },
    audio,
  );
  return Response.json(result);
}
