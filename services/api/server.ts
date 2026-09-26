import { cache } from 'react';

import type { ServerTimingSample } from '@/utils/time';
import { LATEST_SIGNATURES_LIMIT } from '@/lib/latestSignatures';

import {
  SERVER_READ_TIMEOUT_MS,
  flattenGestureArray,
  flattenTx,
  flattenTxArray,
  getAPIUrl,
} from './client';
import { RATE_LIMIT_RETRIES, TOO_MANY_REQUESTS, rateLimitDelayMs, waitMs } from './rateLimit';
import { normalizeDashboardWire } from './rounds';
import {
  DashboardInfoSchema,
  GestureInfoSchema,
  SpecialRecipientsSchema,
  validate,
  validateList,
} from './schemas';
import type { CSTTokenInfo, DashboardInfo, GestureInfo, SpecialRecipients } from './types';

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
 * Every helper resolves to `null` on failure, a read that takes longer than
 * `SERVER_READ_TIMEOUT_MS` included: a missing seed must degrade to the
 * client-side loading path, never fail or hold up the prerender. Helpers are
 * wrapped in React `cache()` so `generateMetadata` and the page body share
 * one upstream request per render.
 */

/** How stale the app-home seed HTML is allowed to be, in seconds. */
export const HOME_SEED_REVALIDATE_SECONDS = 15;

/** Serializable request/render anchor for hydration-safe client clock fallbacks. */
export function getServerRenderTimeMs(): number {
  return Date.now();
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const TIMING_COHERENCE_TOLERANCE_SECONDS = 30;

export function resolveHomeTimingSample({
  targetRaw,
  currentRaw,
  dashboardRaw,
  sampledAtMs,
}: {
  targetRaw: Record<string, unknown>;
  currentRaw: Record<string, unknown>;
  dashboardRaw: Record<string, unknown>;
  sampledAtMs: number;
}): ServerTimingSample | null {
  let targetServerTimeSec = Number(targetRaw.CurRoundPrizeTime);
  const currentServerTimeSec = Number(currentRaw.CurrentTimeStamp);
  const cycleNumber = Number(dashboardRaw.CurRoundNum);
  const cycleStart = Number(dashboardRaw.TsRoundStart);
  const latestAddress =
    typeof dashboardRaw.LastBidderAddr === 'string' ? dashboardRaw.LastBidderAddr : '';
  const opened = cycleStart > 0 && latestAddress.toLowerCase() !== ZERO_ADDRESS;

  if (
    !Number.isFinite(targetServerTimeSec) ||
    targetServerTimeSec < 0 ||
    !Number.isFinite(currentServerTimeSec) ||
    currentServerTimeSec <= 0 ||
    !Number.isFinite(cycleNumber) ||
    cycleNumber < 0
  ) {
    return null;
  }

  if (!opened) {
    // No finalization clock exists before the first Gesture. Discard a stale
    // target cached from the preceding cycle while retaining the chain clock
    // needed to project this cycle's activation timestamp.
    targetServerTimeSec = 0;
  } else {
    const dashboardTarget = Number(dashboardRaw.PrizeClaimTs);
    if (!Number.isFinite(dashboardTarget) || dashboardTarget <= 0 || targetServerTimeSec <= 0) {
      return null;
    }
    const normalizedDashboardTarget =
      dashboardTarget > 1_000_000_000 ? dashboardTarget : currentServerTimeSec + dashboardTarget;
    if (
      Math.abs(normalizedDashboardTarget - targetServerTimeSec) > TIMING_COHERENCE_TOLERANCE_SECONDS
    ) {
      return null;
    }
  }

  return { targetServerTimeSec, currentServerTimeSec, cycleNumber, sampledAtMs };
}

/**
 * One seed read. An answer of 429 Too Many Requests is asked again after a
 * jittered wait, up to `RATE_LIMIT_RETRIES` times (./rateLimit), as every
 * server read is; any other failure resolves to `null` at once.
 */
async function fetchApiJson(path: string, revalidateSeconds: number): Promise<unknown> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(getAPIUrl(path), {
        headers: { Accept: 'application/json' },
        next: { revalidate: revalidateSeconds },
        signal: AbortSignal.timeout(SERVER_READ_TIMEOUT_MS),
      });
      if (response.status === TOO_MANY_REQUESTS && attempt < RATE_LIMIT_RETRIES) {
        await waitMs(rateLimitDelayMs(attempt, response.headers.get('retry-after')));
        continue;
      }
      if (!response.ok) return null;
      return (await response.json()) as unknown;
    } catch {
      return null;
    }
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

