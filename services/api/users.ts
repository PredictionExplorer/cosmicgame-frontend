import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type {
  UserInfoWithLists,
  UserBalance,
  NotifyRedBoxResult,
  Bidder,
  Winner,
  UniqueEthDonor,
  UniqueStakerCST,
  UniqueStakerRWLK,
} from './types';

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

export function notify_red_box(address: string): Promise<NotifyRedBoxResult | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
    return data.Winnings as NotifyRedBoxResult;
  }, null);
}

export function get_unique_bidders(): Promise<Bidder[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/bidders'));
    return data.UniqueBidders as Bidder[];
  }, []);
}

export function get_unique_winners(): Promise<Winner[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/winners'));
    return data.UniqueWinners as Winner[];
  }, []);
}

export function get_unique_donors(): Promise<UniqueEthDonor[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return data.UniqueDonors as UniqueEthDonor[];
  }, []);
}

export function get_unique_cst_stakers(): Promise<UniqueStakerCST[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/cst'));
    return data.UniqueStakersCST as UniqueStakerCST[];
  }, []);
}

export function get_unique_rwalk_stakers(): Promise<UniqueStakerRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/rwalk'));
    return data.UniqueStakersRWalk as UniqueStakerRWLK[];
  }, []);
}

export function get_unique_both_stakers(): Promise<UniqueStakerRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/both'));
    return data.UniqueStakersBoth as UniqueStakerRWLK[];
  }, []);
}
