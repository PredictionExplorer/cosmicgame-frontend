import { cache } from 'react';

import { flattenTx, getAPIUrl } from './client';
import { normalizeDashboardWire } from './rounds';
import { DashboardInfoSchema, validate } from './schemas';
import type { CSTTokenInfo, DashboardInfo } from './types';

/**
 * Server-only seed reads for ISR pages.
 *
 * These use `fetch` — not the axios client — on purpose: axios bypasses the
 * Next.js Data Cache entirely, which previously forced the app home to hit
 * the backend on every request and kept the route dynamic (multi-second
 * TTFB on cold serverless starts). `fetch` with `next.revalidate` lets the
 * page prerender, serve from the CDN, and regenerate in the background.
 * Client-side React Query takes over for live updates immediately after
 * hydration, so seeds only need to be fresh enough for the first paint.
 *
 * Every helper resolves to `null` on failure: a missing seed must degrade to
 * the client-side loading path, never fail the prerender. Helpers are
 * wrapped in React `cache()` so `generateMetadata` and the page body share
 * one upstream request per render.
 */

/** How stale the app-home seed HTML is allowed to be, in seconds. */
export const HOME_SEED_REVALIDATE_SECONDS = 15;

async function fetchApiJson(path: string, revalidateSeconds: number): Promise<unknown> {
  try {
    const response = await fetch(getAPIUrl(path), {
      headers: { Accept: 'application/json' },
      next: { revalidate: revalidateSeconds },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/** Dashboard read backing the app-home seed and its metadata, deduped per render. */
export const getDashboardInfoSeed = cache(async (): Promise<DashboardInfo | null> => {
  const raw = await fetchApiJson('statistics/dashboard', HOME_SEED_REVALIDATE_SECONDS);
  if (raw == null || typeof raw !== 'object') return null;
  try {
    return validate(
      DashboardInfoSchema,
      normalizeDashboardWire(raw as Record<string, unknown>),
      'DashboardInfo[seed]',
    ) as DashboardInfo;
  } catch {
    return null;
  }
});

/** Single Cosmic Signature token read for the server-picked hero artwork. */
export const getCstInfoSeed = cache(async (tokenId: number): Promise<CSTTokenInfo | null> => {
  const raw = await fetchApiJson(`cst/info/${tokenId}`, HOME_SEED_REVALIDATE_SECONDS);
  if (raw == null || typeof raw !== 'object') return null;
  const tokenInfo = (raw as { TokenInfo?: unknown }).TokenInfo;
  if (tokenInfo == null || typeof tokenInfo !== 'object') return null;
  return flattenTx(tokenInfo) as CSTTokenInfo | null;
});
