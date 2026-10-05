import { protocolFacts as facts } from '@/content/protocol-facts';

/**
 * The allocation tracks at a glance, above the Terms' allocation clauses: each
 * row is a clause id of the `allocations` section (its subtitle names the
 * track), with the shares and amounts from `protocolFacts`, so the table and
 * the clauses can never state different figures.
 *
 * `eth`: percent of the Cycle Reserve (`approximate` for the remainder that
 * rolls forward, `sharedBy` when several Recipients split it). `cst` and
 * `nft`: per Recipient, times `each` Recipients when several are selected.
 */
export interface TermsAllocationRow {
  readonly id: string;
  readonly eth?: {
    readonly percent: number;
    readonly sharedBy?: number;
    readonly approximate?: true;
  };
  readonly cst?: number;
  readonly nft?: number;
  readonly each?: number;
}

export const TERMS_ALLOCATION_ROWS: readonly TermsAllocationRow[] = [
  {
    id: 'signature',
    eth: { percent: facts.mainEthPercentage },
    cst: facts.specialAllocationCst,
    nft: 1,
  },
  {
    id: 'chrono',
    eth: { percent: facts.chronoWarriorEthPercentage },
    cst: facts.specialAllocationCst,
    nft: 1,
  },
  { id: 'endurance', cst: facts.specialAllocationCst, nft: 1 },
  { id: 'final-cst', cst: facts.specialAllocationCst, nft: 1 },
  {
    id: 'eth-selection',
    eth: {
      percent: facts.stellarSelectionEthPercentage,
      sharedBy: facts.ethStellarSelectionRecipients,
    },
  },
  {
    id: 'nft-selection',
    cst: facts.specialAllocationCst,
    nft: 1,
    each: facts.nftStellarSelectionRecipients,
  },
  {
    id: 'anchored-selection',
    cst: facts.specialAllocationCst,
    nft: 1,
    each: facts.anchoredRwlkNftSelectionRecipients,
  },
  { id: 'anchor-distribution', eth: { percent: facts.anchorDistributionPercentage } },
  { id: 'public-goods', eth: { percent: facts.publicGoodsPercentage } },
  { id: 'compounding', eth: { percent: facts.compoundingReservePercentage, approximate: true } },
  { id: 'outreach', cst: facts.outreachReserveCst },
];
