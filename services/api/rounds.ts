import {
  axios,
  isAxiosError,
  getAPIUrl,
  getMainAPIUrl,
  flattenTx,
  flattenTxArray,
  flattenRoundInfo,
} from './client';
import type { DashboardInfo, RoundInfo, BidInfo, TxInfo, WinningHistoryEntry } from './types';

export async function get_dashboard_info(): Promise<DashboardInfo | null> {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/dashboard'));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_round_list(): Promise<RoundInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('rounds/list/0/1000000'));
    return (data.Rounds || [])
      .map(flattenRoundInfo)
      .filter((r: RoundInfo | null): r is RoundInfo => r !== null);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_round_info(roundNum: number): Promise<RoundInfo | null> {
  const id = roundNum < 0 ? 0 : roundNum;
  try {
    const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
    return flattenRoundInfo(data.RoundInfo);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_prize_time() {
  try {
    const { data } = await axios.get(getAPIUrl('rounds/current/time'));
    return data.CurRoundPrizeTime;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return 0;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_claim_history(): Promise<TxInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('prizes/history/global/0/1000000'));
    return flattenTxArray<TxInfo>(data.GlobalPrizeHistory);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_claim_history_by_user(
  address: string,
): Promise<WinningHistoryEntry[] | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`prizes/history/by_user/${address}/0/1000000`));
    return flattenTxArray<WinningHistoryEntry>(data.USerPrizeHistory);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_bid_list(): Promise<BidInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('bid/list/all/0/1000000'));
    return flattenTxArray<BidInfo>(data.Bids);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_bid_info(evtLogID: number): Promise<BidInfo | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
    return flattenTx(data.BidInfo) as BidInfo | null;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_bid_list_by_round(round: number, sortDir: string): Promise<BidInfo[]> {
  try {
    const dir = sortDir === 'asc' ? 0 : 1;
    const { data } = await axios.get(getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`));
    return flattenTxArray<BidInfo>(data.BidsByRound);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_current_special_winners() {
  try {
    const { data } = await axios.get(getAPIUrl('bid/current_special_winners'));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_prize_deposits_list(): Promise<TxInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('raffle/deposits/list/0/1000000'));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_prize_deposits_by_round(round: number): Promise<TxInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`raffle/deposits/by_round/${round}`));
    return flattenTxArray<TxInfo>(data.RaffleDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_banned_bids() {
  try {
    const { data } = await axios.get(getMainAPIUrl('get_banned_bids'));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function ban_bid(bid_id: number, user_addr: string) {
  try {
    const { data } = await axios.post(getMainAPIUrl('ban_bid'), {
      bid_id,
      user_addr,
    });
    return data;
  } catch (_err: unknown) {
    throw new Error('Network response was not OK');
  }
}

export async function unban_bid(bid_id: number) {
  try {
    const { data } = await axios.post(getMainAPIUrl('unban_bid'), { bid_id });
    return data;
  } catch (_err: unknown) {
    throw new Error('Network response was not OK');
  }
}

export async function get_bid_eth_price() {
  try {
    const { data } = await axios.get(getAPIUrl(`bid/eth_price`));
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_time_until_prize() {
  try {
    const { data } = await axios.get(getAPIUrl('time/until_prize'));
    return data.TimeUntilPrize;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return 0;
    }
    throw new Error('Network response was not OK');
  }
}
