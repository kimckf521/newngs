import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// revalidatePath touches the filesystem cache — keep this on the Node runtime.
export const runtime = 'nodejs';

/**
 * On-demand ISR invalidation, called by the page-builder publish flow so a
 * publish goes live immediately instead of waiting for the homepages' 5-minute
 * revalidate window. Only the two public home paths are revalidated (no
 * arbitrary path input), so this is safe to leave unauthenticated — it merely
 * refreshes cached public marketing pages (no data exposure or mutation).
 */
export async function POST() {
  revalidatePath('/');
  revalidatePath('/index_en');
  return NextResponse.json({ revalidated: true, at: Date.now() });
}
