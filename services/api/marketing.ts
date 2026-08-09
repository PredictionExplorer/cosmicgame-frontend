// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import { apiGet, getAPIUrl, apiCall, flattenTxArray, pagedPath } from './client';
import type { ApiListRequestOptions } from './client';
import { MarketingRewardSchema, safeValidateListSample } from './schemas';
import type { MarketingReward } from './types';

/** Fetches marketing reward records globally (optionally paged). */
export function get_marketing_rewards(opts?: ApiListRequestOptions): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`marketing/rewards/global/${pagedPath(opts)}`), opts);
    return safeValidateListSample(
      MarketingRewardSchema,
      flattenTxArray<MarketingReward>(data.MarketingRewards),
      'marketingRewards',
    ) as MarketingReward[];
  }, []);
}

/** Fetches marketing reward records for a specific wallet address (optionally paged). */
export function get_marketing_rewards_by_user(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<MarketingReward[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`marketing/rewards/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return safeValidateListSample(
      MarketingRewardSchema,
      flattenTxArray<MarketingReward>(data.UserMarketingRewards),
      'marketingRewardsByUser',
    ) as MarketingReward[];
  }, []);
}

// lexicon-allow-end
