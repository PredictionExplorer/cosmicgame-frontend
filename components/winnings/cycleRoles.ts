import type { RoundInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';

/** The four roles a finalized cycle imprints a Signature for, in the order they are shown. */
export type CycleRoleId = 'signature' | 'chrono' | 'endurance' | 'finalCst';

export interface CycleRole {
  id: CycleRoleId;
  address: string;
  /** The Signature the role received; `-1` when the record names none. */
  tokenId: number;
  /**
   * All Signatures the role received, when there are several (V3 imprints
   * sequential ids for the Signature Allocation). Omitted on single-NFT roles.
   */
  tokenIds?: number[];
  /**
   * What the role received besides its Signature. Every card follows the same rule, so the
   * Signature Allocation's card names its ETH too, although the header repeats it.
   */
  eth: number | null;
  cst: number | null;
}

/**
 * A finalized cycle's recipients by role, from its record. Server-safe: the
 * record page reads the roles' Signature seeds on the server with it.
 */
export function cycleRoles(cycle: RoundInfo): CycleRole[] {
  const roles: CycleRole[] = [
    {
      id: 'signature',
      address: cycle.WinnerAddr,
      tokenId: cycle.TokenId,
      // V3 imprints several sequential Signatures for this role; the record lists them all.
      ...(cycle.NftTokenIds && cycle.NftTokenIds.length > 1 ? { tokenIds: cycle.NftTokenIds } : {}),
      eth: toFiniteNumber(cycle.AmountEth),
      cst: toFiniteNumber(cycle.CSTAmountEth),
    },
    {
      id: 'chrono',
      address: cycle.ChronoWarriorAddr,
      tokenId: cycle.ChronoWarriorNftTokenId,
      eth: toFiniteNumber(cycle.ChronoWarriorAmountEth),
      cst: toFiniteNumber(cycle.ChronoWarriorCstAmountEth),
    },
    {
      id: 'endurance',
      address: cycle.EnduranceWinnerAddr,
      tokenId: toFiniteNumber(cycle.EnduranceERC721TokenId) ?? -1,
      eth: null,
      cst: toFiniteNumber(cycle.EnduranceERC20AmountEth),
    },
    {
      id: 'finalCst',
      address: cycle.LastCstBidderAddr,
      tokenId: toFiniteNumber(cycle.LastCstBidderERC721TokenId) ?? -1,
      eth: null,
      cst: toFiniteNumber(cycle.LastCstBidderERC20AmountEth),
    },
  ];
  // A role nobody filled (no CST gesture in the cycle, say) has neither holder nor token.
  return roles.filter((role) => Boolean(role.address) || role.tokenId >= 0);
}
