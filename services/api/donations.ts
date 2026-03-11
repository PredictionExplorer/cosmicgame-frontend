import {
  axios,
  getAPIUrl,
  apiCall,
  flattenTx,
  flattenTxArray,
  normalizeFieldNames,
  normalizeFieldNamesArray,
} from './client';

export function get_donations_cg_simple_list() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/simple/list/0/1000000'));
    return flattenTxArray(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_simple_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/simple/by_round/${round}`));
    return flattenTxArray(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_with_info_list() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/with_info/list/0/1000000'));
    return flattenTxArray(data.DirectCGDonations);
  }, []);
}

export function get_donations_cg_with_info_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/by_round/${round}`));
    return flattenTxArray(data.DirectCGDonations);
  }, []);
}

export function get_donations_with_info_by_id(id: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/info/${id}`));
    return flattenTx(data.ETHDonation);
  }, null);
}

export function get_donations_eth_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/by_user/${address}`));
    return flattenTxArray(data.CombinedDonationRecords);
  }, []);
}

export function get_donations_both_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/both/by_round/${round}`));
    return flattenTxArray(data.CosmicGameDonations);
  }, []);
}

export function get_donations_both() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/eth/both/all'));
    return flattenTxArray(data.CosmicGameDonations);
  }, []);
}

export function get_charity_donations_deposits() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/deposits'));
    return flattenTxArray(data.CharityDonations);
  }, []);
}

export function get_charity_cg_deposits() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/cg_deposits'));
    return flattenTxArray(data.CharityDonations);
  }, []);
}

export function get_charity_voluntary() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/voluntary'));
    return flattenTxArray(data.CharityDonations);
  }, []);
}

export function get_charity_withdrawals() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/charity/withdrawals'));
    return flattenTxArray(data.CharityWithdrawals);
  }, []);
}

export function get_donations_nft_list() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/list/0/1000000'));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  }, []);
}

export function get_donated_nft_info(record_id: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
    return normalizeFieldNames(flattenTx(data.NFTDonation));
  }, null);
}

export function get_donated_nft_claims_all() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/claims/0/100000'));
    return flattenTxArray(data.DonatedNFTClaims);
  }, []);
}

export function get_claimed_donated_nft_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
    return flattenTxArray(data.DonatedNFTClaims);
  }, []);
}

export function get_nft_donation_stats() {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('donations/nft/statistics'));
    return data.NFTDonationStats;
  }, []);
}

export function get_donations_nft_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  }, []);
}

export function get_donations_nft_unclaimed_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  }, []);
}

export function get_unclaimed_donated_nft_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
    return normalizeFieldNamesArray(flattenTxArray(data.UnclaimedDonatedNFTs));
  }, []);
}

export function get_donations_erc20_by_round(round: number) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/detailed/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.DonationsERC20ByRoundDetailed));
  }, []);
}

export function get_donations_erc20_by_user(address: string) {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
    return normalizeFieldNamesArray(flattenTxArray(data.DonatedPrizesERC20ByWinner));
  }, []);
}
