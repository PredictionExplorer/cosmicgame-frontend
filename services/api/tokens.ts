// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import {
  axios,
  getAPIUrl,
  apiCall,
  flattenTx,
  flattenTxArray,
  pagedPath,
  type ApiPageWindow,
} from './client';
import {
  CTBalanceDistributionSchema,
  CTStatisticsSchema,
  TokenDistributionSchema,
  safeValidate,
  safeValidateListSample,
} from './schemas';
import type {
  CSTTokenInfo,
  CSTTransferRecord,
  TokenDistribution,
  CTBalanceDistribution,
  CTStatistics,
  CTTotalSupplyHistoryByBidRecord,
  CTTotalSupplyHistoryByDateRecord,
  NameHistoryRecord,
  UsedRWLKNFT,
  TxInfo,
  CTPriceInfo,
  TokenImprintInfo,
} from './types';

/** Fetches Cosmic Signature NFTs with flattened transaction fields (optionally paged). */
export function get_cst_list(page?: ApiPageWindow): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/list/all/${pagedPath(page)}`));
    return flattenTxArray<CSTTokenInfo>(data.CosmicSignatureTokenList);
  }, []);
}

/** Fetches Cosmic Signature NFTs owned by a specific wallet address (optionally paged). */
export function get_cst_tokens_by_user(
  address: string,
  page?: ApiPageWindow,
): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/list/by_user/${address}/${pagedPath(page)}`));
    return flattenTxArray<CSTTokenInfo>(data.UserTokens);
  }, []);
}

/** Fetches detailed info for a single Cosmic Signature NFT by its ID. */
export function get_cst_info(tokenId: number): Promise<CSTTokenInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
    return flattenTx(data.TokenInfo) as CSTTokenInfo | null;
  }, null);
}

/** Fetches the naming history for a Cosmic Signature NFT. */
export function get_name_history(token_id: number): Promise<NameHistoryRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
    return flattenTxArray<NameHistoryRecord>(data.TokenNameHistory);
  }, []);
}

/** Searches Cosmic Signature NFTs by name, returning all matches. */
export function get_token_by_name(token_name: string): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
    return flattenTxArray<CSTTokenInfo>(data.TokenNameSearchResults);
  }, []);
}

/** Fetches only Cosmic Signature NFTs that have been given a custom name. */
export function get_named_nfts(): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/names/named_only'));
    return flattenTxArray<CSTTokenInfo>(data.NamedTokens);
  }, []);
}

/** Fetches Cosmic Signature NFT transfer history for a wallet address (optionally paged). */
export function get_cst_transfers(
  address: string,
  page?: ApiPageWindow,
): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`cst/transfers/by_user/${address}/${pagedPath(page)}`),
    );
    return flattenTxArray<CSTTransferRecord>(data.CosmicSignatureTransfers);
  }, []);
}

/** Fetches the distribution of Cosmic Signature NFT ownership across wallets. */
export function get_cst_distribution(): Promise<TokenDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/distribution'));
    return safeValidateListSample(
      TokenDistributionSchema,
      data.CosmicSignatureTokenDistribution,
      'cstDistribution',
    ) as TokenDistribution[];
  }, []);
}

/** Fetches the CST (ERC-20) balance distribution across wallets. */
export function get_ct_balances_distribution(): Promise<CTBalanceDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('ct/balances'));
    return safeValidateListSample(
      CTBalanceDistributionSchema,
      data.CosmicTokenBalances,
      'ctBalancesDistribution',
    ) as CTBalanceDistribution[];
  }, []);
}

/** Fetches aggregated CST (ERC-20) token statistics including total supply. */
export function get_ct_statistics(): Promise<CTStatistics | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('ct/statistics'));
    if (data.Statistics == null) return null;
    return safeValidate(CTStatisticsSchema, data.Statistics, 'ctStatistics') as CTStatistics;
  }, null);
}

/** Fetches daily CST total supply history between two dates (YYYYMMDD, inclusive). */
export function get_ct_total_supply_history_by_date(
  fromDate: string,
  toDate: string,
): Promise<CTTotalSupplyHistoryByDateRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`ct/total_supply_history_by_date/${fromDate}/${toDate}`),
    );
    return (data.TotalSupplyHistory ?? []) as CTTotalSupplyHistoryByDateRecord[];
  }, []);
}

/** Fetches per-bid CST total supply history (running cumulative supply after each bid). */
export function get_ct_total_supply_history_by_bid(): Promise<CTTotalSupplyHistoryByBidRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('ct/total_supply_history_by_bid'));
    return flattenTxArray<CTTotalSupplyHistoryByBidRecord>(data.TotalSupplyHistory);
  }, []);
}

/** Fetches CST (ERC-20) transfer history for a wallet address (optionally paged). */
export function get_ct_transfers(address: string, page?: ApiPageWindow): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`ct/transfers/by_user/${address}/${pagedPath(page)}`),
    );
    return flattenTxArray<TxInfo>(data.CosmicTokenTransfers);
  }, []);
}

/** Fetches the ownership-transfer history for a single Cosmic Signature NFT (optionally paged). */
export function get_ct_ownership_transfers(
  token_id: number,
  page?: ApiPageWindow,
): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/all/${token_id}/${pagedPath(page)}`));
    return flattenTxArray<CSTTransferRecord>(data.TokenTransfers);
  }, []);
}

/** Fetches the current CST token price info (CST bid price). */
export function get_ct_price(): Promise<CTPriceInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/cst_price'));
    return data as CTPriceInfo;
  }, null);
}

/**
 * Fetches RandomWalk token metadata (owner, name, seed). Uses the same base as other Cosmic Game
 * calls: `GET {NEXT_PUBLIC_API_URL}/randomwalk/tokens/info/:id` → the Go server serves this at
 * `/api/cosmicgame/randomwalk/tokens/info/:id` (and also `/api/randomwalk/tokens/info/:id`).
 */
export function get_info(token_id: number | string): Promise<TokenImprintInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`randomwalk/tokens/info/${token_id}`));
    return data.TokenInfo as TokenImprintInfo | null;
  }, null);
}

/** Fetches RandomWalk NFTs that have been used for discounted gestures. */
export function get_used_rwlk_nfts(): Promise<UsedRWLKNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/used_randomwalk_nfts'));
    return data.UsedRwalkNFTs;
  }, []);
}

/**
 * Triggers server-side CST image generation / token pipeline, returning the background task ID.
 * Uses the Cosmic Game API base (`NEXT_PUBLIC_API_URL`), same as other `getAPIUrl` calls — not
 * `nftApiUrl` (NFT CDN), which does not serve POST `cosmicgame_tokens` and returns 404 locally.
 *
 * Does not use {@link apiPost}: callers (e.g. post-`claimMainPrize`) need raw Axios errors so 404
 * from environments without the imggen endpoint can be ignored without double-reporting.
 */
export function create(token_id: number, count: number): Promise<number> {
  return (async () => {
    const { data } = await axios.post(getAPIUrl('cosmicgame_tokens'), {
      token_id,
      count,
    });
    return data?.task_id ?? -1;
  })();
}

// lexicon-allow-end
