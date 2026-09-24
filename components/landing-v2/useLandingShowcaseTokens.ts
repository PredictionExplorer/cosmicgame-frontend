'use client';

import { useEffect, useState } from 'react';

import { networkConfig } from '@/config/networks';

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
}

export type ShowcaseStatus = 'loading' | 'ready' | 'failed';

export interface LandingShowcase {
  /** Newest first; empty until the collection answers (or when it never does). */
  tokens: readonly LandingShowcaseToken[];
  status: ShowcaseStatus;
}

function landingApiUrl(path: string): string {
  const base = (networkConfig.apiUrl || '').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}

function isShowcaseToken(token: LandingShowcaseToken): boolean {
  return Number.isFinite(token.TokenId) && token.Seed !== undefined && String(token.Seed) !== '';
}

async function fetchShowcase(): Promise<LandingShowcase> {
  try {
    const response = await fetch(landingApiUrl(`cst/list/all/0/${SHOWCASE_LIMIT}`));
    if (!response.ok) return { tokens: [], status: 'failed' };
    const body = (await response.json()) as {
      CosmicSignatureTokenList?: LandingShowcaseToken[];
    };
    return {
      tokens: (body.CosmicSignatureTokenList ?? []).filter(isShowcaseToken),
      status: 'ready',
    };
  } catch {
    return { tokens: [], status: 'failed' };
  }
}

/*
 * One request per page view, shared by every consumer (the hero, the
 * anchoring plates, the collection figure and the closing band).
 */
let pending: Promise<LandingShowcase> | null = null;

/** Forgets the shared request, so each test starts from a fresh page view. */
export function resetLandingShowcaseCache(): void {
  pending = null;
}

const INITIAL: LandingShowcase = { tokens: [], status: 'loading' };

/**
 * The newest imprinted Signatures, read in the browser so the landing stays
 * fully static (no server API dependency). Every consumer renders its own
 * complete state before the answer and when it never comes: the bundled
 * featured art, a pending plate or an unknown figure.
 */
export function useLandingShowcaseTokens(): LandingShowcase {
  const [showcase, setShowcase] = useState<LandingShowcase>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    pending ??= fetchShowcase();
    void pending.then((result) => {
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
 * newest id plus one. `null` until the collection answers.
 */
export function imprintedCount(showcase: LandingShowcase): number | null {
  if (showcase.status !== 'ready') return null;
  if (showcase.tokens.length === 0) return 0;
  return Math.max(...showcase.tokens.map((token) => token.TokenId)) + 1;
}
