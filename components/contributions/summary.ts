import { isAddress } from 'viem';

import { toFiniteNumber } from '@/utils/finiteNumber';

/** What a list of direct ETH contributions adds up to. */
export interface ContributionSummary {
  /** Contribution records. */
  records: number;
  /** ETH contributed; a row without a readable amount adds nothing. */
  totalEth: number;
  /** Distinct contributor addresses, case-insensitively; a malformed one is left out. */
  contributors: number;
}

/**
 * The figures above a contribution ledger (all contributions, or one
 * cycle's), from its rows. Every field is guarded, so one malformed indexer
 * row changes a figure by at most itself and never takes the page down.
 */
export function summarizeContributions(
  rows: readonly { AmountEth?: unknown; DonorAddr?: unknown }[],
): ContributionSummary {
  const contributors = new Set<string>();
  let totalEth = 0;
  for (const row of rows) {
    totalEth += toFiniteNumber(row.AmountEth) ?? 0;
    if (typeof row.DonorAddr === 'string' && isAddress(row.DonorAddr, { strict: false })) {
      contributors.add(row.DonorAddr.toLowerCase());
    }
  }
  return { records: rows.length, totalEth, contributors: contributors.size };
}
