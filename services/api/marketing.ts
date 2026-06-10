// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import { axios, getAPIUrl, apiCall, flattenTxArray, pagedPath } from './client';
import type { ApiPageWindow } from './client';
import type { MarketingReward } from './types';

/** Fetches marketing reward records globally (optionally paged). */
export function get_marketing_rewards(page?: ApiPageWindow): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`marketing/rewards/global/${pagedPath(page)}`));
    return flattenTxArray<MarketingReward>(data.MarketingRewards);
  }, []);
}

/** Fetches marketing reward records for a specific wallet address (optionally paged). */
export function get_marketing_rewards_by_user(
  address: string,
  page?: ApiPageWindow,
): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`marketing/rewards/by_user/${address}/${pagedPath(page)}`),
    );
    return flattenTxArray<MarketingReward>(data.UserMarketingRewards);
  }, []);
}

// lexicon-allow-end
