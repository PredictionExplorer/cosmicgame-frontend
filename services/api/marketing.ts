import { axios, isAxiosError, getAPIUrl, flattenTxArray } from './client';

export async function get_marketing_rewards() {
  try {
    const { data } = await axios.get(getAPIUrl('marketing/rewards/global/0/1000000'));
    return flattenTxArray(data.MarketingRewards);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_marketing_rewards_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`marketing/rewards/by_user/${address}/0/1000000`));
    return flattenTxArray(data.UserMarketingRewards);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
