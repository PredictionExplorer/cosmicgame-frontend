/**
 * Raw ERC-20 claim amounts must be sent to PrizesWallet in token base units.
 * Backend display fields ending in `Eth` are intentionally not considered here.
 */
export interface DonatedErc20ClaimAmountSource {
  DonateClaimDiff?: string | number | bigint | null;
  Amount?: string | number | bigint | null;
  AmountDonated?: string | number | bigint | null;
}

function normalizeRawTokenAmount(
  value: string | number | bigint | null | undefined,
): string | null {
  if (typeof value === 'bigint') return value >= 0n ? value.toString() : null;
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? trimmed : null;
  }
  return null;
}

/** Returns the best raw base-unit amount for claiming a donated ERC-20 token. */
export function getDonatedErc20RawClaimAmount(token: DonatedErc20ClaimAmountSource): string {
  return (
    normalizeRawTokenAmount(token.DonateClaimDiff) ??
    normalizeRawTokenAmount(token.Amount) ??
    normalizeRawTokenAmount(token.AmountDonated) ??
    '0'
  );
}

/** Converts a raw base-unit amount into the bigint expected by viem contract writes. */
export function toDonatedErc20ClaimAmountBigInt(
  amount: string | number | bigint | null | undefined,
): bigint {
  const normalized = normalizeRawTokenAmount(amount);
  if (normalized == null) {
    throw new Error('Missing raw ERC-20 claim amount');
  }
  return BigInt(normalized);
}
