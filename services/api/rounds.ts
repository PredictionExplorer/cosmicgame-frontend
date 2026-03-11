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
import type { DashboardInfo, RoundInfo, BidInfo, TxInfo, WinningHistoryEntry } from './types';

export function get_dashboard_info(): Promise<DashboardInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('statistics/dashboard'));
    return data;
  }, null);
}

export function get_round_list(): Promise<RoundInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/list/0/1000000'));
    return (data.Rounds || [])
      .map(flattenRoundInfo)
      .filter((r: RoundInfo | null): r is RoundInfo => r !== null);
  }, []);
}

export function get_round_info(roundNum: number): Promise<RoundInfo | null> {
  const id = roundNum < 0 ? 0 : roundNum;
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
    return flattenRoundInfo(data.RoundInfo);
  }, null);
}

export function get_prize_time() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('rounds/current/time'));
    return data.CurRoundPrizeTime;
  }, 0);
}

export function get_claim_history(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('prizes/history/global/0/1000000'));
    return flattenTxArray<TxInfo>(data.GlobalPrizeHistory);
  }, []);
}

export function get_claim_history_by_user(address: string): Promise<WinningHistoryEntry[] | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/history/by_user/${address}/0/1000000`));
    return flattenTxArray<WinningHistoryEntry>(data.USerPrizeHistory);
  }, null);
}

export function get_bid_list(): Promise<BidInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/list/all/0/1000000'));
    return flattenTxArray<BidInfo>(data.Bids);
  }, []);
}

export function get_bid_info(evtLogID: number): Promise<BidInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
    return flattenTx(data.BidInfo) as BidInfo | null;
  }, null);
}

export function get_bid_list_by_round(round: number, sortDir: string): Promise<BidInfo[]> {
  return apiCall(async () => {
    const dir = sortDir === 'asc' ? 0 : 1;
    const { data } = await axios.get(getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`));
    return flattenTxArray<BidInfo>(data.BidsByRound);
  }, []);
}

export function get_current_special_winners() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('bid/current_special_winners'));
    return data;
  }, []);
}

export function get_prize_deposits_list(): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('raffle/deposits/list/0/1000000'));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

export function get_prize_deposits_by_round(round: number): Promise<TxInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/deposits/by_round/${round}`));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  }, []);
}

export function get_banned_bids() {
  return apiCall(async () => {
    const { data } = await axios.get(getMainAPIUrl('get_banned_bids'));
    return data;
  }, []);
}

export function ban_bid(bid_id: number, user_addr: string) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('ban_bid'), {
      bid_id,
      user_addr,
    });
    return data;
  });
}

export function unban_bid(bid_id: number) {
  return apiPost(async () => {
    const { data } = await axios.post(getMainAPIUrl('unban_bid'), { bid_id });
    return data;
  });
}

export function get_bid_eth_price() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`bid/eth_price`));
    return data;
  }, null);
}

export function get_time_until_prize() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('time/until_prize'));
    return data.TimeUntilPrize;
  }, 0);
}
