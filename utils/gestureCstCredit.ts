import type { GestureInfo } from '@/services/api/types';

/** Exact and display values of one recipient-specific CST credit. */
export interface GestureCstCredit {
  role: 'previous' | 'participant';
  /** Token units for the shared amount formatter; undefined means unavailable, never zero. */
  amount: number | undefined;
  /** Exact 18-decimal base units, when supplied by the API. */
  amountWei?: string;
  recipient?: string;
  sameParticipant: boolean;
}

export interface GestureCstCredits {
  status: 'credited' | 'first' | 'zero' | 'unknown';
  credits: readonly GestureCstCredit[];
  /** Aggregate only: its recipient cannot be established from this record. */
  unattributedAmount?: number;
  /** Exact aggregate base units, when available, without asserting a recipient. */
  unattributedAmountWei?: string;
}

/** Identifies the deployment that supplied this record, not its current implementation. */
export interface GestureCstCreditContext {
  chainId: number;
  protocolAddress: string;
}

/**
 * Audited Arbitrum One proxy history. The proxy was created at block 455767589;
 * its V3 upgrade was transaction
 * https://arbiscan.io/tx/0x6adb029eadca055f12ded5d48c606edd8f84dad3433e0eab08d841d7962569ad
 * in block 516839618. Exclude the upgrade block itself: a block number alone
 * cannot order the upgrade and a gesture within it.
 */
const LEGACY_CREDIT_DEPLOYMENT = {
  chainId: 42161,
  address: '0x6a714ae7b5b6ea520f6bca23d2e609c4fd5863f2',
  firstBlock: 455_767_589,
  v3Block: 516_839_618,
} as const;

function isKnownLegacyRecord(gesture: GestureInfo, context?: GestureCstCreditContext): boolean {
  return (
    context?.chainId === LEGACY_CREDIT_DEPLOYMENT.chainId &&
    addressOf(context.protocolAddress)?.toLowerCase() === LEGACY_CREDIT_DEPLOYMENT.address &&
    Number.isSafeInteger(gesture.BlockNum) &&
    gesture.BlockNum >= LEGACY_CREDIT_DEPLOYMENT.firstBlock &&
    gesture.BlockNum < LEGACY_CREDIT_DEPLOYMENT.v3Block
  );
}

interface CreditAmount {
  state: 'missing' | 'invalid' | 'known';
  amount?: number;
  amountWei?: string;
}

const UINT256_MAX = (1n << 256n) - 1n;
const ADDRESS = /^0x[\da-fA-F]{40}$/i;
const ZERO_ADDRESS = /^0x0{40}$/i;

const supplied = (value: unknown) => value !== undefined && value !== null;

function addressOf(value: unknown): string | undefined {
  return typeof value === 'string' && ADDRESS.test(value) && !ZERO_ADDRESS.test(value)
    ? `0x${value.slice(2)}`
    : undefined;
}

/** Raw units are authoritative; invalid supplied data must not fall through to another amount. */
function amountOf(raw: unknown, canonical: unknown, alias?: unknown): CreditAmount {
  if (supplied(raw)) {
    if (typeof raw !== 'string' || !/^\d{1,78}$/.test(raw)) return { state: 'invalid' };
    const units = BigInt(raw);
    if (units > UINT256_MAX) return { state: 'invalid' };
    const digits = units.toString().padStart(19, '0');
    return {
      state: 'known',
      amount: Number(`${digits.slice(0, -18)}.${digits.slice(-18)}`),
      amountWei: units.toString(),
    };
  }
  const value = supplied(canonical) ? canonical : alias;
  if (!supplied(value)) return { state: 'missing' };
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= Number(UINT256_MAX) / 1e18
    ? { state: 'known', amount: value === 0 ? 0 : value }
    : { state: 'invalid' };
}

/** Complete partitions must equal the total; even a partial subtotal cannot exceed it. */
function contradictsAggregate(
  previous: CreditAmount,
  participant: CreditAmount,
  aggregate: CreditAmount,
): boolean {
  if (aggregate.state !== 'known') return false;
  const known = [previous, participant].filter((value) => value.state === 'known');
  if (known.length === 0) return false;
  const complete = known.length === 2;
  if (aggregate.amountWei !== undefined && known.every((value) => value.amountWei !== undefined)) {
    const subtotal = known.reduce((sum, value) => sum + BigInt(value.amountWei!), 0n);
    const total = BigInt(aggregate.amountWei);
    return complete ? subtotal !== total : subtotal > total;
  }
  const subtotal = known.reduce((sum, value) => sum + value.amount!, 0);
  const total = aggregate.amount!;
  // Decimal aliases may have incurred one rounding step during serialization
  // or addition (0.1 + 0.2). No absolute floor: a positive tiny credit still
  // contradicts an exact zero total.
  const tolerance = Number.EPSILON * Math.max(subtotal, total) * 8;
  return complete ? Math.abs(subtotal - total) > tolerance : subtotal - total > tolerance;
}

