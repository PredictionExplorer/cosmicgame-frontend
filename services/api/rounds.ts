// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import {
  axios,
  getAPIUrl,
  apiCall,
  apiPost,
  flattenTx,
  flattenTxArray,
  flattenRoundInfo,
} from './client';
import { DashboardInfoSchema, RoundInfoSchema, safeValidate } from './schemas';
import type {
  DashboardInfo,
  RoundInfo,
  GestureInfo,
  TxInfo,
  WinningHistoryEntry,
  SpecialRecipients,
  BannedGesture,
  GestureEthCostInfo,
} from './types';

/**
 * Maps the live Go `/statistics/dashboard` JSON into the field names the app schema expects.
 * Wire format uses `PrizeAmountEth`, `BidPriceEth`, `TokenReward` (wei string); lexicon/UI use
 * `CurPrizeAmountEth`, `CurBidPriceEth`, `GestureCostEth`.
 */
export function normalizeDashboardWire(raw: Record<string, unknown>): Record<string, unknown> {
  const data = { ...raw };

  if (data.CurPrizeAmountEth === undefined && typeof data.PrizeAmountEth === 'number') {
    data.CurPrizeAmountEth = data.PrizeAmountEth;
  }
  if (data.CurBidPriceEth === undefined && typeof data.BidPriceEth === 'number') {
    data.CurBidPriceEth = data.BidPriceEth;
  }
  if (data.GestureCostEth === undefined) {
    data.GestureCostEth = tokenRewardWeiStringToGestureCostEth(data.TokenReward);
  }

  return data;
}

function tokenRewardWeiStringToGestureCostEth(tokenReward: unknown): number {
  if (typeof tokenReward !== 'string' || tokenReward === '' || tokenReward === 'error') {
    return 0;
  }
  try {
    const wei = BigInt(tokenReward);
    return Number(wei) / 1e18;
  } catch {
    const n = Number(tokenReward);
    return Number.isFinite(n) ? n / 1e18 : 0;
  }
}

/** Fetches the global dashboard statistics (current round, allocation pool, bid count, etc.). */
export function get_dashboard_info(): Promise<DashboardInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/dashboard'));
    const normalized = normalizeDashboardWire(data as Record<string, unknown>);
    return safeValidate(DashboardInfoSchema, normalized, 'DashboardInfo') as DashboardInfo;
  }, null);
}

/** Fetches all rounds with flattened allocation, charity, and anchoring fields. */
export function get_round_list(): Promise<RoundInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/list/0/1000000'));
    const rounds = (data.Rounds || [])
      .map(flattenRoundInfo)
      .filter((r: RoundInfo | null): r is RoundInfo => r !== null);
    // Spot-check the first round against the schema (warn-only) — cheap
    // signal that the backend shape is still the one we think it is.
    if (rounds.length > 0) {
      safeValidate(RoundInfoSchema, rounds[0], 'RoundInfo[list]');
    }
    return rounds;
  }, []);
}

/** Fetches detailed info for a single round, clamping negative values to 0. */
export function get_round_info(roundNum: number): Promise<RoundInfo | null> {
  const id = roundNum < 0 ? 0 : roundNum;
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
    const round = flattenRoundInfo(data.RoundInfo);
    if (round) safeValidate(RoundInfoSchema, round, 'RoundInfo[detail]');
    return round;
  }, null);
}

/** Fetches the allocation-claim timestamp for the current round. */
export function get_prize_time(): Promise<number> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/current/time'));
    return data.CurRoundPrizeTime;
  }, 0);
}

/** Fetches the global allocation-claim history with flattened transaction fields. */
export function get_claim_history(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('prizes/history/global/0/1000000'));
    return flattenTxArray<TxInfo>(data.GlobalPrizeHistory);
  }, []);
}

/** Fetches allocation-claim history for a specific wallet address. */
export function get_claim_history_by_user(address: string): Promise<WinningHistoryEntry[] | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/history/by_user/${address}/0/1000000`));
    // Backend uses `USerPrizeHistory` (typo); accept the corrected key as well.
    return flattenTxArray<WinningHistoryEntry>(data.UserPrizeHistory ?? data.USerPrizeHistory);
  }, null);
}

/** Fetches all gestures across all rounds with flattened transaction fields. */
export function get_bid_list(): Promise<GestureInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/list/all/0/1000000'));
    return flattenTxArray<GestureInfo>(data.Gestures);
  }, []);
}

/** Fetches a single bid by its event-log ID. */
export function get_bid_info(evtLogID: number): Promise<GestureInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
    return flattenTx(data.GestureInfo) as GestureInfo | null;
  }, null);
}

/** Fetches gestures for a given round, sorted by the specified direction (`"asc"` or `"desc"`). */
export function get_bid_list_by_round(round: number, sortDir: string): Promise<GestureInfo[]> {
  return apiCall(async () => {
    const dir = sortDir === 'asc' ? 0 : 1;
    const { data } = await axios.get(getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`));
    return flattenTxArray<GestureInfo>(data.BidsByRound);
  }, []);
}

/** Fetches the current round's special-allocation recipients (endurance champion, last CST bidder, chrono warrior). */
export function get_current_special_winners(): Promise<SpecialRecipients | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/current_special_winners'));
    return data as SpecialRecipients;
  }, null);
}

/** Fetches all stellarSelection ETH deposits across all rounds. */
export function get_prize_deposits_list(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('raffle/deposits/list/0/1000000'));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

/** Fetches stellarSelection ETH deposits for a specific round. */
export function get_prize_deposits_by_round(round: number): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/deposits/by_round/${round}`));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

/** Fetches the list of administratively banned gestures (Cosmic Game / Go API). */
export function get_banned_bids(): Promise<BannedGesture[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('get_banned_bids'));
    return data as BannedGesture[];
  }, []);
}

/** Bans a bid by its ID and the bidder's address (admin action). Uses Cosmic Game / Go API. */
export function ban_bid(bid_id: number, user_addr: string) {
  return apiPost(async () => {
    const { data } = await axios.post(getAPIUrl('ban_bid'), {
      bid_id,
      user_addr,
    });
    return data;
  });
}

/** Unbans a previously banned bid (admin action). Uses Cosmic Game / Go API. */
export function unban_gesture(bid_id: number) {
  return apiPost(async () => {
    const { data } = await axios.post(getAPIUrl('unban_bid'), { bid_id });
    return data;
  });
}

/** Fetches the current bid price in ETH and related pricing info. */
export function get_bid_eth_price(): Promise<GestureEthCostInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/eth_price`));
    return data as GestureEthCostInfo;
  }, null);
}

/** Fetches the number of seconds remaining until the next allocation can be claimed. */
export function get_time_until_prize(): Promise<number> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('time/until_prize'));
    return data.TimeUntilPrize;
  }, 0);
}

// lexicon-allow-end
