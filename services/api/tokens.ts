// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import {
  apiGet,
  axios,
  getAPIUrl,
  apiCall,
  apiCallRequired,
  flattenTx,
  flattenTxArray,
  pagedPath,
  type ApiListRequestOptions,
  type ApiRequestOptions,
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

/**
 * Fetches Cosmic Signature NFTs with flattened transaction fields (optionally paged).
 * Required read: the gallery is built entirely from this list, so a failure has to
 * surface as an error rather than an empty collection.
 */
export function get_cst_list(opts?: ApiListRequestOptions): Promise<CSTTokenInfo[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(getAPIUrl(`cst/list/all/${pagedPath(opts)}`), opts);
    return flattenTxArray<CSTTokenInfo>(data.CosmicSignatureTokenList);
  });
}

/** Fetches Cosmic Signature NFTs owned by a specific wallet address (optionally paged). */
export function get_cst_tokens_by_user(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`cst/list/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<CSTTokenInfo>(data.UserTokens);
  }, []);
}

/** Fetches detailed info for a single Cosmic Signature NFT by its ID. */
export function get_cst_info(
  tokenId: number,
  opts?: ApiRequestOptions,
): Promise<CSTTokenInfo | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`cst/info/${tokenId}`), opts);
    return flattenTx(data.TokenInfo) as CSTTokenInfo | null;
  }, null);
}

/** Fetches the naming history for a Cosmic Signature NFT. */
export function get_name_history(
  token_id: number,
  opts?: ApiRequestOptions,
): Promise<NameHistoryRecord[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`cst/names/history/${token_id}`), opts);
    return flattenTxArray<NameHistoryRecord>(data.TokenNameHistory);
  }, []);
}

/** Searches Cosmic Signature NFTs by name, returning all matches. */
export function get_token_by_name(
  token_name: string,
  opts?: ApiRequestOptions,
): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`cst/names/search/${token_name}`), opts);
    return flattenTxArray<CSTTokenInfo>(data.TokenNameSearchResults);
  }, []);
}

/** Fetches only Cosmic Signature NFTs that have been given a custom name. */
export function get_named_nfts(opts?: ApiRequestOptions): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('cst/names/named_only'), opts);
    return flattenTxArray<CSTTokenInfo>(data.NamedTokens);
  }, []);
}

/** Fetches Cosmic Signature NFT transfer history for a wallet address (optionally paged). */
export function get_cst_transfers(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`cst/transfers/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<CSTTransferRecord>(data.CosmicSignatureTransfers);
  }, []);
}

/** Fetches the distribution of Cosmic Signature NFT ownership across wallets. */
export function get_cst_distribution(opts?: ApiRequestOptions): Promise<TokenDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('cst/distribution'), opts);
    return safeValidateListSample(
      TokenDistributionSchema,
      data.CosmicSignatureTokenDistribution,
      'cstDistribution',
    ) as TokenDistribution[];
  }, []);
}

/** Fetches the CST (ERC-20) balance distribution across wallets. */
export function get_ct_balances_distribution(
  opts?: ApiRequestOptions,
): Promise<CTBalanceDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('ct/balances'), opts);
    return safeValidateListSample(
      CTBalanceDistributionSchema,
      data.CosmicTokenBalances,
      'ctBalancesDistribution',
    ) as CTBalanceDistribution[];
  }, []);
}

/** Fetches aggregated CST (ERC-20) token statistics including total supply. */
export function get_ct_statistics(opts?: ApiRequestOptions): Promise<CTStatistics | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('ct/statistics'), opts);
    if (data.Statistics == null) return null;
    return safeValidate(CTStatisticsSchema, data.Statistics, 'ctStatistics') as CTStatistics;
  }, null);
}

/** Fetches daily CST total supply history between two dates (YYYYMMDD, inclusive). */
export function get_ct_total_supply_history_by_date(
  fromDate: string,
  toDate: string,
  opts?: ApiRequestOptions,
): Promise<CTTotalSupplyHistoryByDateRecord[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`ct/total_supply_history_by_date/${fromDate}/${toDate}`),
      opts,
    );
    return (data.TotalSupplyHistory ?? []) as CTTotalSupplyHistoryByDateRecord[];
  }, []);
}

/** Fetches per-bid CST total supply history (running cumulative supply after each bid). */
export function get_ct_total_supply_history_by_bid(
  opts?: ApiRequestOptions,
): Promise<CTTotalSupplyHistoryByBidRecord[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('ct/total_supply_history_by_bid'), opts);
    return flattenTxArray<CTTotalSupplyHistoryByBidRecord>(data.TotalSupplyHistory);
  }, []);
}

/** Fetches CST (ERC-20) transfer history for a wallet address (optionally paged). */
export function get_ct_transfers(address: string, opts?: ApiListRequestOptions): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`ct/transfers/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<TxInfo>(data.CosmicTokenTransfers);
  }, []);
}

/** Fetches the ownership-transfer history for a single Cosmic Signature NFT (optionally paged). */
export function get_ct_ownership_transfers(
  token_id: number,
  opts?: ApiListRequestOptions,
): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`cst/transfers/all/${token_id}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<CSTTransferRecord>(data.TokenTransfers);
  }, []);
}

/** Fetches the current CST token price info (CST bid price). */
export function get_ct_price(opts?: ApiRequestOptions): Promise<CTPriceInfo | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('bid/cst_price'), opts);
    return data as CTPriceInfo;
  }, null);
}

/**
 * Fetches RandomWalk token metadata (owner, name, seed). Uses the same base as other Cosmic Game
 * calls: `GET {NEXT_PUBLIC_API_URL}/randomwalk/tokens/info/:id` → the Go server serves this at
 * `/api/cosmicgame/randomwalk/tokens/info/:id` (and also `/api/randomwalk/tokens/info/:id`).
 */
export function get_info(
  token_id: number | string,
  opts?: ApiRequestOptions,
): Promise<TokenImprintInfo | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`randomwalk/tokens/info/${token_id}`), opts);
    return data.TokenInfo as TokenImprintInfo | null;
  }, null);
}

/** Fetches RandomWalk NFTs that have been used for discounted gestures. */
export function get_used_rwlk_nfts(opts?: ApiRequestOptions): Promise<UsedRWLKNFT[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('bid/used_randomwalk_nfts'), opts);
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
