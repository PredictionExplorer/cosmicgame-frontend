import {
  axios,
  getAPIUrl,
  getMainAPIUrl,
  apiCall,
  apiPost,
  flattenTx,
  flattenTxArray,
} from './client';
import type {
  CSTTokenInfo,
  CSTTransferRecord,
  TokenDistribution,
  CTBalanceDistribution,
  NameHistoryRecord,
  UsedRWLKNFT,
  TxInfo,
  CTPriceInfo,
  TokenMintInfo,
} from './types';

/** Fetches all Cosmic Signature Tokens with flattened transaction fields. */
export function get_cst_list(): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/list/all/0/1000000'));
    return flattenTxArray<CSTTokenInfo>(data.CosmicSignatureTokenList);
  }, []);
}

/** Fetches Cosmic Signature Tokens owned by a specific wallet address. */
export function get_cst_tokens_by_user(address: string): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/list/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTokenInfo>(data.UserTokens);
  }, []);
}

/** Fetches detailed info for a single Cosmic Signature Token by its ID. */
export function get_cst_info(tokenId: number): Promise<CSTTokenInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
    return flattenTx(data.TokenInfo) as CSTTokenInfo | null;
  }, null);
}

/** Fetches the naming history for a Cosmic Signature Token. */
export function get_name_history(token_id: number): Promise<NameHistoryRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
    return flattenTxArray<NameHistoryRecord>(data.TokenNameHistory);
  }, []);
}

/** Searches Cosmic Signature Tokens by name, returning all matches. */
export function get_token_by_name(token_name: string): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
    return flattenTxArray<CSTTokenInfo>(data.TokenNameSearchResults);
  }, []);
}

/** Fetches only Cosmic Signature Tokens that have been given a custom name. */
export function get_named_nfts(): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/names/named_only'));
    return flattenTxArray<CSTTokenInfo>(data.NamedTokens);
  }, []);
}

/** Fetches Cosmic Signature Token transfer history for a wallet address. */
export function get_cst_transfers(address: string): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTransferRecord>(data.CosmicSignatureTransfers);
  }, []);
}

/** Fetches the distribution of Cosmic Signature Token ownership across wallets. */
export function get_cst_distribution(): Promise<TokenDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/distribution'));
    return data.CosmicSignatureTokenDistribution;
  }, []);
}

/** Fetches the Cosmic Token (ERC-20) balance distribution across wallets. */
export function get_ct_balances_distribution(): Promise<CTBalanceDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('ct/balances'));
    return data.CosmicTokenBalances;
  }, []);
}

/** Fetches Cosmic Token (ERC-20) transfer history for a wallet address. */
export function get_ct_transfers(address: string): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`ct/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray<TxInfo>(data.CosmicTokenTransfers);
  }, []);
}

/** Fetches the full ownership-transfer history for a single Cosmic Signature Token. */
export function get_ct_ownership_transfers(token_id: number): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/all/${token_id}/0/1000000`));
    return flattenTxArray<CSTTransferRecord>(data.TokenTransfers);
  }, []);
}

/** Fetches the current Cosmic Signature Token price info (CST bid price). */
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
export function get_info(token_id: number | string): Promise<TokenMintInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`randomwalk/tokens/info/${token_id}`));
    return data.TokenInfo as TokenMintInfo | null;
  }, null);
}

/** Fetches RandomWalk NFTs that have been used for discounted bids. */
export function get_used_rwlk_nfts(): Promise<UsedRWLKNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/used_randomwalk_nfts'));
    return data.UsedRwalkNFTs;
  }, []);
}

/** Triggers server-side token minting, returning the background task ID. */
export function create(token_id: number, count: number) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('cosmicgame_tokens'), {
      token_id,
      count,
    });
    return data?.task_id || -1;
  });
}
