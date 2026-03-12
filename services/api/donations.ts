import {
  axios,
  getAPIUrl,
  apiCall,
  flattenTx,
  flattenTxArray,
  normalizeFieldNames,
  normalizeFieldNamesArray,
} from './client';
import type {
  CharityWithdrawal,
  ETHDonation,
  DonatedNFT,
  DonatedERC20Token,
  NFTDonationStatsEntry,
} from './types';

/** Fetches all direct Cosmic Game ETH donations (simple records without extra info). */
export function get_donations_cg_simple_list(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/simple/list/0/1000000'));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

/** Fetches direct Cosmic Game ETH donations for a specific round (simple records). */
export function get_donations_cg_simple_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/simple/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

/** Fetches all direct Cosmic Game ETH donations with extended donor/round info. */
export function get_donations_cg_with_info_list(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/with_info/list/0/1000000'));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

/** Fetches direct Cosmic Game ETH donations with extended info for a specific round. */
export function get_donations_cg_with_info_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

/** Fetches a single ETH donation with extended info by its record ID. */
export function get_donations_with_info_by_id(id: number): Promise<ETHDonation | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/info/${id}`));
    return flattenTx(data.ETHDonation) as ETHDonation | null;
  }, null);
}

/** Fetches combined ETH donation records made by a specific wallet address. */
export function get_donations_eth_by_user(address: string): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/by_user/${address}`));
    return flattenTxArray<ETHDonation>(data.CombinedDonationRecords);
  }, []);
}

/** Fetches combined (direct + voluntary) Cosmic Game donations for a specific round. */
export function get_donations_both_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/both/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.CosmicGameDonations);
  }, []);
}

/** Fetches all combined (direct + voluntary) Cosmic Game donations. */
export function get_donations_both(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/both/all'));
    return flattenTxArray<ETHDonation>(data.CosmicGameDonations);
  }, []);
}

/** Fetches charity donation deposits from prize-pool distributions. */
export function get_charity_donations_deposits(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/deposits'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

/** Fetches Cosmic Game charity deposits (automatic per-round charity share). */
export function get_charity_cg_deposits(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/cg_deposits'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

/** Fetches voluntary charity donations made by users. */
export function get_charity_voluntary(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/voluntary'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

/** Fetches charity withdrawal records (funds sent to the charity address). */
export function get_charity_withdrawals(): Promise<CharityWithdrawal[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/withdrawals'));
    return flattenTxArray<CharityWithdrawal>(data.CharityWithdrawals);
  }, []);
}

/** Fetches all donated NFTs with normalized field names. */
export function get_donations_nft_list(): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/list/0/1000000'));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

/** Fetches detailed info for a single donated NFT by its record ID. */
export function get_donated_nft_info(record_id: number): Promise<DonatedNFT | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
    return normalizeFieldNames(flattenTx(data.NFTDonation)) as DonatedNFT | null;
  }, null);
}

/** Fetches all donated NFT claim records globally. */
export function get_donated_nft_claims_all(): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/claims/0/100000'));
    return flattenTxArray<DonatedNFT>(data.DonatedNFTClaims);
  }, []);
}

/** Fetches donated NFTs that have been claimed by a specific wallet address. */
export function get_claimed_donated_nft_by_user(address: string): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
    return flattenTxArray<DonatedNFT>(data.DonatedNFTClaims);
  }, []);
}

/** Fetches aggregate NFT donation statistics. */
export function get_nft_donation_stats(): Promise<NFTDonationStatsEntry[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/statistics'));
    return data.NFTDonationStats as NFTDonationStatsEntry[];
  }, []);
}

/** Fetches donated NFTs for a specific round with normalized field names. */
export function get_donations_nft_by_round(round: number): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

/** Fetches unclaimed donated NFTs for a specific round. */
export function get_donations_nft_unclaimed_by_round(round: number): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

/** Fetches unclaimed donated NFTs available for a specific wallet address. */
export function get_unclaimed_donated_nft_by_user(address: string): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedNFT>(data.UnclaimedDonatedNFTs),
    ) as DonatedNFT[];
  }, []);
}

/** Fetches detailed ERC-20 token donations for a specific round with normalized field names. */
export function get_donations_erc20_by_round(round: number): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/detailed/${round}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonationsERC20ByRoundDetailed),
    ) as DonatedERC20Token[];
  }, []);
}

/** Fetches ERC-20 token donations won by a specific wallet address. */
export function get_donations_erc20_by_user(address: string): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonatedPrizesERC20ByWinner),
    ) as DonatedERC20Token[];
  }, []);
}
