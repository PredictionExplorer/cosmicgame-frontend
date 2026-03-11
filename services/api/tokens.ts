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

export function get_cst_list(): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/list/all/0/1000000'));
    return flattenTxArray<CSTTokenInfo>(data.CosmicSignatureTokenList);
  }, []);
}

export function get_cst_tokens_by_user(address: string): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/list/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTokenInfo>(data.UserTokens);
  }, []);
}

export function get_cst_info(tokenId: number): Promise<CSTTokenInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
    return flattenTx(data.TokenInfo) as CSTTokenInfo | null;
  }, null);
}

export function get_name_history(token_id: number): Promise<NameHistoryRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
    return flattenTxArray<NameHistoryRecord>(data.TokenNameHistory);
  }, []);
}

export function get_token_by_name(token_name: string): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
    return flattenTxArray<CSTTokenInfo>(data.TokenNameSearchResults);
  }, []);
}

export function get_named_nfts(): Promise<CSTTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/names/named_only'));
    return flattenTxArray<CSTTokenInfo>(data.NamedTokens);
  }, []);
}

export function get_cst_transfers(address: string): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTransferRecord>(data.CosmicSignatureTransfers);
  }, []);
}

export function get_cst_distribution(): Promise<TokenDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('cst/distribution'));
    return data.CosmicSignatureTokenDistribution;
  }, []);
}

export function get_ct_balances_distribution(): Promise<CTBalanceDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('ct/balances'));
    return data.CosmicTokenBalances;
  }, []);
}

export function get_ct_transfers(address: string): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`ct/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray<TxInfo>(data.CosmicTokenTransfers);
  }, []);
}

export function get_ct_ownership_transfers(token_id: number): Promise<CSTTransferRecord[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/all/${token_id}/0/1000000`));
    return flattenTxArray<CSTTransferRecord>(data.TokenTransfers);
  }, []);
}

export function get_ct_price(): Promise<CTPriceInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/cst_price'));
    return data as CTPriceInfo;
  }, null);
}

export function get_info(token_id: number | string): Promise<TokenMintInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getMainAPIUrl(`token_info/${token_id}`));
    return data.TokenInfo as TokenMintInfo | null;
  }, null);
}

export function get_used_rwlk_nfts(): Promise<UsedRWLKNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/used_rwalk_nfts'));
    return data.UsedRwalkNFTs;
  }, []);
}

export function create(token_id: number, count: number) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('cosmicgame_tokens'), {
      token_id,
      count,
    });
    return data?.task_id || -1;
  });
}
