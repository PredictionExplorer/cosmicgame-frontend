import axios, { isAxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { networkConfig } from '@/config/networks';
import { reportError } from '@/utils/errors';

import type { RoundInfo } from './types';

/** True when the failed request was aimed at our Cosmic Game or main NFT API (not arbitrary third-party URLs). */
function isConfiguredBackendRequest(cfg: InternalAxiosRequestConfig | undefined): boolean {
  if (!cfg) return false;
  const built = (cfg.url ?? '').trim();
  const base = (cfg.baseURL ?? '').replace(/\/$/, '');
  const full = base ? `${base}/${built.replace(/^\//, '')}` : built;
  const target = (full || built).toLowerCase();

  const cosmic = (networkConfig.apiUrl || '').replace(/\/$/, '').toLowerCase();
  if (cosmic && target.startsWith(cosmic)) return true;
  if (target.includes('/api/cosmicgame')) return true;

  const main = (networkConfig.nftApiUrl || '').replace(/\/$/, '').toLowerCase();
  if (main && target.startsWith(main)) return true;

  return false;
}

axios.interceptors.response.use(
  (response) => {
    assertApiEnvelope(response);
    return response;
  },
  (error: unknown) => {
    if (
      process.env.NODE_ENV === 'development' &&
      isAxiosError(error) &&
      !error.response &&
      isConfiguredBackendRequest(error.config)
    ) {
      const cfg = error.config;
      const built = cfg?.url ?? '';
      const fullUrl = cfg?.baseURL ? `${cfg.baseURL.replace(/\/$/, '')}/${(cfg.url ?? '').replace(/^\//, '')}` : built;
      console.error(
        '[Cosmic API] Network error (no response). Request URL:',
        fullUrl || built || '(unknown)',
      );
      console.error(
        'Check: (1) Go websrv is running, (2) NEXT_PUBLIC_API_URL ends with /api/cosmicgame — e.g. http://127.0.0.1:8099/api/cosmicgame',
      );
      console.error(
        'If the page is HTTPS and the API is HTTP, use same-origin proxy: set NEXT_PUBLIC_API_URL to this app origin + /api/cosmicgame and COSMICGAME_API_UPSTREAM in .env.local (see .env.example).',
      );
    }
    return Promise.reject(error);
  },
);

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const b = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (b && !b.includes('cosmicgame')) {
    console.warn(
      '[Cosmic API] NEXT_PUBLIC_API_URL should include the path /api/cosmicgame (see .env.example). Got:',
      b,
    );
  }
}

export { axios, isAxiosError };

/** Base URL for the main NFT/token API. */
export const baseUrl = networkConfig.nftApiUrl;
/** Base URL for the Cosmic Game statistics API. */
export const cosmicGameBaseUrl = networkConfig.apiUrl;

/**
 * Builds a full URL to the Cosmic Game API. Joins `NEXT_PUBLIC_API_URL` and `url` with exactly one
 * `/` (so `.../api/cosmicgame` + `bid/...` does not become `.../api/cosmicgamebid/...`).
 */
export const getAPIUrl = (url: string) => {
  if (url === '') {
    return cosmicGameBaseUrl;
  }
  const base = (cosmicGameBaseUrl || '').replace(/\/+$/, '');
  const path = (url || '').replace(/^\/+/, '');
  if (!base) return `/${path}`;
  return `${base}/${path}`;
};

/** Builds a direct URL targeting the main NFT/token API. */
export const getMainAPIUrl = (url: string) => {
  return baseUrl + url;
};

/** Hoists nested `Tx` fields (EvtLogId, BlockNum, TxHash, etc.) to the top level of a record. */
export const flattenTx = (item: unknown) => {
  if (!item || typeof item !== 'object') return item;
  const obj = item as Record<string, unknown>;
  if (obj.Tx && typeof obj.Tx === 'object') {
    const Tx = obj.Tx as Record<string, unknown>;
    const { Tx: _Tx, ...rest } = obj;
    return {
      ...rest,
      EvtLogId: Tx.EvtLogId,
      BlockNum: Tx.BlockNum,
      TxId: Tx.TxId,
      TxHash: Tx.TxHash,
      TimeStamp: Tx.TimeStamp,
      DateTime: Tx.DateTime,
    };
  }
  return item;
};

/** Applies {@link flattenTx} to every element of an array, returning `[]` for non-array input. */
export const flattenTxArray = <T>(items: unknown): T[] => {
  if (!Array.isArray(items)) return [] as T[];
  return items.map((item) => flattenTx(item)) as T[];
};

