import {
  axios,
  isAxiosError,
  getAPIUrl,
  flattenTx,
  flattenTxArray,
  normalizeFieldNames,
  normalizeFieldNamesArray,
} from './client';

export async function get_donations_cg_simple_list() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/eth/simple/list/0/1000000'));
    return flattenTxArray(data.DirectCGDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_cg_simple_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/eth/simple/by_round/${round}`));
    return flattenTxArray(data.DirectCGDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_cg_with_info_list() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/eth/with_info/list/0/1000000'));
    return flattenTxArray(data.DirectCGDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_cg_with_info_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/by_round/${round}`));
    return flattenTxArray(data.DirectCGDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_with_info_by_id(id: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/info/${id}`));
    return flattenTx(data.ETHDonation);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_eth_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/eth/by_user/${address}`));
    return flattenTxArray(data.CombinedDonationRecords);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_both_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/eth/both/by_round/${round}`));
    return flattenTxArray(data.CosmicGameDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_both() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/eth/both/all'));
    return flattenTxArray(data.CosmicGameDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_charity_donations_deposits() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/charity/deposits'));
    return flattenTxArray(data.CharityDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_charity_cg_deposits() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/charity/cg_deposits'));
    return flattenTxArray(data.CharityDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_charity_voluntary() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/charity/voluntary'));
    return flattenTxArray(data.CharityDonations);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_charity_withdrawals() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/charity/withdrawals'));
    return flattenTxArray(data.CharityWithdrawals);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_nft_list() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/nft/list/0/1000000'));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donated_nft_info(record_id: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
    return normalizeFieldNames(flattenTx(data.NFTDonation));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donated_nft_claims_all() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/nft/claims/0/100000'));
    return flattenTxArray(data.DonatedNFTClaims);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_claimed_donated_nft_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
    return flattenTxArray(data.DonatedNFTClaims);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_nft_donation_stats() {
  try {
    const { data } = await axios.get(getAPIUrl('donations/nft/statistics'));
    return data.NFTDonationStats;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_nft_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_nft_unclaimed_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_unclaimed_donated_nft_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
    return normalizeFieldNamesArray(flattenTxArray(data.UnclaimedDonatedNFTs));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_erc20_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/detailed/${round}`));
    return normalizeFieldNamesArray(flattenTxArray(data.DonationsERC20ByRoundDetailed));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_donations_erc20_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
    return normalizeFieldNamesArray(flattenTxArray(data.DonatedPrizesERC20ByWinner));
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
