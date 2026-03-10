import { axios, isAxiosError, getAPIUrl, getMainAPIUrl, flattenTx, flattenTxArray } from './client';
import type {
  CSTTokenInfo,
  CSTTransferRecord,
  TokenDistribution,
  CTBalanceDistribution,
  NameHistoryRecord,
  UsedRWLKNFT,
} from './types';

export async function get_cst_list(): Promise<CSTTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('cst/list/all/0/1000000'));
    return flattenTxArray<CSTTokenInfo>(data.CosmicSignatureTokenList);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_cst_tokens_by_user(address: string): Promise<CSTTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/list/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTokenInfo>(data.UserTokens);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_cst_info(tokenId: number): Promise<CSTTokenInfo | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
    return flattenTx(data.TokenInfo) as CSTTokenInfo | null;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_name_history(token_id: number): Promise<NameHistoryRecord[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
    return flattenTxArray<NameHistoryRecord>(data.TokenNameHistory);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_token_by_name(token_name: string): Promise<CSTTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
    return flattenTxArray<CSTTokenInfo>(data.TokenNameSearchResults);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_named_nfts(): Promise<CSTTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('cst/names/named_only'));
    return flattenTxArray<CSTTokenInfo>(data.NamedTokens);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_cst_transfers(address: string): Promise<CSTTransferRecord[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray<CSTTransferRecord>(data.CosmicSignatureTransfers);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_cst_distribution(): Promise<TokenDistribution[]> {
  try {
    const { data } = await axios.get(getAPIUrl('cst/distribution'));
    return data.CosmicSignatureTokenDistribution;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_ct_balances_distribution(): Promise<CTBalanceDistribution[]> {
  try {
    const { data } = await axios.get(getAPIUrl('ct/balances'));
    return data.CosmicTokenBalances;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_ct_transfers(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`ct/transfers/by_user/${address}/0/1000000`));
    return flattenTxArray(data.CosmicTokenTransfers);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_ct_ownership_transfers(token_id: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/transfers/all/${token_id}/0/1000000`));
    return flattenTxArray(data.TokenTransfers);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_ct_price() {
  try {
    const { data } = await axios.get(getAPIUrl('bid/cst_price'));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_info(token_id: number | string) {
  try {
    const { data } = await axios.get(getMainAPIUrl(`token_info/${token_id}`));
    return data.TokenInfo;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_used_rwlk_nfts(): Promise<UsedRWLKNFT[]> {
  try {
    const { data } = await axios.get(getAPIUrl('bid/used_rwalk_nfts'));
    return data.UsedRwalkNFTs;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function create(token_id: number, count: number) {
  try {
    const { data } = await axios.post(getMainAPIUrl('cosmicgame_tokens'), {
      token_id,
      count,
    });
    return data?.task_id || -1;
  } catch (_err: unknown) {
    throw new Error('Network response was not OK');
  }
}