/** Chain-clock sample used to project absolute protocol times onto the client clock. */
export const getHomeTimingSeed = cache(async (): Promise<ServerTimingSample | null> => {
  const [targetRaw, currentRaw, dashboardRaw] = await Promise.all([
    fetchApiJson('rounds/current/time', HOME_SEED_REVALIDATE_SECONDS),
    fetchApiJson('time/current', HOME_SEED_REVALIDATE_SECONDS),
    fetchApiJson('statistics/dashboard', HOME_SEED_REVALIDATE_SECONDS),
  ]);
  if (
    targetRaw == null ||
    currentRaw == null ||
    dashboardRaw == null ||
    typeof targetRaw !== 'object' ||
    typeof currentRaw !== 'object' ||
    typeof dashboardRaw !== 'object'
  ) {
    return null;
  }
  return resolveHomeTimingSample({
    targetRaw: targetRaw as Record<string, unknown>,
    currentRaw: currentRaw as Record<string, unknown>,
    dashboardRaw: dashboardRaw as Record<string, unknown>,
    // Anchor to response receipt, not request start, so network latency does
    // not get added to every projected countdown.
    sampledAtMs: Date.now(),
  });
});

/** Latest gesture in the active cycle, used to make participant intelligence complete in ISR HTML. */
export const getLatestGestureSeed = cache(
  async (cycleNumber: number): Promise<GestureInfo | null> => {
    if (!Number.isFinite(cycleNumber) || cycleNumber < 0) return null;
    const raw = await fetchApiJson(
      `bid/list/by_round/${cycleNumber}/1/0/1`, // lexicon-allow-backend-type
      HOME_SEED_REVALIDATE_SECONDS,
    );
    if (raw == null || typeof raw !== 'object') return null;
    try {
      const gestures = flattenGestureArray<GestureInfo>(
        (raw as { BidsByRound?: unknown }).BidsByRound,
      );
      return (
        (validateList(GestureInfoSchema, gestures, 'GestureInfo[homeSeed]') as GestureInfo[])[0] ??
        null
      );
    } catch {
      return null;
    }
  },
);

/** Special-recipient snapshot used for the home desk's first-paint role intelligence. */
export const getCurrentSpecialRecipientsSeed = cache(
  async (): Promise<SpecialRecipients | null> => {
    const raw = await fetchApiJson(
      'bid/current_special_winners', // lexicon-allow-backend-type
      HOME_SEED_REVALIDATE_SECONDS,
    );
    if (raw == null || typeof raw !== 'object') return null;
    try {
      return validate(
        SpecialRecipientsSchema,
        raw,
        'SpecialRecipients[homeSeed]',
      ) as SpecialRecipients;
    } catch {
      return null;
    }
  },
);

/** Single Cosmic Signature token read for the server-picked hero artwork. */
export const getCstInfoSeed = cache(async (tokenId: number): Promise<CSTTokenInfo | null> => {
  const raw = await fetchApiJson(`cst/info/${tokenId}`, HOME_SEED_REVALIDATE_SECONDS);
  if (raw == null || typeof raw !== 'object') return null;
  const tokenInfo = (raw as { TokenInfo?: unknown }).TokenInfo;
  if (tokenInfo == null || typeof tokenInfo !== 'object') return null;
  return flattenTx(tokenInfo) as CSTTokenInfo | null;
});

/**
 * The newest imprinted Signatures, newest first, for the app home's plate.
 * Imprints only happen when a cycle finalizes, so a minute of staleness is
 * plenty; an empty list or a failed read renders the designed pending plate.
 */
export const getLatestSignaturesSeed = cache(async (): Promise<CSTTokenInfo[] | null> => {
  const raw = await fetchApiJson(`cst/list/all/0/${LATEST_SIGNATURES_LIMIT}`, 60);
  if (raw == null || typeof raw !== 'object') return null;
  const list = (raw as { CosmicSignatureTokenList?: unknown }).CosmicSignatureTokenList;
  if (!Array.isArray(list)) return null;
  return flattenTxArray<CSTTokenInfo>(list).filter((token) => Boolean(token?.Seed));
});
