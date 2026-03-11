import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';

export function get_marketing_rewards() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('marketing/rewards/global/0/1000000'));
    return flattenTxArray(data.MarketingRewards);
  }, []);
}

export function get_marketing_rewards_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`marketing/rewards/by_user/${address}/0/1000000`));
    return flattenTxArray(data.UserMarketingRewards);
  }, []);
}