/** Canonical aliases for the sealed API fields, applied to detail and list responses alike. */
export function normalizeGestureCstCreditFields(record: Record<string, unknown>): void {
  // lexicon-allow-start: sealed backend recipient-credit fields.
  const previous = amountOf(
    record.PreviousBidderCstRewardAmount,
    record.PreviousBidderCstRewardAmountEth,
    record.PreviousCstRewardAmountEth,
  );
  const participant = amountOf(
    record.ThisBidderCstRewardAmount,
    record.ThisBidderCstRewardAmountEth,
    record.ThisCstRewardAmountEth,
  );
  if (previous.state === 'known') record.PreviousBidderCstRewardAmountEth = previous.amount;
  if (participant.state === 'known') record.ThisBidderCstRewardAmountEth = participant.amount;
  // lexicon-allow-end
}

/**
 * Resolve who actually received CST from one record. A bare aggregate is not
 * evidence of a recipient, and today's contract version says nothing about a
 * historical record. Multiple explicit credits remain separate by role.
 */
export function getGestureCstCredits(
  gesture: GestureInfo,
  context?: GestureCstCreditContext,
): GestureCstCredits {
  // lexicon-allow-start: sealed backend fields; their amounts describe recipients, not the caller.
  const previous = amountOf(
    gesture.PreviousBidderCstRewardAmount,
    gesture.PreviousBidderCstRewardAmountEth,
    gesture.PreviousCstRewardAmountEth,
  );
  const participant = amountOf(
    gesture.ThisBidderCstRewardAmount,
    gesture.ThisBidderCstRewardAmountEth,
    gesture.ThisCstRewardAmountEth,
  );
  const aggregate = amountOf(
    gesture.CSTReward,
    gesture.ParticipationCST ?? gesture.CSTRewardEth,
    gesture.ERC20RewardAmountEth,
  );
  const actor = addressOf(gesture.BidderAddr);
  const previousRecipient = addressOf(gesture.PreviousBidderAddr);
  // lexicon-allow-end

  const entry = (
    role: GestureCstCredit['role'],
    value: CreditAmount,
    recipient: string | undefined,
  ): GestureCstCredit => ({
    role,
    amount: value.amount,
    ...(value.amountWei === undefined ? {} : { amountWei: value.amountWei }),
    ...(recipient === undefined ? {} : { recipient }),
    sameParticipant: Boolean(actor && recipient && actor.toLowerCase() === recipient.toLowerCase()),
  });

  const positive: GestureCstCredit[] = [];
  if (previous.state === 'known' && previous.amount! > 0)
    positive.push(entry('previous', previous, previousRecipient));
  if (participant.state === 'known' && participant.amount! > 0)
    positive.push(entry('participant', participant, actor));
  const invalid = previous.state === 'invalid' || participant.state === 'invalid';
  if (contradictsAggregate(previous, participant, aggregate)) {
    return {
      status: 'unknown',
      credits: [
        ...(previous.state !== 'missing' ? [entry('previous', previous, previousRecipient)] : []),
        ...(participant.state !== 'missing' ? [entry('participant', participant, actor)] : []),
      ],
    };
  }
  if (positive.length > 0 && !invalid) return { status: 'credited', credits: positive };

  const explicit = [previous, participant].filter((value) => value.state !== 'missing');
  const bothRecipientsZero =
    previous.state === 'known' &&
    previous.amount === 0 &&
    participant.state === 'known' &&
    participant.amount === 0;
  const aggregateZero = aggregate.state === 'known' && aggregate.amount === 0;
  if (!invalid && (bothRecipientsZero || aggregateZero)) {
    if (gesture.BidPosition === 1) return { status: 'first', credits: [] };
    return {
      status: 'zero',
      credits:
        previous.state === 'known' && previousRecipient
          ? [entry('previous', previous, previousRecipient)]
          : participant.state === 'known' && previous.state === 'missing'
            ? [entry('participant', participant, actor)]
            : [],
    };
  }

  if (
    explicit.length === 0 &&
    aggregate.state === 'known' &&
    aggregate.amount! > 0 &&
    isKnownLegacyRecord(gesture, context)
  ) {
    return { status: 'credited', credits: [entry('participant', aggregate, actor)] };
  }

  const uncertain = [...positive];
  // One known zero does not prove the other participant received nothing.
  // Retain that narrow fact while keeping the overall attribution unresolved.
  if (positive.length === 0 && previous.state === 'known' && previousRecipient) {
    uncertain.push(entry('previous', previous, previousRecipient));
  } else if (
    positive.length === 0 &&
    participant.state === 'known' &&
    previous.state === 'missing'
  ) {
    uncertain.push(entry('participant', participant, actor));
  }
  if (previous.state === 'invalid') uncertain.push(entry('previous', previous, previousRecipient));
  if (participant.state === 'invalid') uncertain.push(entry('participant', participant, actor));
  return {
    status: 'unknown',
    credits: uncertain,
    ...(aggregate.state === 'known' && uncertain.length === 0
      ? {
          unattributedAmount: aggregate.amount,
          ...(aggregate.amountWei === undefined
            ? {}
            : { unattributedAmountWei: aggregate.amountWei }),
        }
      : {}),
  };
}
