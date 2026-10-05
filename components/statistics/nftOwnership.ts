/** A row of the NFT distribution read: an address and how many Cosmic Signature NFTs it holds. */
export interface NftDistributionRow {
  OwnerAddr: string;
  OwnerAid: string | number;
  NumTokens: number;
}

/** A row of the anchor-holders read: an address and how many NFTs it has anchored now. */
export interface AnchorHolderRow {
  StakerAddr?: string;
  TotalTokensStaked?: number;
}

export interface NftHolder {
  address: string;
  /** NFTs in the address's own wallet. */
  held: number;
  /** NFTs it has anchored, which the Anchoring Wallet holds on its behalf. */
  anchored: number;
  total: number;
}

export interface NftOwnership {
  /** Every address that holds or has anchored an NFT, most NFTs first. */
  holders: NftHolder[];
  /**
   * How many NFTs the Anchoring Wallet holds for anchor-holders, or null when
   * it holds none in the read.
   */
  custody: number | null;
}

/**
 * Who owns the Cosmic Signature NFTs, as the profile counts them: an anchored
 * NFT belongs to its anchor-holder, not to the Anchoring Wallet that holds it
 * while it is anchored. The wallet's own row leaves the list (it is custody,
 * not a holder) and its NFTs are credited to each anchor-holder, so the
 * holder count and every address's total agree with that address's profile.
 */
export function nftOwnership(
  distribution: readonly NftDistributionRow[],
  anchorHolders: readonly AnchorHolderRow[],
  custodyAddress: string,
): NftOwnership {
  const custodyKey = custodyAddress.toLowerCase();
  const byAddress = new Map<string, NftHolder>();
  const holder = (address: string) => {
    const key = address.toLowerCase();
    let entry = byAddress.get(key);
    if (!entry) {
      entry = { address, held: 0, anchored: 0, total: 0 };
      byAddress.set(key, entry);
    }
    return entry;
  };

  let custody: number | null = null;
  for (const row of distribution) {
    if (!row.OwnerAddr || !(row.NumTokens > 0)) continue;
    if (row.OwnerAddr.toLowerCase() === custodyKey) {
      custody = (custody ?? 0) + row.NumTokens;
      continue;
    }
    holder(row.OwnerAddr).held += row.NumTokens;
  }
  for (const row of anchorHolders) {
    const anchored = row.TotalTokensStaked ?? 0;
    if (!row.StakerAddr || !(anchored > 0)) continue;
    holder(row.StakerAddr).anchored += anchored;
  }

  const holders = [...byAddress.values()]
    .map((entry) => ({ ...entry, total: entry.held + entry.anchored }))
    .sort((a, b) => b.total - a.total || a.address.localeCompare(b.address));
  return { holders, custody };
}
