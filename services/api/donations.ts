// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

import {
  axios,
  getAPIUrl,
  apiCall,
  flattenTx,
  flattenTxArray,
  normalizeFieldNames,
  normalizeFieldNamesArray,
  pagedPath,
  type ApiPageWindow,
} from './client';
import type {
  CharityWithdrawal,
  ETHDonation,
  AttachedNFT,
  DonatedERC20Token,
  NFTDonationStatsEntry,
} from './types';

function toFiniteNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Per-donation ERC20 rows from `by_round/all` expose `AmountEth` (and optional claim fields).
 * {@link AttachedERC20Table} expects summarized fields (`AmountDonatedEth`, etc.).
 */
function mapErc20DonationRowForTable(row: DonatedERC20Token): DonatedERC20Token {
  const rawDonated = row.AmountDonatedEth;
  const donated =
    typeof rawDonated === 'number' && Number.isFinite(rawDonated)
      ? rawDonated
      : toFiniteNumber(row.AmountEth);
  const claimed = toFiniteNumber(row.AmountClaimedEth);
  const winner =
    typeof row.WinnerAddr === 'string' && row.WinnerAddr.length > 0 ? row.WinnerAddr : '';
  const rawDiff =
    row.DonateClaimDiff != null && String(row.DonateClaimDiff) !== ''
      ? String(row.DonateClaimDiff)
      : row.Amount != null && String(row.Amount) !== ''
        ? String(row.Amount)
        : row.AmountDonated != null && String(row.AmountDonated) !== ''
          ? String(row.AmountDonated)
          : '0';

  return {
    ...row,
    AmountDonatedEth: donated,
    AmountClaimedEth: claimed,
    Claimed: Boolean(row.Claimed),
    WinnerAddr: winner,
    DonateClaimDiff: rawDiff,
    DonateClaimDiffEth:
      row.DonateClaimDiffEth != null && String(row.DonateClaimDiffEth) !== ''
        ? String(row.DonateClaimDiffEth)
        : String(donated - claimed),
  };
}

/** Fetches direct Cosmic Game ETH donations without extra info (optionally paged). */
export function get_donations_cg_simple_list(page?: ApiPageWindow): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/simple/list/${pagedPath(page)}`));
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

/** Fetches direct Cosmic Game ETH donations with extended donor/round info (optionally paged). */
export function get_donations_cg_with_info_list(page?: ApiPageWindow): Promise<ETHDonation[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/list/${pagedPath(page)}`));
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

/** Fetches charity donation deposits from allocation-pool distributions. */
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

/** Fetches donated NFTs with normalized field names (optionally paged). */
export function get_donations_nft_list(page?: ApiPageWindow): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/list/${pagedPath(page)}`));
    return normalizeFieldNamesArray(
      flattenTxArray<AttachedNFT>(data.NFTDonations),
    ) as AttachedNFT[];
  }, []);
}

/** Fetches detailed info for a single donated NFT by its record ID. */
export function get_donated_nft_info(record_id: number): Promise<AttachedNFT | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
    return normalizeFieldNames(flattenTx(data.NFTDonation)) as AttachedNFT | null;
  }, null);
}

/** Fetches donated NFT claim records globally (optionally paged; historical cap 100k). */
export function get_donated_nft_claims_all(page?: ApiPageWindow): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`donations/nft/claims/${pagedPath({ limit: 100_000, ...page })}`),
    );
    return flattenTxArray<AttachedNFT>(data.DonatedNFTClaims);
  }, []);
}

/** Fetches donated NFTs that have been claimed by a specific wallet address. */
export function get_claimed_donated_nft_by_user(address: string): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
    return flattenTxArray<AttachedNFT>(data.DonatedNFTClaims);
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
export function get_donations_nft_by_round(round: number): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
    return normalizeFieldNamesArray(
      flattenTxArray<AttachedNFT>(data.NFTDonations),
    ) as AttachedNFT[];
  }, []);
}

/** Fetches unclaimed donated NFTs for a specific round. */
export function get_donations_nft_unclaimed_by_round(round: number): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
    return normalizeFieldNamesArray(
      flattenTxArray<AttachedNFT>(data.NFTDonations),
    ) as AttachedNFT[];
  }, []);
}

/** Fetches unclaimed donated NFTs available for a specific wallet address. */
export function get_unclaimed_donated_nft_by_user(address: string): Promise<AttachedNFT[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
    return normalizeFieldNamesArray(
      flattenTxArray<AttachedNFT>(data.UnclaimedDonatedNFTs),
    ) as AttachedNFT[];
  }, []);
}

/** Fetches ERC-20 token donations for a round (includes rows before main-prize claim; optional winner when claim exists). */
export function get_donations_erc20_by_round(round: number): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/all/${round}`));
    const rows = normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonationsERC20ByRoundAll),
    ) as DonatedERC20Token[];
    return rows.map(mapErc20DonationRowForTable);
  }, []);
}

/** Fetches ERC-20 token donations won by a specific wallet address. */
export function get_donations_erc20_by_user(address: string): Promise<DonatedERC20Token[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
    const rows = normalizeFieldNamesArray(
      flattenTxArray<DonatedERC20Token>(data.DonatedPrizesERC20ByWinner),
    ) as DonatedERC20Token[];
    return rows.map(mapErc20DonationRowForTable);
  }, []);
}

// lexicon-allow-end
