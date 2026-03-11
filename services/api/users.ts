import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type { UserInfoWithLists, UserBalance } from './types';

export function get_user_info(address: string): Promise<UserInfoWithLists | null> {
  return apiCall(async () => {
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
  }, null);
}

export function get_user_balance(address: string): Promise<UserBalance | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
    return data;
  }, null);
}

export function notify_red_box(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
    return data.Winnings;
  }, null);
}

export function get_unique_bidders() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/bidders'));
    return data.UniqueBidders;
  }, []);
}

export function get_unique_winners() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/winners'));
    return data.UniqueWinners;
  }, []);
}

export function get_unique_donors() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return data.UniqueDonors;
  }, []);
}

export function get_unique_cst_stakers() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/cst'));
    return data.UniqueStakersCST;
  }, []);
}

export function get_unique_rwalk_stakers() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/rwalk'));
    return data.UniqueStakersRWalk;
  }, []);
}

export function get_unique_both_stakers() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/both'));
    return data.UniqueStakersBoth;
  }, []);
}
