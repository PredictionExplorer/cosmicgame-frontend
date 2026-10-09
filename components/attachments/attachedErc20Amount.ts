import { formatUnits } from 'viem';

import { toFiniteNumber } from '@/utils/finiteNumber';
import type { DonatedERC20Token } from '@/services/api/types';

/** A base-unit amount as the reads deliver it (a decimal string, or a number or bigint). */
type BaseUnitField = string | number | bigint | null;

/**
 * The amount fields an attached ERC-20 row may carry (reads differ in which).
 * Base-unit fields are wider than `DonatedERC20Token`'s so the retrieval
 * ledgers, whose rows also feed the retrieve call, read through here too.
 */
export type AttachedErc20AmountRow = Partial<
  Pick<DonatedERC20Token, 'AmountDonatedEth' | 'AmountClaimedEth' | 'AmountEth'>
> & {
  Amount?: BaseUnitField;
  AmountDonated?: BaseUnitField;
  AmountClaimed?: BaseUnitField;
};

/** A whole number of base units, or null. */
function baseUnits(value: unknown): bigint | null {
  if (typeof value === 'bigint') return value >= 0n ? value : null;
  if (typeof value === 'number')
    return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : null;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return BigInt(value.trim());
  return null;
}

function wholeTokens(units: bigint | null, decimals: number): number | null {
  if (units === null) return null;
  const amount = Number(formatUnits(units, decimals));
  return Number.isFinite(amount) ? amount : null;
}

/**
 * The amount of an ERC-20 that was attached, in whole tokens, or `null` when
 * the row reports none. Every surface that shows an attached amount reads it
 * here, so a table and a showcase never disagree about the same row.
 *
 * - The Recipient's read (`by_user`) reports what is still held
 *   (`AmountDonated`, 0 once retrieved) beside what was retrieved, so the
 *   attached amount is their sum.
 * - The cycle's read (`by_round`) reports the attached amount itself
 *   (`AmountEth`).
 * - A row without the display figures falls back to its base units
 *   (`Amount`, or held plus retrieved), scaled by the token's `decimals`.
 */
export function attachedErc20Amount(row: AttachedErc20AmountRow, decimals = 18): number | null {
  const reportsHolding = row.AmountDonated !== undefined && row.AmountDonated !== null;
  if (reportsHolding) {
    const held = toFiniteNumber(row.AmountDonatedEth);
    if (held !== null) return held + (toFiniteNumber(row.AmountClaimedEth) ?? 0);
    const heldUnits = baseUnits(row.AmountDonated);
    if (heldUnits === null) return null;
    return wholeTokens(heldUnits + (baseUnits(row.AmountClaimed) ?? 0n), decimals);
  }
  const attached = toFiniteNumber(row.AmountEth) ?? toFiniteNumber(row.AmountDonatedEth);
  if (attached !== null) return attached;
  return wholeTokens(baseUnits(row.Amount), decimals);
}
