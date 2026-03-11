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

/** Fetches comprehensive user profile including flattened bids, prizes, tokens, staking, and donation lists. */
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

/** Fetches ETH and token balances for a wallet address. */
export function get_user_balance(address: string): Promise<UserBalance | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
    return data;
  }, null);
}

/** Fetches red-box notification data (unclaimed winnings) for a wallet address. */
export function notify_red_box(address: string): Promise<NotifyRedBoxResult | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
    return data.Winnings as NotifyRedBoxResult;
  }, null);
}

/** Fetches the list of unique bidder addresses with bid counts and totals. */
export function get_unique_bidders(): Promise<Bidder[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/bidders'));
    return data.UniqueBidders as Bidder[];
  }, []);
}

/** Fetches the list of unique prize-winner addresses with win counts. */
export function get_unique_winners(): Promise<Winner[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/winners'));
    return data.UniqueWinners as Winner[];
  }, []);
}

/** Fetches the list of unique ETH donor addresses with donation totals. */
export function get_unique_donors(): Promise<UniqueEthDonor[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return data.UniqueDonors as UniqueEthDonor[];
  }, []);
}

/** Fetches the list of unique CST staker addresses with staking stats. */
export function get_unique_cst_stakers(): Promise<UniqueStakerCST[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/cst'));
    return data.UniqueStakersCST as UniqueStakerCST[];
  }, []);
}

/** Fetches the list of unique RandomWalk staker addresses with staking stats. */
export function get_unique_rwalk_stakers(): Promise<UniqueStakerRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/rwalk'));
    return data.UniqueStakersRWalk as UniqueStakerRWLK[];
  }, []);
}

/** Fetches addresses that have staked both CST and RandomWalk tokens. */
export function get_unique_both_stakers(): Promise<UniqueStakerRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/both'));
    return data.UniqueStakersBoth as UniqueStakerRWLK[];
  }, []);
}
