import 'server-only';

/**
 * Per-(book,test) mutex for the listening-audio upload/delete routes.
 *
 * Both routes do a slow COS round-trip (seconds to minutes over the known-slow
 * ap-shanghai link) BEFORE their final DB write. Without serialization, a
 * delete-then-reupload (or vice versa) on the same test can complete
 * out of order — whichever request's network call finishes LAST wins the DB
 * write, silently undoing the other. This chains same-key operations so they
 * run in the order they were RECEIVED, not the order their slow leg finishes.
 *
 * Cached on globalThis so the chain survives Next.js dev-server HMR reloads
 * (mirrors the pg pool caching pattern in lib/db/pg.ts).
 */
type Cache = { chains?: Map<string, Promise<unknown>> };
const cache: Cache = ((globalThis as unknown as { __ngsAudioLock?: Cache }).__ngsAudioLock ??= {});
if (!cache.chains) cache.chains = new Map();

export async function withAudioLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const chains = cache.chains!;
  const prev = chains.get(key) || Promise.resolve();
  // Swallow the previous op's rejection here so it can't short-circuit ours —
  // we only need to wait for it to SETTLE, not succeed.
  const waitForPrev = prev.catch(() => {});
  const next = waitForPrev.then(fn);
  // Store a settled-tracking promise so the NEXT caller also just waits (not fails).
  chains.set(key, next.catch(() => {}));
  return next;
}
