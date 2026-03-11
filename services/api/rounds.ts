import {
  axios,
  getAPIUrl,
  getMainAPIUrl,
  apiCall,
  apiPost,
  flattenTx,
  flattenTxArray,
  flattenRoundInfo,
} from './client';
import type {
  DashboardInfo,
  RoundInfo,
  BidInfo,
  TxInfo,
  WinningHistoryEntry,
  SpecialWinners,
  BannedBid,
  BidEthPriceInfo,
} from './types';

/** Fetches the global dashboard statistics (current round, prize pool, bid count, etc.). */
export function get_dashboard_info(): Promise<DashboardInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/dashboard'));
    return data;
  }, null);
}

/** Fetches all rounds with flattened prize, charity, and staking fields. */
export function get_round_list(): Promise<RoundInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/list/0/1000000'));
    return (data.Rounds || [])
      .map(flattenRoundInfo)
      .filter((r: RoundInfo | null): r is RoundInfo => r !== null);
  }, []);
}

/** Fetches detailed info for a single round, clamping negative values to 0. */
export function get_round_info(roundNum: number): Promise<RoundInfo | null> {
  const id = roundNum < 0 ? 0 : roundNum;
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
    return flattenRoundInfo(data.RoundInfo);
  }, null);
}

/** Fetches the prize-claim timestamp for the current round. */
export function get_prize_time(): Promise<number> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/current/time'));
    return data.CurRoundPrizeTime;
  }, 0);
}

/** Fetches the global prize-claim history with flattened transaction fields. */
export function get_claim_history(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('prizes/history/global/0/1000000'));
    return flattenTxArray<TxInfo>(data.GlobalPrizeHistory);
  }, []);
}

/** Fetches prize-claim history for a specific wallet address. */
export function get_claim_history_by_user(address: string): Promise<WinningHistoryEntry[] | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/history/by_user/${address}/0/1000000`));
    return flattenTxArray<WinningHistoryEntry>(data.USerPrizeHistory);
  }, null);
}

/** Fetches all bids across all rounds with flattened transaction fields. */
export function get_bid_list(): Promise<BidInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/list/all/0/1000000'));
    return flattenTxArray<BidInfo>(data.Bids);
  }, []);
}

/** Fetches a single bid by its event-log ID. */
export function get_bid_info(evtLogID: number): Promise<BidInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
    return flattenTx(data.BidInfo) as BidInfo | null;
  }, null);
}

/** Fetches bids for a given round, sorted by the specified direction (`"asc"` or `"desc"`). */
export function get_bid_list_by_round(round: number, sortDir: string): Promise<BidInfo[]> {
  return apiCall(async () => {
    const dir = sortDir === 'asc' ? 0 : 1;
    const { data } = await axios.get(getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`));
    return flattenTxArray<BidInfo>(data.BidsByRound);
  }, []);
}

/** Fetches the current round's special-prize winners (endurance champion, last CST bidder, chrono warrior). */
export function get_current_special_winners(): Promise<SpecialWinners | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/current_special_winners'));
    return data as SpecialWinners;
  }, null);
}

/** Fetches all raffle ETH deposits across all rounds. */
export function get_prize_deposits_list(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('raffle/deposits/list/0/1000000'));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

/** Fetches raffle ETH deposits for a specific round. */
export function get_prize_deposits_by_round(round: number): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/deposits/by_round/${round}`));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

/** Fetches the list of administratively banned bids. */
export function get_banned_bids(): Promise<BannedBid[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getMainAPIUrl('get_banned_bids'));
    return data as BannedBid[];
  }, []);
}

/** Bans a bid by its ID and the bidder's address (admin action). */
export function ban_bid(bid_id: number, user_addr: string) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('ban_bid'), {
      bid_id,
      user_addr,
    });
    return data;
  });
}

/** Unbans a previously banned bid (admin action). */
export function unban_bid(bid_id: number) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('unban_bid'), { bid_id });
    return data;
  });
}

/** Fetches the current bid price in ETH and related pricing info. */
export function get_bid_eth_price(): Promise<BidEthPriceInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/eth_price`));
    return data as BidEthPriceInfo;
  }, null);
}

/** Fetches the number of seconds remaining until the next prize can be claimed. */
export function get_time_until_prize(): Promise<number> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('time/until_prize'));
    return data.TimeUntilPrize;
  }, 0);
}
