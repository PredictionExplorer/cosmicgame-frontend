'use client';

import { useEffect, useState } from 'react';

import { LANDING_FETCH_TIMEOUT_MS, landingApiUrl, timeoutSignal } from './landing-cycle-data';

/** How many of the newest Signatures the landing reads once per visit. */
export const SHOWCASE_LIMIT = 36;

export interface LandingShowcaseToken {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
  /** The cycle the token was imprinted in. */
  RoundNum?: number;
  /** Anchored to the protocol right now. */
  Staked?: boolean;
  /** When the token was imprinted (Unix seconds), for the wall label's date. */
  ImprintedAt?: number;
}

/** A token as the collection list returns it: the imprint time sits on its transaction. */
type ListedToken = Omit<LandingShowcaseToken, 'ImprintedAt'> & { Tx?: { TimeStamp?: unknown } };

export type ShowcaseStatus = 'loading' | 'ready' | 'failed';

export interface LandingShowcase {
  /** Newest first; empty until the collection answers (or when it never does). */
  tokens: readonly LandingShowcaseToken[];
  status: ShowcaseStatus;
}

function isShowcaseToken(token: ListedToken): boolean {
  return Number.isFinite(token.TokenId) && token.Seed !== undefined && String(token.Seed) !== '';
}

function toShowcaseToken({ Tx, ...token }: ListedToken): LandingShowcaseToken {
  const imprintedAt = Tx?.TimeStamp;
  return typeof imprintedAt === 'number' && imprintedAt > 0
    ? { ...token, ImprintedAt: imprintedAt }
    : token;
}

async function fetchShowcase(): Promise<LandingShowcase> {
  try {
    const response = await fetch(landingApiUrl(`cst/list/all/0/${SHOWCASE_LIMIT}`), {
      signal: timeoutSignal(LANDING_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return { tokens: [], status: 'failed' };
    const body = (await response.json()) as {
      CosmicSignatureTokenList?: ListedToken[];
    };
    return {
      tokens: (body.CosmicSignatureTokenList ?? []).filter(isShowcaseToken).map(toShowcaseToken),
      status: 'ready',
    };
  } catch {
    return { tokens: [], status: 'failed' };
  }
}

/** How long a good answer is reused across mounts (a client-side visit back to the home). */
export const SHOWCASE_TTL_MS = 5 * 60_000;

/*
 * One request shared by every consumer on the page (the hero, the anchoring
 * plates, the collection figure and the closing band). A good answer is
 * reused for SHOWCASE_TTL_MS, then read again; a failed one is never kept,
 * so the next mount asks again instead of showing nothing for the session.
 */
let shared: { readonly at: number; readonly request: Promise<LandingShowcase> } | null = null;

function sharedShowcase(now: number = Date.now()): Promise<LandingShowcase> {
  if (shared && now - shared.at < SHOWCASE_TTL_MS) return shared.request;
  const request = fetchShowcase().then((result) => {
    if (result.status === 'failed' && shared?.request === request) shared = null;
    return result;
  });
  shared = { at: now, request };
  return request;
}

/** Forgets the shared request, so each test starts from a fresh page view. */
export function resetLandingShowcaseCache(): void {
  shared = null;
}

const INITIAL: LandingShowcase = { tokens: [], status: 'loading' };

/**
 * The newest imprinted Signatures, read in the browser so the landing stays
 * fully static (no server API dependency), from the API server the rotation
 * picks, within LANDING_FETCH_TIMEOUT_MS. Every consumer renders its own
 * complete state before the answer and when it never comes: the bundled
 * featured art, a pending plate or an unknown figure.
 */
export function useLandingShowcaseTokens(): LandingShowcase {
  const [showcase, setShowcase] = useState<LandingShowcase>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    void sharedShowcase().then((result) => {
      if (!cancelled) setShowcase(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return showcase;
}

/**
 * How many Signatures exist: token ids run from 0 without gaps, so the
 * newest id plus one. `null` until the collection answers, and `null` when
 * it answers without a usable token: the page already shows imprinted
 * Signatures (the bundled featured pieces), so an empty answer is a broken
 * read, never "0 imprinted".
 */
export function imprintedCount(showcase: LandingShowcase): number | null {
  if (showcase.status !== 'ready' || showcase.tokens.length === 0) return null;
  return Math.max(...showcase.tokens.map((token) => token.TokenId)) + 1;
}
