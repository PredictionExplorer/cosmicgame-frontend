import { axios, isAxiosError, getAPIUrl, flattenTxArray } from './client';

export async function get_raffle_deposits_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`prizes/deposits/raffle/by_user/${address}`));
    return flattenTxArray(data.UserRaffleDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_chrono_warrior_deposits_by_user(address: string) {
  try {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/chrono_warrior/by_user/${address}`),
    );
    return flattenTxArray(data.UserChronoWarriorDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unclaimed_raffle_deposits_by_user(address: string) {
  try {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/unclaimed/by_user/${address}/0/1000000`),
    );
    return flattenTxArray(data.UnclaimedDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_raffle_nft_winners_list() {
  try {
    const { data } = await axios.get(getAPIUrl('raffle/nft/all/list/0/1000000'));
    return flattenTxArray(data.RaffleNFTWinners);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_raffle_nft_winners_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_round/${round}`));
    return flattenTxArray(data.RaffleNFTWinners);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_raffle_nft_winnings_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_user/${address}`));
    return flattenTxArray(data.UserRaffleNFTWinnings);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
