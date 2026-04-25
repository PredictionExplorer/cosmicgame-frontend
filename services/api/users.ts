// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type {
  UserInfoWithLists,
  UserBalance,
  NotifyRedBoxResult,
  Participant,
  Recipient,
  UniqueEthDonor,
  UniqueAnchorHolderCST,
  UniqueAnchorHolderRWLK,
} from './types';

/** Fetches comprehensive user profile including flattened gestures, allocations, tokens, anchoring, and donation lists. */
export function get_user_info(address: string): Promise<UserInfoWithLists | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`user/info/${address}`));

    if (data) {
      return {
        ...data,
        Gestures: flattenTxArray(data.Gestures || []),
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
export function get_unique_bidders(): Promise<Participant[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/bidders'));
    return data.UniqueBidders as Participant[];
  }, []);
}

/** Fetches the list of unique allocation-recipient addresses with win counts. */
export function get_unique_winners(): Promise<Recipient[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/recipients'));
    return data.UniqueWinners as Recipient[];
  }, []);
}

/** Fetches the list of unique ETH donor addresses with donation totals. */
export function get_unique_donors(): Promise<UniqueEthDonor[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return data.UniqueDonors as UniqueEthDonor[];
  }, []);
}

/** Fetches the list of unique CST anchorHolder addresses with anchoring stats. */
export function get_unique_cst_stakers(): Promise<UniqueAnchorHolderCST[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/anchorHolders/cst'));
    return data.UniqueStakersCST as UniqueAnchorHolderCST[];
  }, []);
}

/** Fetches the list of unique RandomWalk anchorHolder addresses with anchoring stats. */
export function get_unique_rwalk_stakers(): Promise<UniqueAnchorHolderRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/anchorHolders/randomwalk'));
    return data.UniqueStakersRWalk as UniqueAnchorHolderRWLK[];
  }, []);
}

/** Fetches addresses that have staked both CST and RandomWalk tokens. */
export function get_unique_both_stakers(): Promise<UniqueAnchorHolderRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/anchorHolders/both'));
    return data.UniqueStakersBoth as UniqueAnchorHolderRWLK[];
  }, []);
}

// lexicon-allow-end
