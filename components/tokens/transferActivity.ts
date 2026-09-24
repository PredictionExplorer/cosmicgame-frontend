import { isZeroAddress, sameAddress } from '@/utils/format';

/**
 * What a transfer meant for the address whose history is shown:
 *
 * - `imprinted`: created for it (from the zero address): CST a gesture
 *   imprinted to it, or a Cosmic Signature NFT it received as an allocation
 * - `consumed`: destroyed from it (to the zero address): CST a CST gesture spent
 * - `received` / `sent`: moved between it and another address
 */
export type TransferActivity = 'imprinted' | 'received' | 'sent' | 'consumed';

/** The direction an activity moves value: into the address, or out of it. */
export type TransferDirection = 'in' | 'out';

export const ACTIVITY_DIRECTION: Readonly<Record<TransferActivity, TransferDirection>> = {
  imprinted: 'in',
  received: 'in',
  sent: 'out',
  consumed: 'out',
};

export interface ClassifiedTransfer {
  activity: TransferActivity;
  /** The other side of an ordinary transfer; `null` when the protocol created or consumed it. */
  counterparty: string | null;
}

/**
 * Classifies one transfer from the point of view of `address`. A transfer
 * from the address to itself reads as sent, with itself as the counterparty.
 */
export function classifyTransfer(
  from: string | null | undefined,
  to: string | null | undefined,
  address: string,
): ClassifiedTransfer {
  if (isZeroAddress(from)) return { activity: 'imprinted', counterparty: null };
  if (isZeroAddress(to)) return { activity: 'consumed', counterparty: null };
  if (sameAddress(from, address)) return { activity: 'sent', counterparty: to ?? null };
  return { activity: 'received', counterparty: from ?? null };
}

/**
 * Base units of a transfer, exactly: the indexer's wei string when it has
 * one, the float otherwise (rounded to the nearest wei).
 */
export function transferWei(value: unknown, valueFloat: unknown): bigint | null {
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value);
  if (typeof valueFloat === 'number' && Number.isFinite(valueFloat)) {
    return BigInt(Math.round(valueFloat * 1e6)) * 1_000_000_000_000n;
  }
  return null;
}

/** Totals of an address's CST history, in base units. */
export interface CstTransferTotals {
  received: bigint;
  imprinted: bigint;
  sent: bigint;
  consumed: bigint;
  /** Everything in minus everything out; negative when more left than came in. */
  net: bigint;
}

/** Sums a CST history by activity. Rows without a readable amount count as zero. */
export function sumCstTransfers(
  rows: readonly { activity: TransferActivity; wei: bigint | null }[],
): CstTransferTotals {
  const totals = { received: 0n, imprinted: 0n, sent: 0n, consumed: 0n };
  for (const row of rows) totals[row.activity] += row.wei ?? 0n;
  const incoming = totals.received + totals.imprinted;
  const outgoing = totals.sent + totals.consumed;
  // `received` and `sent` include what was imprinted and consumed: they are
  // what came in and went out, whatever the counterparty.
  return {
    received: incoming,
    imprinted: totals.imprinted,
    sent: outgoing,
    consumed: totals.consumed,
    net: incoming - outgoing,
  };
}

/** Counts of an address's NFT history by activity. */
export function countByActivity(
  rows: readonly { activity: TransferActivity }[],
): Record<TransferActivity, number> {
  const counts: Record<TransferActivity, number> = {
    imprinted: 0,
    received: 0,
    sent: 0,
    consumed: 0,
  };
  for (const row of rows) counts[row.activity] += 1;
  return counts;
}
