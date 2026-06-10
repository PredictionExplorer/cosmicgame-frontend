// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import { axios, getAPIUrl, apiCall, flattenTxArray, pagedPath } from './client';
import type { ApiPageWindow } from './client';
import type { StellarSelectionETHDeposit, StellarSelectionNFTRecipient } from './types';

/** Fetches stellarSelection ETH deposits made by a specific wallet address. */
export function get_raffle_deposits_by_user(
  address: string,
): Promise<StellarSelectionETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/eth/raffle/by_user/${address}`));
    const d = data as Record<string, unknown>;
    /** Primary JSON API uses `RaffleDeposits`; older/alternate route uses `UserRaffleDeposits`. */
    const list = d.UserRaffleDeposits ?? d.RaffleDeposits;
    return flattenTxArray<StellarSelectionETHDeposit>(list);
  }, []);
}

/** Fetches Chrono Warrior allocation deposits for a specific wallet address. */
export function get_chrono_warrior_deposits_by_user(
  address: string,
): Promise<StellarSelectionETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`prizes/eth/chronowarrior/by_user/${address}`));
    const d = data as Record<string, unknown>;
    const list = d.UserChronoWarriorDeposits ?? d.ChronoWarriorDeposits;
    return flattenTxArray<StellarSelectionETHDeposit>(list);
  }, []);
}

/** Fetches unclaimed stellarSelection deposits available for withdrawal (optionally paged). */
export function get_unclaimed_raffle_deposits_by_user(
  address: string,
  page?: ApiPageWindow,
): Promise<StellarSelectionETHDeposit[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`prizes/eth/unclaimed/by_user/${address}/${pagedPath(page)}`),
    );
    return flattenTxArray<StellarSelectionETHDeposit>(data.UnclaimedDeposits);
  }, []);
}

/** Fetches stellarSelection NFT recipients across all rounds (optionally paged). */
export function get_raffle_nft_winners_list(
  page?: ApiPageWindow,
): Promise<StellarSelectionNFTRecipient[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/all/list/${pagedPath(page)}`));
    return flattenTxArray<StellarSelectionNFTRecipient>(data.RaffleNFTWinners);
  }, []);
}

/** Fetches stellarSelection NFT recipients for a specific round. */
export function get_raffle_nft_winners_by_round(
  round: number,
): Promise<StellarSelectionNFTRecipient[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_round/${round}`));
    return flattenTxArray<StellarSelectionNFTRecipient>(data.RaffleNFTWinners);
  }, []);
}

/** Fetches stellarSelection NFT winnings for a specific wallet address. */
export function get_raffle_nft_winnings_by_user(
  address: string,
): Promise<StellarSelectionNFTRecipient[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`raffle/nft/by_user/${address}`));
    return flattenTxArray<StellarSelectionNFTRecipient>(data.UserRaffleNFTWinnings);
  }, []);
}

// lexicon-allow-end
