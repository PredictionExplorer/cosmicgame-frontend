// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import { axios, getAPIUrl, apiCall, flattenGestureArray, flattenTxArray } from './client';
import {
  ParticipantSchema,
  RecipientSchema,
  UniqueAnchorHolderCSTSchema,
  UniqueAnchorHolderRWLKSchema,
  UniqueEthDonorSchema,
  safeValidateListSample,
} from './schemas';
import type {
  UserInfoWithLists,
  UserBalance,
  NotifyRedBoxResult,
  Participant,
  Recipient,
  RoiLeaderboardEntry,
  RoiLeaderboardSort,
  RoundClaimSummary,
  RoundClaimDetail,
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
        Gestures: flattenGestureArray(data.Gestures ?? data.Bids ?? []),
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
    return safeValidateListSample(
      ParticipantSchema,
      data.UniqueBidders,
      'uniqueBidders',
    ) as Participant[];
  }, []);
}

/** Fetches the list of unique allocation-recipient addresses with win counts. */
export function get_unique_winners(): Promise<Recipient[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/winners'));
    return safeValidateListSample(
      RecipientSchema,
      data.UniqueWinners,
      'uniqueWinners',
    ) as Recipient[];
  }, []);
}

/**
 * Fetches the per-player ROI leaderboard (Tier-1, ETH-only). The backend sorts
 * server-side per `sort` and filters by `minBids`; we over-fetch and paginate
 * client-side. Returns `[]` when the endpoint isn't deployed yet.
 */
export function get_roi_leaderboard(
  sort: RoiLeaderboardSort = 'net_pl',
  minBids = 5,
  limit = 200,
  offset = 0,
): Promise<RoiLeaderboardEntry[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/leaderboard/roi'), {
      params: { sort, min_bids: minBids, limit, offset },
    });
    return (data.RoiLeaderboard ?? []) as RoiLeaderboardEntry[];
  }, []);
}

/**
 * Fetches the per-cycle claimable-asset summary (awarded vs unclaimed secondary
 * ETH allocations, attached NFTs, and attached ERC-20s held in PrizesWallet), with
 * claim-window expiry, average claim time, and the unclaimed items for drill-down.
 * Returns `[]` when the endpoint isn't deployed yet.
 */
export function get_claims_by_round(): Promise<RoundClaimSummary[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/claims/by_round'));
    return (data.ClaimsByRound ?? []) as RoundClaimSummary[];
  }, []);
}

/**
 * Fetches the per-cycle claim drill-down: the claim transactions (each recipient's
 * withdrawal, with the time it took after the cycle finalized and the tx hash) and
 * the tokens attached during that cycle. Returns `null` when unavailable.
 */
export function get_claim_detail_by_round(round: number): Promise<RoundClaimDetail | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`statistics/claims/detail/${round}`));
    return {
      RoundNum: data.RoundNum ?? round,
      ClaimTransactions: data.ClaimTransactions ?? [],
      AttachedTokens: data.AttachedTokens ?? [],
    } as RoundClaimDetail;
  }, null);
}

/** Fetches the list of unique ETH donor addresses with donation totals. */
export function get_unique_donors(): Promise<UniqueEthDonor[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/donors'));
    return safeValidateListSample(
      UniqueEthDonorSchema,
      data.UniqueDonors,
      'uniqueDonors',
    ) as UniqueEthDonor[];
  }, []);
}

/** Fetches the list of unique CST anchorHolder addresses with anchoring stats. */
export function get_unique_cst_stakers(): Promise<UniqueAnchorHolderCST[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/cst'));
    return safeValidateListSample(
      UniqueAnchorHolderCSTSchema,
      data.UniqueStakersCST,
      'uniqueStakersCST',
    ) as UniqueAnchorHolderCST[];
  }, []);
}

/** Fetches the list of unique RandomWalk anchorHolder addresses with anchoring stats. */
export function get_unique_rwalk_stakers(): Promise<UniqueAnchorHolderRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/randomwalk'));
    return safeValidateListSample(
      UniqueAnchorHolderRWLKSchema,
      data.UniqueStakersRWalk,
      'uniqueStakersRWalk',
    ) as UniqueAnchorHolderRWLK[];
  }, []);
}

/** Fetches addresses that have staked both CST and RandomWalk tokens. */
export function get_unique_both_stakers(): Promise<UniqueAnchorHolderRWLK[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/unique/stakers/both'));
    return data.UniqueStakersBoth as UniqueAnchorHolderRWLK[];
  }, []);
}

// lexicon-allow-end