/** Flattens a raw round response into a single {@link RoundInfo} by extracting nested prize, charity, staking, and tx fields. */
export const flattenRoundInfo = (roundInfo: unknown) => {
  if (!roundInfo || typeof roundInfo !== 'object') return null;
  const round = roundInfo as Record<string, unknown>;

  const {
    ClaimPrizeTx,
    MainPrize,
    CharityDeposit,
    StakingDeposit,
    EnduranceChampion,
    LastCstBidder,
    ChronoWarrior,
    RoundStats,
    RaffleNFTWinners,
    StakingNFTWinners,
    RaffleETHDeposits,
    AllPrizes,
    ...rest
  } = round;

  const claimTx =
    ClaimPrizeTx &&
    typeof ClaimPrizeTx === 'object' &&
    (ClaimPrizeTx as Record<string, unknown>).Tx &&
    typeof (ClaimPrizeTx as Record<string, unknown>).Tx === 'object'
      ? ((ClaimPrizeTx as Record<string, unknown>).Tx as Record<string, unknown>)
      : null;

  return {
    ...rest,
    RoundStats: RoundStats || {},
    RaffleNFTWinners: RaffleNFTWinners || [],
    StakingNFTWinners: StakingNFTWinners || [],
    RaffleETHDeposits: RaffleETHDeposits || [],
    AllPrizes: AllPrizes || [],
    EvtLogId: claimTx?.EvtLogId,
    BlockNum: claimTx?.BlockNum,
    TxId: claimTx?.TxId,
    TxHash: claimTx?.TxHash,
    TimeStamp: claimTx?.TimeStamp,
    DateTime: claimTx?.DateTime,
    WinnerAddr: (MainPrize as Record<string, unknown>)?.WinnerAddr || '',
    AmountEth: (MainPrize as Record<string, unknown>)?.EthAmountEth || 0,
    TokenId: (MainPrize as Record<string, unknown>)?.NftTokenId ?? -1,
    CSTAmountEth: (MainPrize as Record<string, unknown>)?.CstAmountEth || 0,
    CharityAddress: (CharityDeposit as Record<string, unknown>)?.CharityAddress || '',
    CharityAmountETH: (CharityDeposit as Record<string, unknown>)?.CharityAmountETH || 0,
    StakingDepositAmountEth:
      (StakingDeposit as Record<string, unknown>)?.StakingDepositAmountEth || 0,
    StakingPerTokenEth: (StakingDeposit as Record<string, unknown>)?.StakingPerTokenEth || 0,
    StakingNumStakedTokens:
      (StakingDeposit as Record<string, unknown>)?.StakingNumStakedTokens || 0,
    EnduranceWinnerAddr: (EnduranceChampion as Record<string, unknown>)?.WinnerAddr || '',
    EnduranceERC721TokenId: (EnduranceChampion as Record<string, unknown>)?.NftTokenId ?? -1,
    EnduranceERC20AmountEth: (EnduranceChampion as Record<string, unknown>)?.CstAmountEth || 0,
    LastCstBidderAddr: (LastCstBidder as Record<string, unknown>)?.WinnerAddr || '',
    LastCstBidderERC721TokenId: (LastCstBidder as Record<string, unknown>)?.NftTokenId ?? -1,
    LastCstBidderERC20AmountEth: (LastCstBidder as Record<string, unknown>)?.CstAmountEth || 0,
    ChronoWarriorAddr: (ChronoWarrior as Record<string, unknown>)?.WinnerAddr || '',
    ChronoWarriorAmountEth: (ChronoWarrior as Record<string, unknown>)?.EthAmountEth || 0,
    ChronoWarriorCstAmountEth: (ChronoWarrior as Record<string, unknown>)?.CstAmountEth || 0,
    ChronoWarriorNftTokenId: (ChronoWarrior as Record<string, unknown>)?.NftTokenId ?? -1,
  } as RoundInfo;
};

/** Normalizes API field-name variants (e.g. `TokenAddress` → `TokenAddr`) for consistency. */
export const normalizeFieldNames = (item: unknown) => {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...(item as Record<string, unknown>) };

  if (normalized.TokenAddress !== undefined && normalized.TokenAddr === undefined) {
    normalized.TokenAddr = normalized.TokenAddress;
  }

  return normalized;
};

/** Applies {@link normalizeFieldNames} to every element of an array. */
export const normalizeFieldNamesArray = (items: unknown) => {
  if (!Array.isArray(items)) return items;
  return items.map((item) => normalizeFieldNames(item));
};

/**
 * Checks the backend response envelope for soft errors.
 * The Go API returns `{ status: 1, error: "" }` on success and
 * `{ status: 0, error: "..." }` on logical failure (still HTTP 200).
 * Throws with the backend message when the response signals failure.
 */
export function assertApiEnvelope(response: AxiosResponse): void {
  const body = response.data;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    if ('status' in body && body.status !== undefined && Number(body.status) !== 1) {
      const msg =
        typeof body.error === 'string' && body.error ? body.error : 'API returned an error';
      throw new Error(msg);
    }
    if ('error' in body && typeof body.error === 'string' && body.error) {
      throw new Error(body.error);
    }
  }
}

/** Wraps an API call with response-envelope checking and standard error handling. */
export async function apiCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const status = isAxiosError(err) ? err.response?.status : undefined;
    if (status === 400 || status === 403) return fallback;
    reportError(err, 'apiCall');
    throw new Error('Network response was not OK');
  }
}

/** Wraps a POST/write API call that should throw on any error. */
export async function apiPost<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    reportError(err, 'apiPost');
    throw new Error('Network response was not OK');
  }
}
