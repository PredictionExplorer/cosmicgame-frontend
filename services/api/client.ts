import axios, { isAxiosError } from 'axios';

import { networkConfig } from '@/config/networks';

import type { RoundInfo } from './types';

export { axios, isAxiosError };

export const baseUrl = networkConfig.nftApiUrl;
export const proxyUrl = '/api/proxy?url=';
export const cosmicGameBaseUrl = networkConfig.apiUrl;

export const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl + url)}`;
};

export const getMainAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(baseUrl + url)}`;
};

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

export const flattenTxArray = <T>(items: unknown): T[] => {
  if (!Array.isArray(items)) return [] as T[];
  return items.map((item) => flattenTx(item)) as T[];
};

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

export const normalizeFieldNames = (item: unknown) => {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...(item as Record<string, unknown>) };

  if (normalized.TokenAddress !== undefined && normalized.TokenAddr === undefined) {
    normalized.TokenAddr = normalized.TokenAddress;
  }

  return normalized;
};

export const normalizeFieldNamesArray = (items: unknown) => {
  if (!Array.isArray(items)) return items;
  return items.map((item) => normalizeFieldNames(item));
};

/** Wraps an API call with standard 400-fallback error handling. */
export async function apiCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) return fallback;
    throw new Error('Network response was not OK');
  }
}

/** Wraps a POST/write API call that should throw on any error. */
export async function apiPost<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    throw new Error('Network response was not OK');
  }
}
