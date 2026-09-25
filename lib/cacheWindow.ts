import { unstable_cache } from 'next/cache';

/**
 * How long a cached render of a public record page is served before a
 * request renders it again, by how much of what it shows can still change.
 *
 * - `final`, a day: a record that can no longer change. A finalized cycle,
 *   a gesture of a finalized cycle, an indexed contribution, a closed
 *   configuration window, a released anchor.
 * - `live`, five minutes: a record that still changes. An address's
 *   history, a Signature's owner and name, a cycle still open, an anchor
 *   still held.
 * - `pending`, a minute: what the next minute may settle. A record the
 *   indexer does not hold yet, or a render whose read failed or timed out,
 *   so neither a missing record nor a degraded page is served for long.
 *
 * Next.js reads a route's `revalidate` statically, so a route exports the
 * longest window its records can take as a literal, and a render that shows
 * something shorter-lived lowers it with {@link capCacheWindow}.
 * `record-route-caching.test.ts` holds every record route's literal to one of
 * these values.
 */
export const CACHE_WINDOW = { final: 86_400, live: 300, pending: 60 } as const;

export type CacheWindow = keyof typeof CACHE_WINDOW;

/**
 * Lowers the cache window of the page being rendered to `window`; a window
 * longer than the route's own leaves it as it is.
 *
 * Next.js keeps a cached render for the shortest window of any cached read
 * in it ("Revalidation frequency" in the caching guide), and a route's
 * `revalidate` export cannot depend on what the render found. So the render
 * makes one empty cached read with the window it needs: the same rule then
 * applies the shorter window to the page. Outside a Next.js render (a test, a
 * script) there is no cache to lower, and nothing happens.
 */
export async function capCacheWindow(window: CacheWindow): Promise<void> {
  const seconds = CACHE_WINDOW[window];
  try {
    await unstable_cache(async () => seconds, ['cache-window', String(seconds)], {
      revalidate: seconds,
    })();
  } catch {
    // No incremental cache outside a Next.js render: nothing to lower.
  }
}
