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
  TxInfo,
  DonatedNFT,
  DonatedERC20Token,
  NFTDonationStatsEntry,
} from './types';

export function get_donations_cg_simple_list(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/simple/list/0/1000000'));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_simple_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/simple/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_with_info_list(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/with_info/list/0/1000000'));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_with_info_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.DirectCGDonations);
  }, []);
}

export function get_donations_with_info_by_id(id: number): Promise<ETHDonation | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/info/${id}`));
    return flattenTx(data.ETHDonation) as ETHDonation | null;
  }, null);
}

export function get_donations_eth_by_user(address: string): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/by_user/${address}`));
    return flattenTxArray<ETHDonation>(data.CombinedDonationRecords);
  }, []);
}

export function get_donations_both_by_round(round: number): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/both/by_round/${round}`));
    return flattenTxArray<ETHDonation>(data.CosmicGameDonations);
  }, []);
}

export function get_donations_both(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/both/all'));
    return flattenTxArray<ETHDonation>(data.CosmicGameDonations);
  }, []);
}

export function get_charity_donations_deposits(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/deposits'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

export function get_charity_cg_deposits(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/cg_deposits'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

export function get_charity_voluntary(): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/voluntary'));
    return flattenTxArray<ETHDonation>(data.CharityDonations);
  }, []);
}

export function get_charity_withdrawals(): Promise<CharityWithdrawal[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/withdrawals'));
    return flattenTxArray<CharityWithdrawal>(data.CharityWithdrawals);
  }, []);
}

export function get_donations_nft_list(): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/list/0/1000000'));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

export function get_donated_nft_info(record_id: number): Promise<DonatedNFT | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
    return normalizeFieldNames(flattenTx(data.NFTDonation)) as DonatedNFT | null;
  }, null);
}

export function get_donated_nft_claims_all(): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/claims/0/100000'));
    return flattenTxArray<DonatedNFT>(data.DonatedNFTClaims);
  }, []);
}

export function get_claimed_donated_nft_by_user(address: string): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
    return flattenTxArray<DonatedNFT>(data.DonatedNFTClaims);
  }, []);
}

export function get_nft_donation_stats(): Promise<NFTDonationStatsEntry[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/statistics'));
    return data.NFTDonationStats as NFTDonationStatsEntry[];
  }, []);
}

export function get_donations_nft_by_round(round: number): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

export function get_donations_nft_unclaimed_by_round(round: number): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray<DonatedNFT>(data.NFTDonations)) as DonatedNFT[];
  }, []);
}

export function get_unclaimed_donated_nft_by_user(address: string): Promise<DonatedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedNFT>(data.UnclaimedDonatedNFTs),
    ) as DonatedNFT[];
  }, []);
}

export function get_donations_erc20_by_round(round: number): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/detailed/${round}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonationsERC20ByRoundDetailed),
    ) as DonatedERC20Token[];
  }, []);
}

export function get_donations_erc20_by_user(address: string): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
    return normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonatedPrizesERC20ByWinner),
    ) as DonatedERC20Token[];
  }, []);
}
