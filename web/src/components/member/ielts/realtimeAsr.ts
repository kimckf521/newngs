'use client';

/**
 * Browser-side Tencent real-time ASR. Fetches a server-signed wss URL, opens the
 * WebSocket, and streams 16k PCM frames (fed live from the recorder) so the
 * transcript is ready the moment the user stops — removing the post-stop ASR
 * round-trip from the conversation loop. Falls back gracefully (returns null /
 * empty) so the caller can use the one-shot ASR instead.
 *
 * Result assembly (Tencent v2): `result.voice_text_str` is the FULL text of the
 * sentence `result.index` so far — REPLACE in place across that sentence's
 * slice_type 0→1→…→2 lifecycle; a new index APPENDS a new sentence.
 */

export type RealtimeAsr = {
  pushFrame: (frame: Int16Array) => void;
  /** Send end-of-stream and resolve the final transcript (with a safety timeout). */
  finalize: () => Promise<string>;
  cancel: () => void;
  /** True if the session errored (e.g. auth/quota 4xx) rather than finishing
   *  normally — the caller can stop attempting realtime for the rest of the session. */
  failed: () => boolean;
};

export async function startRealtimeAsr(): Promise<RealtimeAsr | null> {
  let url: string;
  try {
    const res = await fetch('/api/ielts/asr-token', { method: 'POST' });
    if (!res.ok) return null;
    url = (await res.json()).url as string;
    if (!url) return null;
  } catch {
    return null;
  }

  let ws: WebSocket;
  try {
    ws = new WebSocket(url);
  } catch {
    return null;
  }
  ws.binaryType = 'arraybuffer';

  const sentences = new Map<number, string>();
  let ready = false;
  let done = false;
  let errored = false;
  const pending: Int16Array[] = [];
  let finalResolve: ((s: string) => void) | null = null;

  const assemble = () =>
    [...sentences.keys()]
      .sort((a, b) => a - b)
      .map((i) => sentences.get(i) || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

  const settle = () => {
    if (finalResolve) { finalResolve(assemble()); finalResolve = null; }
  };

  ws.onmessage = (ev) => {
    let msg: { code?: number; final?: number; result?: { index?: number; voice_text_str?: string } };
    try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ''); } catch { return; }
    if (typeof msg.code === 'number' && msg.code !== 0) { errored = true; done = true; settle(); try { ws.close(); } catch { /* noop */ } return; }
    if (msg.final === 1) { done = true; settle(); try { ws.close(); } catch { /* noop */ } return; }
    if (!ready) {
      // first code:0 = auth ok / ready → flush buffered frames
      ready = true;
      for (const f of pending) { try { ws.send(f); } catch { /* noop */ } }
      pending.length = 0;
      return;
    }
    const r = msg.result;
    if (r && typeof r.index === 'number') sentences.set(r.index, r.voice_text_str || '');
  };
  ws.onerror = () => { errored = true; done = true; settle(); };
  ws.onclose = () => { if (!ready) errored = true; done = true; settle(); };

  return {
    pushFrame: (frame) => {
      if (done) return;
      if (ready && ws.readyState === WebSocket.OPEN) { try { ws.send(frame); } catch { /* noop */ } }
      else if (pending.length < 2000) pending.push(frame); // bound buffer (~80s) before ready
    },
    finalize: () =>
      new Promise<string>((resolve) => {
        if (done) return resolve(assemble());
        finalResolve = resolve;
        try { ws.send(JSON.stringify({ type: 'end' })); } catch { return resolve(assemble()); }
        // Final result normally arrives in <1s; don't hang the turn if it doesn't.
        setTimeout(() => { if (finalResolve) { finalResolve(assemble()); finalResolve = null; try { ws.close(); } catch { /* noop */ } } }, 2500);
      }),
    cancel: () => { done = true; try { ws.close(); } catch { /* noop */ } },
    failed: () => errored,
  };
}
