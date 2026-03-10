import { axios, isAxiosError, getAPIUrl, flattenTxArray } from './client';
import type { UserInfoWithLists, UserBalance } from './types';

export async function get_user_info(address: string): Promise<UserInfoWithLists | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`user/info/${address}`));

    if (data) {
      return {
        ...data,
        Bids: flattenTxArray(data.Bids || []),
        PrizeHistory: flattenTxArray(data.PrizeHistory || []),
        CosmicSignatureTokensOwned: flattenTxArray(data.CosmicSignatureTokensOwned || []),
        CurrentlyStakedTokens: flattenTxArray(data.CurrentlyStakedTokens || []),
        DonatedNFTsClaimed: flattenTxArray(data.DonatedNFTsClaimed || []),
        DonatedTokensClaimed: flattenTxArray(data.DonatedTokensClaimed || []),
        ERC20Transfers: flattenTxArray(data.ERC20Transfers || []),
        ERC721Transfers: flattenTxArray(data.ERC721Transfers || []),
        ETHDonationsMade: flattenTxArray(data.ETHDonationsMade || []),
        MainPrizeClaims: flattenTxArray(data.MainPrizeClaims || []),
        MarketingRewardsAwarded: flattenTxArray(data.MarketingRewardsAwarded || []),
        StakingActions: flattenTxArray(data.StakingActions || []),
        TokenDonationsMade: flattenTxArray(data.TokenDonationsMade || []),
      };
    }

    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_user_balance(address: string): Promise<UserBalance | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function notify_red_box(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
    return data.Winnings;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_bidders() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/bidders'));
    return data.UniqueBidders;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_winners() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/winners'));
    return data.UniqueWinners;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_donors() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return data.UniqueDonors;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_cst_stakers() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/cst'));
    return data.UniqueStakersCST;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_rwalk_stakers() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/rwalk'));
    return data.UniqueStakersRWalk;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unique_both_stakers() {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/both'));
    return data.UniqueStakersBoth;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
