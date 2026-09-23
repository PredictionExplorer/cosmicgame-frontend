/**
 * Allocation record types (`RecordType` in the allocation history API, `cg_prize.ptype` in the
 * indexer). One module owns the classification so every table, summary card and total reads
 * the same sets: an ETH total that sums a CST row (whose `AmountEth` carries the CST amount)
 * overstates ETH by orders of magnitude.
 *
 *  0 Signature Allocation ETH          10 Stellar Selection ETH (participant)
 *  1 Signature Allocation CST          11 Stellar Selection CST (participant)
 *  2 Signature Allocation NFT          12 Stellar Selection NFT (participant)
 *  3 Final CST Gesture NFT             13 Stellar Selection CST (anchored NFT)
 *  4 Final CST Gesture Recognition CST 14 Stellar Selection NFT (anchored NFT)
 *  5 Endurance NFT                     15 Anchor Distribution ETH
 *  6 Endurance Recognition CST         16 Attached NFT retrieval
 *  7 Chrono-Warrior ETH                17 Attached ERC-20 retrieval
 *  8 Chrono-Warrior CST                18 Stellar Selection ETH timeout retrieval
 *  9 Chrono-Warrior NFT
 */

/** Rows whose `AmountEth` is an ETH amount (allocations and the type-18 timeout retrieval). */
export const ETH_RECORD_TYPES: ReadonlySet<number> = new Set([0, 7, 10, 15, 18]);

/**
 * Rows that retrieve ETH another row already allocated. Type 18 re-records the ETH of a
 * type-10 Stellar Selection deposit, so a total that includes it counts the same ETH twice.
 */
export const ETH_RETRIEVAL_RECORD_TYPES: ReadonlySet<number> = new Set([18]);

/** ETH allocations proper: {@link ETH_RECORD_TYPES} without the retrieval rows. */
export const ETH_ALLOCATION_RECORD_TYPES: ReadonlySet<number> = new Set(
  [...ETH_RECORD_TYPES].filter((type) => !ETH_RETRIEVAL_RECORD_TYPES.has(type)),
);

/** Rows whose `AmountEth` is a CST amount (18-decimal token units, not ETH). */
export const CST_RECORD_TYPES: ReadonlySet<number> = new Set([1, 4, 6, 8, 11, 13]);

/** Rows that allocate or retrieve an ERC-721 token; `AmountEth` is 0 and carries no meaning. */
export const NFT_RECORD_TYPES: ReadonlySet<number> = new Set([2, 3, 5, 9, 12, 14, 16]);

/** Attached ERC-20 retrieval; `AmountEth` is in the attached token's own units. */
export const ERC20_RECORD_TYPES: ReadonlySet<number> = new Set([17]);

/** Stellar Selection rows (participant and anchored-NFT selections, plus the timeout retrieval). */
export const STELLAR_SELECTION_RECORD_TYPES: ReadonlySet<number> = new Set([
  10, 11, 12, 13, 14, 18,
]);

/** The unit an allocation row's `AmountEth` is denominated in. */
export type AllocationAmountUnit = 'eth' | 'cst' | 'nft' | 'erc20' | 'unknown';

/** Classifies a `RecordType` by the unit of its `AmountEth` field. */
export function allocationAmountUnit(recordType: number): AllocationAmountUnit {
  if (ETH_RECORD_TYPES.has(recordType)) return 'eth';
  if (CST_RECORD_TYPES.has(recordType)) return 'cst';
  if (NFT_RECORD_TYPES.has(recordType)) return 'nft';
  if (ERC20_RECORD_TYPES.has(recordType)) return 'erc20';
  return 'unknown';
}

/** The fields of an allocation history row that the totals below read. */
export interface AllocationAmountRow {
  RecordType?: number;
  AmountEth?: number;
}

function sumWhere(rows: readonly AllocationAmountRow[], types: ReadonlySet<number>): number {
  return rows.reduce((total, row) => {
    if (typeof row.RecordType !== 'number' || !types.has(row.RecordType)) return total;
    const amount = Number(row.AmountEth);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

/**
 * Total ETH allocated across allocation history rows: Signature, Chrono-Warrior, Stellar
 * Selection and Anchor Distribution ETH. CST, NFT and ERC-20 rows are excluded, and so are
 * timeout-retrieval rows, which repeat ETH an allocation row already counts.
 */
export function sumAllocatedEth(rows: readonly AllocationAmountRow[]): number {
  return sumWhere(rows, ETH_ALLOCATION_RECORD_TYPES);
}

/** Total CST allocated across allocation history rows (CST record types only). */
export function sumAllocatedCst(rows: readonly AllocationAmountRow[]): number {
  return sumWhere(rows, CST_RECORD_TYPES);
}
