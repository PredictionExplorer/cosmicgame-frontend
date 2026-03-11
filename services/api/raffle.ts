import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type { RaffleETHDeposit, RaffleNFTWinner } from './types';

/** Fetches raffle ETH deposits made by a specific wallet address. */
export function get_raffle_deposits_by_user(address: string): Promise<RaffleETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/deposits/raffle/by_user/${address}`));
    return flattenTxArray<RaffleETHDeposit>(data.UserRaffleDeposits);
  }, []);
}

/** Fetches Chrono Warrior prize deposits for a specific wallet address. */
export function get_chrono_warrior_deposits_by_user(address: string): Promise<RaffleETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/chrono_warrior/by_user/${address}`),
    );
    return flattenTxArray<RaffleETHDeposit>(data.UserChronoWarriorDeposits);
  }, []);
}

/** Fetches unclaimed raffle deposits available for withdrawal by a wallet address. */
export function get_unclaimed_raffle_deposits_by_user(
  address: string,
): Promise<RaffleETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`prizes/deposits/unclaimed/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<RaffleETHDeposit>(data.UnclaimedDeposits);
  }, []);
}

/** Fetches all raffle NFT winners across all rounds. */
export function get_raffle_nft_winners_list(): Promise<RaffleNFTWinner[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('raffle/nft/all/list/0/1000000'));
    return flattenTxArray<RaffleNFTWinner>(data.RaffleNFTWinners);
  }, []);
}

/** Fetches raffle NFT winners for a specific round. */
export function get_raffle_nft_winners_by_round(round: number): Promise<RaffleNFTWinner[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_round/${round}`));
    return flattenTxArray<RaffleNFTWinner>(data.RaffleNFTWinners);
  }, []);
}

/** Fetches raffle NFT winnings for a specific wallet address. */
export function get_raffle_nft_winnings_by_user(address: string): Promise<RaffleNFTWinner[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_user/${address}`));
    return flattenTxArray<RaffleNFTWinner>(data.UserRaffleNFTWinnings);
  }, []);
}
