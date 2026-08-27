'use client';

import { useEffect, useState } from 'react';

import { networkConfig } from '@/config/networks';

export const SHOWCASE_LIMIT = 36;

export interface LandingShowcaseToken {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
}

function landingApiUrl(path: string): string {
  const base = (networkConfig.apiUrl || '').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}

function isShowcaseToken(token: LandingShowcaseToken): boolean {
  return Number.isFinite(token.TokenId) && token.Seed !== undefined && String(token.Seed) !== '';
}

/**
 * Client-fetches the most recent imprinted Signatures for landing showcases
 * (the landing stays fully static — no server API dependency). Returns an
 * empty list until the network responds, or forever if it never does; every
 * consumer must render a graceful "forming" state for that case.
 */
export function useLandingShowcaseTokens(): LandingShowcaseToken[] {
  const [tokens, setTokens] = useState<LandingShowcaseToken[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTokens() {
      try {
        const response = await fetch(landingApiUrl(`cst/list/all/0/${SHOWCASE_LIMIT}`));
        if (!response.ok) return;
        const body = (await response.json()) as {
          CosmicSignatureTokenList?: LandingShowcaseToken[];
        };
        if (cancelled) return;
        setTokens((body.CosmicSignatureTokenList ?? []).filter(isShowcaseToken));
      } catch {
        if (!cancelled) setTokens([]);
      }
    }

    void fetchTokens();
    return () => {
      cancelled = true;
    };
  }, []);

  return tokens;
}
