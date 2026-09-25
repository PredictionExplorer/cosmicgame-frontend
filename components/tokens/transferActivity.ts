import { isZeroAddress, sameAddress } from '@/utils/format';

/**
 * What a transfer meant for the address whose history is shown:
 *
 * - `imprinted`: created for it (from the zero address): CST a gesture
 *   imprinted to it, or a Cosmic Signature NFT it received as an allocation
 * - `consumed`: destroyed from it (to the zero address): CST a CST gesture spent
 * - `anchored` / `released`: moved into an anchoring wallet and back. The
 *   address still owns what it anchored, so these rows are neither sent nor
 *   received and stay out of both totals.
 * - `received` / `sent`: moved between it and another address
 */
export type TransferActivity =
  | 'imprinted'
  | 'received'
  | 'sent'
  | 'consumed'
  | 'anchored'
  | 'released';

/** The direction an activity moves value: into the address, or out of it. */
export type TransferDirection = 'in' | 'out';

/**
 * Where each activity moves value; `null` for anchoring, which moves custody
 * but not ownership, so the incoming and outgoing filters leave it out.
 */
export const ACTIVITY_DIRECTION: Readonly<Record<TransferActivity, TransferDirection | null>> = {
  imprinted: 'in',
  received: 'in',
  sent: 'out',
  consumed: 'out',
  anchored: null,
  released: null,
};

export interface ClassifiedTransfer {
  activity: TransferActivity;
  /** The other side of an ordinary transfer; `null` when the protocol created or consumed it. */
  counterparty: string | null;
  /**
   * From the address to itself: it both sent and received the amount, so
   * the transfer counts on both sides and leaves the net unchanged.
   */
  self: boolean;
}

/**
 * Classifies one transfer from the point of view of `address`. A transfer
 * from the address to itself reads as sent, with itself as the counterparty,
 * and is marked `self`. A transfer into one of `anchorWallets` (the protocol's
 * anchoring contracts) reads as anchored, and one out of it as released.
 */
export function classifyTransfer(
  from: string | null | undefined,
  to: string | null | undefined,
  address: string,
  anchorWallets: readonly (string | null | undefined)[] = [],
): ClassifiedTransfer {
  if (isZeroAddress(from)) return { activity: 'imprinted', counterparty: null, self: false };
  if (isZeroAddress(to)) return { activity: 'consumed', counterparty: null, self: false };
  const isAnchorWallet = (candidate: string | null | undefined) =>
    anchorWallets.some((wallet) => sameAddress(wallet, candidate));
  if (sameAddress(from, address)) {
    if (isAnchorWallet(to)) return { activity: 'anchored', counterparty: to ?? null, self: false };
    return { activity: 'sent', counterparty: to ?? null, self: sameAddress(to, address) };
  }
  if (isAnchorWallet(from)) {
    return { activity: 'released', counterparty: from ?? null, self: false };
  }
  return { activity: 'received', counterparty: from ?? null, self: false };
}

/** A classified row as the totals and the direction filter read it. */
export interface ActivityRow {
  activity: TransferActivity;
  /** A transfer to itself: in and out at once (see `ClassifiedTransfer.self`). */
  self?: boolean;
}

/**
 * Whether a row moved value in the given direction; a self-transfer moves both
 * ways, and an anchoring move neither.
 */
export function movesInDirection(row: ActivityRow, direction: TransferDirection): boolean {
  return row.self === true || ACTIVITY_DIRECTION[row.activity] === direction;
}

/**
 * A transfer between the address and another wallet (received or sent, a
 * self-transfer included): not something the protocol imprinted or consumed,
 * and not an anchoring move.
 */
export function isPeerTransfer(row: ActivityRow): boolean {
  return row.activity === 'received' || row.activity === 'sent';
}

/**
 * Base units of a transfer: exactly, from the indexer's wei string when it
 * has one; otherwise from the float, which carries about six decimals, so
 * that fallback is rounded to a millionth of a token (never to the wei).
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

/**
 * Sums a CST history by activity. Rows without a readable amount count as
 * zero; a self-transfer counts as both received and sent; anchoring moves
 * change neither side.
 */
export function sumCstTransfers(
  rows: readonly (ActivityRow & { wei: bigint | null })[],
): CstTransferTotals {
  const totals = { received: 0n, imprinted: 0n, sent: 0n, consumed: 0n };
  for (const row of rows) {
    if (row.activity === 'anchored' || row.activity === 'released') continue;
    const wei = row.wei ?? 0n;
    totals[row.activity] += wei;
    if (row.self) totals.received += wei;
  }
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

/** Counts of an address's NFT history by activity; a self-transfer counts as received and sent. */
export function countByActivity(rows: readonly ActivityRow[]): Record<TransferActivity, number> {
  const counts: Record<TransferActivity, number> = {
    imprinted: 0,
    received: 0,
    sent: 0,
    consumed: 0,
    anchored: 0,
    released: 0,
  };
  for (const row of rows) {
    counts[row.activity] += 1;
    if (row.self) counts.received += 1;
  }
  return counts;
}
