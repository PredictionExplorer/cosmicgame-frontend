import axios, { isAxiosError, type AxiosResponse } from 'axios';

import { networkConfig } from '@/config/networks';
import { reportError } from '@/utils/errors';

import type { RoundInfo } from './types';

axios.interceptors.response.use((response) => {
  assertApiEnvelope(response);
  return response;
});

export { axios, isAxiosError };

/** Base URL for the main NFT/token API. */
export const baseUrl = networkConfig.nftApiUrl;
/** Local proxy path prepended to external API URLs to avoid CORS. */
export const proxyUrl = '/api/proxy?url=';
/** Base URL for the Cosmic Game statistics API. */
export const cosmicGameBaseUrl = networkConfig.apiUrl;

/** Builds a proxied URL targeting the Cosmic Game API. */
export const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl + url)}`;
};

/** Builds a proxied URL targeting the main NFT/token API. */
export const getMainAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(baseUrl + url)}`;
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
