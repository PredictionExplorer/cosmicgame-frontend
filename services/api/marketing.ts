import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type { MarketingReward } from './types';

/** Fetches all marketing reward records globally. */
export function get_marketing_rewards(): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('marketing/rewards/global/0/1000000'));
    return flattenTxArray<MarketingReward>(data.MarketingRewards);
  }, []);
}

/** Fetches marketing reward records for a specific wallet address. */
export function get_marketing_rewards_by_user(address: string): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`marketing/rewards/by_user/${address}/0/1000000`));
    return flattenTxArray<MarketingReward>(data.UserMarketingRewards);
  }, []);
}
