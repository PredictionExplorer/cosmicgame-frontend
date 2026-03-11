import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';

export function get_raffle_deposits_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/deposits/raffle/by_user/${address}`));
    return flattenTxArray(data.UserRaffleDeposits);
  }, []);
}

export function get_chrono_warrior_deposits_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/chrono_warrior/by_user/${address}`),
    );
    return flattenTxArray(data.UserChronoWarriorDeposits);
  }, []);
}

export function get_unclaimed_raffle_deposits_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/unclaimed/by_user/${address}/0/1000000`),
    );
    return flattenTxArray(data.UnclaimedDeposits);
  }, []);
}

export function get_raffle_nft_winners_list() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('raffle/nft/all/list/0/1000000'));
    return flattenTxArray(data.RaffleNFTWinners);
  }, []);
}

export function get_raffle_nft_winners_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_round/${round}`));
    return flattenTxArray(data.RaffleNFTWinners);
  }, []);
}

export function get_raffle_nft_winnings_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_user/${address}`));
    return flattenTxArray(data.UserRaffleNFTWinnings);
  }, []);
}
